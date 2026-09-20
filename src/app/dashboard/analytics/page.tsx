"use client";

import { useEffect, useState } from "react";
import {
  Star,
  TrendingUp,
  BarChart3,
  Users,
} from "lucide-react";

type Analytics = {
  totalReviews: number;
  publicReviews: number;
  privateReviews: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  businesses: number;
  branches: number;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const maxRating = analytics
    ? Math.max(...Object.values(analytics.ratingDistribution), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-slate-600 mt-1">
            Track your review performance and insights.
          </p>
        </div>
        <div className="flex gap-2 bg-white border border-slate-200 rounded-lg p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
                days === d
                  ? "bg-purple-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading || !analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">
                {analytics.totalReviews}
              </div>
              <div className="text-sm text-slate-500">Total Reviews</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">
                {analytics.publicReviews}
              </div>
              <div className="text-sm text-slate-500">Public on Google</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">
                {analytics.privateReviews}
              </div>
              <div className="text-sm text-slate-500">Private Feedback</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">
                  {analytics.averageRating.toFixed(1)}
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= analytics.averageRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-500">Avg Rating</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold mb-6">Rating Distribution</h2>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = analytics.ratingDistribution[String(rating)] || 0;
                  const pct = analytics.totalReviews
                    ? (count / analytics.totalReviews) * 100
                    : 0;
                  return (
                    <div key={rating}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <span className="text-sm font-medium w-4">
                          {rating}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 w-12 text-right">
                          {count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold mb-6">Summary</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">
                    Active Businesses
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics.businesses}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">
                    Active QR Branches
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics.branches}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">
                    Public/Private Ratio
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600 font-semibold">
                      {analytics.publicReviews} public
                    </span>
                    <span className="text-slate-400"> vs </span>
                    <span className="text-amber-600 font-semibold">
                      {analytics.privateReviews} private
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mt-4">
                  <div className="text-sm font-semibold text-purple-900 mb-1">
                    💡 Pro tip
                  </div>
                  <p className="text-xs text-purple-800">
                    More reviews mean better local SEO ranking. Share your QR
                    codes at checkout, on receipts, or via email to keep the
                    momentum going!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
