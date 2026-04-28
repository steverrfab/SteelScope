import type { ProcessingStatus } from "@/domain/enums";
import type { JobQueue, WorkerJob } from "@/ports/queue";

const jobs = new Map<string, WorkerJob & { status: ProcessingStatus }>();

export class InMemoryJobQueue implements JobQueue {
  async enqueue(job: Omit<WorkerJob, "jobId" | "attempt">): Promise<WorkerJob> {
    const queued: WorkerJob & { status: ProcessingStatus } = {
      ...job,
      jobId: crypto.randomUUID(),
      attempt: 0,
      status: "queued"
    };
    jobs.set(queued.jobId, queued);
    return queued;
  }

  async getStatus(jobId: string): Promise<ProcessingStatus> {
    return jobs.get(jobId)?.status ?? "failed";
  }
}
