"use client";
import { useEffect, useState } from "react";
import { MetricCard } from "./components/MetricCard";
import { ChartRuns } from "./components/ChartRuns";
import { ChartDonut } from "./components/ChartDonut";

type KPI = { name: string; value: string };

export default function Home() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [donut, setDonut] = useState<Array<{ name: string; value: number }>>([
    { name: "Optimo", value: 72 },
    { name: "Advertencia", value: 20 },
    { name: "Critico", value: 8 },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/analytics/overview");
        const j = await r.json();
        if (r.ok){ setKpis(j.kpis || []); setDonut(j.distribution?.length ? j.distribution : donut); }
      } catch {}
      try {
        const r2 = await fetch("/api/agents/runs/list");
        const j2 = await r2.json();
        if (r2.ok) setRuns(j2.runs || []);
      } catch {}
    })();
  }, []);

  const totalProducts = kpis.find(k=>k.name==="SKUs")?.value || "—";
  const avgMargin = kpis.find(k=>k.name==="Margen Promedio")?.value || "—";
  const successRate = kpis.find(k=>k.name==="Tasa de Éxito")?.value || "—";
  const totalTime = kpis.find(k=>k.name==="Tiempo Total")?.value || "—";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-[#2b2665]">Dashboard · Centro de Gestión de Agentes IA</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total de Productos" value={totalProducts} color="blue" />
        <MetricCard title="Margen Promedio" value={avgMargin} color="green" />
        <MetricCard title="Tasa de Éxito" value={successRate} color="violet" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Simulaciones" value={String(runs.length)} color="red" />
        <MetricCard title="Tiempo Total" value={totalTime} color="blue" />
        <MetricCard title="Productos Críticos" value={"89"} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartRuns data={runs.slice(0, 10)} />
        <ChartDonut data={donut} />
      </div>
    </div>
  );
}


