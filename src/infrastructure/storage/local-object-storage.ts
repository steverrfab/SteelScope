import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import type { InitiateMultipartUploadInput, ObjectStorage, UploadedPart } from "@/ports/storage";

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;

export class LocalObjectStorage implements ObjectStorage {
  constructor(private readonly root: string = process.env.LOCAL_OBJECT_STORAGE_ROOT ?? ".data/object-storage") {}

  async initiateMultipartUpload(input: InitiateMultipartUploadInput) {
    const uploadId = crypto.randomUUID();
    const objectKey = path.posix.join(
      "org",
      input.organizationId,
      "project",
      input.projectId,
      "file",
      input.fileId,
      "source",
      uploadId
    );
    await mkdir(this.partDirectory(uploadId, objectKey), { recursive: true });
    return {
      uploadId,
      objectKey,
      chunkSizeBytes: DEFAULT_CHUNK_SIZE
    };
  }

  async putPart(uploadId: string, objectKey: string, partNumber: number, body: ReadableStream<Uint8Array>) {
    if (!Number.isInteger(partNumber) || partNumber <= 0) {
      throw new Error("Part number must be a positive integer.");
    }
    const dir = this.partDirectory(uploadId, objectKey);
    await mkdir(dir, { recursive: true });
    const partPath = path.join(dir, `${partNumber}.part`);
    const hash = createHash("sha256");
    const source = Readable.fromWeb(body as unknown as NodeReadableStream<Uint8Array>);
    source.on("data", (chunk) => hash.update(chunk));
    await pipeline(source, createWriteStream(partPath));
    const partStat = await stat(partPath);
    return {
      partNumber,
      checksum: hash.digest("hex"),
      etag: `${uploadId}-${partNumber}-${partStat.size}`,
      sizeBytes: partStat.size
    };
  }

  async completeMultipartUpload(uploadId: string, objectKey: string, parts: UploadedPart[]) {
    if (parts.length === 0) {
      throw new Error("At least one uploaded part is required.");
    }
    const sortedParts = [...parts].sort((a, b) => a.partNumber - b.partNumber);
    const objectPath = this.objectPath(objectKey);
    await mkdir(path.dirname(objectPath), { recursive: true });
    const destination = createWriteStream(objectPath);

    try {
      for (const part of sortedParts) {
        const partPath = path.join(this.partDirectory(uploadId, objectKey), `${part.partNumber}.part`);
        await pipeline(createReadStream(partPath), destination, { end: false });
      }
    } finally {
      destination.end();
    }

    await new Promise<void>((resolve, reject) => {
      destination.on("finish", resolve);
      destination.on("error", reject);
    });
    const objectStat = await stat(objectPath);
    return { objectKey, sizeBytes: objectStat.size };
  }

  async abortMultipartUpload(_uploadId: string, _objectKey: string) {
    return;
  }

  async getObjectBytes(objectKey: string) {
    return readFile(this.objectPath(objectKey));
  }

  async putObjectBytes(input: { objectKey: string; contentType: string; body: Uint8Array }) {
    const objectPath = this.objectPath(input.objectKey);
    await mkdir(path.dirname(objectPath), { recursive: true });
    await writeFile(objectPath, input.body);
    const objectStat = await stat(objectPath);
    return { objectKey: input.objectKey, sizeBytes: objectStat.size };
  }

  async createSignedGetUrl(objectKey: string, _expiresInSeconds: number) {
    return `local-object://${objectKey}`;
  }

  private objectPath(objectKey: string) {
    const normalized = objectKey.split("/").filter(Boolean);
    return path.join(process.cwd(), this.root, ...normalized);
  }

  private partDirectory(uploadId: string, objectKey: string) {
    return path.join(process.cwd(), this.root, ".multipart", uploadId, ...objectKey.split("/").filter(Boolean));
  }
}
