import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { PdfPageArtifact, PdfProcessor } from "@/ports/pdf";
import type { ObjectStorage } from "@/ports/storage";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfjsPromise: Promise<PdfJsModule> | undefined;

async function loadPdfJs() {
  pdfjsPromise ??= import("pdfjs-dist/legacy/build/pdf.mjs");
  return pdfjsPromise;
}

export class PdfJsPdfProcessor implements PdfProcessor {
  constructor(private readonly storage: ObjectStorage) {}

  async *splitToPages(input: { sourceObjectKey: string; projectId: string; fileId: string }): AsyncIterable<PdfPageArtifact> {
    const pdf = await this.loadDocument(input.sourceObjectKey);
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      yield {
        pageNumber,
        width: viewport.width,
        height: viewport.height
      };
    }
  }

  async extractVectorText(input: { sourceObjectKey: string; pageNumber: number }) {
    const pdf = await this.loadDocument(input.sourceObjectKey);
    const page = await pdf.getPage(input.pageNumber);
    const content = await page.getTextContent();
    const items = content.items.filter((item): item is TextItem => "str" in item);
    const text = items
      .map((item) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return {
      text,
      confidence: text.length > 25 ? 0.92 : 0.2
    };
  }

  private async loadDocument(sourceObjectKey: string) {
    const pdfjs = await loadPdfJs();
    const bytes = await this.storage.getObjectBytes(sourceObjectKey);
    const loadingTask = pdfjs.getDocument({
      data: bytes,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true
    });
    return loadingTask.promise;
  }
}
