'use client';
import { useEffect, useState } from 'react';
type KPI = { name: string; value: string };
type Row = { sku: string; our_price: number; competitor_avg: number; delta_pct: number };

export default function Analytics() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [top, setTop] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true);
    const res = await fetch('/api/analytics/overview');
    const json = await res.json();
    setLoading(false);
    if (res.ok) { setKpis(json.kpis || []); setTop(json.top || []); } else alert(json.error || 'error');
  })(); }, []);

  return (
    <div style={{ display:'grid', gap:24 }}>
      <h1>Analytics</h1>
      {loading ? <p>Cargando...</p> : (<>
        <section style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {kpis.map(k => (
            <div key={k.name} style={{ background:'#1c1147', padding:16, borderRadius:12 }}>
              <div style={{ color:'#a7a1c2', fontSize:12 }}>{k.name}</div>
              <div style={{ fontWeight:700, fontSize:22 }}>{k.value}</div>
            </div>
          ))}
        </section>
        <section>
          <h3>Top 10 vs Competidores</h3>
          <div style={{ overflow:'auto', border:'1px solid #2d215c' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['SKU','Precio nuestro','Promedio competidores','Δ%'].map(h =>
                <th key={h} style={{ textAlign:'left', padding:8, borderBottom:'1px solid #2d215c' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {top.map((r,i)=>(
                  <tr key={i}>
                    <td style={{ padding:8 }}>{r.sku}</td>
                    <td style={{ padding:8 }}>{r.our_price.toFixed(0)}</td>
                    <td style={{ padding:8 }}>{r.competitor_avg.toFixed(0)}</td>
                    <td style={{ padding:8, fontWeight:600 }}>{(r.delta_pct*100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>)}
    </div>
  );
}



