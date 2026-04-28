import { z } from "zod";
import { calculateTakeoffWeight, type TakeoffItem } from "@/domain/takeoff";
import type { AuthContext } from "@/infrastructure/auth/context";

export const createTakeoffSchema = z.object({
  category: z.string(),
  memberType: z.string(),
  shape: z.string().optional(),
  size: z.string().optional(),
  lengthFeet: z.number().positive().optional(),
  quantity: z.number().int().positive(),
  weightPerFoot: z.number().positive().optional(),
  materialGrade: z.string().optional(),
  finish: z.string().optional(),
  location: z.string().optional(),
  drawingSheet: z.string().optional(),
  gridlineLocation: z.string().optional(),
  detailReference: z.string().optional(),
  specReference: z.string().optional(),
  notes: z.string().optional(),
  sourceCitation: z.object({
    sourceType: z.enum(["text", "table", "visual", "manual", "calculated"]),
    projectId: z.string(),
    fileId: z.string().optional(),
    documentId: z.string().optional(),
    pageId: z.string().optional(),
    sheetId: z.string().optional(),
    sheetNumber: z.string().optional(),
    detailReference: z.string().optional(),
    specReference: z.string().optional(),
    textQuote: z.string().optional(),
    tableReference: z.string().optional(),
    confidence: z.number().min(0).max(1),
    reason: z.string().min(1)
  })
});

export type CreateTakeoffInput = z.infer<typeof createTakeoffSchema>;

export interface TakeoffRepository {
  list(ctx: AuthContext, projectId: string): Promise<TakeoffItem[]>;
  create(ctx: AuthContext, projectId: string, input: CreateTakeoffInput): Promise<TakeoffItem>;
  setReviewStatus(ctx: AuthContext, projectId: string, itemId: string, status: "approved" | "rejected"): Promise<TakeoffItem>;
}

export class TakeoffService {
  constructor(private readonly takeoff: TakeoffRepository) {}

  list(ctx: AuthContext, projectId: string) {
    return this.takeoff.list(ctx, projectId);
  }

  create(ctx: AuthContext, projectId: string, input: CreateTakeoffInput) {
    return this.takeoff.create(ctx, projectId, {
      ...input,
      sourceCitation: {
        ...input.sourceCitation,
        projectId
      }
    });
  }

  review(ctx: AuthContext, projectId: string, itemId: string, status: "approved" | "rejected") {
    return this.takeoff.setReviewStatus(ctx, projectId, itemId, status);
  }
}

export function enrichTakeoffInput(input: CreateTakeoffInput) {
  const totalWeightPounds = calculateTakeoffWeight(input);
  return {
    totalWeightPounds,
    confidenceScore: input.sourceCitation.confidence,
    manualReviewFlag: input.sourceCitation.confidence < 0.85
  };
}
