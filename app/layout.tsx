export const metadata = { title: 'Agente IA de Pricing — Demo con Upload' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'ui-sans-serif,system-ui', margin: 0, background: '#0b0520', color: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100dvh' }}>
          <aside style={{ padding: 20, borderRight: '1px solid #24174d' }}>
            <h2 style={{ marginTop: 0 }}>Pricing Agent</h2>
            <nav style={{ display: 'grid', gap: 8 }}>
              <a href="/" style={{ color: '#9ae6ff' }}>Subir archivos</a>
              <a href="/wizard" style={{ color: '#9ae6ff' }}>Wizard</a>
              <a href="/analytics" style={{ color: '#9ae6ff' }}>Analytics</a>
              <a href="/agents" style={{ color: '#9ae6ff' }}>Agentes</a>
              <a href="/settings" style={{ color: '#9ae6ff' }}>Configuración</a>
            </nav>
          </aside>
          <main style={{ padding: 24, background: '#140b33' }}>{children}</main>
        </div>
      </body>
    </html>
  );
}


