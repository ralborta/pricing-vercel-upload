"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function ChartRuns({ data }: { data: any[] }) {
  const chartData = data.map(r => ({
    date: new Date(r.ts).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
    items: r.items || 0,
  }));
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold mb-3 text-[#2b2665]">Ejecuciones recientes</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="date" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />
          <Line type="monotone" dataKey="items" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


