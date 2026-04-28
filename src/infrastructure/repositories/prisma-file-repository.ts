import type { FileRepository } from "@/application/uploads";
import { getPrisma } from "@/infrastructure/database/prisma";

export class PrismaFileRepository implements FileRepository {
  async listProjectFiles(input: { organizationId: string; projectId: string }) {
    const files = await getPrisma().file.findMany({
      where: {
        organizationId: input.organizationId,
        projectId: input.projectId
      },
      orderBy: { createdAt: "desc" }
    });
    return files.map((file) => ({
      id: file.id,
      displayName: file.displayName,
      contentType: file.contentType,
      sizeBytes: Number(file.sizeBytes),
      status: file.status,
      objectKey: file.objectKey,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString()
    }));
  }

  async getFileStatus(input: { organizationId: string; projectId: string; fileId: string }) {
    const file = await getPrisma().file.findFirst({
      where: {
        id: input.fileId,
        organizationId: input.organizationId,
        projectId: input.projectId
      }
    });
    if (!file) {
      throw new Response("File not found", { status: 404 });
    }
    return {
      id: file.id,
      displayName: file.displayName,
      status: file.status,
      lastError: file.lastError,
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
    const prisma = getPrisma();
    const file = await prisma.file.create({
      data: {
        organizationId: input.organizationId,
        projectId: input.projectId,
        displayName: input.displayName,
        contentType: input.contentType,
        sizeBytes: BigInt(input.sizeBytes),
        checksum: input.checksum,
        uploadId: input.uploadId,
        objectKey: input.objectKey,
        status: "queued"
      },
      select: { id: true }
    });
    return { fileId: file.id };
  }

  async markUploadComplete(input: {
    organizationId: string;
    projectId: string;
    fileId: string;
    objectKey: string;
    sizeBytes: number;
  }) {
    const prisma = getPrisma();
    await prisma.file.update({
      where: {
        id: input.fileId,
        organizationId: input.organizationId,
        projectId: input.projectId
      },
      data: {
        objectKey: input.objectKey,
        sizeBytes: BigInt(input.sizeBytes),
        status: "queued"
      }
    });
  }
}
