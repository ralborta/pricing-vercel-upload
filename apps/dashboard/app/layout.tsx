import "./../styles/globals.css";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

export const metadata = { title: "Centro de Gestión de Agentes IA para Pricing" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#f7f8fa] text-[#1e1e2d] font-sans antialiased">
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Topbar />
            <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}


