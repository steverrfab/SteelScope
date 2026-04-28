export interface PdfPageArtifact {
  pageNumber: number;
  width: number;
  height: number;
  textObjectKey?: string;
  thumbnailObjectKey?: string;
  rasterObjectKey?: string;
}

export interface PdfProcessor {
  splitToPages(input: { sourceObjectKey: string; projectId: string; fileId: string }): AsyncIterable<PdfPageArtifact>;
  extractVectorText(input: { sourceObjectKey: string; pageNumber: number }): Promise<{ text: string; confidence: number }>;
}
