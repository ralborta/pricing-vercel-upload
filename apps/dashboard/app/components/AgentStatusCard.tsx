import { Power, Clock, Timer, Download, Upload, Mail, Settings } from "lucide-react";

export function AgentStatusCard({ config }: { config: any }) {
  if (!config) return <div className="bg-white rounded-xl p-5 text-gray-500">Sin configuración</div>;
  const selectedDays = (config.schedule?.days || []).join(" · ");
  const formats = config.report?.formats ? Object.entries(config.report.formats).filter(([,v])=>v).map(([k])=>k.toUpperCase()).join(" · ") : "—";
  const badge = (ok:boolean, txt:string) => (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${ok? 'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700'}`}>{txt}</span>
  );
  const iconStyle = {
    slate: "bg-slate-50 text-slate-600 ring-slate-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    orange: "bg-amber-50 text-amber-600 ring-amber-100",
  } as const;
  const IconPill = ({ children, tone }: { children: React.ReactNode; tone: keyof typeof iconStyle }) => (
    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-md ring-1 ${iconStyle[tone]}`}>{children}</span>
  );
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold mb-3 text-[#2b2665]">Estado del Agente</h3>
      <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconPill tone={config.active? 'green':'slate'}><Power size={14}/></IconPill>
            {badge(!!config.active, config.active? 'Activo':'Inactivo')}
            <span>· Modo: {config.simulation ? 'Simulación' : 'Producción'}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconPill tone="slate"><Clock size={14}/></IconPill>
            <span>Ventana: <b>{config.schedule?.from || '—'}–{config.schedule?.to || '—'}</b> · {selectedDays || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconPill tone="violet"><Timer size={14}/></IconPill>
            <span>Cron programado: {config.cron || 'No definido'}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><IconPill tone="blue"><Download size={14}/></IconPill><span>Inputs: <b>{Object.entries(config.use || {}).filter(([_,v])=>v).map(([k])=>k).join(", ") || 'Ninguno'}</b></span></div>
          <div className="flex items-center gap-2"><IconPill tone="blue"><Upload size={14}/></IconPill><span>Outputs: <b>{Object.entries(config.outputs || {}).filter(([_,v])=>v).map(([k])=>k).join(", ") || 'Ninguno'}</b></span></div>
          <div className="flex items-center gap-2"><IconPill tone="orange"><Mail size={14}/></IconPill><span>Reportes: {config.report?.email || '—'} · {formats}</span></div>
          <div className="flex items-center gap-2"><IconPill tone="slate"><Settings size={14}/></IconPill><span>Reglas: IVA {config.rules?.iva ?? '—'}% · Markup {config.rules?.markup ?? '—'}% · Rnd {config.rules?.roundTo ?? '—'}</span></div>
        </div>
      </div>
    </div>
  );
}



