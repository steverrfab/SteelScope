import { deterministicClassifyPage, type ProcessingRepository } from "@/application/document-processing";
import { enrichTakeoffInput, type CreateTakeoffInput, type TakeoffRepository } from "@/application/takeoff-items";
import type { FileRepository } from "@/application/uploads";
import type { ProjectRepository } from "@/application/projects";
import type { TakeoffItem } from "@/domain/takeoff";
import type { SourceEvidence } from "@/domain/source-evidence";
import type { AuthContext } from "@/infrastructure/auth/context";
import { LocalJsonStore, type LocalPage, type LocalTakeoffItem } from "@/infrastructure/repositories/local-json-store";

export class LocalAppRepository implements ProjectRepository, FileRepository, TakeoffRepository, ProcessingRepository {
  constructor(private readonly store = new LocalJsonStore()) {}

  async list(ctx: AuthContext): ReturnType<ProjectRepository["list"]>;
  async list(ctx: AuthContext, projectId: string): ReturnType<TakeoffRepository["list"]>;
  async list(ctx: AuthContext, projectId?: string) {
    if (projectId) {
      const db = await this.store.read();
      return db.takeoffItems.filter((item) => item.projectId === projectId).map(toTakeoffDomain);
    }
    const db = await this.store.read();
    return db.projects
      .filter((project) => project.organizationId === ctx.organizationId)
      .map((project) => ({
        id: project.id,
        name: project.name,
        bidDate: project.bidDate,
        clientName: project.clientName,
        generalContractor: project.generalContractor,
        status: project.status,
        fileCount: db.files.filter((file) => file.projectId === project.id).length,
        pageCount: db.pages.filter((page) => page.projectId === project.id).length,
        reviewFlagCount: db.riskFlags.filter((risk) => risk.projectId === project.id).length
      }));
  }

  async create(ctx: AuthContext, input: { name: string; bidDate?: string; clientName?: string; generalContractor?: string }): ReturnType<ProjectRepository["create"]>;
  async create(ctx: AuthContext, projectId: string, input: CreateTakeoffInput): ReturnType<TakeoffRepository["create"]>;
  async create(
    ctx: AuthContext,
    inputOrProjectId: { name: string; bidDate?: string; clientName?: string; generalContractor?: string } | string,
    maybeTakeoff?: CreateTakeoffInput
  ): Promise<Awaited<ReturnType<ProjectRepository["create"]>> | Awaited<ReturnType<TakeoffRepository["create"]>>> {
    if (typeof inputOrProjectId === "string") {
      const projectId = inputOrProjectId;
      const input = maybeTakeoff;
      if (!input) throw new Error("Takeoff input is required.");
      const enriched = enrichTakeoffInput(input);
      const item: LocalTakeoffItem = {
        id: crypto.randomUUID(),
        projectId,
        category: input.category,
        memberType: input.memberType,
        shape: input.shape,
        size: input.size,
        lengthFeet: input.lengthFeet,
        quantity: input.quantity,
        weightPerFoot: input.weightPerFoot,
        totalWeightPounds: enriched.totalWeightPounds,
        materialGrade: input.materialGrade,
        finish: input.finish,
        location: input.location,
        gridlineLocation: input.gridlineLocation,
        detailReference: input.detailReference,
        specReference: input.specReference,
        notes: input.notes,
        confidenceScore: enriched.confidenceScore,
        manualReviewFlag: enriched.manualReviewFlag,
        sourceCitation: input.sourceCitation,
        estimatorApprovalStatus: "not_reviewed"
      };
      await this.store.update((db) => db.takeoffItems.push(item));
      return toTakeoffDomain(item);
    }
    const input = inputOrProjectId;
    const now = new Date().toISOString();
    const project = {
      id: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      name: input.name,
      bidDate: input.bidDate ?? null,
      clientName: input.clientName ?? null,
      generalContractor: input.generalContractor ?? null,
      status: "bidding",
      createdAt: now,
      updatedAt: now
    };
    await this.store.update((db) => db.projects.push(project));
    return { ...project, fileCount: 0, pageCount: 0, reviewFlagCount: 0 };
  }

  async listProjectFiles(input: { organizationId: string; projectId: string }) {
    const db = await this.store.read();
    return db.files
      .filter((file) => file.organizationId === input.organizationId && file.projectId === input.projectId)
      .map((file) => ({
        id: file.id,
        displayName: file.displayName,
        contentType: file.contentType,
        sizeBytes: file.sizeBytes,
        status: file.status,
        objectKey: file.objectKey,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }));
  }

