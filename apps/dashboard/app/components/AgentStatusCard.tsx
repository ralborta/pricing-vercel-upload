export function AgentStatusCard({ config }: { config: any }) {
  if (!config) return <div className="bg-white rounded-xl p-5 text-gray-500">Sin configuración</div>;
  const selectedDays = (config.schedule?.days || []).join(" · ");
  const formats = config.report?.formats ? Object.entries(config.report.formats).filter(([,v])=>v).map(([k])=>k.toUpperCase()).join(" · ") : "—";
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold mb-2 text-[#2b2665]">Estado del Agente</h3>
      <div className="text-sm text-gray-700 grid md:grid-cols-2 gap-2">
        <p>🟢 Activo: {config.active ? "Sí" : "No"}</p>
        <p>🧪 Modo: {config.simulation ? "Simulación" : "Producción"}</p>
        <p>⏰ Ventana: {config.schedule?.from || "—"}–{config.schedule?.to || "—"} · {selectedDays || "—"}</p>
        <p>🗓 Cron programado: {config.cron || "No definido"}</p>
        <p>📥 Inputs: {Object.entries(config.use || {}).filter(([_,v])=>v).map(([k])=>k).join(", ") || "Ninguno"}</p>
        <p>📤 Outputs: {Object.entries(config.outputs || {}).filter(([_,v])=>v).map(([k])=>k).join(", ") || "Ninguno"}</p>
        <p>📧 Reportes: {config.report?.email || "—"} · {formats}</p>
        <p>⚙️ Reglas: IVA {config.rules?.iva ?? "—"}% · Markup {config.rules?.markup ?? "—"}% · Rnd {config.rules?.roundTo ?? "—"}</p>
      </div>
    </div>
  );
}



