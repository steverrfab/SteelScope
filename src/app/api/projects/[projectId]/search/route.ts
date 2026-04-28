import { detectScopeTerms } from "@/domain/scope-vocabulary";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { container } from "@/infrastructure/container";
import { handleRouteError } from "@/infrastructure/http/json";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:read");
    const { projectId } = await params;
    const q = new URL(request.url).searchParams.get("q") ?? "";
    const results = await container.processing.searchProject({
      organizationId: ctx.organizationId,
      projectId,
      query: q
    });
    return Response.json({
      projectId,
      query: q,
      detectedTerms: detectScopeTerms(q),
      results
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
