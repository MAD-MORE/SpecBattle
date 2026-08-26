import { NextRequest, NextResponse } from "next/server";
import { mobileApiProvider } from "@/lib/phones/provider";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) return NextResponse.json({ phones: [] });
  try { return NextResponse.json({ phones: await mobileApiProvider.search(query) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Phone lookup failed" }, { status: 502 }); }
}
