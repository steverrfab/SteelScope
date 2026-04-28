import { defaultHardBidTemplate, priceSteelPounds } from "@/domain/pricing";

export async function GET() {
  return Response.json({ templates: [defaultHardBidTemplate] });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.totalPounds !== "number") {
    return Response.json({ error: "totalPounds is required." }, { status: 400 });
  }
  return Response.json({
    template: defaultHardBidTemplate,
    estimate: priceSteelPounds(body.totalPounds, defaultHardBidTemplate)
  });
}
