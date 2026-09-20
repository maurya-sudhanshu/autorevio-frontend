import { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { LayoutDashboard, Users, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const cookieStr = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  try {
    const apiUrl = process.env.API_URL || "https://ai.storybeans.in";
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { cookie: cookieStr },
      cache: "no-store"
    });
    if (!res.ok) {
      redirect("/dashboard");
    }
    const data = await res.json();
    if (data.user?.role !== "admin") {
      redirect("/dashboard");
    }
  } catch (e) {
    // If backend is down during build, just proceed or redirect
    console.error("Failed to verify admin status", e);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <Logo size="md" href="/" />
          <div className="text-xs font-semibold text-purple-600 mt-1 uppercase tracking-wider">Admin Panel</div>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
