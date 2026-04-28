import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import type { InitiateMultipartUploadInput, ObjectStorage, UploadedPart } from "@/ports/storage";

const DEFAULT_CHUNK_SIZE = 25 * 1024 * 1024;

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = requiredEnv("S3_BUCKET");
    this.client = new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
            }
          : undefined
    });
  }

  async initiateMultipartUpload(input: InitiateMultipartUploadInput) {
    const objectKey = [
      "org",
      input.organizationId,
      "project",
      input.projectId,
      "file",
      input.fileId,
      "source",
      crypto.randomUUID()
    ].join("/");
    const response = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: objectKey,
        ContentType: input.contentType,
        Metadata: {
          originalName: input.fileName
        }
      })
    );
    if (!response.UploadId) {
      throw new Error("S3 did not return an upload ID.");
    }
    return {
      uploadId: response.UploadId,
      objectKey,
      chunkSizeBytes: DEFAULT_CHUNK_SIZE
    };
  }

  async putPart(uploadId: string, objectKey: string, partNumber: number, body: ReadableStream<Uint8Array>) {
    const hash = createHash("sha256");
    const source = Readable.fromWeb(body as unknown as NodeReadableStream<Uint8Array>);
    source.on("data", (chunk) => hash.update(chunk));
    const response = await this.client.send(
      new UploadPartCommand({
        Bucket: this.bucket,
        Key: objectKey,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: source
      })
    );
    return {
      partNumber,
      checksum: hash.digest("hex"),
      etag: response.ETag ?? "",
      sizeBytes: Number.NaN
    };
  }

  async completeMultipartUpload(uploadId: string, objectKey: string, parts: UploadedPart[]) {
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: objectKey,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
            .sort((a, b) => a.partNumber - b.partNumber)
            .map((part) => ({ ETag: part.etag, PartNumber: part.partNumber }))
        }
      })
    );
    const sizeBytes = parts.reduce((sum, part) => sum + (Number.isFinite(part.sizeBytes) ? part.sizeBytes : 0), 0);
    return { objectKey, sizeBytes };
  }

  async abortMultipartUpload(uploadId: string, objectKey: string) {
    await this.client.send(
      new AbortMultipartUploadCommand({
        Bucket: this.bucket,
        Key: objectKey,
        UploadId: uploadId
      })
    );
  }

  async getObjectBytes(objectKey: string) {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey
      })
    );
    if (!response.Body) throw new Error(`Object ${objectKey} has no body.`);
    return response.Body.transformToByteArray();
  }

  async putObjectBytes(input: { objectKey: string; contentType: string; body: Uint8Array }) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.objectKey,
        ContentType: input.contentType,
        Body: input.body
      })
    );
    return { objectKey: input.objectKey, sizeBytes: input.body.byteLength };
  }

  async createSignedGetUrl(objectKey: string, expiresInSeconds: number) {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey
      }),
      { expiresIn: expiresInSeconds }
    );
  }
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for S3 storage.`);
  return value;
}
