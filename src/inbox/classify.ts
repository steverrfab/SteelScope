// Sort an estimating@ email into one of the types in ARCHITECTURE.md.
// Rules come from a sample of the real inbox (Sept to Oct 2026).
// When nothing matches, the answer is "other", never a guess.

import type { Classification, EmailInput, EmailSource } from "./types";

const UPDATE_WORDS =
  /\b(addend(a|um)|amendment|extension|extended|rfi|site visit|walk[- ]?through|pre-?bid|reminder|scope of work|sow|wage scale|bids? due|proposals? due|intent to bid|not bidding|general memo|updated bid documents|revised|geotech|qualifications|project status)\b/i;

const INVITE_WORDS = /\b(invitation to bid|invited to bid|invites you to bid|itb)\b/i;

function domainOf(address: string): string {
  return address.toLowerCase().split("@")[1] ?? "";
}

function result(kind: Classification["kind"], source: EmailSource, reason: string): Classification {
  return { kind, source, reason };
}

export function classifyEmail(email: EmailInput, bodyText = ""): Classification {
  const from = email.fromAddress.toLowerCase();
  const domain = domainOf(from);
  const subject = email.subject.trim();

  // Spam filter digest. It can list bid invites that never reached the inbox.
  if (domain.endsWith("proofpointessentials.com") && /quarantine digest/i.test(subject)) {
    return result("quarantine_digest", "spam_filter", "Spam filter quarantine digest");
  }

  // The Blue Book (owned by Dodge).
  if (domain.endsWith("thebluebook.com")) {
    if (/bidscope summary/i.test(subject)) {
      return result("digest", "bluebook", "Blue Book daily summary");
    }
    if (/^invitation to bid\b/i.test(subject)) {
      return result("new_invite", "bluebook", "Blue Book invitation to bid");
    }
    return result("update", "bluebook", "Blue Book message about an invite");
  }

  // BuildingConnected.
  if (domain === "buildingconnected.com") {
    if (/^bid invite:/i.test(subject)) {
      return result("new_invite", "buildingconnected", "BuildingConnected bid invite");
    }
    if (/sent your company a message about/i.test(bodyText)) {
      return result("update", "buildingconnected", "BuildingConnected message about an invite");
    }
    return result("other", "buildingconnected", "BuildingConnected email of an unknown type");
  }

  // PlanHub. Invites come from message.planhub.com; the rest is marketing.
  if (domain.endsWith("planhub.com") || domain.endsWith("planhubprojects.com")) {
    if (domain === "message.planhub.com" && /^itb\s*-/i.test(subject)) {
      return result("new_invite", "planhub", "PlanHub invitation to bid");
    }
    return result("digest", "planhub", "PlanHub marketing or project list");
  }

  // Direct from a GC or a GC's plan room. Updates first: an addendum email
  // often repeats "invitation to bid" in its body.
  if (UPDATE_WORDS.test(subject)) {
    return result("update", "direct", "GC message about an invite (subject)");
  }
  if (INVITE_WORDS.test(subject) || INVITE_WORDS.test(bodyText.slice(0, 600))) {
    return result("new_invite", "direct", "Invitation to bid from a GC");
  }
  return result("other", "unknown", "Not a bid invite or update");
}
