"use client";
import { Home, Settings, Activity, Database, Bot } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function Sidebar() {
  const links = [
    { href: "/", label: "Dashboard", icon: <Home size={18}/> },
    { href: "/agents", label: "Agente", icon: <Bot size={18}/> },
    { href: "/wizard", label: "Wizard", icon: <Database size={18}/> },
    { href: "/analytics", label: "Analytics", icon: <Activity size={18}/> },
    { href: "/settings", label: "Configuración", icon: <Settings size={18}/> },
  ];
  const year = new Date().getFullYear();
  return (
    <aside className="w-64 bg-gradient-to-b from-[#3b1e9d] to-[#2e167c] text-white flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <BrandLogo size="md" />
        <div className="text-xs text-white/80 mt-1 flex items-center gap-1"><Bot size={14}/> Pricila · Agente IA de Pricing</div>
      </div>
      <nav className="flex-1 py-4">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="flex items-center gap-3 px-6 py-3 text-sm hover:bg-white/10 transition">
            {l.icon}<span>{l.label}</span>
          </a>
        ))}
      </nav>
      <div className="text-[11px] text-white/60 px-6 py-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span>v2.1.9</span>
          <span className="px-2 py-[2px] rounded-full bg-white/10 text-white/80">by Empliados</span>
        </div>
        <div className="mt-1">© {year} Empliados. Todos los derechos reservados.</div>
      </div>
    </aside>
  );
}



