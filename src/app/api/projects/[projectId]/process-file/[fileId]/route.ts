import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { handleRouteError } from "@/infrastructure/http/json";
import { dispatchWorkerJob } from "@/workers";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string; fileId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "upload:write");
    const { projectId, fileId } = await params;
    const result = await dispatchWorkerJob({
      jobId: crypto.randomUUID(),
      organizationId: ctx.organizationId,
      projectId,
      fileId,
      stage: "file_processing",
      attempt: 0,
      idempotencyKey: `manual_process:${fileId}:${Date.now()}`,
      requestedByUserId: ctx.userId
    });
    return Response.json({ projectId, fileId, result });
  } catch (error) {
    return handleRouteError(error);
  }
}
