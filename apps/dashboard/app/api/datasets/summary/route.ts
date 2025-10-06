export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  const bucket = process.env.BLOB_BUCKET || 'pricing-suite';
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ ok:false, files:{} });
  const blobs = await list({ token, prefix: `${bucket}/datasets/` });
  const idx = blobs.blobs.find(b => b.pathname.endsWith('datasets/index.json'));
  if (!idx) return NextResponse.json({ ok:true, files:{} });
  const index = await (await fetch(idx.url)).json();
  const files = index.files || {};
  const latest = (name:string)=>{
    const arr:string[] = files[name]||[]; if (!arr.length) return null;
    const last = arr.sort().slice(-1)[0];
    const item = blobs.blobs.find(b => b.pathname.endsWith(`datasets/${name}/${last}`));
    return { name:last, url:item?.url||null };
  };
  return NextResponse.json({ ok:true, files: {
    products: latest('products'),
    sales: latest('sales'),
    competitors: latest('competitors'),
    costs: latest('costs'),
    supplier_prices: latest('supplier_prices')
  }});
}


