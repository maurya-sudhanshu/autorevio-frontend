"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  QrCode,
  TrendingUp,
  ArrowRight,
  Plus,
  BarChart3,
  Users,
  ShieldCheck,
  CreditCard,
  Settings,
  Star,
  Loader2,
  Sparkles,
  Bot,
  UserCheck,
  ChevronRight,
  Activity
} from "lucide-react";

type Analytics = {
  totalReviews: number;
  publicReviews: number;
  privateReviews: number;
  averageRating: number;
  businesses: number;
  branches: number;
  recentReviews: Array<{
    id: string;
    rating: number;
    status: string;
    content?: string;
    createdAt: string;
    customerName?: string;
  }>;
};

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

type AdminStats = {
  totalOwners: number;
  totalAgents: number;
  totalAdmins: number;
  pendingVerifications: number;
};

export default function DashboardOverview() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Admin details
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (data.user.role === "admin") {
            fetchAdminStats();
          } else {
            fetchUserAnalytics();
          }
        }
      })
      .catch(console.error);
  }, []);

  const fetchUserAnalytics = () => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchAdminStats = async () => {
    try {
      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      const allUsers = usersData.users || [];

      const totalOwners = allUsers.filter((u: any) => u.role === "owner").length;
      const totalAgents = allUsers.filter((u: any) => u.role === "agent").length;
      const totalAdmins = allUsers.filter((u: any) => u.role === "admin").length;

      // Fetch pending UTR
      const verRes = await fetch("/api/admin/payment-verifications");
      const verData = await verRes.json();
      const allVerifications = verData.verifications || [];
      const pendingVerifications = allVerifications.filter((v: any) => v.status === "pending").length;

      setAdminStats({
        totalOwners,
        totalAgents,
        totalAdmins,
        pendingVerifications
      });
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ================= ADMIN DASHBOARD VIEW =================
  if (user?.role === "admin") {
    const adminCards = [
      {
        label: "Owners (Users)",
        value: adminStats?.totalOwners ?? 0,
        icon: Users,
        gradient: "from-blue-600 via-indigo-600 to-indigo-700",
        link: "/dashboard/admin-users"
      },
      {
        label: "Team Agents",
        value: adminStats?.totalAgents ?? 0,
        icon: ShieldCheck,
        gradient: "from-sky-500 to-blue-600",
        link: "/dashboard/agents"
      },
      {
        label: "Pending UTRs",
        value: adminStats?.pendingVerifications ?? 0,
        icon: CreditCard,
        gradient: "from-amber-500 to-orange-500",
        link: "/dashboard/admin-users?tab=utr",
        badge: adminStats?.pendingVerifications ? `${adminStats.pendingVerifications} Pending` : null
      },
      {
        label: "Administrators",
        value: adminStats?.totalAdmins ?? 0,
        icon: Settings,
        gradient: "from-slate-700 to-slate-900",
        link: "/dashboard/admin-users"
      }
    ];

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Modern Glassmorphic Welcome Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-8 md:p-10 shadow-xl shadow-slate-950/20 border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full filter blur-3xl opacity-60 pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full filter blur-2xl opacity-40 pointer-events-none -ml-16 -mb-16" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Root Administrator Console
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Welcome Back, {user.fullName}!
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Oversee manual subscription transactions, provision active plans, configure machine learning settings, and track agent allocations across the platform.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/admin-users?tab=utr"
                className="bg-white text-indigo-950 hover:bg-slate-50 transition px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-1.5"
              >
                Review UTRs
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((card, i) => (
            <Link
              key={i}
              href={card.link}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 block group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                {card.badge && (
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="text-3xl font-extrabold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                {card.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                {card.label}
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Operations Console */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Quick Operations Panel</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              href="/dashboard/admin-users?tab=utr"
              className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-200 hover:shadow-xs transition duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Approve Transactions</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Review manual payment receipts, activate customer plans, and oversee verifications.</p>
            </Link>
            <Link
              href="/dashboard/ai-models"
              className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 hover:shadow-xs transition duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">AI Configuration</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Adjust platform-wide LLM settings, system prompt parameters, and auto-reply filters.</p>
            </Link>
            <Link
              href="/dashboard/agents"
              className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-sky-200 hover:shadow-xs transition duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Manage Team Agents</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Configure agent accounts, inspect store owner limits, and manage sub-profiles.</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= OWNER/AGENT DASHBOARD VIEW =================
  const stats = [
    {
      label: "Total Reviews",
      value: analytics?.totalReviews ?? 0,
      icon: Star,
      gradient: "from-yellow-400 to-amber-500",
      change: "+24%",
      isPositive: true,
    },
    {
      label: "Public Reviews",
      value: analytics?.publicReviews ?? 0,
      icon: TrendingUp,
      gradient: "from-emerald-400 to-teal-500",
      change: "+18%",
      isPositive: true,
    },
    {
      label: "Private Feedback",
      value: analytics?.privateReviews ?? 0,
      icon: BarChart3,
      gradient: "from-blue-400 to-indigo-500",
      change: "-5%",
      isPositive: false,
    },
    {
      label: "Average Rating",
      value: analytics?.averageRating?.toFixed(1) ?? "0",
      icon: Star,
      gradient: "from-blue-500 to-indigo-600",
      change: "+0.3",
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modern Dynamic Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-8 md:p-10 shadow-xl shadow-blue-950/20 border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full filter blur-3xl opacity-60 pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full filter blur-2xl opacity-40 pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {user?.role === "agent" ? "Relationship Manager Workspace" : "Business Owner Console"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName || "User"}!
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your platform metrics look great! Across your active branches, you have achieved an average customer satisfaction score of <span className="text-yellow-400 font-bold">{analytics?.averageRating?.toFixed(1) ?? "0"}★</span>.
            </p>
          </div>
          <Link
            href="/dashboard/businesses"
            className="bg-white text-blue-950 hover:bg-slate-50 transition px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Add Business
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                stat.isPositive 
                  ? "bg-green-50 text-green-700 border-green-100" 
                  : "bg-red-50 text-red-700 border-red-100"
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 mb-1">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Reviews Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-800">Recent Customer Reviews</h2>
            <Link
              href="/dashboard/reviews"
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 transition"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {analytics?.recentReviews && analytics.recentReviews.length > 0 ? (
              analytics.recentReviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="flex items-start gap-4 p-3.5 rounded-2xl border border-slate-50 hover:bg-slate-50/50 hover:border-slate-100 transition duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    {review.customerName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm text-slate-800">
                        {review.customerName || "Anonymous"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          review.status === "public"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed truncate">
                      {review.content || "No message content submitted."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full space-y-3">
                <Star className="w-12 h-12 text-slate-300" />
                <p className="text-slate-500 text-xs">
                  No reviews received yet. Add a business to start receiving ratings!
                </p>
                <Link
                  href="/dashboard/businesses"
                  className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline text-xs"
                >
                  Add Business <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Stats Column */}
        <div className="space-y-6">
          {/* Active Businesses block */}
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full filter blur-2xl pointer-events-none -mr-8 -mt-8" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Businesses</h3>
                  <span className="text-[10px] text-blue-200">Registered Companies</span>
                </div>
              </div>
              <span className="text-3xl font-extrabold">{analytics?.businesses ?? 0}</span>
            </div>
            <p className="text-blue-200/80 text-xs mb-5 leading-relaxed">
              Verify, edit, or append new business registrations to scale your operations.
            </p>
            <Link
              href="/dashboard/businesses"
              className="inline-flex items-center justify-center w-full bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition gap-1.5"
            >
              Manage Properties
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active QR codes / Branches block */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">QR codes</h3>
                  <span className="text-[10px] text-slate-400">Total active branches</span>
                </div>
              </div>
              <span className="text-3xl font-extrabold text-slate-800">{analytics?.branches ?? 0}</span>
            </div>
            <p className="text-slate-500 text-xs mb-5 leading-relaxed">
              Generate checkout QR codes to map feedback routes and verify transaction details.
            </p>
            <Link
              href="/dashboard/branches"
              className="inline-flex items-center justify-center w-full bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-xs font-bold transition gap-1.5"
            >
              View QR codes
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Average Rating Rating Gauge */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="font-bold text-sm text-amber-900">Average Platform Score</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-amber-900 leading-none">
                {analytics?.averageRating?.toFixed(1) ?? "0"}
              </span>
              <span className="text-xs text-amber-700 font-semibold">/ 5.0 Rating</span>
            </div>
            <div className="flex gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= (analytics?.averageRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Excellent job! Maintain high standards and ensure active AI models continue handling feedback replies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
