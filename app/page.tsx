'use client';
import { useEffect, useRef, useState } from 'react';

const DATASETS = ['products','costs','sales','supplier_prices','competitors'];

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dataset, setDataset] = useState('products');
  const [busy, setBusy] = useState(false);
  const [cfg, setCfg] = useState({ markup:0.70, iva:0.21, roundTo:100 });
  const [preview, setPreview] = useState<any[] | null>(null);
  const [dsState, setDsState] = useState<any>({});
  const [msg, setMsg] = useState<string>('');
  const ready = Boolean(dsState?.products?.name);

  useEffect(()=>{ (async()=>{
    const r = await fetch('/api/datasets/summary');
    const j = await r.json();
    if (r.ok) setDsState(j.files||{});
  })(); },[]);

  const upload = async () => {
    if (!fileRef.current?.files?.[0]) return alert('Elegí un CSV');
    setBusy(true);
    const fd = new FormData();
    fd.append('dataset', dataset);
    fd.append('file', fileRef.current.files[0]);
    const res = await fetch('/api/datasets/upload', { method:'POST', body: fd });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return alert(json.error || 'Error');
    setMsg(`OK: ${json.dataset} (${json.rows} filas)`);
    const r = await fetch('/api/datasets/summary'); const j = await r.json(); if (r.ok) setDsState(j.files||{});
  };

  const previewPricing = async () => {
    if (!fileRef.current?.files?.[0]) return alert('Subí un CSV de products (sku, descripcion, costo)');
    setBusy(true);
    const fd = new FormData();
    fd.append('file', fileRef.current.files[0]);
    fd.append('config', JSON.stringify(cfg));
    const res = await fetch('/api/pricing/preview', { method:'POST', body: fd });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return alert(json.error || 'Error');
    setPreview(json.preview);
  };

  const applyPricing = async () => {
    if (!preview) return alert('Primero hacé Preview');
    setBusy(true);
    const res = await fetch('/api/pricing/apply', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ rows: preview, config: cfg })
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return alert(json.error || 'Error');
    alert(`Precios aplicados. Archivo: ${json.url}`);
  };

  return (
    <div style={{ display:'grid', gap:16 }}>
      <h1>Subir archivos de base</h1>
      {msg && <p style={{ color:'#b3e6ff' }}>{msg}</p>}
      <div style={{ display:'flex', gap:16, alignItems:'center', color:'#a7a1c2', fontSize:13, flexWrap:'wrap' }}>
        <div>products: {dsState?.products?.name ? (<a href={dsState.products.url} style={{ color:'#9ae6ff' }}>{dsState.products.name}</a>) : '—'}</div>
        <div>sales: {dsState?.sales?.name ? (<a href={dsState.sales.url} style={{ color:'#9ae6ff' }}>{dsState.sales.name}</a>) : '—'}</div>
        <div>competitors: {dsState?.competitors?.name ? (<a href={dsState.competitors.url} style={{ color:'#9ae6ff' }}>{dsState.competitors.name}</a>) : '—'}</div>
        <div>costs: {dsState?.costs?.name ? (<a href={dsState.costs.url} style={{ color:'#9ae6ff' }}>{dsState.costs.name}</a>) : '—'}</div>
        <div>supplier_prices: {dsState?.supplier_prices?.name ? (<a href={dsState.supplier_prices.url} style={{ color:'#9ae6ff' }}>{dsState.supplier_prices.name}</a>) : '—'}</div>
      </div>

      <div style={{ marginTop:12, display:'flex', gap:12, alignItems:'center' }}>
        <button disabled={!ready || busy} onClick={async()=>{
          setBusy(true);
          const fd = new FormData(); fd.append('config', JSON.stringify(cfg));
          const res = await fetch('/api/pricing/preview', { method:'POST', body: fd });
          const json = await res.json(); setBusy(false);
          if (!res.ok) return alert(json.error||'Error'); setPreview(json.preview);
        }}
        >Generar Pricing ahora</button>
        <button disabled={busy || !preview} onClick={applyPricing}>Aplicar (guardar CSV)</button>
        {!ready && <span style={{ color:'#ffb3b3', fontSize:12 }}>Subí primero products (sku, descripcion, costo)</span>}
      </div>
      <p>Formatos esperados:</p>
      <ul style={{ color:'#a7a1c2' }}>
        <li><b>products</b>: sku, descripcion, costo</li>
        <li><b>costs</b>: sku, costo</li>
        <li><b>sales</b>: sku, fecha, cantidad, precio_unit</li>
        <li><b>supplier_prices</b>: sku, proveedor, precio_proveedor, fecha</li>
        <li><b>competitors</b>: sku, competidor, precio, fecha</li>
      </ul>

      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <select value={dataset} onChange={e => setDataset(e.target.value)}>
          {DATASETS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel,.csv,text/csv"
          onClick={e=>{ (e.currentTarget as HTMLInputElement).value = ""; }}
        />
        <button disabled={busy} onClick={upload}>Cargar dataset</button>
      </div>

      <hr style={{ borderColor:'#2d215c' }} />

      <section>
        <h2>Preview / Apply del Pricing</h2>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <label>Markup <input type="number" step="0.01" value={cfg.markup} onChange={e => setCfg({ ...cfg, markup: Number(e.target.value) })}/></label>
          <label>IVA <input type="number" step="0.01" value={cfg.iva} onChange={e => setCfg({ ...cfg, iva: Number(e.target.value) })}/></label>
          <label>Redondeo <input type="number" value={cfg.roundTo} onChange={e => setCfg({ ...cfg, roundTo: Number(e.target.value) })}/></label>
          <button disabled={busy} onClick={previewPricing}>Preview (archivo)</button>
          <button disabled={busy} onClick={async()=>{
            setBusy(true);
            const fd = new FormData(); fd.append('config', JSON.stringify(cfg));
            const res = await fetch('/api/pricing/preview', { method:'POST', body: fd });
            const json = await res.json(); setBusy(false);
            if (!res.ok) return alert(json.error||'Error'); setPreview(json.preview);
          }}>Preview (últimos datasets)</button>
          <button disabled={busy || !preview} onClick={applyPricing}>Apply</button>
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
      </section>
    </div>
  );
}


