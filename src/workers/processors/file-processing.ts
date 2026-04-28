import { deterministicClassifyPage, type ProcessingRepository } from "@/application/document-processing";
import { detectScopeTerms } from "@/domain/scope-vocabulary";
import type { WorkerJob } from "@/ports/queue";
import type { PdfProcessor } from "@/ports/pdf";
import type { JobQueue } from "@/ports/queue";

export async function processFileJob(
  job: WorkerJob,
  pdf: PdfProcessor,
  queue: JobQueue,
  processing: ProcessingRepository
) {
  if (!job.fileId) throw new Error("file_processing job requires fileId.");
  await processing.markFileStatus({
    organizationId: job.organizationId,
    projectId: job.projectId,
    fileId: job.fileId,
    status: "running",
    lastError: null
  });

  try {
    const file = await processing.getSourceFile({
      organizationId: job.organizationId,
      projectId: job.projectId,
      fileId: job.fileId
    });
    if (file.contentType !== "application/pdf") {
      await processing.markFileStatus({
        organizationId: job.organizationId,
        projectId: job.projectId,
        fileId: job.fileId,
        status: "needs_review",
        lastError: "Only PDF processing is implemented in the current worker slice."
      });
      return;
    }

    const pages = [];
    for await (const page of pdf.splitToPages({ sourceObjectKey: file.objectKey, projectId: job.projectId, fileId: job.fileId })) {
      pages.push(page);
    }

    const document = await processing.createOrUpdateDocument({
      projectId: job.projectId,
      fileId: job.fileId,
      title: file.displayName,
      kind: "pdf",
      pageCount: pages.length
    });

    let needsReview = false;
    for (const page of pages) {
      const vector = await pdf.extractVectorText({ sourceObjectKey: file.objectKey, pageNumber: page.pageNumber });
      const classification = deterministicClassifyPage(vector.text, file.displayName);
      const terms = detectScopeTerms(vector.text);
      const pageStatus = vector.confidence < 0.65 || classification.confidence < 0.5 ? "needs_review" : "succeeded";
      needsReview ||= pageStatus === "needs_review" || terms.some((term) => term.family === "risk");
      const persistedPage = await processing.upsertPage({
        projectId: job.projectId,
        fileId: job.fileId,
        documentId: document.id,
        artifact: page,
        searchText: vector.text,
        vectorTextConfidence: vector.confidence,
        processingStatus: pageStatus,
        classification
      });
      await processing.saveOcrText({
        pageId: persistedPage.id,
        source: "vector_pdf",
        text: vector.text,
        confidence: vector.confidence
      });
      await processing.saveDetectedTerms({
        projectId: job.projectId,
        pageId: persistedPage.id,
        terms,
        text: vector.text
      });
      if (pageStatus === "needs_review") {
        await queue.enqueue({
          organizationId: job.organizationId,
          projectId: job.projectId,
          fileId: job.fileId,
          pageId: persistedPage.id,
          stage: "page_processing",
          idempotencyKey: `page_processing:${persistedPage.id}`,
          requestedByUserId: job.requestedByUserId
        });
      }
    }

    await processing.markFileStatus({
      organizationId: job.organizationId,
      projectId: job.projectId,
      fileId: job.fileId,
      status: needsReview ? "needs_review" : "succeeded",
      lastError: null
    });
  } catch (error) {
    await processing.markFileStatus({
      organizationId: job.organizationId,
      projectId: job.projectId,
      fileId: job.fileId,
      status: "failed",
      lastError: error instanceof Error ? error.message : "Unknown file processing failure."
    });
    throw error;
  }
}
