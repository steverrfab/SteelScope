import { z } from "zod";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { handleRouteError, parseJson } from "@/infrastructure/http/json";

const schema = z.object({
  question: z.string().min(1),
  reason: z.string().min(1),
  evidence: z.unknown().optional()
});

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:read");
    const { projectId } = await params;
    return Response.json({ projectId, rfis: [] });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "takeoff:write");
    const { projectId } = await params;
    const input = await parseJson(request, schema);
    return Response.json({ id: crypto.randomUUID(), projectId, status: "draft", ...input }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
