"use client";
import { BrandLogo } from "./BrandLogo";
export function Topbar() {
  const date = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="opacity-90 hidden sm:block"><BrandLogo size="sm" /></div>
        <h1 className="text-xl font-semibold text-[#2b2665]">Pricila · Centro de Gestión de Agentes IA para Pricing</h1>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-sm text-gray-600">{date}</span>
        <button className="bg-[#4f46e5] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#3c38c2]">Actualizar</button>
        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[#4f46e5]">R</div>
      </div>
    </header>
  );
}



