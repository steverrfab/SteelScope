const allowedExtensions = new Set(["pdf", "xlsx", "xls", "csv", "docx", "doc"]);
const allowedContentTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
]);

export interface FileValidationInput {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export function validateBidPackageFile(input: FileValidationInput): void {
  const extension = input.fileName.split(".").pop()?.toLowerCase();
  if (!extension || !allowedExtensions.has(extension)) {
    throw new Error(`Unsupported file extension for ${input.fileName}.`);
  }
  if (!allowedContentTypes.has(input.contentType)) {
    throw new Error(`Unsupported content type ${input.contentType}.`);
  }
  if (input.sizeBytes <= 0) {
    throw new Error("File size must be greater than zero.");
  }
  if (input.sizeBytes > 25 * 1024 * 1024 * 1024) {
    throw new Error("File exceeds the 25 GB upload limit.");
  }
}
