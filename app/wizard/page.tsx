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
    <div style={{ display:'grid', gap:16 }}>
      <h1>Wizard — Setup del Agente de Pricing</h1>
      <p style={{ color:'#a7a1c2' }}>{stepTitle}</p>
      {msg && <p style={{ color:'#b3e6ff' }}>{msg}</p>}

      {step === 1 && (
        <section style={{ display:'grid', gap:12 }}>
          <p>Subí <b>products</b> (Excel o CSV). Columnas: <code>sku, descripcion, costo</code>.</p>

          <div
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer.files?.[0]; if (f){ const dt=new DataTransfer(); dt.items.add(f); if (productsFile.current) productsFile.current.files = dt.files; } }}
            onClick={()=>{ const el=document.getElementById('hiddenFileInput') as HTMLInputElement|null; el?.click(); }}
            style={{ border:'1px dashed #ccc', padding:12, borderRadius:12, background:'#fff' }}
          >
            <div style={{ color:'#666', fontSize:13 }}>Arrastrá y soltá tu Excel/CSV aquí, o hacé clic para elegir</div>
            <input id="hiddenFileInput" type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel,.csv,text/csv"
              style={{ display:'none' }}
              onChange={e=>{ const f=e.currentTarget.files?.[0]; if (f){ const dt=new DataTransfer(); dt.items.add(f); if (productsFile.current) productsFile.current.files = dt.files; } }}
            />
          </div>

          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <input
              ref={productsFile}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel,.csv,text/csv"
              onClick={e=>{ (e.currentTarget as HTMLInputElement).value = ""; }}
              onChange={e=>{ const f=e.currentTarget.files?.[0]; if (f) console.log('Elegido:', f.name, f.type, f.size); }}
            />
            <a href="/api/datasets/template/products" style={{ border:'1px solid #2d215c', padding:'8px 10px', borderRadius:8 }}>Template XLSX</a>
            <button disabled={busy} onClick={uploadProductsAndNext}>Subir y continuar</button>
            <button style={{ border:'1px solid #ccc', padding:'8px 10px', borderRadius:8 }} onClick={()=>{
              const f=productsFile.current?.files?.[0];
              alert(f?`OK: ${f.name} (${f.type})`:'Aún no elegiste archivo');
            }}>Test file</button>
            <button disabled={busy} onClick={doPreviewLatest}>Preview ahora (usa últimos datasets)</button>
          </div>
          <div style={{ color:'#a7a1c2' }}>Estado: {ico(status.products)} products</div>
        </section>
      )}

      {step === 2 && (
        <section style={{ display:'grid', gap:12 }}>
          <p>Subí datasets opcionales (Excel/CSV). Descargá templates si hace falta.</p>
          {(['sales','competitors','costs','supplier_prices'] as OptionalDs[]).map(ds => (
            <div key={ds} style={{ display:'flex', gap:12, alignItems:'center' }}>
              <span style={{ width:160, textTransform:'capitalize' }}>{ds}</span>
              <input ref={el => (optRefs.current[ds] = el)} type="file" accept=".xlsx,.xls,.csv" />
              <a href={`/api/datasets/template/${ds}`} style={{ border:'1px solid #2d215c', padding:'6px 8px', borderRadius:8 }}>Template XLSX</a>
              <button disabled={busy} onClick={() => uploadOptional(ds)}>Subir</button>
              <span>{ico(status[ds])}</span>
            </div>
          ))}
          <div style={{ display:'flex', gap:12, marginTop:8 }}>
            <button onClick={() => setStep(1)}>← Volver</button>
            <button disabled={!canGoStep3} onClick={() => setStep(3)}>Continuar →</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section style={{ display:'grid', gap:12 }}>
          <p>Definí reglas y hacé <b>Preview</b> usando el archivo de products del Paso 1.</p>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <label>Markup <input type="number" step="0.01" value={cfg.markup} onChange={e => setCfg({ ...cfg, markup: Number(e.target.value) })} /></label>
            <label>IVA <input type="number" step="0.01" value={cfg.iva} onChange={e => setCfg({ ...cfg, iva: Number(e.target.value) })} /></label>
            <label>Redondeo <input type="number" value={cfg.roundTo} onChange={e => setCfg({ ...cfg, roundTo: Number(e.target.value) })} /></label>
            <button disabled={busy} onClick={doPreview}>Preview (archivo)</button>
            <button disabled={busy} onClick={doPreviewLatest}>Preview (últimos datasets)</button>
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
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => setStep(2)}>← Volver</button>
            <button disabled={!canGoStep4} onClick={() => setStep(4)}>Continuar →</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section style={{ display:'grid', gap:12 }}>
          <p>Aplicá los precios (genera un archivo en <code>pricing_results/</code>) y pasá a <b>Analytics</b>.</p>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => setStep(3)}>← Volver</button>
            <button disabled={!preview || busy} onClick={doApply}>Apply</button>
            <a href="/analytics" style={{ display:'inline-block', padding:'8px 12px', border:'1px solid #2d215c', borderRadius:8 }}>Ir a Analytics →</a>
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


