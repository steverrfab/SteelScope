import type { ProcessingStatus } from "@/domain/enums";

export type JobStage =
  | "file_processing"
  | "page_processing"
  | "classification"
  | "extraction"
  | "pricing"
  | "reports"
  | "revision_compare";

export interface WorkerJob {
  jobId: string;
  organizationId: string;
  projectId: string;
  fileId?: string;
  documentId?: string;
  pageId?: string;
  sheetId?: string;
  stage: JobStage;
  attempt: number;
  idempotencyKey: string;
  requestedByUserId: string;
}

export interface JobQueue {
  enqueue(job: Omit<WorkerJob, "jobId" | "attempt">): Promise<WorkerJob>;
  getStatus(jobId: string): Promise<ProcessingStatus>;
}
