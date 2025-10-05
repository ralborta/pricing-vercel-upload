'use client';
import { useState } from 'react';

export default function Settings() {
  const [cfg, setCfg] = useState({
    useSales:true, useCosts:true, useProducts:true, useSupplier:true, useCompetitors:true,
    markup:0.70, iva:0.21, roundTo:100
  });
  const [msg, setMsg] = useState('');

  const save = async () => {
    const res = await fetch('/api/config/save', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(cfg)
    });
    const json = await res.json();
    if (!res.ok) return setMsg(json.error || 'Error');
    setMsg('Configuración guardada');
  };

  return (
    <div style={{ display:'grid', gap:16 }}>
      <h1>Configuración del Agente</h1>
      <div style={{ display:'grid', gap:8, maxWidth:420 }}>
        {['useSales','useCosts','useProducts','useSupplier','useCompetitors'].map(k => (
          <label key={k} style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input type="checkbox" checked={(cfg as any)[k]}
                   onChange={e => setCfg({ ...cfg, [k]: e.target.checked })} />
            <span>Usar {k.replace('use','').toLowerCase()}</span>
          </label>
        ))}
        <label>Markup <input type="number" step="0.01" value={cfg.markup}
                onChange={e => setCfg({ ...cfg, markup: Number(e.target.value) })}/></label>
        <label>IVA <input type="number" step="0.01" value={cfg.iva}
                onChange={e => setCfg({ ...cfg, iva: Number(e.target.value) })}/></label>
        <label>Redondeo <input type="number" value={cfg.roundTo}
                onChange={e => setCfg({ ...cfg, roundTo: Number(e.target.value) })}/></label>
        <button onClick={save}>Guardar</button>
        {msg && <p style={{ color:'#b3e6ff' }}>{msg}</p>}
      </div>
    </div>
  );
}


