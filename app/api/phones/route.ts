import { NextResponse } from "next/server";
import { phoneCatalog } from "@/lib/phones/catalog";

export async function GET() {
  return NextResponse.json({ phones: phoneCatalog });
}
