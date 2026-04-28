import type { LlmProvider, OcrProvider, EmbeddingProvider } from "@/ports/ai";
import type { PdfProcessor } from "@/ports/pdf";
import type { ReportGenerator } from "@/ports/reports";
import type { ObjectStorage } from "@/ports/storage";
import type { JobQueue } from "@/ports/queue";

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} provider is not configured.`);
    this.name = "ProviderNotConfiguredError";
  }
}

export const notConfiguredStorage: ObjectStorage = {
  initiateMultipartUpload: async () => {
    throw new ProviderNotConfiguredError("Object storage");
  },
  putPart: async () => {
    throw new ProviderNotConfiguredError("Object storage");
  },
  completeMultipartUpload: async () => {
    throw new ProviderNotConfiguredError("Object storage");
  },
  abortMultipartUpload: async () => {
    throw new ProviderNotConfiguredError("Object storage");
  },
  getObjectBytes: async () => {
    throw new ProviderNotConfiguredError("Object storage");
  },
  putObjectBytes: async () => {
    throw new ProviderNotConfiguredError("Object storage");
  },
  createSignedGetUrl: async () => {
    throw new ProviderNotConfiguredError("Object storage");
  }
};

export const notConfiguredQueue: JobQueue = {
  enqueue: async () => {
    throw new ProviderNotConfiguredError("Queue");
  },
  getStatus: async () => {
    throw new ProviderNotConfiguredError("Queue");
  }
};

export const notConfiguredOcr: OcrProvider = {
  extractPage: async () => {
    throw new ProviderNotConfiguredError("OCR");
  }
};

export const notConfiguredLlm: LlmProvider = {
  classifyPage: async () => {
    throw new ProviderNotConfiguredError("LLM");
  },
  extractStructuredEntities: async () => {
    throw new ProviderNotConfiguredError("LLM");
  }
};

export const notConfiguredEmbedding: EmbeddingProvider = {
  embed: async () => {
    throw new ProviderNotConfiguredError("Embedding");
  }
};

export const notConfiguredPdf: PdfProcessor = {
  splitToPages: async function* () {
    throw new ProviderNotConfiguredError("PDF processor");
  },
  extractVectorText: async () => {
    throw new ProviderNotConfiguredError("PDF processor");
  }
};

export const notConfiguredReports: ReportGenerator = {
  generateTakeoffWorkbook: async () => {
    throw new ProviderNotConfiguredError("Report generator");
  },
  generateEstimatePdf: async () => {
    throw new ProviderNotConfiguredError("Report generator");
  }
};
