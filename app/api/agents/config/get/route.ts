import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  const bucket = process.env.BLOB_BUCKET || "pricing-suite";
  const blobs = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, prefix: `${bucket}/config/` });
  const file = blobs.blobs.find(b => b.pathname.endsWith("config/agent.json"));
  if (!file) return NextResponse.json({ config: null });
  const res = await fetch(file.url);
  const config = await res.json();
  return NextResponse.json({ config });
}


