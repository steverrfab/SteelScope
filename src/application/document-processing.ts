import type { PageClassification } from "@/ports/ai";
import type { PdfPageArtifact } from "@/ports/pdf";

export interface SourceFileForProcessing {
  id: string;
  displayName: string;
  contentType: string;
  objectKey: string;
}

export interface PersistedPage {
  id: string;
  pageNumber: number;
}

export interface ProcessingRepository {
  getSourceFile(input: { organizationId: string; projectId: string; fileId: string }): Promise<SourceFileForProcessing>;
  markFileStatus(input: {
    organizationId: string;
    projectId: string;
    fileId: string;
    status: "queued" | "running" | "succeeded" | "failed" | "needs_review" | "skipped";
    lastError?: string | null;
  }): Promise<void>;
  createOrUpdateDocument(input: {
    projectId: string;
    fileId: string;
    title: string;
    kind: string;
    pageCount: number;
  }): Promise<{ id: string }>;
  upsertPage(input: {
    projectId: string;
    fileId: string;
    documentId: string;
    artifact: PdfPageArtifact;
    searchText?: string;
    vectorTextConfidence?: number;
    processingStatus: "queued" | "running" | "succeeded" | "failed" | "needs_review" | "skipped";
    classification?: PageClassification;
  }): Promise<PersistedPage>;
  saveOcrText(input: {
    pageId: string;
    source: "vector_pdf" | "ocr";
    text: string;
    confidence: number;
    blocks?: unknown;
    tables?: unknown;
  }): Promise<void>;
  saveDetectedTerms(input: {
    projectId: string;
    pageId: string;
    terms: Array<{ term: string; family: "structural_steel" | "misc_metals" | "risk"; occurrences: number }>;
    text: string;
  }): Promise<void>;
  getProcessingRollup(projectId: string, organizationId: string): Promise<Record<string, number>>;
  searchProject(input: { organizationId: string; projectId: string; query: string }): Promise<
    Array<{
      type: string;
      id: string;
      title: string;
      snippet: string;
      pageNumber?: number;
      confidence?: number;
    }>
  >;
}

export function deterministicClassifyPage(text: string, fileName?: string): PageClassification {
  const haystack = `${fileName ?? ""} ${text}`.toLowerCase();
  const sheetMatch = text.match(/\b([A-Z]{1,3}[-\s]?\d{2,4}(?:\.\d+)?)\b/);
  const scaleMatch = text.match(/\b(?:scale\s*:?\s*)?(\d+\/\d+"\s*=\s*1'-0"|1\/8"\s*=\s*1'-0"|1\/4"\s*=\s*1'-0"|3\/16"\s*=\s*1'-0")/i);

  if (haystack.includes("specification") || /\bsection\s+\d{2}\s+\d{2}\s+\d{2}\b/i.test(text)) {
    return baseClassification("specifications", "specification", sheetMatch?.[1], scaleMatch?.[1]);
  }
  if (haystack.includes("addendum") || haystack.includes("addenda")) {
    return baseClassification("addenda", "addendum", sheetMatch?.[1], scaleMatch?.[1]);
  }
  if (/\bS[-\s]?\d{2,4}\b/i.test(text) || haystack.includes("structural")) {
    return baseClassification("structural", "structural_drawing", sheetMatch?.[1], scaleMatch?.[1]);
  }
  if (/\bA[-\s]?\d{2,4}\b/i.test(text) || haystack.includes("architectural")) {
    return baseClassification("architectural", "architectural_drawing", sheetMatch?.[1], scaleMatch?.[1]);
  }
  if (/\bC[-\s]?\d{2,4}\b/i.test(text) || haystack.includes("civil")) {
    return baseClassification("civil", "civil_drawing", sheetMatch?.[1], scaleMatch?.[1]);
  }
  if (/\b(M|E|P|FP)[-\s]?\d{2,4}\b/i.test(text) || haystack.includes("mechanical") || haystack.includes("electrical")) {
    return baseClassification("mep", "mep_drawing", sheetMatch?.[1], scaleMatch?.[1]);
  }
  return baseClassification("unknown", "unknown", sheetMatch?.[1], scaleMatch?.[1], 0.35, "No deterministic discipline signal found.");
}

function baseClassification(
  discipline: PageClassification["discipline"],
  pageType: PageClassification["pageType"],
  sheetNumber?: string,
  scale?: string,
  confidence = 0.72,
  reason = "Deterministic keyword and sheet-number classification."
): PageClassification {
  return {
    discipline,
    pageType,
    sheetNumber,
    scale,
    confidence,
    reason
  };
}
