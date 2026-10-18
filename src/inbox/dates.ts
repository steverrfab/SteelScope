// Find bid due dates as the email states them. Returns every candidate so a
// disagreement between subject and body can be shown instead of guessed.

import type { DueCandidate } from "./types";

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

function iso(y: number, m: number, d: number): string | undefined {
  if (y < 100) y += 2000;
  if (m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** "5:00 PM", "2:00 pm", "4PM", "5:00 P" to "17:00". */
export function to24h(raw: string): string | undefined {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m?\.?$/i);
  if (!m) return undefined;
  let h = Number(m[1]) % 12;
  if (m[3].toLowerCase() === "p") h += 12;
  return `${pad(h)}:${m[2] ?? "00"}`;
}

const TIME = String.raw`(\d{1,2}(?::\d{2})?\s*[ap]\.?\s*m?\.?)(?![a-z])`;
const ZONE = String.raw`(?:\s*\((eastern|central|mountain|pacific)\))?`;
const LONG_DATE = String.raw`([a-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})`;
const NUM_DATE = String.raw`(\d{1,2})/(\d{1,2})/(\d{2,4})`;

/** Due-date wording seen in real invites, in the body text. */
export function findDueInBody(text: string): DueCandidate[] {
  const out: DueCandidate[] = [];
  const add = (c: DueCandidate) => {
    if (!out.some((o) => o.date === c.date && o.time === c.time)) out.push(c);
  };

  // Blue Book: "Bid is due by 5:00 PM (Eastern) on November 6, 2026"
  for (const m of text.matchAll(new RegExp(`due by ${TIME}${ZONE} on ${LONG_DATE}`, "gi"))) {
    const month = MONTHS[m[3].slice(0, 3).toLowerCase()];
    if (!month) continue;
    add({
      where: "body", raw: m[0],
      date: iso(Number(m[5]), month, Number(m[4])),
      time: to24h(m[1]), timeZone: m[2]?.toLowerCase(),
    });
  }

  // "Bids are due by: November 17, 2026 2:00 PM", "Bid Due: November 17, 2026 2:00 PM"
  const longRe = new RegExp(`\\bbids?\\s+(?:are\\s+)?due(?:\\s+by)?:?\\s*${LONG_DATE}(?:\\s*(?:at\\s*)?${TIME})?`, "gi");
  for (const m of text.matchAll(longRe)) {
    const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (!month) continue;
    add({ where: "body", raw: m[0], date: iso(Number(m[3]), month, Number(m[2])), time: m[4] ? to24h(m[4]) : undefined });
  }

  // "Bid date: 11/23/2026 at 5:00 P"
  const numRe = new RegExp(`\\bbid\\s+(?:due\\s+)?date:?\\s*${NUM_DATE}(?:\\s*(?:at\\s*)?${TIME})?`, "gi");
  for (const m of text.matchAll(numRe)) {
    add({ where: "body", raw: m[0], date: iso(Number(m[3]), Number(m[1]), Number(m[2])), time: m[4] ? to24h(m[4]) : undefined });
  }

  return out.filter((c) => c.date);
}

/** Subject shorthand, e.g. "-bids 11/23@4PM". Month and day only. */
export function findDueInSubject(subject: string): DueCandidate[] {
  const out: DueCandidate[] = [];
  const re = /\bbids?\s+(?:due\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*(?:@|at)?\s*(\d{1,2}(?::\d{2})?\s*[ap]\.?\s*m?\.?)?/gi;
  for (const m of subject.matchAll(re)) {
    const c: DueCandidate = { where: "subject", raw: m[0].trim(), monthDay: `${pad(Number(m[1]))}-${pad(Number(m[2]))}` };
    if (m[3]) c.date = iso(Number(m[3]), Number(m[1]), Number(m[2]));
    if (m[4]) c.time = to24h(m[4]);
    out.push(c);
  }
  return out;
}

/**
 * One due date only when every statement agrees. Any disagreement returns no
 * date and a flag naming what the email said, for a person to settle.
 */
export function settleDue(cands: DueCandidate[]): {
  date: string | null; time: string | null; zone: string | null; flag: string | null;
} {
  if (cands.length === 0) {
    return { date: null, time: null, zone: null, flag: "No bid due date found in the email." };
  }
  const md = (c: DueCandidate) => c.monthDay ?? c.date?.slice(5);
  const first = cands[0];
  for (const c of cands.slice(1)) {
    const sameDay = md(c) === md(first) && (!c.date || !first.date || c.date === first.date);
    const sameTime = !c.time || !first.time || c.time === first.time;
    if (!sameDay || !sameTime) {
      return {
        date: null, time: null, zone: null,
        flag: `Bid due date conflicts in the email: ${cands.map((x) => `"${x.raw}" (${x.where})`).join(" vs ")}.`,
      };
    }
  }
  const full = cands.find((c) => c.date);
  if (!full) {
    return { date: null, time: null, zone: null, flag: `Bid due date has no year: "${first.raw}".` };
  }
  return {
    date: full.date ?? null,
    time: cands.find((c) => c.time)?.time ?? null,
    zone: cands.find((c) => c.timeZone)?.timeZone ?? null,
    flag: null,
  };
}
