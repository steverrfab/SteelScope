import { ZodError, type ZodSchema } from "zod";

export async function parseJson<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  try {
    return schema.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      throw Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }
    throw error;
  }
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof Response) return error;
  if (error instanceof Error) {
    const status = error.name === "ProviderNotConfiguredError" ? 503 : 500;
    return Response.json({ error: error.message }, { status });
  }
  return Response.json({ error: "Unexpected error" }, { status: 500 });
}
