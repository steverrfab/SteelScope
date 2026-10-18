// Shapes used by the inbox reader. Plain data only: no database, no Microsoft
// Graph. Everything here can be tested with sample emails.

export interface EmailInput {
  fromAddress: string;
  fromName?: string;
  subject: string;
  receivedAt: string; // ISO timestamp
  html?: string;
  text?: string;
}

export type EmailKind =
  | "new_invite"
  | "update"
  | "digest"
  | "quarantine_digest"
  | "other";

export type EmailSource =
  | "bluebook"
  | "buildingconnected"
  | "planhub"
  | "direct"
  | "spam_filter"
  | "unknown";

export interface Classification {
  kind: EmailKind;
  source: EmailSource;
  reason: string; // plain-language why, for the activity log
}

export interface Link {
  text: string;
  url: string; // unwrapped real address
}

/** A due date the email states somewhere. Kept so conflicts can be shown. */
export interface DueCandidate {
  where: "subject" | "body";
  date?: string; // YYYY-MM-DD, only when the email gives the year
  monthDay?: string; // MM-DD
  time?: string; // HH:MM, 24-hour
  timeZone?: string;
  raw: string;
}

export interface InviteFields {
  projectName: string | null;
  gc: string | null;
  contact: string | null;
  location: string | null;
  scopes: string[];
  dueDate: string | null; // YYYY-MM-DD
  dueTime: string | null; // HH:MM
  dueTimeZone: string | null;
  walkthrough: string | null; // raw sentence, a person confirms
  rfiDeadline: string | null; // raw sentence, a person confirms
  planLinks: Link[];
  flags: string[]; // plain-language problems for the reviewer
}

export interface QuarantinedInvite {
  sender: string;
  subject: string;
  heldOn: string; // as the digest prints it
}
