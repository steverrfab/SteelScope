export const structuralSteelTerms = [
  "beam",
  "column",
  "joist",
  "deck",
  "lintel",
  "angle",
  "channel",
  "hss",
  "pipe column",
  "bracing",
  "moment frame",
  "base plate",
  "cap plate",
  "stiffener",
  "gusset plate",
  "embed plate",
  "anchor rod",
  "bolt",
  "weld",
  "dunnage",
  "roof frame",
  "equipment support",
  "loose lintel",
  "shelf angle",
  "relieving angle",
  "edge angle"
];

export const miscMetalsTerms = [
  "stair",
  "rail",
  "guardrail",
  "handrail",
  "ladder",
  "ship ladder",
  "bollard",
  "grating",
  "platform",
  "canopy",
  "checker plate",
  "safety gate",
  "mezzanine",
  "access platform",
  "wall rail",
  "kick plate",
  "toe plate",
  "metal gate"
];

export const riskTerms = [
  "by others",
  "not in scope",
  "delegated design",
  "design-build",
  "contractor to verify",
  "field verify",
  "existing conditions",
  "galvanized",
  "painted",
  "primed",
  "fireproofed",
  "aess",
  "stainless steel",
  "aluminum",
  "hot-dip galvanized",
  "powder coat",
  "mockup",
  "special inspection",
  "welding inspection",
  "pe stamped calculations",
  "deferred submittal",
  "alternate",
  "unit price",
  "allowance",
  "addendum",
  "clarification",
  "exclusion",
  "owner furnished",
  "gc furnished",
  "installed by others",
  "furnished only",
  "install only",
  "coordinate with",
  "final dimensions by field verification"
];

export interface DetectedTerm {
  term: string;
  family: "structural_steel" | "misc_metals" | "risk";
  occurrences: number;
}

export function detectScopeTerms(text: string): DetectedTerm[] {
  const normalized = text.toLowerCase();
  return [
    ...matchTerms(normalized, structuralSteelTerms, "structural_steel"),
    ...matchTerms(normalized, miscMetalsTerms, "misc_metals"),
    ...matchTerms(normalized, riskTerms, "risk")
  ];
}

function matchTerms(
  text: string,
  terms: string[],
  family: DetectedTerm["family"]
): DetectedTerm[] {
  return terms
    .map((term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = text.match(new RegExp(`\\b${escaped}\\b`, "gi"));
      return { term, family, occurrences: matches?.length ?? 0 };
    })
    .filter((match) => match.occurrences > 0);
}
