import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

function roundTo(value: number, multiple: number) { return Math.round(value / multiple) * multiple; }
function price(costo: number, markup: number, iva: number, roundToMult: number) {
  const base = costo * (1 + markup); const iv = base * iva; const final = roundTo(base + iv, roundToMult);
  return { precioBase: base, iva: iv, precioFinal: final, margen: final - costo };
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const config = form.get("config") as string | null;
  if (!file) return NextResponse.json({ error: "missing file" }, { status: 400 });
  const cfg = config ? JSON.parse(config) : { markup:0.70, iva:0.21, roundTo:100 };

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true });
  const rows = (parsed.data as any[]).filter(Boolean).slice(0, 200);

  const preview = rows.map(r => {
    const costo = Number(r.costo ?? 0);
    const calc = price(costo, cfg.markup, cfg.iva, cfg.roundTo);
    return { sku: r.sku ?? '', descripcion: r.descripcion ?? '', costo, ...calc };
  });

  return NextResponse.json({ ok:true, preview });
}


