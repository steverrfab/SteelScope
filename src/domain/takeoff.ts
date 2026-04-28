import type { ReviewStatus, TakeoffCategory } from "./enums";
import type { SourceEvidence } from "./source-evidence";

export interface TakeoffItem {
  id: string;
  category: TakeoffCategory;
  memberType: string;
  shape?: string;
  size?: string;
  lengthFeet?: number;
  quantity: number;
  weightPerFoot?: number;
  totalWeightPounds?: number;
  materialGrade?: string;
  finish?: string;
  location?: string;
  drawingSheet?: string;
  gridlineLocation?: string;
  detailReference?: string;
  specReference?: string;
  notes?: string;
  confidenceScore: number;
  manualReviewFlag: boolean;
  sourceCitation: SourceEvidence;
  estimatorApprovalStatus: ReviewStatus;
}

export function calculateTakeoffWeight(item: Pick<TakeoffItem, "lengthFeet" | "quantity" | "weightPerFoot">): number | undefined {
  if (!item.lengthFeet || !item.weightPerFoot) return undefined;
  return item.lengthFeet * item.quantity * item.weightPerFoot;
}
