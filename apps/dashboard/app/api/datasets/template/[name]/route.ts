export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";

const templates: Record<string, { filename: string; content: string; contentType: string }> = {
  products: { filename: 'products_template.csv', content: 'sku,descripcion,costo\nPHN-GALAXY-A15,Samsung Galaxy A15 128GB,420000\n', contentType: 'text/csv' },
  sales: { filename: 'sales_template.csv', content: 'sku,fecha,cantidad,precio_unit\nPHN-GALAXY-A15,2025-09-30,2,850000\n', contentType: 'text/csv' },
  competitors: { filename: 'competitors_template.csv', content: 'sku,competidor,precio,fecha\nPHN-GALAXY-A15,ML-ShopPro,870000,2025-09-30\n', contentType: 'text/csv' },
  costs: { filename: 'costs_template.csv', content: 'sku,costo\nPHN-GALAXY-A15,420000\n', contentType: 'text/csv' },
  supplier_prices: { filename: 'supplier_prices_template.csv', content: 'sku,proveedor,precio_proveedor,fecha\nPHN-GALAXY-A15,DistTech SA,390000,2025-09-01\n', contentType: 'text/csv' },
};

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const name = (params.name || '').toLowerCase();
  const t = templates[name];
  if (!t) return NextResponse.json({ error: 'template no disponible' }, { status: 404 });
  return new NextResponse(t.content, {
    status: 200,
    headers: {
      'Content-Type': t.contentType,
      'Content-Disposition': `attachment; filename=${t.filename}`
    }
  });
}


