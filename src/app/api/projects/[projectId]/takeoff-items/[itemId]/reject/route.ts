import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError } from "@/infrastructure/http/json";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string; itemId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "takeoff:approve");
    const { projectId, itemId } = await params;
    const item = await container.takeoff.review(ctx, projectId, itemId, "rejected");
    return Response.json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}
