import { seedSteelShapes } from "@/domain/steel-shapes";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.toLowerCase();
  const family = url.searchParams.get("family");
  const shapes = seedSteelShapes.filter((shape) => {
    const matchesQuery = !q || shape.size.toLowerCase().includes(q);
    const matchesFamily = !family || shape.family === family;
    return matchesQuery && matchesFamily;
  });
  return Response.json({ shapes });
}
