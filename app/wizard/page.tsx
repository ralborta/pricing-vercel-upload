'use client';

import { useMemo, useRef, useState } from 'react';

type Step = 1 | 2 | 3 | 4;
const OPTIONAL = ['sales','competitors','costs','supplier_prices'] as const;
type OptionalDs = typeof OPTIONAL[number];
type Check = "pending" | "ok" | "error";

export default function Wizard() {
  const [step, setStep] = useState<Step>(1);

  const productsFile = useRef<HTMLInputElement>(null);
  const optRefs = useRef<Record<OptionalDs, HTMLInputElement | null>>({
    sales: null, competitors: null, costs: null, supplier_prices: null
  });

  const [status, setStatus] = useState<Record<string, Check>>({
    products: "pending",
    sales: "pending",
    competitors: "pending",
    costs: "pending",
    supplier_prices: "pending"
  });

  const [cfg, setCfg] = useState({ markup: 0.70, iva: 0.21, roundTo: 100 });
  const [preview, setPreview] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const canGoStep2 = status.products === "ok";
  const canGoStep3 = canGoStep2;
  const canGoStep4 = Boolean(preview?.length);
  const ico = (s:Check)=> s==="ok" ? "✅" : s==="error" ? "❌" : "⏳";

  async function upload(dataset: string, file: File) {
    const fd = new FormData();
    fd.append('dataset', dataset);
    fd.append('file', file);
    const res = await fetch('/api/datasets/upload', { method:'POST', body: fd });
    const json = await res.json();
    if (!res.ok) { setStatus(p=>({...p,[dataset]:'error'})); throw new Error(json.error || 'Error'); }
    setStatus(p=>({...p,[dataset]:'ok'}));
    return json.rows as number;
  }

  async function uploadProductsAndNext() {
    const file = productsFile.current?.files?.[0];
    if (!file) return alert('Elegí un Excel/CSV de products con columnas: sku, descripcion, costo');
    setBusy(true);
    try {
      const rows = await upload('products', file);
      setMsg(`Products OK (${rows} filas)`);
      setStep(2);
    } catch (e:any) { setMsg(e.message || 'Error'); }
    finally { setBusy(false); }
  }

  async function uploadOptional(ds: OptionalDs) {
    const f = optRefs.current[ds]?.files?.[0];
    if (!f) return alert(`Elegí un archivo para ${ds}`);
    setBusy(true);
    try { const rows = await upload(ds, f); setMsg(`${ds} OK (${rows} filas)`); }
    catch (e:any) { setMsg(e.message || 'Error'); }
    finally { setBusy(false); }
  }

  async function doPreview() {
    const file = productsFile.current?.files?.[0];
    if (!file) return alert('Para el preview, usá el mismo archivo de products del paso 1');
    setBusy(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('config', JSON.stringify(cfg));
    const res = await fetch('/api/pricing/preview', { method: 'POST', body: fd });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(json.error || 'Error en preview');
    setPreview(json.preview);
  }

  async function doPreviewLatest() {
    setBusy(true);
    const fd = new FormData();
    fd.append('config', JSON.stringify(cfg));
    const res = await fetch('/api/pricing/preview', { method: 'POST', body: fd });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(json.error || 'Error en preview');
    setPreview(json.preview);
    setMsg(`Preview listo. Usados → products:${json.used?.products} sales:${json.used?.sales} competitors:${json.used?.competitors} costs:${json.used?.costs}`);
  }

  async function doApply() {
    if (!preview) return;
    setBusy(true);
    const res = await fetch('/api/pricing/apply', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: preview, config: cfg })
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(json.error || 'Error en apply');
    setMsg(`Precios aplicados → ${json.url}`);
  }

  const stepTitle = useMemo(() => ({
    1: 'Paso 1 · Productos (obligatorio)',
    2: 'Paso 2 · Más datos (opcional)',
    3: 'Paso 3 · Reglas y Preview',
    4: 'Paso 4 · Apply y Analytics'
  }[step]), [step]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold text-[#2b2665]">Wizard — Setup del Agente de Pricing</h1>
      <p className="text-gray-500">{stepTitle}</p>
      {msg && <p className="text-[#4f46e5] text-sm">{msg}</p>}

      {step === 1 && (
        <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-3">
          <p className="text-gray-600">Subí <b>products</b> (Excel o CSV). Columnas: <code>sku, descripcion, costo</code>.</p>

          <div
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer.files?.[0]; if (f){ const dt=new DataTransfer(); dt.items.add(f); if (productsFile.current) productsFile.current.files = dt.files; } }}
            onClick={()=>{ const el=document.getElementById('hiddenFileInput') as HTMLInputElement|null; el?.click(); }}
            className="rounded-xl border border-dashed border-gray-300 p-6 bg-gray-50 hover:bg-gray-100 cursor-pointer"
          >
            <div className="text-sm text-gray-600">Arrastrá y soltá tu Excel/CSV aquí, o hacé clic para elegir</div>
            <input id="hiddenFileInput" type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel,.csv,text/csv"
              className="hidden"
              onChange={e=>{ const f=e.currentTarget.files?.[0]; if (f){ const dt=new DataTransfer(); dt.items.add(f); if (productsFile.current) productsFile.current.files = dt.files; } }}
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <input
              ref={productsFile}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel,.csv,text/csv"
              onClick={e=>{ (e.currentTarget as HTMLInputElement).value = ""; }}
              onChange={e=>{ const f=e.currentTarget.files?.[0]; if (f) console.log('Elegido:', f.name, f.type, f.size); }}
            />
            <a className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" href="/api/datasets/template/products">Template XLSX</a>
            <button className="px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50" disabled={busy} onClick={uploadProductsAndNext}>Subir y continuar</button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" onClick={()=>{
              const f=productsFile.current?.files?.[0];
              alert(f?`OK: ${f.name} (${f.type})`:'Aún no elegiste archivo');
            }}>Test file</button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" disabled={busy} onClick={doPreviewLatest}>Preview ahora (usa últimos datasets)</button>
          </div>
          <div className="text-sm text-gray-500">Estado: {ico(status.products)} products</div>
        </section>
      )}

      {step === 2 && (
        <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-3">
          <p className="text-gray-600">Subí datasets opcionales (Excel/CSV). Descargá templates si hace falta.</p>
          {(['sales','competitors','costs','supplier_prices'] as OptionalDs[]).map(ds => (
            <div key={ds} className="flex gap-3 items-center">
              <span className="w-40 capitalize">{ds}</span>
              <input ref={el => (optRefs.current[ds] = el)} type="file" accept=".xlsx,.xls,.csv" />
              <a className="px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-50" href={`/api/datasets/template/${ds}`}>Template XLSX</a>
              <button className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" disabled={busy} onClick={() => uploadOptional(ds)}>Subir</button>
              <span>{ico(status[ds])}</span>
            </div>
          ))}
          <div className="flex gap-3 mt-2">
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" onClick={() => setStep(1)}>← Volver</button>
            <button className="px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50" disabled={!canGoStep3} onClick={() => setStep(3)}>Continuar →</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-3">
          <p className="text-gray-600">Definí reglas y hacé <b>Preview</b> usando el archivo de products del Paso 1.</p>
          <div className="flex gap-3 items-center">
            <label className="text-sm text-gray-600">Markup <input className="ml-1 w-24 px-2 py-1 rounded-lg border border-gray-300" type="number" step="0.01" value={cfg.markup} onChange={e => setCfg({ ...cfg, markup: Number(e.target.value) })} /></label>
            <label className="text-sm text-gray-600">IVA <input className="ml-1 w-24 px-2 py-1 rounded-lg border border-gray-300" type="number" step="0.01" value={cfg.iva} onChange={e => setCfg({ ...cfg, iva: Number(e.target.value) })} /></label>
            <label className="text-sm text-gray-600">Redondeo <input className="ml-1 w-28 px-2 py-1 rounded-lg border border-gray-300" type="number" value={cfg.roundTo} onChange={e => setCfg({ ...cfg, roundTo: Number(e.target.value) })} /></label>
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" disabled={busy} onClick={doPreview}>Preview (archivo)</button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" disabled={busy} onClick={doPreviewLatest}>Preview (últimos datasets)</button>
          </div>
          {preview && (
            <div style={{ marginTop:12, overflow:'auto', border:'1px solid #2d215c' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>{['SKU','Descripción','Costo','Precio Base','IVA','Precio Final','Margen'].map(h =>
                    <th key={h} style={{ textAlign:'left', padding:8, borderBottom:'1px solid #2d215c' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r:any,i:number)=>(
                    <tr key={i}>
                      <td style={{ padding:8 }}>{r.sku}</td>
                      <td style={{ padding:8 }}>{r.descripcion}</td>
                      <td style={{ padding:8 }}>{r.costo}</td>
                      <td style={{ padding:8 }}>{r.precioBase?.toFixed?.(2) ?? r.precioBase}</td>
                      <td style={{ padding:8 }}>{r.iva?.toFixed?.(2) ?? r.iva}</td>
                      <td style={{ padding:8, fontWeight:600 }}>{r.precioFinal?.toFixed?.(0) ?? r.precioFinal}</td>
                      <td style={{ padding:8 }}>{r.margen?.toFixed?.(2) ?? r.margen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-3">
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" onClick={() => setStep(2)}>← Volver</button>
            <button className="px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50" disabled={!canGoStep4} onClick={() => setStep(4)}>Continuar →</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-3">
          <p className="text-gray-600">Aplicá los precios (genera un archivo en <code>pricing_results/</code>) y pasá a <b>Analytics</b>.</p>
          <div className="flex gap-3 items-center">
            <button className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" onClick={() => setStep(3)}>← Volver</button>
            <button className="px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50" disabled={!preview || busy} onClick={doApply}>Apply</button>
            <a className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50" href="/analytics">Ir a Analytics →</a>
          </div>
        </section>
      )}

      <section style={{ marginTop:16 }}>
        <h3>Checklist</h3>
        <ul style={{ lineHeight:1.8 }}>
          <li>{ico(status.products)} Products</li>
          <li>{ico(status.sales)} Sales (opcional)</li>
          <li>{ico(status.competitors)} Competitors (Mercado Libre) (opcional)</li>
          <li>{ico(status.costs)} Costs (opcional)</li>
          <li>{ico(status.supplier_prices)} Supplier prices (opcional)</li>
        </ul>
      </section>
    </div>
  );
}


