import { detectScopeTerms } from "@/domain/scope-vocabulary";
import { getAuthContext, requirePermission } from "@/infrastructure/auth/context";
import { handleRouteError } from "@/infrastructure/http/json";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const ctx = await getAuthContext();
    requirePermission(ctx, "project:read");
    const { projectId } = await params;
    const body = await request.json();
    const text = String(body.text ?? "");
    const terms = detectScopeTerms(text);
    return Response.json({
      projectId,
      included: terms.filter((term) => term.family !== "risk"),
      riskFlags: terms.filter((term) => term.family === "risk"),
      clarifications: terms
        .filter((term) => ["by others", "field verify", "delegated design", "allowance", "alternate"].includes(term.term))
        .map((term) => ({
          kind: "clarification",
          text: `Clarify responsibility and pricing basis for ${term.term}.`,
          source: "submitted text"
        }))
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
