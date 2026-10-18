// Inbox reader entry point: one email in, a sorted and parsed result out.
// No side effects. The caller decides what to store; nothing is sent anywhere.

import { classifyEmail } from "./classify";
import { extractInvite, extractQuarantined } from "./extract";
import { extractLinks, htmlToText } from "./html";
import { maskSecrets } from "./urls";
import type { Classification, EmailInput, InviteFields, Link, QuarantinedInvite } from "./types";

export interface ReadResult {
  classification: Classification;
  invite: InviteFields | null;
  quarantined: QuarantinedInvite[];
  /** Body text with access codes hidden. Safe for logs and screens. */
  safeText: string;
  links: Link[];
}

export function readEmail(email: EmailInput): ReadResult {
  const text = email.html ? htmlToText(email.html) : (email.text ?? "");
  const links = email.html ? extractLinks(email.html) : [];
  const classification = classifyEmail(email, text);
  const invite = classification.kind === "new_invite" ? extractInvite(email, classification, text, links) : null;
  const quarantined = classification.kind === "quarantine_digest" ? extractQuarantined(text) : [];
  return { classification, invite, quarantined, safeText: maskSecrets(text), links };
}

export * from "./types";
export { redactUrl, maskSecrets, unwrapUrl } from "./urls";
