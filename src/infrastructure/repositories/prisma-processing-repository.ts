import { Prisma } from "@prisma/client";
import type { ProcessingRepository } from "@/application/document-processing";
import { getPrisma } from "@/infrastructure/database/prisma";

export class PrismaProcessingRepository implements ProcessingRepository {
  async getSourceFile(input: { organizationId: string; projectId: string; fileId: string }) {
    const file = await getPrisma().file.findFirst({
      where: {
        id: input.fileId,
        organizationId: input.organizationId,
        projectId: input.projectId
      }
    });
    if (!file?.objectKey) throw new Error("Uploaded source file was not found or has no object key.");
    return {
      id: file.id,
      displayName: file.displayName,
      contentType: file.contentType,
      objectKey: file.objectKey
    };
  }

  async markFileStatus(input: {
    organizationId: string;
    projectId: string;
    fileId: string;
    status: "queued" | "running" | "succeeded" | "failed" | "needs_review" | "skipped";
    lastError?: string | null;
  }) {
    await getPrisma().file.update({
      where: {
        id: input.fileId,
        organizationId: input.organizationId,
        projectId: input.projectId
      },
      data: {
        status: input.status,
        lastError: input.lastError
      }
    });
  }

  async createOrUpdateDocument(input: { projectId: string; fileId: string; title: string; kind: string; pageCount: number }) {
    const existing = await getPrisma().document.findFirst({
      where: { projectId: input.projectId, fileId: input.fileId },
      select: { id: true }
    });
    if (existing) {
      return getPrisma().document.update({
        where: { id: existing.id },
        data: { title: input.title, kind: input.kind, pageCount: input.pageCount },
        select: { id: true }
      });
    }
    return getPrisma().document.create({
      data: input,
      select: { id: true }
    });
  }

  async upsertPage(input: Parameters<ProcessingRepository["upsertPage"]>[0]) {
    const page = await getPrisma().page.upsert({
      where: {
        fileId_pageNumber: {
          fileId: input.fileId,
          pageNumber: input.artifact.pageNumber
        }
      },
      create: {
        projectId: input.projectId,
        fileId: input.fileId,
        documentId: input.documentId,
        pageNumber: input.artifact.pageNumber,
        width: input.artifact.width,
        height: input.artifact.height,
        thumbnailObjectKey: input.artifact.thumbnailObjectKey,
        rasterObjectKey: input.artifact.rasterObjectKey,
        vectorTextConfidence: input.vectorTextConfidence,
        processingStatus: input.processingStatus,
        pageType: input.classification?.pageType ?? "unknown",
        discipline: input.classification?.discipline ?? "unknown",
        searchText: input.searchText
      },
      update: {
        documentId: input.documentId,
        width: input.artifact.width,
        height: input.artifact.height,
        thumbnailObjectKey: input.artifact.thumbnailObjectKey,
        rasterObjectKey: input.artifact.rasterObjectKey,
        vectorTextConfidence: input.vectorTextConfidence,
        processingStatus: input.processingStatus,
        pageType: input.classification?.pageType ?? "unknown",
        discipline: input.classification?.discipline ?? "unknown",
        searchText: input.searchText
      },
      select: { id: true, pageNumber: true }
    });

    if (input.classification?.sheetNumber || input.classification?.sheetTitle || input.classification?.scale) {
      await getPrisma().drawingSheet.upsert({
        where: { pageId: page.id },
        create: {
          projectId: input.projectId,
          pageId: page.id,
          sheetNumber: input.classification.sheetNumber,
          sheetTitle: input.classification.sheetTitle,
          discipline: input.classification.discipline,
          scale: input.classification.scale,
          revisionDate: input.classification.revisionDate ? new Date(input.classification.revisionDate) : undefined,
          projectName: input.classification.projectName,
          confidence: input.classification.confidence
        },
        update: {
          sheetNumber: input.classification.sheetNumber,
          sheetTitle: input.classification.sheetTitle,
          discipline: input.classification.discipline,
          scale: input.classification.scale,
          revisionDate: input.classification.revisionDate ? new Date(input.classification.revisionDate) : undefined,
          projectName: input.classification.projectName,
          confidence: input.classification.confidence
        }
      });
    }

    return page;
  }

  async saveOcrText(input: { pageId: string; source: "vector_pdf" | "ocr"; text: string; confidence: number; blocks?: unknown; tables?: unknown }) {
    await getPrisma().ocrText.create({
      data: {
        pageId: input.pageId,
        source: input.source,
        text: input.text,
        confidence: input.confidence,
        blocks: toJsonInput(input.blocks),
        tables: toJsonInput(input.tables)
      }
    });
  }

