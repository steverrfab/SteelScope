import { UploadService } from "@/application/uploads";
import { ProjectService } from "@/application/projects";
import { TakeoffService } from "@/application/takeoff-items";
import { PdfJsPdfProcessor } from "@/infrastructure/pdf/pdfjs-pdf-processor";
import { BullMqJobQueue } from "@/infrastructure/queue/bullmq-job-queue";
import { InMemoryJobQueue } from "@/infrastructure/queue/in-memory-job-queue";
import {
  notConfiguredEmbedding,
  notConfiguredLlm,
  notConfiguredOcr,
  notConfiguredReports,
} from "@/infrastructure/providers/not-configured";
import { PrismaFileRepository } from "@/infrastructure/repositories/prisma-file-repository";
import { PrismaProcessingRepository } from "@/infrastructure/repositories/prisma-processing-repository";
import { PrismaProjectRepository } from "@/infrastructure/repositories/prisma-project-repository";
import { PrismaTakeoffRepository } from "@/infrastructure/repositories/prisma-takeoff-repository";
import { LocalAppRepository } from "@/infrastructure/repositories/local-app-repository";
import { LocalObjectStorage } from "@/infrastructure/storage/local-object-storage";
import { S3ObjectStorage } from "@/infrastructure/storage/s3-object-storage";

const storage = process.env.STORAGE_DRIVER === "s3" ? new S3ObjectStorage() : new LocalObjectStorage();
const queue = process.env.QUEUE_DRIVER === "bullmq" ? new BullMqJobQueue() : new InMemoryJobQueue();
const usePrisma = Boolean(process.env.DATABASE_URL);
const localRepository = new LocalAppRepository();
const fileRepository = usePrisma ? new PrismaFileRepository() : localRepository;
const projectRepository = usePrisma ? new PrismaProjectRepository() : localRepository;
const takeoffRepository = usePrisma ? new PrismaTakeoffRepository() : localRepository;
const processingRepository = usePrisma ? new PrismaProcessingRepository() : localRepository;
const pdf = new PdfJsPdfProcessor(storage);

export const container = {
  storage,
  queue,
  ocr: notConfiguredOcr,
  llm: notConfiguredLlm,
  embedding: notConfiguredEmbedding,
  pdf,
  reports: notConfiguredReports,
  processing: processingRepository,
  projects: new ProjectService(projectRepository),
  takeoff: new TakeoffService(takeoffRepository),
  uploads: new UploadService(storage, fileRepository, queue)
};
