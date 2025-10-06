export type PricingCfg = {
  markup: number;
  iva: number;
  roundTo: number;
  strategyDelta?: number;
  blend?: number;
};

export function roundTo(value: number, multiple: number) {
  return Math.round(value / multiple) * multiple;
}

export function elasticAdj(units30d: number) {
  if (units30d >= 30) return +0.10;
  if (units30d >= 10) return +0.05;
  if (units30d <= 1)  return -0.08;
  return 0;
}

export function priceFromCost(costo: number, cfg: PricingCfg) {
  const base = costo * (1 + cfg.markup);
  const iva  = base * cfg.iva;
  return base + iva;
}

export function priceFromMarket(avgCompetitor: number, cfg: PricingCfg) {
  const delta = cfg.strategyDelta ?? 0;
  return avgCompetitor * (1 + delta);
}

export function computePricing(args: {
  products: any[]; sales: any[]; competitors: any[];
  costs?: any[]; supplier?: any[]; cfg: PricingCfg;
}) {
  const { products, sales, competitors, costs = [], cfg } = args;

  const salesBySku = new Map<string, number>();
  for (const s of sales) {
    const sku = String(s.sku||"");
    salesBySku.set(sku, (salesBySku.get(sku)||0) + Number(s.cantidad||0));
  }

  const costOverride = new Map<string, number>();
  for (const c of costs) costOverride.set(String(c.sku||""), Number(c.costo||0));

  const compAgg = new Map<string, {sum:number; count:number}>();
  for (const c of competitors) {
    const sku = String(c.sku||""); const p = Number(c.precio||0);
    const cur = compAgg.get(sku) || {sum:0,count:0}; cur.sum += p; cur.count += 1; compAgg.set(sku, cur);
  }

  const blend = Math.min(1, Math.max(0, cfg.blend ?? 0.5));

  return products.map(p => {
    const sku   = String(p.sku||"");
    const desc  = p.descripcion ?? "";
    const costo = Number(costOverride.get(sku) ?? p.costo ?? 0);

    const adj   = elasticAdj(salesBySku.get(sku)||0);
    const costCfg = { ...cfg, markup: Math.max(0, cfg.markup + adj) };
    const costPrice = priceFromCost(costo, costCfg);

    const comp = compAgg.get(sku);
    const marketPrice = comp && comp.count ? priceFromMarket(comp.sum/comp.count, cfg) : costPrice;

    const blended = costPrice*(1-blend) + marketPrice*blend;
    const final   = roundTo(blended, cfg.roundTo);
    const base    = costo * (1 + costCfg.markup);
    const iva     = base * costCfg.iva;

    return {
      sku, descripcion: desc, costo,
      precioBase: base, iva, precioFinal: final,
      fuente: comp?.count ? "costo+mercado" : "costo",
      ventas30d: salesBySku.get(sku)||0,
      compAvg: comp && comp.count ? comp.sum/comp.count : null
    };
  });
}


