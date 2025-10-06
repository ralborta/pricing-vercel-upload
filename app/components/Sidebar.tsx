"use client";
import { Home, Settings, Activity, Database } from "lucide-react";

export function Sidebar() {
  const links = [
    { href: "/agents", label: "Dashboard", icon: <Home size={18}/> },
    { href: "/wizard", label: "Wizard", icon: <Database size={18}/> },
    { href: "/analytics", label: "Analytics", icon: <Activity size={18}/> },
    { href: "/settings", label: "Configuración", icon: <Settings size={18}/> },
  ];
  return (
    <aside className="w-64 bg-gradient-to-b from-[#3b1e9d] to-[#2e167c] text-white flex flex-col">
      <div className="px-5 py-6 text-2xl font-bold tracking-tight border-b border-white/10">
        Pricing Center
      </div>
      <nav className="flex-1 py-4">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="flex items-center gap-3 px-6 py-3 text-sm hover:bg-white/10 transition">
            {l.icon}<span>{l.label}</span>
          </a>
        ))}
      </nav>
      <div className="text-xs text-white/60 px-6 py-4 border-t border-white/10">
        v1.0 · Empliados.net
      </div>
    </aside>
  );
}


