import type { EstimateBreakdown } from "@/domain/pricing";
import type { TakeoffItem } from "@/domain/takeoff";

export interface ReportArtifact {
  reportId: string;
  objectKey: string;
  contentType: string;
}

export interface ReportGenerator {
  generateTakeoffWorkbook(input: { projectId: string; takeoffItems: TakeoffItem[] }): Promise<ReportArtifact>;
  generateEstimatePdf(input: { projectId: string; estimate: EstimateBreakdown }): Promise<ReportArtifact>;
}
