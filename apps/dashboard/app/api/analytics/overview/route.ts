export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { latestUrls, loadDataset, normalizeDataset, attachSkuToCompetitors } from "@/src/lib/datasets";

export async function GET() {
  const urls:any = await latestUrls();
  if (!urls?.products) return NextResponse.json({ kpis: [], top: [] });
  const [pRaw, sRaw, cRaw] = await Promise.all([
    loadDataset(urls.products || null),
    loadDataset(urls.sales || null),
    loadDataset(urls.competitors || null)
  ]);
  const products = normalizeDataset('products', pRaw);
  const sales = normalizeDataset('sales', sRaw);
  let competitors = normalizeDataset('competitors', cRaw);
  competitors = attachSkuToCompetitors(competitors, products);

  const skuSet = new Set(products.map((p:any)=>p.sku));
  const avgCost = products.length ? products.reduce((a:any,p:any)=>a+Number(p.costo||0),0)/products.length : 0;
  const qty = sales.reduce((a:any,s:any)=>a+Number(s.cantidad||0),0);
  const revenue = sales.reduce((a:any,s:any)=>a+Number(s.cantidad||0)*Number(s.precio_unit||0),0);
  const currency = (n:number)=> new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(n);
  // Calcular precio propio para estimar margen y éxito
  const markupEnv = Number(process.env.PRICING_DEFAULT_MARKUP ?? 0.70);
  const ivaEnv = Number(process.env.PRICING_DEFAULT_IVA ?? 0.21);
  const ourPrice = (c:number)=> c*(1+markupEnv)*(1+ivaEnv);
  const priceMap = new Map(products.map((p:any)=>[p.sku, ourPrice(Number(p.costo||0))]));
  const compAgg = new Map<string,{sum:number,count:number}>();
  for (const c of competitors){ const sku=c.sku; const val=Number(c.precio||0); const cur=compAgg.get(sku)||{sum:0,count:0}; cur.sum+=val; cur.count+=1; compAgg.set(sku,cur); }

  let sumMargin = 0; let counted = 0; let successCount = 0;
  let optimo = 0; let advert = 0; let critico = 0;
  for (const sku of skuSet){
    const our = priceMap.get(sku)||0;
    const agg = compAgg.get(sku); const avg = agg?agg.sum/agg.count:0;
    if (our>0){
      const cost = Number(products.find((p:any)=>p.sku===sku)?.costo||0);
      const margin = cost>0 ? (our-cost)/our : 0;
      sumMargin += margin; counted += 1;
      if (avg>0) successCount += our <= avg ? 1 : 0; // éxito = igual o mejor precio que competidores
      const mPct = margin*100;
      if (mPct >= 20) optimo++; else if (mPct >= 10) advert++; else critico++;
    }
  }
  const avgMarginPct = counted ? `${(sumMargin/counted*100).toFixed(1)}%` : "—";
  const successRate = skuSet.size ? `${Math.round(successCount/skuSet.size*100)}%` : "—";

  // Tiempo total (demo): sumar duraciones sintéticas de runs si existen
  // En esta demo, devolvemos un fijo amigable
  const totalTime = "94h 12m";

  const kpis = [
    { name:"SKUs", value:String(skuSet.size) },
    { name:"Costo promedio", value:currency(avgCost) },
    { name:"Unidades 30 días", value:String(qty) },
    { name:"Ingresos 30 días", value:currency(revenue) },
    { name:"Margen Promedio", value:avgMarginPct },
    { name:"Tasa de Éxito", value:successRate },
    { name:"Tiempo Total", value:totalTime }
  ];

  const rows:any[] = [];
  for (const sku of skuSet){
    const our=priceMap.get(sku)||0; const agg=compAgg.get(sku); const avg=agg?agg.sum/agg.count:0;
    const delta=avg>0?(our-avg)/avg:0; rows.push({ sku, our_price:our, competitor_avg:avg, delta_pct:delta });
  }
  rows.sort((a,b)=>Math.abs(b.delta_pct)-Math.abs(a.delta_pct));
  const top = rows.slice(0,10);

  const distribution = [
    { name: "Optimo", value: optimo },
    { name: "Advertencia", value: advert },
    { name: "Critico", value: critico },
  ];

  return NextResponse.json({ kpis, top, distribution });
}


