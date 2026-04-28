import { z } from "zod";
import { validateBidPackageFile } from "@/infrastructure/file-validation";
import type { AuthContext } from "@/infrastructure/auth/context";
import type { JobQueue } from "@/ports/queue";
import type { ObjectStorage, UploadedPart } from "@/ports/storage";

export const initiateUploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  checksum: z.string().optional(),
  documentRole: z.string().optional()
});

export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>;

export interface UploadRecord {
  fileId: string;
  uploadId: string;
  objectKey: string;
  chunkSizeBytes: number;
  status: "initiated";
}

export interface FileRepository {
  listProjectFiles(input: {
    organizationId: string;
    projectId: string;
  }): Promise<
    Array<{
      id: string;
      displayName: string;
      contentType: string;
      sizeBytes: number;
      status: string;
      objectKey: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  >;
  getFileStatus(input: {
    organizationId: string;
    projectId: string;
    fileId: string;
  }): Promise<{
    id: string;
    displayName: string;
    status: string;
    lastError: string | null;
    objectKey: string | null;
  }>;
  createInitiatedFile(input: {
    organizationId: string;
    projectId: string;
    displayName: string;
    contentType: string;
    sizeBytes: number;
    checksum?: string;
    uploadId: string;
    objectKey: string;
  }): Promise<{ fileId: string }>;
  markUploadComplete(input: {
    organizationId: string;
    projectId: string;
    fileId: string;
    objectKey: string;
    sizeBytes: number;
  }): Promise<void>;
}

export class UploadService {
  constructor(
    private readonly storage: ObjectStorage,
    private readonly files: FileRepository,
    private readonly queue: JobQueue
  ) {}

  async initiate(ctx: AuthContext, projectId: string, input: InitiateUploadInput): Promise<UploadRecord> {
    validateBidPackageFile(input);
    const fileId = crypto.randomUUID();
    const initiated = await this.storage.initiateMultipartUpload({
      organizationId: ctx.organizationId,
      projectId,
      fileId,
      fileName: input.fileName,
      contentType: input.contentType
    });
    const file = await this.files.createInitiatedFile({
      organizationId: ctx.organizationId,
      projectId,
      displayName: input.fileName,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      checksum: input.checksum,
      uploadId: initiated.uploadId,
      objectKey: initiated.objectKey
    });

    return {
      fileId: file.fileId,
      uploadId: initiated.uploadId,
      objectKey: initiated.objectKey,
      chunkSizeBytes: initiated.chunkSizeBytes,
      status: "initiated"
    };
  }

  async listFiles(ctx: AuthContext, projectId: string) {
    return this.files.listProjectFiles({
      organizationId: ctx.organizationId,
      projectId
    });
  }

  async getFileStatus(ctx: AuthContext, projectId: string, fileId: string) {
    return this.files.getFileStatus({
      organizationId: ctx.organizationId,
      projectId,
      fileId
    });
  }

  async complete(
    ctx: AuthContext,
    projectId: string,
    fileId: string,
    uploadId: string,
    objectKey: string,
    parts: UploadedPart[]
  ) {
    const completed = await this.storage.completeMultipartUpload(uploadId, objectKey, parts);
    await this.files.markUploadComplete({
      organizationId: ctx.organizationId,
      projectId,
      fileId,
      objectKey: completed.objectKey,
      sizeBytes: completed.sizeBytes
    });
    return this.queue.enqueue({
      organizationId: ctx.organizationId,
      projectId,
      fileId,
      stage: "file_processing",
      idempotencyKey: `file_processing:${fileId}`,
      requestedByUserId: ctx.userId
    });
  }
}
