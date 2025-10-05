import { NextRequest, NextResponse } from "next/server";
import { blobList, blobPut } from "@/src/lib/blob";
import Papa from "papaparse";

const ALLOWED = new Set(['products','costs','sales','supplier_prices','competitors']);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const dataset = (form.get('dataset') as string || '').toLowerCase();
  const file = form.get('file') as File | null;
  if (!ALLOWED.has(dataset)) return NextResponse.json({ error:'dataset inválido' }, { status: 400 });
  if (!file) return NextResponse.json({ error:'missing file' }, { status: 400 });

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) return NextResponse.json({ error: parsed.errors.map(e=>e.message).join(', ') }, { status: 400 });
  const rows = (parsed.data as any[]).filter(Boolean);

  const ts = Date.now();
  await blobPut(`datasets/${dataset}/${ts}.csv`, text, "text/csv");

  // update (acumula) index.json
  const list = await blobList(`datasets/`);
  const idxBlob = list.find(b => b.pathname.endsWith("datasets/index.json"));
  let index: any = { files: { products:[], costs:[], sales:[], supplier_prices:[], competitors:[] } };
  if (idxBlob) { const res = await fetch(idxBlob.url); index = await res.json(); }
  index.files = index.files || {};
  for (const k of ['products','costs','sales','supplier_prices','competitors']) index.files[k] = index.files[k] || [];
  index.files[dataset].push(`${ts}.csv`);
  index.last = ts;
  await blobPut(`datasets/index.json`, JSON.stringify(index, null, 2), "application/json");

  return NextResponse.json({ ok: true, dataset, rows: rows.length });
}


