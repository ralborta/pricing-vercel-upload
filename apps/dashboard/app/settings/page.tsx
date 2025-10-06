"use client";
import { useEffect, useMemo, useState } from "react";

type Formats = { excel: boolean; pdf: boolean; csv: boolean };

type ConfigShape = {
  active: boolean;
  simulation: boolean;
  cron?: string;
  use: { sales: boolean; costs: boolean; products: boolean; supplier: boolean; competitors: boolean };
  rules: {
    iva: number;
    markup: number;
    roundTo: number;
    supplierDiscount: number;
    markups: { mayorista: number; directa: number; distribucion: number };
    equivalencia: { factorBase: number; capacidad80Ah: number };
    promotionsEnabled: boolean;
    commissions: { mayorista: number; directa: number; distribucion: number };
  };
  schedule: { days: string[]; from: string; to: string };
  report: { email: string; formats: Formats; frequency: "Diario" | "Semanal" | "Mensual" };
  outputs: { reports: boolean; email: boolean; erpIn: boolean; erpOut: boolean };
  connection?: { agentName?: string };
};

const DEFAULT_CFG: ConfigShape = {
  active: true,
  simulation: false,
  cron: "",
  use: { sales: true, costs: true, products: true, supplier: true, competitors: true },
  rules: {
    iva: 21,
    markup: 70,
    roundTo: 100,
    supplierDiscount: 0,
    markups: { mayorista: 10, directa: 25, distribucion: 20 },
    equivalencia: { factorBase: 10, capacidad80Ah: 35 },
    promotionsEnabled: false,
    commissions: { mayorista: 5, directa: 8, distribucion: 6 },
  },
  schedule: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], from: "09:00", to: "18:00" },
  report: { email: "pricing@acubat.com", formats: { excel: true, pdf: false, csv: false }, frequency: "Diario" },
  outputs: { reports: true, email: true, erpIn: false, erpOut: false },
  connection: { agentName: "Pricila" },
};

