'use client';
import { useEffect, useState } from 'react';

type AgentConfig = {
  active: boolean;
  cron: string;
  use: { sales: boolean; costs: boolean; products: boolean; supplier: boolean; competitors: boolean; };
  rules: { markup: number; iva: number; roundTo: number; };
  outputs: { reports: boolean; email: boolean; erpIn: boolean; erpOut: boolean; };
};

type Run = { ts: number; status: string; items: number; note?: string };

const defaults: AgentConfig = {
  active: true,
  cron: '0 3 * * *',
  use: { sales:true, costs:true, products:true, supplier:true, competitors:true },
  rules: { markup:0.70, iva:0.21, roundTo:100 },
  outputs: { reports:true, email:false, erpIn:false, erpOut:false }
};

export default function Agents() {
  const [cfg, setCfg] = useState<AgentConfig>(defaults);
  const [runs, setRuns] = useState<Run[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/agents/config/get'); const j = await r.json();
      if (r.ok && j.config) setCfg(j.config);
      const r2 = await fetch('/api/agents/runs/list'); const j2 = await r2.json();
      if (r2.ok) setRuns(j2.runs || []);
    })();
  }, []);

  async function save() {
    const r = await fetch('/api/agents/config/save', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(cfg) });
    const j = await r.json();
    setMsg(r.ok ? 'Configuración guardada' : (j.error || 'Error'));
  }

  async function runNow() {
    setMsg('Ejecutando...');
    const r = await fetch('/api/agent/run', { method:'POST' });
    const j = await r.json();
    setMsg(r.ok ? `Run OK (${j.items} ítems)` : (j.error || 'Error'));
    const r2 = await fetch('/api/agents/runs/list'); const j2 = await r2.json();
    if (r2.ok) setRuns(j2.runs || []);
  }

  return (
    <div style={{ display:'grid', gap:16 }}>
      <h1>Centro de Gestión del Agente de Pricing</h1>
      {msg && <p style={{ color:'#b3e6ff' }}>{msg}</p>}

      <section style={{ display:'grid', gap:8, maxWidth:640 }}>
        <label><input type="checkbox" checked={cfg.active} onChange={e=>setCfg({...cfg, active:e.target.checked})}/> Agente activo</label>
        <label>CRON (día/hora): <input style={{ width:200 }} value={cfg.cron} onChange={e=>setCfg({...cfg, cron:e.target.value})} /></label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
          <div>
            <h3>Inputs</h3>
            {Object.entries(cfg.use).map(([k,v])=> (
              <label key={k} style={{ display:'block' }}><input type="checkbox" checked={v} onChange={e=>setCfg({...cfg, use:{...cfg.use, [k]:e.target.checked}})} /> {k}</label>
            ))}
          </div>
          <div>
            <h3>Outputs</h3>
            {Object.entries(cfg.outputs).map(([k,v])=> (
              <label key={k} style={{ display:'block' }}><input type="checkbox" checked={v} onChange={e=>setCfg({...cfg, outputs:{...cfg.outputs, [k]:e.target.checked}})} /> {k}</label>
            ))}
          </div>
        </div>

        <h3>Reglas</h3>
        <div style={{ display:'flex', gap:12 }}>
          <label>Markup <input type="number" step="0.01" value={cfg.rules.markup} onChange={e=>setCfg({...cfg, rules:{...cfg.rules, markup:Number(e.target.value)}})} /></label>
          <label>IVA <input type="number" step="0.01" value={cfg.rules.iva} onChange={e=>setCfg({...cfg, rules:{...cfg.rules, iva:Number(e.target.value)}})} /></label>
          <label>Redondeo <input type="number" value={cfg.rules.roundTo} onChange={e=>setCfg({...cfg, rules:{...cfg.rules, roundTo:Number(e.target.value)}})} /></label>
        </div>

        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <button onClick={save}>Guardar configuración</button>
          <button onClick={runNow}>Run now</button>
        </div>
      </section>

      <section>
        <h3>Historial de runs</h3>
        <div style={{ overflow:'auto', border:'1px solid #2d215c' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Fecha','Estado','Items','Nota'].map(h => <th key={h} style={{ textAlign:'left', padding:8, borderBottom:'1px solid #2d215c' }}>{h}</th>)}</tr></thead>
            <tbody>
              {runs.map((r,i)=> (
                <tr key={i}>
                  <td style={{ padding:8 }}>{new Date(r.ts).toLocaleString()}</td>
                  <td style={{ padding:8 }}>{r.status}</td>
                  <td style={{ padding:8 }}>{r.items}</td>
                  <td style={{ padding:8 }}>{r.note || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color:'#a7a1c2', marginTop:8 }}>Configura la <b>Vercel Cron</b> para llamar <code>POST /api/agent/run</code> con la periodicidad definida.</p>
      </section>
    </div>
  );
}


