import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.mobileapi.dev/devices/search/";

export async function GET(request: NextRequest) {
  const key = process.env.MOBILEAPI_KEY;
  const model = request.nextUrl.searchParams.get("model")?.trim();
  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (!key) return NextResponse.json({ error: "MOBILEAPI_KEY is not configured" }, { status: 503 });
  if (!model && !name) return NextResponse.json({ error: "model or name is required" }, { status: 400 });
  const params = new URLSearchParams({ page: "1", exact: "true" });
  if (model) params.set("model_number", model); else params.set("name", name!);
  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" }, next: { revalidate: 86400 } });
    if (!response.ok) return NextResponse.json({ error: "Device specification provider failed", providerStatus: response.status }, { status: 502 });
    const data = await response.json();
    const device = data?.devices?.[0] ?? data?.results?.[0] ?? null;
    if (!device) return NextResponse.json({ match: null }, { status: 404 });
    return NextResponse.json({ match: device });
  } catch {
    return NextResponse.json({ error: "Unable to reach device specification provider" }, { status: 502 });
  }
}
