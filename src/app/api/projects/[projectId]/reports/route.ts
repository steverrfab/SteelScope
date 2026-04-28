import { z } from "zod";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError, parseJson } from "@/infrastructure/http/json";

const schema = z.object({
  kind: z.enum([
    "takeoff_excel",
    "estimate_summary_pdf",
    "bid_proposal_pdf",
    "scope_review",
    "clarifications_exclusions",
    "rfi_list",
    "addenda_impact",
    "drawing_log",
    "spec_summary",
    "material_list",
    "shop_labor_summary",
    "delivery_summary",
    "pricing_backup",
    "internal_estimate_review"
  ])
});

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "report:export");
    const { projectId } = await params;
    const input = await parseJson(request, schema);
    const job = await container.queue.enqueue({
      organizationId: ctx.organizationId,
      projectId,
      stage: "reports",
      idempotencyKey: `report:${projectId}:${input.kind}:${Date.now()}`,
      requestedByUserId: ctx.userId
    });
    return Response.json({ projectId, kind: input.kind, status: "queued", job }, { status: 202 });
  } catch (error) {
    return handleRouteError(error);
  }
}
