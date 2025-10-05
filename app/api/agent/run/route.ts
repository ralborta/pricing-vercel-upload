import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { blobPut } from "@/src/lib/blob";

async function fetchText(url: string) { const r = await fetch(url); return await r.text(); }
function parseCSV(text: string) { const [hdr, ...rows] = text.trim().split("\n"); const headers = hdr.split(","); return rows.map(line => Object.fromEntries(line.split(",").map((v,i)=>[headers[i], v]))); }
function currency(n:number){ return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(n); }

export async function POST() {
  const bucket = process.env.BLOB_BUCKET || "pricing-suite";
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  const cfgList = await list({ token, prefix: `${bucket}/config/` });
  const cfgBlob = cfgList.blobs.find(b => b.pathname.endsWith("config/agent.json"));
  const cfg = cfgBlob ? await (await fetch(cfgBlob.url)).json() : null;

  if (!cfg?.active) return NextResponse.json({ ok:false, note:'Agente inactivo' }, { status: 200 });

  const blobs = await list({ token, prefix: `${bucket}/datasets/` });
  const indexBlob = blobs.blobs.find(b => b.pathname.endsWith("datasets/index.json"));
  if (!indexBlob) return NextResponse.json({ ok:false, note:'Sin datasets' }, { status: 200 });
  const index = await (await fetch(indexBlob.url)).json();

  const latest = (name:string) => {
    const files = index.files?.[name] || [];
    if (!files.length) return null;
    const last = files.sort().slice(-1)[0];
    const found = blobs.blobs.find(b => b.pathname.endsWith(`datasets/${name}/${last}`));
    return found?.url || null;
  };

  const pUrl = latest('products');
  if (!pUrl) return NextResponse.json({ ok:false, note:'Sin products' }, { status: 200 });

  let products:any[] = [];
  if (pUrl.endsWith('.csv')) {
    const text = await fetchText(pUrl);
    products = parseCSV(text);
  } else {
    const text = await fetchText(pUrl);
    products = parseCSV(text);
  }

  const { markup, iva, roundTo } = cfg.rules || { markup:0.70, iva:0.21, roundTo:100 };
  const roundToFn = (v:number, m:number)=> Math.round(v/m)*m;
  const priced = products.map((r:any) => {
    const costo = Number(r.costo ?? 0);
    const base = costo*(1+markup);
    const ivaVal = base*iva;
    const final = roundToFn(base+ivaVal, roundTo);
    return { sku:r.sku||'', descripcion:r.descripcion||'', costo, precio_final: final };
  });

  const ts = Date.now();
  const headers = ['sku','descripcion','costo','precio_final'];
  const csvLines = [headers.join(',')].concat(priced.map(r => [r.sku, r.descripcion, r.costo, r.precio_final].join(',')));
  const resultUrl = await blobPut(`runs/${ts}/pricing_results.csv`, csvLines.join('\n'), "text/csv");

  const log = {
    ts,
    status: 'ok',
    items: priced.length,
    usedInputs: cfg.use,
    outputs: cfg.outputs,
    resultUrl,
    summary: {
      avgCost: products.length ? products.reduce((a:any,p:any)=>a+Number(p.costo||0),0)/products.length : 0,
      example: priced[0] ? { sku: priced[0].sku, precio: priced[0].precio_final } : null
    },
    note: `Ejecutado por agente; ejemplo: ${priced[0]?.sku || ''} → ${currency(priced[0]?.precio_final || 0)}`
  };
  await blobPut(`runs/${ts}/run.json`, JSON.stringify(log, null, 2), "application/json");

  return NextResponse.json({ ok:true, items: priced.length, url: resultUrl });
}


