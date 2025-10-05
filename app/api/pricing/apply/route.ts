import { NextRequest, NextResponse } from "next/server";
import { blobPut } from "@/src/lib/blob";
import { PricingCfg } from "@/src/lib/pricing";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rows = body.rows as Array<{ sku:string; descripcion:string; costo:number; precioFinal:number }>;
  const cfg = body.config as PricingCfg;
  if (!rows?.length) return NextResponse.json({ error:'rows vacíos' }, { status: 400 });

  const headers = ['sku','descripcion','costo','precio_final'];
  const lines = [headers.join(',')];
  for (const r of rows) lines.push([r.sku, r.descripcion, r.costo, Math.round(r.precioFinal)].join(','));
  const csv = lines.join('\n');

  const ts = Date.now();
  const url = await blobPut(`pricing_results/${ts}.csv`, csv, "text/csv");
  return NextResponse.json({ ok:true, url });
}


