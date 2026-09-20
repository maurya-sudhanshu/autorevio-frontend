"use client";

import { useEffect, useState } from "react";
import { Star, Filter, MessageSquare, CornerDownRight, Loader2, Send } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  content?: string;
  status: "public" | "private" | "pending" | "ignored";
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  aiGenerated: boolean;
  reply?: string;
  // Admin-only fields returned
  businessName?: string;
  branchName?: string;
};

type Business = { id: string; name: string };

export default function ReviewsPage() {
  const [userRole, setUserRole] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  
  // Reply Form States
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [reviewId: string]: string }>({});

  useEffect(() => {
    checkUserRole();
  }, []);

  async function checkUserRole() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUserRole(data.user.role);
        if (data.user.role === "admin") {
          loadAdminReviews(filter);
        } else {
          loadBusinesses();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (userRole === "admin") {
      loadAdminReviews(filter);
    } else if (selectedBusiness) {
      loadReviews();
    }
  }, [selectedBusiness, filter, userRole]);

  async function loadAdminReviews(currentFilter: string) {
    setLoading(true);
    try {
      const statusParam = currentFilter !== "all" ? `?status=${currentFilter}` : "";
      const res = await fetch(`/api/reviews${statusParam}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadBusinesses() {
    try {
      const res = await fetch("/api/businesses");
      const data = await res.json();
      const list: Business[] = data.businesses || [];
      setBusinesses(list);
      if (list.length > 0) setSelectedBusiness(list[0].id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function loadReviews() {
    if (!selectedBusiness) return;
    setLoading(true);
    try {
      const url = `/api/reviews?businessId=${selectedBusiness}${
        filter !== "all" ? `&status=${filter}` : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyTexts[reviewId];
    if (!text || !text.trim()) return;

    setSubmittingReplyId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: text.trim() }),
      });

      if (res.ok) {
        // Update local state
        setReviews(
          reviews.map((r) => (r.id === reviewId ? { ...r, reply: text.trim() } : r))
        );
        // Clear input
        setReplyTexts({ ...replyTexts, [reviewId]: "" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit reply");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting reply");
    } finally {
      setSubmittingReplyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {userRole === "admin" ? "All Platform Reviews" : "Reviews"}
        </h1>
        <p className="text-slate-600 mt-1">
          {userRole === "admin"
            ? "View and reply to customer feedback from all registered businesses on the platform."
            : "View and reply to reviews submitted through your QR codes."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {userRole !== "admin" && businesses.length > 1 && (
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-2 bg-white border border-slate-200 rounded-lg p-1">
          {(["all", "public", "private"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
          <p className="text-slate-600">
            {userRole === "admin"
              ? "No reviews have been submitted on the platform yet."
              : "Share your QR codes with customers to start collecting reviews."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {review.customerName?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-slate-900">
                      {review.customerName || "Anonymous"}
                    </span>
                    {review.customerEmail && (
                      <span className="text-xs text-slate-500">
                        {review.customerEmail}
                      </span>
                    )}

                    {/* Admin Business Details */}
                    {userRole === "admin" && (review.businessName || review.branchName) && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {review.businessName} ({review.branchName})
                      </span>
                    )}

                    <div className="flex ml-auto gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          review.status === "public"
                            ? "bg-green-50 text-green-700"
                            : review.status === "private"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {review.status}
                      </span>
                      {review.aiGenerated && (
                        <span className="text-xs px-2 py-1 rounded font-semibold bg-purple-50 text-purple-700">
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.content && (
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      {review.content}
                    </p>
                  )}

                  {/* Reply Section */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {review.reply ? (
                      <div className="flex items-start gap-2 bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100/50">
                        <CornerDownRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-indigo-950 mb-0.5">Response:</div>
                          <p className="text-sm text-indigo-900 leading-relaxed">{review.reply}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 max-w-2xl">
                        <input
                          type="text"
                          value={replyTexts[review.id] || ""}
                          onChange={(e) =>
                            setReplyTexts({ ...replyTexts, [review.id]: e.target.value })
                          }
                          placeholder="Type a response to this review..."
                          className="flex-1 px-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition"
                        />
                        <button
                          onClick={() => handleReplySubmit(review.id)}
                          disabled={submittingReplyId === review.id || !(replyTexts[review.id] || "").trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {submittingReplyId === review.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
