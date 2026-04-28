import { deterministicClassifyPage } from "@/application/document-processing";
import { detectScopeTerms } from "@/domain/scope-vocabulary";
import type { LlmProvider, OcrProvider } from "@/ports/ai";
import type { PdfProcessor } from "@/ports/pdf";
import type { WorkerJob } from "@/ports/queue";

export async function processPageJob(job: WorkerJob, pdf: PdfProcessor, ocr: OcrProvider, llm: LlmProvider) {
  if (!job.fileId || !job.pageId) throw new Error("page_processing job requires fileId and pageId.");
  const pageNumber = Number(job.pageId.split(":").at(-1));
  const sourceObjectKey = `resolved-by-file-repository:${job.fileId}`;
  const vector = await pdf.extractVectorText({ sourceObjectKey, pageNumber });
  const needsOcr = vector.text.trim().length < 25 || vector.confidence < 0.65;
  const ocrResult = needsOcr
    ? await ocr.extractPage({ pageImageObjectKey: `resolved-page-raster:${job.pageId}`, projectId: job.projectId, pageId: job.pageId })
    : undefined;
  const text = ocrResult?.text ?? vector.text;
  const classification = await llm.classifyPage({ text }).catch(() => deterministicClassifyPage(text));
  const detectedTerms = detectScopeTerms(text);

  return {
    vectorConfidence: vector.confidence,
    ocrConfidence: ocrResult?.confidence,
    classification,
    detectedTerms,
    requiresEstimatorReview: needsOcr || classification.confidence < 0.8 || detectedTerms.some((term) => term.family === "risk")
  };
}
