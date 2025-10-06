export function AgentStatusCard({ config }: { config: any }) {
  if (!config) return <div className="bg-white rounded-xl p-5 text-gray-500">Sin configuración</div>;
  const selectedDays = (config.schedule?.days || []).join(" · ");
  const formats = config.report?.formats ? Object.entries(config.report.formats).filter(([,v])=>v).map(([k])=>k.toUpperCase()).join(" · ") : "—";
  const badge = (ok:boolean, txt:string) => (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${ok? 'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>{txt}</span>
  );
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold mb-3 text-[#2b2665]">Estado del Agente</h3>
      <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">{badge(!!config.active, config.active? 'Activo':'Inactivo')}<span>· Modo: {config.simulation ? 'Simulación' : 'Producción'}</span></div>
          <div>⏰ Ventana: <b>{config.schedule?.from || '—'}–{config.schedule?.to || '—'}</b> · {selectedDays || '—'}</div>
          <div>🗓 Cron programado: {config.cron || 'No definido'}</div>
        </div>
        <div className="space-y-2">
          <div>📥 Inputs: <b>{Object.entries(config.use || {}).filter(([_,v])=>v).map(([k])=>k).join(", ") || 'Ninguno'}</b></div>
          <div>📤 Outputs: <b>{Object.entries(config.outputs || {}).filter(([_,v])=>v).map(([k])=>k).join(", ") || 'Ninguno'}</b></div>
          <div>📧 Reportes: {config.report?.email || '—'} · {formats}</div>
          <div>⚙️ Reglas: IVA {config.rules?.iva ?? '—'}% · Markup {config.rules?.markup ?? '—'}% · Rnd {config.rules?.roundTo ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}



