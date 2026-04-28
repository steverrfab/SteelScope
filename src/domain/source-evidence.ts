export type SourceType = "text" | "table" | "visual" | "manual" | "calculated";

export interface BoundingBox {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
  units: "points" | "pixels" | "percent";
}

export interface SourceEvidence {
  sourceType: SourceType;
  projectId: string;
  fileId?: string;
  documentId?: string;
  pageId?: string;
  sheetId?: string;
  sheetNumber?: string;
  detailReference?: string;
  specReference?: string;
  textQuote?: string;
  tableReference?: string;
  boundingBox?: BoundingBox;
  confidence: number;
  reason: string;
}

export function requireEvidenceConfidence(evidence: SourceEvidence): void {
  if (evidence.confidence < 0 || evidence.confidence > 1) {
    throw new Error("Evidence confidence must be between 0 and 1.");
  }
  if (!evidence.reason.trim()) {
    throw new Error("Evidence reason is required for estimator review.");
  }
}