  async getFileStatus(input: { organizationId: string; projectId: string; fileId: string }) {
    const db = await this.store.read();
    const file = db.files.find((candidate) => candidate.id === input.fileId && candidate.organizationId === input.organizationId && candidate.projectId === input.projectId);
    if (!file) throw new Response("File not found", { status: 404 });
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
    const now = new Date().toISOString();
    const file = {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      projectId: input.projectId,
      displayName: input.displayName,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      checksum: input.checksum ?? null,
      uploadId: input.uploadId,
      objectKey: input.objectKey,
      status: "queued",
      lastError: null,
      createdAt: now,
      updatedAt: now
    };
    await this.store.update((db) => db.files.push(file));
    return { fileId: file.id };
  }

  async markUploadComplete(input: { organizationId: string; projectId: string; fileId: string; objectKey: string; sizeBytes: number }) {
    await this.store.update((db) => {
      const file = db.files.find((candidate) => candidate.id === input.fileId && candidate.organizationId === input.organizationId && candidate.projectId === input.projectId);
      if (!file) throw new Response("File not found", { status: 404 });
      file.objectKey = input.objectKey;
      file.sizeBytes = input.sizeBytes;
      file.status = "queued";
      file.updatedAt = new Date().toISOString();
    });
  }

  async getSourceFile(input: { organizationId: string; projectId: string; fileId: string }) {
    const db = await this.store.read();
    const file = db.files.find((candidate) => candidate.id === input.fileId && candidate.organizationId === input.organizationId && candidate.projectId === input.projectId);
    if (!file?.objectKey) throw new Error("Uploaded source file was not found or has no object key.");
    return {
      id: file.id,
      displayName: file.displayName,
      contentType: file.contentType,
      objectKey: file.objectKey
    };
  }

  async markFileStatus(input: { organizationId: string; projectId: string; fileId: string; status: "queued" | "running" | "succeeded" | "failed" | "needs_review" | "skipped"; lastError?: string | null }) {
    await this.store.update((db) => {
      const file = db.files.find((candidate) => candidate.id === input.fileId && candidate.organizationId === input.organizationId && candidate.projectId === input.projectId);
      if (!file) throw new Response("File not found", { status: 404 });
      file.status = input.status;
      file.lastError = input.lastError ?? null;
      file.updatedAt = new Date().toISOString();
    });
  }

  async createOrUpdateDocument(input: { projectId: string; fileId: string; title: string; kind: string; pageCount: number }) {
    return this.store.update((db) => {
      let document = db.documents.find((candidate) => candidate.projectId === input.projectId && candidate.fileId === input.fileId);
      if (!document) {
        document = { id: crypto.randomUUID(), ...input };
        db.documents.push(document);
      } else {
        Object.assign(document, input);
      }
      return { id: document.id };
    });
  }

  async upsertPage(input: Parameters<ProcessingRepository["upsertPage"]>[0]) {
    return this.store.update((db) => {
      const classification = input.classification ?? deterministicClassifyPage(input.searchText ?? "");
      let page: LocalPage | undefined = db.pages.find((candidate) => candidate.fileId === input.fileId && candidate.pageNumber === input.artifact.pageNumber);
      if (!page) {
        page = {
          id: crypto.randomUUID(),
          projectId: input.projectId,
          fileId: input.fileId,
          documentId: input.documentId,
          pageNumber: input.artifact.pageNumber,
          processingStatus: input.processingStatus,
          pageType: classification.pageType,
          discipline: classification.discipline,
          searchText: input.searchText ?? ""
        };
        db.pages.push(page);
      }
      Object.assign(page, {
        documentId: input.documentId,
        width: input.artifact.width,
        height: input.artifact.height,
        vectorTextConfidence: input.vectorTextConfidence,
        processingStatus: input.processingStatus,
        pageType: classification.pageType,
        discipline: classification.discipline,
        searchText: input.searchText ?? ""
      });
      if (classification.sheetNumber || classification.scale) {
        const existingSheet = db.drawingSheets.find((sheet) => sheet.pageId === page.id);
        const sheet = {
          id: existingSheet?.id ?? crypto.randomUUID(),
          projectId: input.projectId,
          pageId: page.id,
          sheetNumber: classification.sheetNumber,
          sheetTitle: classification.sheetTitle,
          discipline: classification.discipline,
          scale: classification.scale,
          confidence: classification.confidence
        };
        if (existingSheet) Object.assign(existingSheet, sheet);
        else db.drawingSheets.push(sheet);
      }
      return { id: page.id, pageNumber: page.pageNumber };
    });
  }

  async saveOcrText(input: { pageId: string; source: "vector_pdf" | "ocr"; text: string; confidence: number }) {
    await this.store.update((db) => {
      db.ocrTexts.push({ id: crypto.randomUUID(), ...input });
    });
  }

