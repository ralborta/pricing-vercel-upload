export function toCSV(rows: any[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map(h => String(r[h] ?? "")).join(","));
  return lines.join("\n");
}



