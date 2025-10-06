'use client';
import { useEffect, useState } from 'react';
import { MetricCard } from "../components/MetricCard";
import { AgentStatusCard } from "../components/AgentStatusCard";
import { ChartRuns } from "../components/ChartRuns";

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
      setConfig(j2.config);
    })();
  }, []);

  const totalRuns = runs.length;
  const avgItems = runs.length ? Math.round(runs.reduce((a,r)=>a+r.items,0)/runs.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total de Ejecuciones" value={totalRuns} color="blue" />
        <MetricCard title="Items Promedio por Run" value={avgItems} color="violet" />
        <MetricCard title="Último Estado" value={runs[0]?.status || '—'} color={runs[0]?.status === 'ok' ? 'green' : 'red'} />
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
    </div>
  );
}


