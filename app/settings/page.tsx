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
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold text-[#2b2665]">Configuración del Agente</h1>

      <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-3 max-w-2xl">
        <h2 className="text-lg font-semibold text-[#2b2665]">Fuentes de datos</h2>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          {['useSales','useCosts','useProducts','useSupplier','useCompetitors'].map(k => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={(cfg as any)[k]}
                     onChange={e => setCfg({ ...cfg, [k]: e.target.checked })} />
              <span>Usar {k.replace('use','').toLowerCase()}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-3 max-w-2xl">
        <h2 className="text-lg font-semibold text-[#2b2665]">Parámetros del motor</h2>
        <div className="flex gap-3 items-center text-sm text-gray-700">
          <label>Markup <input className="ml-1 w-24 px-2 py-1 rounded-lg border border-gray-300" type="number" step="0.01" value={cfg.markup}
                  onChange={e => setCfg({ ...cfg, markup: Number(e.target.value) })}/></label>
          <label>IVA <input className="ml-1 w-24 px-2 py-1 rounded-lg border border-gray-300" type="number" step="0.01" value={cfg.iva}
                  onChange={e => setCfg({ ...cfg, iva: Number(e.target.value) })}/></label>
          <label>Redondeo <input className="ml-1 w-24 px-2 py-1 rounded-lg border border-gray-300" type="number" value={cfg.roundTo}
                  onChange={e => setCfg({ ...cfg, roundTo: Number(e.target.value) })}/></label>
        </div>
        <div className="flex gap-3">
          <button className="px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700" onClick={save}>Guardar</button>
          {msg && <p className="text-[#4f46e5] text-sm">{msg}</p>}
        </div>
      </section>
    </div>
  );
}


