"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  Sparkles,
  LayoutDashboard,
  Building2,
  Star,
  QrCode,
  BarChart3,
  LogOut,
  Menu,
  X,
  Users,
  Bot,
  HelpCircle,
  CheckCircle2,
  Layers,
  Settings2,
  MessageSquare,
} from "lucide-react";

import { Logo } from "@/components/Logo";

type User = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "owner" | "agent";
};

function SidebarNav({ navItems, user, pathname, setSidebarOpen }: any) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  return (
    <nav className="p-4 space-y-1">
      {navItems
        .filter((item: any) => item.roles.includes(user.role))
        .map((item: any) => {
          let active = false;
          if (item.href.includes("?tab=")) {
            const urlTab = item.href.split("?tab=")[1];
            active = pathname.startsWith(item.href.split("?")[0]) && tabParam === urlTab;
          } else if (item.href === "/dashboard/admin-users") {
            active = pathname === item.href && !tabParam;
          } else {
            active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          router.push("/auth/login");
        }
      })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true, roles: ["owner", "admin", "agent"] },
    { href: "/dashboard/owners", icon: Users, label: "My Owners", roles: ["agent"] },
    { href: "/dashboard/businesses", icon: Building2, label: "Businesses", roles: ["owner", "agent"] },
    { href: "/dashboard/branches", icon: QrCode, label: "Branches & QR", roles: ["owner", "agent"] },
    { href: "/dashboard/reviews", icon: Star, label: "Reviews", roles: ["owner", "agent"] },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", roles: ["owner", "agent"] },
    { href: "/dashboard/admin-users", icon: Users, label: "Users & Businesses", exact: true, roles: ["admin"] },
    { href: "/dashboard/admin-users?tab=utr", icon: CheckCircle2, label: "UTR Verifications", roles: ["admin"] },
    { href: "/dashboard/admin-users?tab=plans", icon: Layers, label: "Manage Plans", roles: ["admin"] },
    { href: "/dashboard/admin-users?tab=settings", icon: Settings2, label: "Payment QR Settings", roles: ["admin"] },
    { href: "/dashboard/admin-users?tab=support", icon: MessageSquare, label: "Support Messages", roles: ["admin"] },
    { href: "/dashboard/agents", icon: Users, label: "Team & Agents", roles: ["admin"] },
    { href: "/dashboard/ai-models", icon: Bot, label: "AI Models", roles: ["admin"] },
    { href: "/dashboard/pricing", icon: Sparkles, label: "Upgrade Plan", roles: ["owner", "agent"] },
    { href: "/dashboard/support", icon: HelpCircle, label: "Help & Support", roles: ["owner", "agent"] },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <Logo size="md" href="/" />
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <Suspense fallback={<div className="p-4 text-xs text-slate-400">Loading navigation...</div>}>
          <SidebarNav navItems={navItems} user={user} pathname={pathname} setSidebarOpen={setSidebarOpen} />
        </Suspense>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <div className="mb-3 px-3 py-2">
            <div className="text-sm font-semibold text-slate-800 truncate">
              {user.fullName}
            </div>
            <div className="text-xs text-slate-500 truncate mb-1">{user.email}</div>
            <div className="text-xs font-semibold text-blue-600 capitalize">{user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 w-full transition"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" href="/" />
            </div>
          </div>

          {/* User profile section matching the screenshot */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-800 leading-tight">
                {user.fullName}
              </div>
              <div className="text-xs font-semibold text-blue-600 capitalize leading-tight">
                {user.role}
              </div>
            </div>
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center rounded-full font-bold text-sm shadow-sm uppercase">
              {user.fullName[0]}
            </div>
          </div>
        </header>

        {/* Dynamic Page Rendering */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
