export function MetricCard({ title, value, color, icon }: { title: string; value: any; color: "blue" | "violet" | "green" | "red"; icon?: React.ReactNode }) {
  const labelColors: any = {
    blue: "text-blue-700 bg-blue-50",
    violet: "text-violet-700 bg-violet-50",
    green: "text-green-700 bg-green-50",
    red: "text-red-700 bg-red-50",
  };
  const ringColors: any = {
    blue: "ring-blue-100",
    violet: "ring-violet-100",
    green: "ring-green-100",
    red: "ring-red-100",
  };
  return (
    <div className={`rounded-xl p-5 border border-gray-100 bg-white shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className={`px-2 py-0.5 rounded-md text-xs font-medium ${labelColors[color]}`}>{title}</div>
        {icon && <div className={`h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center ring-1 ${ringColors[color]}`}>{icon}</div>}
      </div>
      <div className="mt-2 text-3xl font-semibold text-[#1e1e2d]">{value}</div>
    </div>
  );
}



