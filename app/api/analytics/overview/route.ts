export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import Papa from "papaparse";

async function fetchText(url: string) { const res = await fetch(url); return await res.text(); }
function parseCSV(text: string) { const parsed = Papa.parse(text, { header: true }); return parsed.data as any[]; }

export async function GET() {
  const bucket = process.env.BLOB_BUCKET || "pricing-suite";
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ kpis: [], top: [] });
  const blobs = await list({ token, prefix: `${bucket}/datasets/` });
  const idx = blobs.blobs.find(b => b.pathname.endsWith("datasets/index.json"));
  if (!idx) return NextResponse.json({ kpis: [], top: [] });
  const index = JSON.parse(await fetchText(idx.url));

  function latestUrl(name: string){
    const files: string[] = index.files?.[name] || [];
    if (!files.length) return null;
    const last = files.sort().slice(-1)[0];
    const item = blobs.blobs.find(b => b.pathname.endsWith(`datasets/${name}/${last}`));
    return item?.url;
  }

  const urls = { products: latestUrl('products'), sales: latestUrl('sales'), competitors: latestUrl('competitors') };
  const products = urls.products ? parseCSV(await fetchText(urls.products)) : [];
  const sales = urls.sales ? parseCSV(await fetchText(sUrl(urls.sales))) : [];
  function sUrl(u:string){return u} // evita TypeScript warnings en edge
  const competitors = urls.competitors ? parseCSV(await fetchText(urls.competitors)) : [];

  const skuSet = new Set(products.map((p:any)=>p.sku));
  const avgCost = products.length ? products.reduce((a:any,p:any)=>a+Number(p.costo||0),0)/products.length : 0;
  const qty = sales.reduce((a:any,s:any)=>a+Number(s.cantidad||0),0);
  const revenue = sales.reduce((a:any,s:any)=>a+Number(s.cantidad||0)*Number(s.precio_unit||0),0);
  const currency = (n:number)=> new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(n);
  const kpis = [
    { name:"SKUs", value:String(skuSet.size) },
    { name:"Costo promedio", value:currency(avgCost) },
    { name:"Unidades 30 días", value:String(qty) },
    { name:"Ingresos 30 días", value:currency(revenue) }
  ];

  // our_price = costo * 1.7 * 1.21 (demo)
  const priceMap = new Map(products.map((p:any)=>[p.sku, Number(p.costo||0)*1.7*1.21]));
  const compAgg = new Map<string,{sum:number,count:number}>();
  for (const c of competitors){ const sku=c.sku; const val=Number(c.precio||0); const cur=compAgg.get(sku)||{sum:0,count:0}; cur.sum+=val; cur.count+=1; compAgg.set(sku,cur); }
  const rows:any[] = [];
  for (const sku of skuSet){
    const our=priceMap.get(sku)||0; const agg=compAgg.get(sku); const avg=agg?agg.sum/agg.count:0;
    const delta=avg>0?(our-avg)/avg:0; rows.push({ sku, our_price:our, competitor_avg:avg, delta_pct:delta });
  }
  rows.sort((a,b)=>Math.abs(b.delta_pct)-Math.abs(a.delta_pct));
  const top = rows.slice(0,10);

  return NextResponse.json({ kpis, top });
}


