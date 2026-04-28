import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError } from "@/infrastructure/http/json";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string; addendumId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:write");
    const { projectId, addendumId } = await params;
    const job = await container.queue.enqueue({
      organizationId: ctx.organizationId,
      projectId,
      stage: "revision_compare",
      idempotencyKey: `revision_compare:${addendumId}`,
      requestedByUserId: ctx.userId
    });
    return Response.json({ projectId, addendumId, status: "queued", job }, { status: 202 });
  } catch (error) {
    return handleRouteError(error);
  }
}
