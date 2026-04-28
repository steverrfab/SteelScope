export interface InitiateMultipartUploadInput {
  organizationId: string;
  projectId: string;
  fileId: string;
  fileName: string;
  contentType: string;
}

export interface InitiatedUpload {
  uploadId: string;
  objectKey: string;
  chunkSizeBytes: number;
}

export interface UploadedPart {
  partNumber: number;
  checksum: string;
  etag: string;
  sizeBytes: number;
}

export interface ObjectStorage {
  initiateMultipartUpload(input: InitiateMultipartUploadInput): Promise<InitiatedUpload>;
  putPart(uploadId: string, objectKey: string, partNumber: number, body: ReadableStream<Uint8Array>): Promise<UploadedPart>;
  completeMultipartUpload(uploadId: string, objectKey: string, parts: UploadedPart[]): Promise<{ objectKey: string; sizeBytes: number }>;
  abortMultipartUpload(uploadId: string, objectKey: string): Promise<void>;
  getObjectBytes(objectKey: string): Promise<Uint8Array>;
  putObjectBytes(input: { objectKey: string; contentType: string; body: Uint8Array }): Promise<{ objectKey: string; sizeBytes: number }>;
  createSignedGetUrl(objectKey: string, expiresInSeconds: number): Promise<string>;
}
