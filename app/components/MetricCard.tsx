export function MetricCard({ title, value, color }: { title: string; value: any; color: "blue" | "violet" | "green" | "red" }) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-xl p-5 border border-gray-100 bg-white shadow-sm`}>
      <div className={`text-sm font-medium mb-1 ${colors[color]}`}>{title}</div>
      <div className="text-3xl font-semibold text-[#1e1e2d]">{value}</div>
    </div>
  );
}


