type Dataset = "products" | "costs" | "sales" | "supplier_prices" | "competitors";

const expectedByDs: Record<Dataset, string[]> = {
  products: ["sku", "descripcion", "costo"],
  costs: ["sku", "costo"],
  sales: ["sku", "fecha", "cantidad", "precio_unit"],
  supplier_prices: ["sku", "proveedor", "precio_proveedor", "fecha"],
  competitors: ["sku", "competidor", "precio", "fecha"],
};

export function validateHeaders(headers: string[], dataset: Dataset): { ok: boolean; missing: string[]; expected: string[] } {
  const have = new Set(headers.map(h => String(h || "").trim().toLowerCase()));
  const expected = expectedByDs[dataset] || [];
  const missing = expected.filter(h => !have.has(h));
  return { ok: missing.length === 0, missing, expected };
}


