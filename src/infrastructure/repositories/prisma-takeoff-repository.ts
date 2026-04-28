import { enrichTakeoffInput, type CreateTakeoffInput, type TakeoffRepository } from "@/application/takeoff-items";
import type { TakeoffItem } from "@/domain/takeoff";
import type { SourceEvidence } from "@/domain/source-evidence";
import type { AuthContext } from "@/infrastructure/auth/context";
import { getPrisma } from "@/infrastructure/database/prisma";

export class PrismaTakeoffRepository implements TakeoffRepository {
  async list(ctx: AuthContext, projectId: string): Promise<TakeoffItem[]> {
    const prisma = getPrisma();
    await assertProjectAccess(ctx, projectId);
    const rows = await prisma.takeoffItem.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });
    return rows.map(toDomain);
  }

  async create(ctx: AuthContext, projectId: string, input: CreateTakeoffInput): Promise<TakeoffItem> {
    const prisma = getPrisma();
    await assertProjectAccess(ctx, projectId);
    const enriched = enrichTakeoffInput(input);
    const row = await prisma.takeoffItem.create({
      data: {
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
      }
    });
    return toDomain(row);
  }

  async setReviewStatus(
    ctx: AuthContext,
    projectId: string,
    itemId: string,
    status: "approved" | "rejected"
  ): Promise<TakeoffItem> {
    const prisma = getPrisma();
    await assertProjectAccess(ctx, projectId);
    const row = await prisma.takeoffItem.update({
      where: { id: itemId, projectId },
      data: { estimatorApprovalStatus: status }
    });
    return toDomain(row);
  }
}

async function assertProjectAccess(ctx: AuthContext, projectId: string) {
  const prisma = getPrisma();
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: ctx.organizationId },
    select: { id: true }
  });
  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }
}

function toDomain(row: {
  id: string;
  category: string;
  memberType: string;
  shape: string | null;
  size: string | null;
  lengthFeet: number | null;
  quantity: number;
  weightPerFoot: number | null;
  totalWeightPounds: number | null;
  materialGrade: string | null;
  finish: string | null;
  location: string | null;
  gridlineLocation: string | null;
  detailReference: string | null;
  specReference: string | null;
  notes: string | null;
  confidenceScore: number;
  manualReviewFlag: boolean;
  sourceCitation: unknown;
  estimatorApprovalStatus: string;
}): TakeoffItem {
  return {
    id: row.id,
    category: row.category as TakeoffItem["category"],
    memberType: row.memberType,
    shape: row.shape ?? undefined,
    size: row.size ?? undefined,
    lengthFeet: row.lengthFeet ?? undefined,
    quantity: row.quantity,
    weightPerFoot: row.weightPerFoot ?? undefined,
    totalWeightPounds: row.totalWeightPounds ?? undefined,
    materialGrade: row.materialGrade ?? undefined,
    finish: row.finish ?? undefined,
    location: row.location ?? undefined,
    gridlineLocation: row.gridlineLocation ?? undefined,
    detailReference: row.detailReference ?? undefined,
    specReference: row.specReference ?? undefined,
    notes: row.notes ?? undefined,
    confidenceScore: row.confidenceScore,
    manualReviewFlag: row.manualReviewFlag,
    sourceCitation: row.sourceCitation as SourceEvidence,
    estimatorApprovalStatus: row.estimatorApprovalStatus as TakeoffItem["estimatorApprovalStatus"]
  };
}
