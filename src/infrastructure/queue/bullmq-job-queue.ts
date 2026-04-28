import { Queue } from "bullmq";
import type { ProcessingStatus } from "@/domain/enums";
import type { JobQueue, WorkerJob } from "@/ports/queue";

export class BullMqJobQueue implements JobQueue {
  private readonly queues = new Map<string, Queue>();

  async enqueue(job: Omit<WorkerJob, "jobId" | "attempt">): Promise<WorkerJob> {
    const queued: WorkerJob = {
      ...job,
      jobId: crypto.randomUUID(),
      attempt: 0
    };
    await this.queueFor(job.stage).add(job.stage, queued, {
      jobId: job.idempotencyKey,
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 }
    });
    return queued;
  }

  async getStatus(jobId: string): Promise<ProcessingStatus> {
    for (const queue of this.queues.values()) {
      const job = await queue.getJob(jobId);
      if (!job) continue;
      const state = await job.getState();
      if (state === "completed") return "succeeded";
      if (state === "failed") return "failed";
      if (state === "active") return "running";
      return "queued";
    }
    return "failed";
  }

  private queueFor(stage: string) {
    const existing = this.queues.get(stage);
    if (existing) return existing;
    const queue = new Queue(stage, {
      connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" }
    });
    this.queues.set(stage, queue);
    return queue;
  }
}
