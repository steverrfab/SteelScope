// Decide which invite an email belongs to. Pure functions, no database.
//
// The rule is "one clear match or none": if an update could belong to more
// than one invite, it is marked ambiguous for a person, never assigned.

export interface InviteKey {
  id: string;
  projectKey: string | null;
  gc: string | null;
}

/** Lowercase words only, location in brackets dropped. */
export function projectKey(name: string | null | undefined): string | null {
  if (!name) return null;
  const key = name
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(project|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return key.length >= 6 ? key : null;
}

/** Company name reduced to its distinctive words. */
export function gcKey(name: string | null | undefined): string | null {
  if (!name) return null;
  const key = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(inc|llc|co|corp|corporation|company|construction|contractors?|contracting|group|general|the|of|america)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return key.length >= 3 ? key : null;
}

function normalize(text: string): string {
  return ` ${text.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ")} `;
}

/** Same project from the same GC already on file (a duplicate invite). */
export function findDuplicate(
  invites: InviteKey[],
  project: string | null,
  gc: string | null,
): InviteKey | null {
  const p = projectKey(project);
  const g = gcKey(gc);
  if (!p || !g) return null;
  const hits = invites.filter((i) => i.projectKey === p && gcKey(i.gc) === g);
  return hits.length === 1 ? hits[0] : null;
}

export type MatchResult =
  | { status: "matched"; inviteId: string; note: string }
  | { status: "ambiguous"; candidates: string[]; note: string }
  | { status: "unmatched"; note: string };

/**
 * Match an update email (addendum, extension, site visit...) to one invite.
 * `haystack` is the subject, sender name and the start of the body.
 */
export function matchUpdate(invites: InviteKey[], haystack: string): MatchResult {
  const hay = normalize(haystack);
  const byProject = invites.filter((i) => i.projectKey && hay.includes(` ${i.projectKey} `));
  if (byProject.length === 0) {
    return { status: "unmatched", note: "No invite on file names this project." };
  }
  if (byProject.length === 1) {
    return { status: "matched", inviteId: byProject[0].id, note: "Project name matches one invite." };
  }
  // Same project from several GCs: the GC's name must appear too.
  const byGc = byProject.filter((i) => {
    const g = gcKey(i.gc);
    return g && hay.includes(` ${g} `);
  });
  if (byGc.length === 1) {
    return { status: "matched", inviteId: byGc[0].id, note: "Project and GC match one invite." };
  }
  return {
    status: "ambiguous",
    candidates: (byGc.length ? byGc : byProject).map((i) => i.id),
    note: `Project matches ${byProject.length} invites and the GC could not be told apart. A person picks.`,
  };
}
