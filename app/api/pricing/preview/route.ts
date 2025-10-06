export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { latestUrls, loadDataset } from "@/src/lib/datasets";
import { computePricing, PricingCfg } from "@/src/lib/pricing";

// flags already declared above

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(()=>null);
  const cfg = form?.get("config") ? JSON.parse(String(form.get("config"))) as PricingCfg
                                  : { markup:0.70, iva:0.21, roundTo:100, strategyDelta:-0.02, blend:0.5 };

  const urls = await latestUrls();
  const [products, sales, competitors, costs] = await Promise.all([
    loadDataset(urls.products || null),
    loadDataset(urls.sales || null),
    loadDataset(urls.competitors || null),
    loadDataset(urls.costs || null),
  ]);

  if (!products.length) return NextResponse.json({ error:"No hay products en datasets/" }, { status: 400 });
  const preview = computePricing({ products, sales, competitors, costs, cfg }).slice(0, 500);
  return NextResponse.json({ ok:true, preview, used: { products: !!products.length, sales: !!sales.length, competitors: !!competitors.length, costs: !!costs.length } });
}


