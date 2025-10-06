import { list } from "@vercel/blob";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const bucket = process.env.BLOB_BUCKET || "pricing-suite";
const token  = process.env.BLOB_READ_WRITE_TOKEN;

async function fetchBuf(url: string){ const r = await fetch(url); const a = await r.arrayBuffer(); return Buffer.from(a); }
async function fetchTxt(url: string){ const r = await fetch(url); return await r.text(); }

function parseCSV(text: string){ const p = Papa.parse(text, { header: true, skipEmptyLines: true }); return (p.data as any[]).filter(Boolean); }
function parseXLSX(buf: Buffer){ const wb = XLSX.read(buf, { type: "buffer" }); const ws = wb.Sheets[wb.SheetNames[0]]; return XLSX.utils.sheet_to_json(ws, { defval:"" }) as any[]; }

export async function latestUrls() {
  if (!token) return {} as any;
  const blobs = await list({ token, prefix: `${bucket}/datasets/` });
  const idx = blobs.blobs.find(b => b.pathname.endsWith("datasets/index.json"));
  if (!idx) return {} as any;
  const index = await (await fetch(idx.url)).json();
  const pick = (name:string) => {
    const files: string[] = index.files?.[name] || [];
    if (!files.length) return null;
    const last = files.sort().slice(-1)[0];
    const match = blobs.blobs.find(b => b.pathname.endsWith(`datasets/${name}/${last}`));
    return match?.url || null;
  };
  return {
    products: pick("products"),
    costs: pick("costs"),
    sales: pick("sales"),
    supplier_prices: pick("supplier_prices"),
    competitors: pick("competitors"),
  } as Record<string,string|null>;
}

export async function loadDataset(url: string|null){
  if (!url) return [] as any[];
  if (url.endsWith(".csv")) return parseCSV(await fetchTxt(url));
  const buf = await fetchBuf(url);
  try { return parseXLSX(buf); } catch { return []; }
}

function toNumber(v:any){ const n=Number(String(v).replace(/[^0-9.-]/g,'')); return isFinite(n)?n:0; }

export function normalizeDataset(name: string, rows: any[]): any[] {
  const n = name.toLowerCase();
  if (n === 'products') {
    return rows.map(r=>({
      sku: String(r.sku ?? r.SKU ?? r.Sku ?? '').trim(),
      descripcion: r.descripcion ?? r.description ?? r.nombre ?? r.producto ?? '',
      costo: toNumber(r.costo ?? r.cost ?? r.costo_ars ?? r.price_cost)
    })).filter(r=>r.sku);
  }
  if (n === 'costs') {
    return rows.map(r=>({ sku: String(r.sku ?? r.SKU ?? '').trim(), costo: toNumber(r.costo ?? r.cost ?? r.costo_ars) })).filter(r=>r.sku);
  }
  if (n === 'sales') {
    return rows.map(r=>({
      sku: String(r.sku ?? r.SKU ?? '').trim(),
      fecha: r.fecha ?? r.date ?? r.fecha_operacion ?? r.created_at ?? '',
      cantidad: toNumber(r.cantidad ?? r.real_units ?? r.units ?? r.qty ?? r.cant),
      precio_unit: toNumber(r.precio_unit ?? r.unit_price ?? r.net_revenue_unit ?? r.revenue_unit ?? r.price)
    })).filter(r=>r.sku);
  }
  if (n === 'competitors') {
    return rows.map(r=>({
      sku: String(r.sku ?? r.SKU ?? '').trim(),
      listing_title: r.listing_title ?? r.title ?? r.titulo ?? '',
      competidor: r.competidor ?? r.seller ?? r.vendedor ?? r.tienda ?? r.merchant ?? 'competidor',
      precio: toNumber(r.precio ?? r.price ?? r.competitor_price ?? r.precio_competidor ?? r.precio_ars ?? r.price_ars ?? r.precio_promedio),
      fecha: r.fecha ?? r.date ?? r.updated_at ?? ''
    }));
  }
  if (n === 'supplier_prices') {
    return rows.map(r=>({
      sku: String(r.sku ?? r.SKU ?? '').trim(), proveedor: r.proveedor ?? r.supplier ?? '', precio_proveedor: toNumber(r.precio_proveedor ?? r.price ?? r.costo), fecha: r.fecha ?? r.date ?? ''
    })).filter(r=>r.sku);
  }
  return rows;
}

// --- Heurística para inferir sku en competidores a partir del listing_title y el catálogo de products
const STOPWORDS = new Set(["ml","shoppro","tiendaoficial","bestprice","oficial","mercado","libre","store","shop","seller","128gb","256gb","512gb","gb"]);
function tokenize(s: string): string[] {
  return String(s||'')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g,' ')
    .split(/\s+/)
    .filter(t => t && !STOPWORDS.has(t));
}

export function attachSkuToCompetitors(rawCompetitors: any[], products: any[]): any[] {
  if (!rawCompetitors?.length) return [];
  const prodTokens = products.map(p => ({ sku: p.sku, tokens: tokenize(p.descripcion || p.sku) }));
  return rawCompetitors.map(c => {
    if (c.sku) return c; // ya viene informado
    const titleTokens = tokenize(c.listing_title || '');
    let bestSku = '';
    let bestScore = 0;
    for (const pt of prodTokens){
      const inter = pt.tokens.filter(t => titleTokens.includes(t));
      const score = inter.length / Math.max(1, Math.min(pt.tokens.length, titleTokens.length));
      if (score > bestScore){ bestScore = score; bestSku = pt.sku; }
    }
    if (bestScore >= 0.3) c.sku = bestSku; // umbral simple
    return c;
  }).filter(c => c.sku); // descarta filas sin poder inferir
}


