import { initiateUploadSchema } from "@/application/uploads";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError, parseJson } from "@/infrastructure/http/json";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "upload:write");
    const { projectId } = await params;
    const input = await parseJson(request, initiateUploadSchema);
    const upload = await container.uploads.initiate(ctx, projectId, input);
    return Response.json(upload, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