  async saveDetectedTerms(input: {
    projectId: string;
    pageId: string;
    terms: Array<{ term: string; family: "structural_steel" | "misc_metals" | "risk"; occurrences: number }>;
    text: string;
  }) {
    const prisma = getPrisma();
    for (const term of input.terms) {
      const evidence = {
        sourceType: "text",
        projectId: input.projectId,
        pageId: input.pageId,
        textQuote: snippetForTerm(input.text, term.term),
        confidence: term.family === "risk" ? 0.84 : 0.78,
        reason: `Detected ${term.occurrences} occurrence(s) of "${term.term}" in extracted page text.`
      };

      await prisma.extractedEntity.create({
        data: {
          projectId: input.projectId,
          pageId: input.pageId,
          family: term.family,
          label: term.term,
          value: String(term.occurrences),
          confidence: evidence.confidence,
          reason: evidence.reason,
          evidence,
          reviewStatus: term.family === "risk" ? "needs_review" : "not_reviewed"
        }
      });

      if (term.family === "risk") {
        await prisma.riskFlag.create({
          data: {
            projectId: input.projectId,
            pageId: input.pageId,
            severity: "medium",
            category: "scope_language",
            title: term.term,
            detail: evidence.reason,
            evidence,
            reviewStatus: "needs_review"
          }
        });
      }
    }
  }

  async getProcessingRollup(projectId: string, organizationId: string) {
    const project = await getPrisma().project.findFirst({
      where: { id: projectId, organizationId },
      select: { id: true }
    });
    if (!project) throw new Response("Project not found", { status: 404 });

    const grouped = await getPrisma().page.groupBy({
      by: ["processingStatus"],
      where: { projectId },
      _count: { processingStatus: true }
    });
    return grouped.reduce<Record<string, number>>(
      (rollup, row) => ({ ...rollup, [row.processingStatus]: row._count.processingStatus }),
      { queued: 0, running: 0, succeeded: 0, failed: 0, needs_review: 0, skipped: 0 }
    );
  }

  async searchProject(input: { organizationId: string; projectId: string; query: string }) {
    const q = input.query.trim();
    if (!q) return [];
    const project = await getPrisma().project.findFirst({
      where: { id: input.projectId, organizationId: input.organizationId },
      select: { id: true }
    });
    if (!project) throw new Response("Project not found", { status: 404 });

    const [pages, entities, risks] = await Promise.all([
      getPrisma().page.findMany({
        where: { projectId: input.projectId, searchText: { contains: q, mode: "insensitive" } },
        take: 20,
        orderBy: { pageNumber: "asc" }
      }),
      getPrisma().extractedEntity.findMany({
        where: {
          projectId: input.projectId,
          OR: [
            { label: { contains: q, mode: "insensitive" } },
            { value: { contains: q, mode: "insensitive" } },
            { reason: { contains: q, mode: "insensitive" } }
          ]
        },
        take: 20,
        orderBy: { createdAt: "desc" }
      }),
      getPrisma().riskFlag.findMany({
        where: {
          projectId: input.projectId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { detail: { contains: q, mode: "insensitive" } }
          ]
        },
        take: 20,
        orderBy: { createdAt: "desc" }
      })
    ]);

    return [
      ...pages.map((page) => ({
        type: "page",
        id: page.id,
        title: `Page ${page.pageNumber}`,
        snippet: snippetForTerm(page.searchText ?? "", q),
        pageNumber: page.pageNumber,
        confidence: page.vectorTextConfidence ?? page.ocrConfidence ?? undefined
      })),
      ...entities.map((entity) => ({
        type: "entity",
        id: entity.id,
        title: entity.label,
        snippet: entity.reason,
        confidence: entity.confidence
      })),
      ...risks.map((risk) => ({
        type: "risk",
        id: risk.id,
        title: risk.title,
        snippet: risk.detail
      }))
    ];
  }
}

function snippetForTerm(text: string, term: string) {
  const lower = text.toLowerCase();
  const index = lower.indexOf(term.toLowerCase());
  if (index === -1) return text.slice(0, 240);
  return text.slice(Math.max(0, index - 90), Math.min(text.length, index + term.length + 150));
}

function toJsonInput(value: unknown) {
  return value === undefined ? undefined : (value as Prisma.InputJsonValue);
}