  async saveDetectedTerms(input: { projectId: string; pageId: string; terms: Array<{ term: string; family: "structural_steel" | "misc_metals" | "risk"; occurrences: number }>; text: string }) {
    await this.store.update((db) => {
      for (const term of input.terms) {
        const evidence = {
          sourceType: "text",
          projectId: input.projectId,
          pageId: input.pageId,
          textQuote: snippetForTerm(input.text, term.term),
          confidence: term.family === "risk" ? 0.84 : 0.78,
          reason: `Detected ${term.occurrences} occurrence(s) of "${term.term}" in extracted page text.`
        };
        db.entities.push({
          id: crypto.randomUUID(),
          projectId: input.projectId,
          pageId: input.pageId,
          family: term.family,
          label: term.term,
          value: String(term.occurrences),
          confidence: evidence.confidence,
          reason: evidence.reason,
          evidence,
          reviewStatus: term.family === "risk" ? "needs_review" : "not_reviewed",
          createdAt: new Date().toISOString()
        });
        if (term.family === "risk") {
          db.riskFlags.push({
            id: crypto.randomUUID(),
            projectId: input.projectId,
            pageId: input.pageId,
            severity: "medium",
            category: "scope_language",
            title: term.term,
            detail: evidence.reason,
            evidence,
            reviewStatus: "needs_review",
            createdAt: new Date().toISOString()
          });
        }
      }
    });
  }

  async getProcessingRollup(projectId: string, organizationId: string) {
    const db = await this.store.read();
    if (!db.projects.some((project) => project.id === projectId && project.organizationId === organizationId)) {
      throw new Response("Project not found", { status: 404 });
    }
    return db.pages
      .filter((page) => page.projectId === projectId)
      .reduce<Record<string, number>>(
        (rollup, page) => ({ ...rollup, [page.processingStatus]: (rollup[page.processingStatus] ?? 0) + 1 }),
        { queued: 0, running: 0, succeeded: 0, failed: 0, needs_review: 0, skipped: 0 }
      );
  }

  async searchProject(input: { organizationId: string; projectId: string; query: string }) {
    const db = await this.store.read();
    if (!db.projects.some((project) => project.id === input.projectId && project.organizationId === input.organizationId)) {
      throw new Response("Project not found", { status: 404 });
    }
    const query = input.query.toLowerCase();
    return [
      ...db.pages
        .filter((page) => page.projectId === input.projectId && page.searchText.toLowerCase().includes(query))
        .slice(0, 20)
        .map((page) => ({
          type: "page",
          id: page.id,
          title: `Page ${page.pageNumber}`,
          snippet: snippetForTerm(page.searchText, input.query),
          pageNumber: page.pageNumber,
          confidence: page.vectorTextConfidence
        })),
      ...db.entities
        .filter((entity) => entity.projectId === input.projectId && `${entity.label} ${entity.reason}`.toLowerCase().includes(query))
        .slice(0, 20)
        .map((entity) => ({
          type: "entity",
          id: entity.id,
          title: entity.label,
          snippet: entity.reason,
          confidence: entity.confidence
        })),
      ...db.riskFlags
        .filter((risk) => risk.projectId === input.projectId && `${risk.title} ${risk.detail}`.toLowerCase().includes(query))
        .slice(0, 20)
        .map((risk) => ({
          type: "risk",
          id: risk.id,
          title: risk.title,
          snippet: risk.detail
        }))
    ];
  }

  async setReviewStatus(_ctx: AuthContext, projectId: string, itemId: string, status: "approved" | "rejected") {
    return this.store.update((db) => {
      const item = db.takeoffItems.find((candidate) => candidate.id === itemId && candidate.projectId === projectId);
      if (!item) throw new Response("Takeoff item not found", { status: 404 });
      item.estimatorApprovalStatus = status;
      return toTakeoffDomain(item);
    });
  }
}

function toTakeoffDomain(row: LocalTakeoffItem): TakeoffItem {
  return {
    ...row,
    category: row.category as TakeoffItem["category"],
    sourceCitation: row.sourceCitation as SourceEvidence,
    estimatorApprovalStatus: row.estimatorApprovalStatus as TakeoffItem["estimatorApprovalStatus"]
  };
}

function snippetForTerm(text: string, term: string) {
  const lower = text.toLowerCase();
  const index = lower.indexOf(term.toLowerCase());
  if (index === -1) return text.slice(0, 240);
  return text.slice(Math.max(0, index - 90), Math.min(text.length, index + term.length + 150));
}
