export const disciplines = [
  "structural",
  "architectural",
  "civil",
  "mep",
  "specifications",
  "bid",
  "addenda",
  "unknown"
] as const;

export type Discipline = (typeof disciplines)[number];

export const pageTypes = [
  "structural_drawing",
  "architectural_drawing",
  "civil_drawing",
  "mep_drawing",
  "specification",
  "addendum",
  "bid_instruction",
  "scope_note",
  "alternate",
  "schedule",
  "general_note",
  "steel_note",
  "connection_note",
  "misc_metals_drawing",
  "stair_drawing",
  "rail_drawing",
  "detail",
  "section",
  "elevation",
  "unknown"
] as const;

export type PageType = (typeof pageTypes)[number];

export const reviewStatuses = [
  "not_reviewed",
  "needs_review",
  "approved",
  "rejected",
  "edited",
  "excluded",
  "clarification_needed"
] as const;

export type ReviewStatus = (typeof reviewStatuses)[number];

export const processingStatuses = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "needs_review",
  "skipped"
] as const;

export type ProcessingStatus = (typeof processingStatuses)[number];

export const takeoffCategories = [
  "structural_steel",
  "misc_metals",
  "deck",
  "joists",
  "plates",
  "bolts_rods",
  "finishing",
  "installation",
  "allowance",
  "alternate"
] as const;

export type TakeoffCategory = (typeof takeoffCategories)[number];
