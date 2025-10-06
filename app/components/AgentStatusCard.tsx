export function AgentStatusCard({ config }: { config: any }) {
  if (!config) return <div className="bg-white rounded-xl p-5 text-gray-500">Sin configuración</div>;
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold mb-2 text-[#2b2665]">Estado del Agente</h3>
      <div className="text-sm text-gray-700 space-y-1">
        <p>🟢 Activo: {config.active ? "Sí" : "No"}</p>
        <p>⏰ Cron programado: {config.cron || "No definido"}</p>
        <p>📥 Inputs: {Object.entries(config.use || {}).filter(([_,v])=>v).map(([k])=>k).join(", ") || "Ninguno"}</p>
        <p>📤 Outputs: {Object.entries(config.outputs || {}).filter(([_,v])=>v).map(([k])=>k).join(", ") || "Ninguno"}</p>
      </div>
    </div>
  );
}


