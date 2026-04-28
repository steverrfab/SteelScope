import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError } from "@/infrastructure/http/json";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string; fileId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:read");
    const { projectId, fileId } = await params;
    const file = await container.uploads.getFileStatus(ctx, projectId, fileId);
    return Response.json(file);
  } catch (error) {
    return handleRouteError(error);
  }
}
