import { createTakeoffSchema } from "@/application/takeoff-items";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError, parseJson } from "@/infrastructure/http/json";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:read");
    const { projectId } = await params;
    const takeoffItems = await container.takeoff.list(ctx, projectId);
    return Response.json({ projectId, takeoffItems });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "takeoff:write");
    const { projectId } = await params;
    const input = await parseJson(request, createTakeoffSchema);
    const item = await container.takeoff.create(ctx, projectId, input);
    return Response.json(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
