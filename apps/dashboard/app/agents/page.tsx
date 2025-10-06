'use client';
import { useEffect, useState } from 'react';
import { MetricCard } from "../components/MetricCard";
import { AgentStatusCard } from "../components/AgentStatusCard";
import { ChartRuns } from "../components/ChartRuns";
import { Clock, Network, Bot } from "lucide-react";

const DEMO_CONFIG:any = {
  active: true,
  simulation: false,
  schedule: { days: ["Lun","Mar","Mie","Jue","Vie"], from: "09:00", to: "18:00" },
  use: { sales:true, costs:true, products:true, supplier:true, competitors:true },
  outputs: { reports:true, email:true, erpIn:false, erpOut:false },
  rules: { iva:21, markup:70, roundTo:100 }
};

export default function AgentsDashboard() {
  const [runs, setRuns] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const r1 = await fetch('/api/agents/runs/list');
      const j1 = await r1.json();
      setRuns(j1.runs || []);
      const r2 = await fetch('/api/agents/config/get');
      const j2 = await r2.json();
      setConfig(j2.config || DEMO_CONFIG);
    })();
  }, []);

  const totalRuns = runs.length;
  const avgItems = runs.length ? Math.round(runs.reduce((a,r)=>a+r.items,0)/runs.length) : 0;
  const activeAgents = 1; // demo: un agente (Pricila)
  const activeConnections = Object.values(config?.outputs || {}).filter(Boolean).length + Object.values(config?.use || {}).filter(Boolean).length;
  const nextRun = (() => {
    if (!config?.schedule) return '—';
    const days = config.schedule.days || [];
    if (!days.length) return '—';
    const map:any = { 'Dom':0,'Lun':1,'Mar':2,'Mie':3,'Jue':4,'Vie':5,'Sáb':6 };
    const now = new Date();
    const today = now.getDay();
    const ordered = days.map((d:string)=>map[d] ?? -1).filter((n:number)=>n>=0).sort((a:number,b:number)=>a-b);
    let targetDay = ordered.find((d:number)=> d>=today) ?? ordered[0];
    const diff = (targetDay - today + 7) % 7;
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate()+diff);
    const [hh,mm] = String(config.schedule.from || '09:00').split(':').map((v:string)=>Number(v));
    base.setHours(hh, mm, 0, 0);
    return base.toLocaleString('es-AR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Agentes Activos" value={activeAgents} color="green" icon={<Bot size={16} className="text-green-600"/>} />
        <MetricCard title="Conexiones Activas" value={activeConnections} color="blue" icon={<Network size={16} className="text-blue-600"/>} />
        <MetricCard title="Próximo Proceso" value={nextRun} color="violet" icon={<Clock size={16} className="text-violet-600"/>} />
        <MetricCard title="Ejecuciones Totales" value={totalRuns} color="blue" />
      </div>

      <AgentStatusCard config={config} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartRuns data={runs.slice(0, 10)} />
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold mb-2 text-[#2b2665]">Integraciones activas</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {config?.outputs?.reports && <li>📊 Genera reportes automáticos</li>}
            {config?.outputs?.email && <li>✉️ Envío de informes por correo</li>}
            {config?.outputs?.erpIn && <li>🔄 Recibe datos desde ERP</li>}
            {config?.outputs?.erpOut && <li>📦 Actualiza precios en ERP</li>}
          </ul>
        </div>
      </div>
      {runs.length>0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold mb-3 text-[#2b2665]">Actividad reciente del agente</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            {runs.slice(0,8).map((r:any,i:number)=> (
              <li key={i} className="flex items-center justify-between">
                <span>{new Date(r.ts).toLocaleString('es-AR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                <span className={r.status==='ok'? 'text-green-600':'text-red-600'}>{r.status}</span>
                <span>{r.items} items</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}


