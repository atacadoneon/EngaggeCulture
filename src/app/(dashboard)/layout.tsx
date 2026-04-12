import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function LayoutDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <div className="ml-56">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
