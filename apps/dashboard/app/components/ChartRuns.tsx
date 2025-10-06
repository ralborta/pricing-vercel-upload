"use client";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, defs, linearGradient, stop } from "recharts";

export function ChartRuns({ data }: { data: any[] }) {
  const chartData = data.map(r => ({
    date: new Date(r.ts).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
    items: r.items || 0,
  }));
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold mb-3 text-[#2b2665]">Ejecuciones recientes</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="runsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={{ stroke:'#e2e8f0' }} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={{ stroke:'#e2e8f0' }} />
          <Tooltip contentStyle={{ borderRadius:12, borderColor:'#e2e8f0' }} />
          <Area type="monotone" dataKey="items" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#runsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}



