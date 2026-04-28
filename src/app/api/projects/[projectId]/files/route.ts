import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError } from "@/infrastructure/http/json";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:read");
    const { projectId } = await params;
    const files = await container.uploads.listFiles(ctx, projectId);
    return Response.json({ projectId, files });
  } catch (error) {
    return handleRouteError(error);
  }
}
