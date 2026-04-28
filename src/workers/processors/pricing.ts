import { defaultHardBidTemplate, priceSteelPounds } from "@/domain/pricing";
import type { WorkerJob } from "@/ports/queue";

export async function processPricingJob(job: WorkerJob, totalApprovedPounds: number) {
  if (job.stage !== "pricing") throw new Error("Invalid job stage for pricing processor.");
  return priceSteelPounds(totalApprovedPounds, defaultHardBidTemplate);
}
