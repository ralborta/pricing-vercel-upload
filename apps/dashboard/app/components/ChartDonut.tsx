"use client";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

type Slice = { name: string; value: number; color: string };

export function ChartDonut({ data }: { data: Array<{ name: string; value: number }> }) {
  const palette: Record<string,string> = {
    Optimo: "#22c55e",
    Advertencia: "#f59e0b",
    Critico: "#ef4444",
  };
  const rows: Slice[] = data.map(d => ({ ...d, color: palette[d.name] || "#4f46e5" }));
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold mb-3 text-[#2b2665]">Distribución de Márgenes</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
            {rows.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


