import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError } from "@/infrastructure/http/json";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string; fileId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "upload:write");
    const { projectId, fileId } = await params;
    const job = await container.queue.enqueue({
      organizationId: ctx.organizationId,
      projectId,
      fileId,
      stage: "file_processing",
      idempotencyKey: `file_processing_retry:${fileId}:${Date.now()}`,
      requestedByUserId: ctx.userId
    });
    return Response.json({ projectId, fileId, status: "queued", job }, { status: 202 });
  } catch (error) {
    return handleRouteError(error);
  }
}
