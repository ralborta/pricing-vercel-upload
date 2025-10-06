export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { blobList, blobPut } from "@/src/lib/blob";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { validateHeaders } from "@/src/lib/validate";

const ALLOWED = new Set(['products','costs','sales','supplier_prices','competitors']);

async function readAsRows(file: File): Promise<{ rows:any[]; headers:string[]; ext:string; buf:Buffer; type:string; }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = (file.name||"").toLowerCase();
  const ext = name.endsWith(".xlsx") || name.endsWith(".xls") ? "xlsx" : "csv";
  if (ext === "xlsx") {
    const wb = XLSX.read(buf, { type:"buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval:"" }) as any[];
    const headers = (XLSX.utils.sheet_to_json(ws, { header:1 })[0] as string[]).map(String);
    return { rows, headers, ext, buf, type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
  }
  const text = buf.toString("utf8");
  const parsed = Papa.parse(text, { header:true, skipEmptyLines:true });
  const headers = (parsed.meta.fields||[]).map(String);
  const rows = (parsed.data as any[]).filter(Boolean);
  return { rows, headers, ext, buf, type:"text/csv" };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const dataset = (form.get('dataset') as string || '').toLowerCase();
    const file = form.get('file') as File | null;
    if (!ALLOWED.has(dataset)) return NextResponse.json({ error:'dataset inválido' }, { status: 400 });
    if (!file) return NextResponse.json({ error:'missing file' }, { status: 400 });

    const { rows, headers, ext, buf, type } = await readAsRows(file);
    const val = validateHeaders(headers as any, dataset as any);
    if (!val.ok) return NextResponse.json({ error:`Faltan columnas: ${val.missing.join(', ')}`, expected: val.expected }, { status:400 });

    const ts = Date.now();
    await blobPut(`datasets/${dataset}/${ts}.${ext}`, buf, type);

    const list = await blobList(`datasets/`);
    const idxBlob = list.find(b => b.pathname.endsWith("datasets/index.json"));
    let index: any = { files: { products:[], costs:[], sales:[], supplier_prices:[], competitors:[] } };
    if (idxBlob) { const res = await fetch(idxBlob.url); index = await res.json(); }
    index.files = index.files || {};
    for (const k of ['products','costs','sales','supplier_prices','competitors']) index.files[k] = index.files[k] || [];
    index.files[dataset].push(`${ts}.${ext}`);
    index.last = ts;
    await blobPut(`datasets/index.json`, JSON.stringify(index, null, 2), "application/json");

    return NextResponse.json({ ok: true, dataset, rows: rows.length, headers });
  } catch (e:any) {
    console.error('UPLOAD_ERROR', e);
    return NextResponse.json({ error: e?.message || 'error interno' }, { status: 500 });
  }
}