export default function Settings() {
  const [cfg, setCfg] = useState<ConfigShape>(DEFAULT_CFG);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/agents/config/get", { cache: "no-store" });
        const j = await r.json();
        if (r.ok && j?.config) setCfg({ ...DEFAULT_CFG, ...j.config });
      } catch {}
    })();
  }, []);

  const update = (path: string, value: any) => {
    setCfg((prev) => {
      const clone: any = structuredClone(prev);
      const parts = path.split(".");
      let ref = clone;
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
      ref[parts[parts.length - 1]] = value;
      return clone as ConfigShape;
    });
  };

  const save = async () => {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/agents/config/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(json.error || "Error");
    setMsg("Configuración guardada");
  };

  const runAgent = async () => {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/agent/run", { method: "POST" });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(json.error || "Error al ejecutar");
    setMsg(`Agente ejecutado: ${json.items || 0} items`);
  };

  const DayButton = ({ d }: { d: string }) => (
    <button
      type="button"
      className={`px-2 py-1 rounded-md text-sm border ${cfg.schedule.days.includes(d) ? "bg-[#2b2665] text-white border-[#2b2665]" : "bg-white text-gray-700 border-gray-300"}`}
      onClick={() => {
        const set = new Set(cfg.schedule.days);
        set.has(d) ? set.delete(d) : set.add(d);
        update("schedule.days", Array.from(set));
      }}
    >
      {d}
    </button>
  );

  const formatsSelected = useMemo(() => Object.entries(cfg.report.formats).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(" · "), [cfg.report.formats]);

  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-semibold text-[#2b2665]">Configuración del Sistema</h1>

      <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2b2665]">Modo de Operación</h2>
            <p className="text-sm text-gray-600">Modo producción: Los cambios se aplican inmediatamente</p>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <span>Simulación</span>
            <input type="checkbox" checked={cfg.simulation} onChange={(e) => update("simulation", e.target.checked)} />
            <span className={`px-3 py-1 rounded-md ${cfg.simulation ? "bg-gray-100 text-gray-700" : "bg-green-50 text-green-700"}`}>{cfg.simulation ? "Simulación" : "Producción"}</span>
          </label>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-5">
          <h2 className="text-lg font-semibold text-[#2b2665]">Variables del Sistema</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm text-gray-700">Porcentaje de IVA
              <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="number" value={cfg.rules.iva}
                     onChange={(e)=>update("rules.iva", Number(e.target.value))} />
            </label>
            <label className="text-sm text-gray-700">Markup base (%)
              <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="number" value={cfg.rules.markup}
                     onChange={(e)=>update("rules.markup", Number(e.target.value))} />
            </label>
            <label className="text-sm text-gray-700">Redondeo a múltiplos de
              <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="number" value={cfg.rules.roundTo}
                     onChange={(e)=>update("rules.roundTo", Number(e.target.value))} />
            </label>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-[#2b2665] mb-3">Descuento de Proveedor</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <label className="text-sm text-gray-700">Porcentaje de Descuento
                <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="number" value={cfg.rules.supplierDiscount}
                       onChange={(e)=>update("rules.supplierDiscount", Number(e.target.value))} />
              </label>
              <div className="md:col-span-3 text-[12px] text-gray-600">
                Precio Final = (Precio Lista - Descuento) × Markup × IVA
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div>
              <h3 className="font-medium text-[#2b2665] mb-2">Markups por Canal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["mayorista","directa","distribucion"] as const).map((c)=> (
                  <label key={c} className="text-sm text-gray-700 capitalize">{c}
                    <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="number" value={(cfg.rules.markups as any)[c]}
                           onChange={(e)=>update(`rules.markups.${c}`, Number(e.target.value))} />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-[#2b2665] mb-2">Factores de Equivalencia Varta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm text-gray-700">Factor Base
                  <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="number" value={cfg.rules.equivalencia.factorBase}
                         onChange={(e)=>update("rules.equivalencia.factorBase", Number(e.target.value))} />
                </label>
                <label className="text-sm text-gray-700">Capacidad ≥80Ah
                  <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="number" value={cfg.rules.equivalencia.capacidad80Ah}
                         onChange={(e)=>update("rules.equivalencia.capacidad80Ah", Number(e.target.value))} />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={cfg.rules.promotionsEnabled} onChange={(e)=>update("rules.promotionsEnabled", e.target.checked)} />
                <span>Activar sistema de promociones</span>
              </label>
            </div>

            <div>
              <h3 className="font-medium text-[#2b2665] mb-2">Comisiones por Canal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["mayorista","directa","distribucion"] as const).map((c)=> (
                  <label key={c} className="text-sm text-gray-700 capitalize">{c}
                    <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="number" value={(cfg.rules.commissions as any)[c]}
                           onChange={(e)=>update(`rules.commissions.${c}`, Number(e.target.value))} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-4">
        <h2 className="text-lg font-semibold text-[#2b2665]">Reporte de Pricing y Rentabilidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-gray-700">Enviar reportes a
            <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="email" value={cfg.report.email}
                   onChange={(e)=>update("report.email", e.target.value)} />
          </label>
          <label className="text-sm text-gray-700">Frecuencia de reportes
            <select className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" value={cfg.report.frequency}
                    onChange={(e)=>update("report.frequency", (e.target as HTMLSelectElement).value)}>
              {(["Diario","Semanal","Mensual"] as const).map(f=> <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          {(["excel","pdf","csv"] as const).map((f)=> (
            <label key={f} className="flex items-center gap-2">
              <input type="checkbox" checked={(cfg.report.formats as any)[f]} onChange={(e)=>update(`report.formats.${f}`, e.target.checked)} />
              <span className="uppercase">{f}</span>
            </label>
          ))}
          <span className="ml-auto text-xs text-gray-500">Seleccionados: {formatsSelected || "—"}</span>
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-4">
        <h2 className="text-lg font-semibold text-[#2b2665]">Procesos Automatizados de Pricing</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={runAgent} disabled={busy} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">Calcular Pricing</button>
          <button onClick={()=>setMsg('Análisis de rentabilidad simulado')} disabled={busy} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">Analizar Rentabilidad</button>
          <button onClick={()=>setMsg('Generación de reportes simulada')} disabled={busy} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">Generar Reportes</button>
          <button onClick={()=>setMsg('Sincronización simulada')} disabled={busy} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Sincronizar Precios</button>
          <button onClick={()=>setMsg('Equivalencias actualizadas (demo)')} disabled={busy} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Actualizar Equivalencias</button>
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-4">
        <h2 className="text-lg font-semibold text-[#2b2665]">Conexión y Archivos de Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-sm text-gray-700">Seleccionar Agente
            <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" value={cfg.connection?.agentName || ''} onChange={(e)=>update("connection.agentName", e.target.value)} />
          </label>
          <label className="text-sm text-gray-700">Desde
            <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="time" value={cfg.schedule.from} onChange={(e)=>update("schedule.from", (e.target as HTMLInputElement).value)} />
          </label>
          <label className="text-sm text-gray-700">Hasta
            <input className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300" type="time" value={cfg.schedule.to} onChange={(e)=>update("schedule.to", (e.target as HTMLInputElement).value)} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 items-center text-sm text-gray-700">
          {["Lun","Mar","Mie","Jue","Vie","Sáb","Dom"].map((d)=> <DayButton key={d} d={d} />)}
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl shadow-soft p-5 grid gap-4">
        <h2 className="text-lg font-semibold text-[#2b2665]">Fuentes de datos e Integraciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          {Object.entries(cfg.use).map(([k,v])=> (
            <label key={k} className="flex items-center gap-2 capitalize">
              <input type="checkbox" checked={v} onChange={(e)=>update(`use.${k}`, e.target.checked)} />
              <span>Usar {k}</span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          {Object.entries(cfg.outputs).map(([k,v])=> (
            <label key={k} className="flex items-center gap-2 capitalize">
              <input type="checkbox" checked={v} onChange={(e)=>update(`outputs.${k}`, e.target.checked)} />
              <span>Salida: {k}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button disabled={busy} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={()=>setCfg(DEFAULT_CFG)}>Resetear Configuración</button>
        <button disabled={busy} className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700" onClick={save}>Guardar Configuración</button>
        {msg && <p className="text-[#4f46e5] text-sm">{msg}</p>}
      </div>
    </div>
  );
}


