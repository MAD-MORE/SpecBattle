import { NextRequest, NextResponse } from "next/server";
import { mobileApiProvider } from "@/lib/phones/provider";
import { runBattle } from "@/lib/scoring/battle-engine";

export async function GET(request: NextRequest) {
  const leftId = request.nextUrl.searchParams.get("left");
  const rightId = request.nextUrl.searchParams.get("right");
  if (!leftId || !rightId) return NextResponse.json({ error: "left and right phone IDs are required" }, { status: 400 });
  const [left, right] = await Promise.all([mobileApiProvider.get(leftId), mobileApiProvider.get(rightId)]);
  if (!left || !right) return NextResponse.json({ error: "phone not found" }, { status: 404 });
  return NextResponse.json({ left, right, result: runBattle(left, right) });
}
