import { z } from "zod";
import { defaultHardBidTemplate, priceSteelPounds } from "@/domain/pricing";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { handleRouteError, parseJson } from "@/infrastructure/http/json";

const schema = z.object({
  totalApprovedPounds: z.number().nonnegative()
});

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "estimate:price");
    const { projectId } = await params;
    const { totalApprovedPounds } = await parseJson(request, schema);
    return Response.json({
      projectId,
      template: defaultHardBidTemplate,
      estimate: priceSteelPounds(totalApprovedPounds, defaultHardBidTemplate)
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
