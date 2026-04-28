import type { FileRepository } from "@/application/uploads";

const files = new Map<string, { organizationId: string; projectId: string; objectKey: string; status: string }>();

export class InMemoryFileRepository implements FileRepository {
  async listProjectFiles(input: { organizationId: string; projectId: string }) {
    return Array.from(files.entries())
      .filter(([, file]) => file.organizationId === input.organizationId && file.projectId === input.projectId)
      .map(([id, file]) => ({
        id,
        displayName: id,
        contentType: "application/octet-stream",
        sizeBytes: 0,
        status: file.status,
        objectKey: file.objectKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
  }

  async getFileStatus(input: { organizationId: string; projectId: string; fileId: string }) {
    const file = files.get(input.fileId);
    if (!file || file.organizationId !== input.organizationId || file.projectId !== input.projectId) {
      throw new Response("File not found", { status: 404 });
    }
    return {
      id: input.fileId,
      displayName: input.fileId,
      status: file.status,
      lastError: null,
      objectKey: file.objectKey
    };
  }

  async createInitiatedFile(input: {
    organizationId: string;
    projectId: string;
    displayName: string;
    contentType: string;
    sizeBytes: number;
    checksum?: string;
    uploadId: string;
    objectKey: string;
  }) {
    const fileId = crypto.randomUUID();
    files.set(fileId, {
      organizationId: input.organizationId,
      projectId: input.projectId,
      objectKey: input.objectKey,
      status: "queued"
    });
    return { fileId };
  }

  async markUploadComplete(input: {
    organizationId: string;
    projectId: string;
    fileId: string;
    objectKey: string;
    sizeBytes: number;
  }) {
    const existing = files.get(input.fileId);
    if (!existing || existing.organizationId !== input.organizationId || existing.projectId !== input.projectId) {
      throw new Error("File not found for organization/project.");
    }
    files.set(input.fileId, { ...existing, objectKey: input.objectKey, status: "queued" });
  }
}
