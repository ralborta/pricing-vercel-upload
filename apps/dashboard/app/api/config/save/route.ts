import { NextRequest, NextResponse } from "next/server";
import { blobPut } from "@/src/lib/blob";

export async function POST(req: NextRequest) {
  const cfg = await req.json();
  await blobPut(`config/agent.json`, JSON.stringify(cfg, null, 2), "application/json");
  return NextResponse.json({ ok: true });
}



