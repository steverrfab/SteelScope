import type { PageType, Discipline } from "@/domain/enums";
import type { SourceEvidence } from "@/domain/source-evidence";

export interface OcrResult {
  text: string;
  confidence: number;
  blocks: Array<{ text: string; confidence: number; evidence: SourceEvidence }>;
  tables: Array<{ markdown: string; confidence: number; evidence: SourceEvidence }>;
}

export interface OcrProvider {
  extractPage(input: { pageImageObjectKey: string; projectId: string; pageId: string }): Promise<OcrResult>;
}

export interface PageClassification {
  discipline: Discipline;
  pageType: PageType;
  sheetNumber?: string;
  sheetTitle?: string;
  scale?: string;
  revisionDate?: string;
  projectName?: string;
  confidence: number;
  reason: string;
}

export interface LlmProvider {
  classifyPage(input: { text: string; sheetHint?: string }): Promise<PageClassification>;
  extractStructuredEntities<T>(input: { schemaName: string; text: string; evidence: SourceEvidence }): Promise<T>;
}

export interface EmbeddingProvider {
  embed(input: { text: string; modelHint?: string }): Promise<number[]>;
}
