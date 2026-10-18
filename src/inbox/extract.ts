// Pull invite fields out of a new-invite email. Anything not stated plainly
// is left empty and listed in `flags` for the person reviewing the invite.

import { findDueInBody, findDueInSubject, settleDue } from "./dates";
import type { Classification, EmailInput, InviteFields, Link, QuarantinedInvite } from "./types";

function lines(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

function after(text: string, label: RegExp): string | null {
  for (const l of lines(text)) {
    const m = l.match(label);
    if (m && m[1]?.trim()) return m[1].trim();
  }
  return null;
}

/** Sentence mentioning a walkthrough or site visit with a date in it. */
function findWalkthrough(text: string): string | null {
  const m = text.match(
    /[^.\n]*\b(site visit|site walk|walk[- ]?through|pre-?bid (?:meeting|conference))\b[^.\n]*\b(\d{1,2}\/\d{1,2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2})[^.\n]*/i,
  );
  return m ? m[0].trim() : null;
}

/** Sentence giving an RFI or questions deadline with a date in it. */
function findRfiDeadline(text: string): string | null {
  const m = text.match(
    /[^.\n]*\b(rfis?|questions)\b[^.\n]*\b(due|deadline|no later than|by)\b[^.\n]*\b(\d{1,2}\/\d{1,2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2})[^.\n]*/i,
  );
  return m ? m[0].trim() : null;
}

const FILE_LINK = /\.(pdf|zip|dwg|docx?|xlsx?)$/i;

function planLinksFrom(links: Link[], textMatch: RegExp): Link[] {
  const seen = new Set<string>();
  return links.filter((l) => {
    const hit = textMatch.test(l.text) || FILE_LINK.test(l.text);
    if (!hit || seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });
}

function blank(): InviteFields {
  return {
    projectName: null, gc: null, contact: null, location: null, scopes: [],
    dueDate: null, dueTime: null, dueTimeZone: null,
    walkthrough: null, rfiDeadline: null, planLinks: [], flags: [],
  };
}

function finish(f: InviteFields): InviteFields {
  if (!f.projectName) f.flags.push("Project name not found.");
  if (!f.gc) f.flags.push("GC not found.");
  if (f.planLinks.length === 0) f.flags.push("No plans link found.");
  return f;
}

function applyDue(f: InviteFields, email: EmailInput, text: string) {
  const due = settleDue([...findDueInBody(text), ...findDueInSubject(email.subject)]);
  f.dueDate = due.date;
  f.dueTime = due.time;
  f.dueTimeZone = due.zone;
  if (due.flag) f.flags.push(due.flag);
}

function fromBlueBook(email: EmailInput, text: string, links: Link[]): InviteFields {
  const f = blank();
  const inv = text.match(/^(.+?) has invited you to bid on (.+)\.\s*$/im);
  if (inv) {
    f.gc = inv[1].trim();
    f.projectName = inv[2].trim();
  }
  const looking = text.match(/We are looking for\s*\n([\s\S]*?)(?:\n\s*\n|\nView Full)/i);
  if (looking) {
    f.scopes = looking[1].split(/\n/).map((s) => s.replace(/\.$/, "").trim()).filter(Boolean);
  }
  if (f.projectName) {
    const ls = lines(text);
    const i = ls.findIndex((l) => l === f.projectName);
    if (i >= 0 && ls[i + 1] && /\b\d{5}\b|,\s*[A-Z]{2}\b/.test(ls[i + 1])) f.location = ls[i + 1];
  }
  f.contact = email.subject.match(/^Invitation to Bid from (.+)$/i)?.[1]?.trim() ?? null;
  f.planLinks = planLinksFrom(links, /^view project files$/i);
  applyDue(f, email, text);
  f.walkthrough = findWalkthrough(text);
  f.rfiDeadline = findRfiDeadline(text);
  return finish(f);
}

function fromBuildingConnected(email: EmailInput, text: string, links: Link[]): InviteFields {
  const f = blank();
  const ls = lines(text);
  const i = ls.findIndex((l) => / has invited you to bid on$/i.test(l));
  if (i >= 0) {
    const who = ls[i].match(/^(.+?) from (.+?) has invited you to bid on$/i);
    if (who) {
      f.contact = who[1].trim();
      f.gc = who[2].trim();
    }
    const proj = ls[i + 1] ?? "";
    // Single scope reads "Project: Scope"; several scopes list "View the RFP for X »".
    const rfpScopes = links.map((l) => l.text.match(/^View the RFP for (.+?)\s*»?$/i)?.[1]).filter(Boolean) as string[];
    if (rfpScopes.length) {
      f.projectName = proj || null;
      f.scopes = rfpScopes;
    } else {
      const parts = proj.split(/:\s+/);
      f.projectName = parts[0]?.trim() || null;
      if (parts[1]) f.scopes = [parts.slice(1).join(": ").trim()];
    }
  }
  f.location = after(text, /^Location:\s*(.+)$/i);
  f.planLinks = planLinksFrom(links, /^view (the rfp|this rfp)/i);
  f.flags.push("BuildingConnected invite emails do not include the bid due date. Enter it from BuildingConnected.");
  f.walkthrough = findWalkthrough(text);
  f.rfiDeadline = findRfiDeadline(text);
  return finish(f);
}

function fromPlanHub(email: EmailInput, text: string, links: Link[]): InviteFields {
  const f = blank();
  // "ITB - Project Name City, State (GC Name)"
  const m = email.subject.match(/^ITB\s*-\s*(.+?)\s*\(([^)]+)\)\s*$/i);
  if (m) {
    f.projectName = m[1].trim();
    f.gc = m[2].trim();
  }
  f.contact = email.fromName ?? null;
  f.planLinks = planLinksFrom(links, /view (project|files|plans|bid)/i);
  applyDue(f, email, text);
  f.walkthrough = findWalkthrough(text);
  f.rfiDeadline = findRfiDeadline(text);
  return finish(f);
}

function fromDirect(email: EmailInput, text: string, links: Link[]): InviteFields {
  const f = blank();
  f.projectName =
    after(text, /^Job Name:\s*(.+)$/i) ??
    after(text, /^Project(?: Name)?:\s*(.+)$/i) ??
    (email.subject.replace(/^(re:|fw:|fwd:)\s*/i, "").replace(/^invitation to bid\s*-\s*/i, "").trim() || null);
  f.location = after(text, /^(?:Location|Address):\s*(.+)$/i);
  f.gc = email.fromName && !/@/.test(email.fromName) ? email.fromName : null;
  if (!f.gc) f.flags.push(`GC taken from sender address only (${email.fromAddress}). Confirm the company name.`);
  const scopeLines = text.match(/invited to bid on the following:?\s*\n([\s\S]*?)(?:\n\s*\n|$)/i);
  if (scopeLines) f.scopes = lines(scopeLines[1]).slice(0, 10);
  f.planLinks = planLinksFrom(links, /view (files|project|plans|drawings)|plan download|direct link/i);
  applyDue(f, email, text);
  f.walkthrough = findWalkthrough(text);
  f.rfiDeadline = findRfiDeadline(text);
  const out = finish(f);
  // A GC name from the sender line can be a department, not the company.
  if (out.gc && /estimating|bids?|department/i.test(out.gc)) {
    out.flags.push(`GC name may be a department name ("${out.gc}"). Confirm the company name.`);
  }
  return out;
}

export function extractInvite(
  email: EmailInput,
  cls: Classification,
  text: string,
  links: Link[],
): InviteFields {
  switch (cls.source) {
    case "bluebook": return fromBlueBook(email, text, links);
    case "buildingconnected": return fromBuildingConnected(email, text, links);
    case "planhub": return fromPlanHub(email, text, links);
    default: return fromDirect(email, text, links);
  }
}

/** Bid invites listed in a spam filter digest, so they are not missed. */
export function extractQuarantined(text: string): QuarantinedInvite[] {
  const out: QuarantinedInvite[] = [];
  const ls = lines(text);
  for (let i = 0; i < ls.length; i++) {
    const sender = ls[i].match(/^(.+<[^>]+@[^>]+>)/);
    if (!sender) continue;
    // Subject and date follow the sender (and its bounce address).
    for (let j = i + 1; j < Math.min(i + 4, ls.length); j++) {
      const m = ls[j].match(/^(?:\S+@\S+\s+)?(.*?\bITB\b.*?)\s+(\d{1,2} \w{3} \d{2} - \d{1,2}:\d{2})/i);
      if (m) {
        out.push({ sender: sender[1].trim(), subject: m[1].trim(), heldOn: m[2] });
        break;
      }
    }
  }
  return out;
}
