import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError } from "@/infrastructure/http/json";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string; reportId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "report:export");
    const { projectId, reportId } = await params;
    const url = await container.storage.createSignedGetUrl(`reports/${projectId}/${reportId}`, 300);
    return Response.json({ url, expiresInSeconds: 300 });
  } catch (error) {
    return handleRouteError(error);
  }
}
