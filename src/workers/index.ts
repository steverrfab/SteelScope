import { container } from "@/infrastructure/container";
import { processFileJob } from "@/workers/processors/file-processing";
import { processPageJob } from "@/workers/processors/page-processing";
import { processPricingJob } from "@/workers/processors/pricing";
import type { WorkerJob } from "@/ports/queue";

export async function dispatchWorkerJob(job: WorkerJob) {
  switch (job.stage) {
    case "file_processing":
      return processFileJob(job, container.pdf, container.queue, container.processing);
    case "page_processing":
      return processPageJob(job, container.pdf, container.ocr, container.llm);
    case "pricing":
      return processPricingJob(job, 0);
    case "classification":
    case "extraction":
    case "reports":
    case "revision_compare":
      throw new Error(`${job.stage} processor is registered but not yet implemented.`);
    default:
      job.stage satisfies never;
      throw new Error("Unsupported worker stage.");
  }
}

if (require.main === module) {
  console.log("SteelScope worker entrypoint loaded. Connect BullMQ adapter to consume jobs.");
}
