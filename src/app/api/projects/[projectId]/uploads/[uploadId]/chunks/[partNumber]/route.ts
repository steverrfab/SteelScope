import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError } from "@/infrastructure/http/json";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; uploadId: string; partNumber: string }> }
) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "upload:write");
    await params;
    const objectKey = request.headers.get("x-object-key");
    if (!objectKey) return Response.json({ error: "x-object-key header is required." }, { status: 400 });
    if (!request.body) return Response.json({ error: "Chunk body is required." }, { status: 400 });
    const { uploadId, partNumber } = await params;
    const uploaded = await container.storage.putPart(uploadId, objectKey, Number(partNumber), request.body);
    return Response.json(uploaded);
  } catch (error) {
    return handleRouteError(error);
  }
}
