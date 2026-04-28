import { createProjectSchema } from "@/application/projects";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError, parseJson } from "@/infrastructure/http/json";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:read");
    const projects = await container.projects.list(ctx);
    return Response.json({ projects });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:write");
    const input = await parseJson(request, createProjectSchema);
    const project = await container.projects.create(ctx, input);
    return Response.json(project, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
