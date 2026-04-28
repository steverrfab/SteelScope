import { z } from "zod";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError, parseJson } from "@/infrastructure/http/json";

const schema = z.object({
  fileId: z.string().uuid(),
  objectKey: z.string().min(1),
  parts: z.array(
    z.object({
      partNumber: z.number().int().positive(),
      checksum: z.string().min(1),
      etag: z.string().min(1),
      sizeBytes: z.number().int().positive()
    })
  )
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; uploadId: string }> }
) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "upload:write");
    const { projectId, uploadId } = await params;
    const input = await parseJson(request, schema);
    const job = await container.uploads.complete(ctx, projectId, input.fileId, uploadId, input.objectKey, input.parts);
    return Response.json({ status: "queued", job }, { status: 202 });
  } catch (error) {
    return handleRouteError(error);
  }
}
