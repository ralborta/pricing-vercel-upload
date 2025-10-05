import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  const bucket = process.env.BLOB_BUCKET || "pricing-suite";
  const blobs = await list({ token: process.env.BLOB_READ_WRITE_TOKEN, prefix: `${bucket}/runs/` });
  const runs = blobs.blobs
    .filter(b => b.pathname.endsWith('/run.json'))
    .map(b => ({ ts: Number(b.pathname.split('/runs/')[1].split('/')[0]), url: b.url }))
    .sort((a,b)=> b.ts - a.ts)
    .slice(0, 25);

  const out:any[] = [];
  for (const r of runs) {
    const j = await (await fetch(r.url)).json();
    out.push({ ts: r.ts, status: j.status, items: j.items, note: j.note });
  }
  return NextResponse.json({ runs: out });
}


