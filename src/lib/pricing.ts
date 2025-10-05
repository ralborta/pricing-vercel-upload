export type PricingCfg = { markup: number; iva: number; roundTo: number; };

export function roundTo(value: number, multiple: number) {
  return Math.round(value / multiple) * multiple;
}

export function price(costo: number, cfg: PricingCfg) {
  const base = costo * (1 + cfg.markup);
  const iva = base * cfg.iva;
  const final = roundTo(base + iva, cfg.roundTo);
  return { precioBase: base, iva, precioFinal: final, margen: final - costo };
}


