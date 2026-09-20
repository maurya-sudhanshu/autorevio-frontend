"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, Sparkles, Check, Copy, ExternalLink, RotateCw, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";

type BranchInfo = {
  name: string;
  businessName: string;
  industry?: string;
  lowRatingThreshold: number;
  googleReviewUrl?: string;
  keywords?: string;
};

export default function PublicReviewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState<"loading" | "rating" | "content" | "done">(
    "loading"
  );
  const [branch, setBranch] = useState<BranchInfo | null>(null);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isAiSuggestion, setIsAiSuggestion] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiFailed, setAiFailed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState("");
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/branch/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.expired) {
          setIsExpired(true);
          setExpiredMessage(
            data.error ||
              "This QR code has expired. Please contact the business for a new review link."
          );
        } else if (data.error) {
          setError(data.error);
        } else {
          setBranch(data.branch);
          setStep("rating");
        }
      })
      .catch(() => setError("Failed to load"));
  }, [slug]);

  async function handleRatingSubmit() {
    if (rating === 0) return;
    setStep("content");

    // If high rating, generate AI suggestions
    if (branch && rating >= branch.lowRatingThreshold) {
      setGenerating(true);
      try {
        const storageKey = `review_keyword_offset_${slug}`;
        const savedOffset = localStorage.getItem(storageKey);
        const currentOffset = savedOffset ? parseInt(savedOffset, 10) : 0;

        const res = await fetch("/api/ai/generate-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            businessName: branch.businessName,
            rating,
            industry: branch.industry,
            tone: "professional",
            keywords: branch.keywords,
            keywordOffset: currentOffset,
          }),
        });
        const data = await res.json();

        if (data.expired || res.status === 403) {
          setIsExpired(true);
          setExpiredMessage(
            data.error ||
              "This QR code has expired. Please contact the business for a new review link."
          );
          setGenerating(false);
          return;
        }

        if (data.reviews && data.reviews.length > 0) {
          setAiSuggestions(data.reviews);
          setContent(data.reviews[0]);
          setSelectedReviewIndex(0);
          setIsAiSuggestion(true);
          setAiFailed(!!data.aiFailed);
          localStorage.setItem(storageKey, (currentOffset + 3).toString());
        } else if (data.review) {
          setAiSuggestions([data.review]);
          setContent(data.review);
          setSelectedReviewIndex(0);
          setIsAiSuggestion(true);
          setAiFailed(!!data.aiFailed);
          localStorage.setItem(storageKey, (currentOffset + 3).toString());
        }
      } catch (e) {
        console.error(e);
      }
      setGenerating(false);
    }
  }

  async function regenerateReviews() {
    if (!branch) return;
    setGenerating(true);
    try {
      const storageKey = `review_keyword_offset_${slug}`;
      const savedOffset = localStorage.getItem(storageKey);
      const currentOffset = savedOffset ? parseInt(savedOffset, 10) : 0;

      const res = await fetch("/api/ai/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          businessName: branch.businessName,
          rating,
          industry: branch.industry,
          tone: "professional",
          keywords: branch.keywords,
          keywordOffset: currentOffset,
        }),
      });
      const data = await res.json();

      if (data.expired || res.status === 403) {
        setIsExpired(true);
        setExpiredMessage(
          data.error ||
            "This QR code has expired. Please contact the business for a new review link."
        );
        setGenerating(false);
        return;
      }

      if (data.reviews && data.reviews.length > 0) {
        setAiSuggestions(data.reviews);
        setContent(data.reviews[0]);
        setSelectedReviewIndex(0);
        setIsAiSuggestion(true);
        setAiFailed(!!data.aiFailed);
        localStorage.setItem(storageKey, (currentOffset + 3).toString());
      } else if (data.review) {
        setAiSuggestions([data.review]);
        setContent(data.review);
        setSelectedReviewIndex(0);
        setIsAiSuggestion(true);
        setAiFailed(!!data.aiFailed);
        localStorage.setItem(storageKey, (currentOffset + 3).toString());
      }
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  }

  async function handleSubmit() {
    if (!content && rating >= (branch?.lowRatingThreshold || 3)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customerName: name,
          customerEmail: email,
          rating,
          content,
        }),
      });
      const data = await res.json();

      if (data.expired || res.status === 403) {
        setIsExpired(true);
        setExpiredMessage(
          data.error ||
            "This QR code has expired. Please contact the business for a new review link."
        );
        setSubmitting(false);
        return;
      }

      if (data.redirect === "google" && branch?.googleReviewUrl) {
        // Store the review content so user can paste on Google
        if (content) {
          try {
            navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
          } catch {}
        }
        setTimeout(() => {
          window.open(branch.googleReviewUrl, "_blank");
        }, 1000);
      }
      setStep("done");
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md border border-slate-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">QR Code Expired</h1>
          <p className="text-slate-600 leading-relaxed mb-6">
            {expiredMessage ||
              "This QR code has expired. Please contact the business for a new review link."}
          </p>
          <div className="text-xs text-slate-400 border-t border-slate-100 pt-4">
            If you are the business owner, please log in to your dashboard to renew your subscription.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Not Found</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-100 py-8 px-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-drift" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-200/15 rounded-full blur-3xl animate-drift" style={{animationDelay: '5s'}} />
      <div className="relative max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {branch?.businessName}
          </h1>
          {branch?.name && (
            <p className="text-slate-600">{branch.name} Branch</p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_60px_-15px_rgba(147,51,234,0.15)] p-6 md:p-8 border border-slate-100">
          {step === "rating" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                How was your experience?
              </h2>
              <p className="text-slate-600 mb-8">
                We'd love to hear how things went. Tap a star below
              </p>
              <div className="flex justify-center gap-2 md:gap-4 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all hover:scale-125 active:scale-90 duration-200"
                  >
                    <Star
                      className={`w-12 h-12 md:w-16 md:h-16 transition ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-between max-w-sm mx-auto text-xs text-slate-400 mb-8 px-2">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Great</span>
                <span>Excellent</span>
              </div>
              {rating > 0 && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Your email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  />
                </div>
              )}
              <button
                onClick={handleRatingSubmit}
                disabled={rating === 0}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          )}

          {step === "content" && branch && (
            <div>
              {rating < branch.lowRatingThreshold ? (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-center">
                    We're sorry things weren't great
                  </h2>
                  <p className="text-slate-600 mb-6 text-center">
                    Your message goes directly to the owner, not to Google.
                    We genuinely want to make this right.
                  </p>
                  <textarea
                    placeholder="Tell us what happened. The more detail you share, the better we can fix it..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none mb-4"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-slate-800 text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-900 transition disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Private Feedback"}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-center gap-2 md:gap-4 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-10 h-10 md:w-12 md:h-12 transition ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between max-w-sm mx-auto text-xs text-slate-400 mb-8 px-2">
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Great</span>
                    <span>Excellent</span>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4 border-t border-slate-100 pt-4">
                    <span className="text-sm font-semibold text-slate-700">
                      Pick one you like and copy it:
                    </span>
                    <button
                      onClick={regenerateReviews}
                      disabled={generating}
                      className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 transition disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {generating && aiSuggestions.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
                        <span className="text-sm text-slate-500">Generating suggestions...</span>
                      </div>
                    ) : (
                      aiSuggestions.map((suggestion, index) => {
                        const isSelected = selectedReviewIndex === index;
                        return (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedReviewIndex(index);
                              setContent(suggestion);
                            }}
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 text-left hover:-translate-y-0.5 ${
                              isSelected
                                ? "border-purple-500 bg-purple-50/30 shadow-lg shadow-purple-100/50"
                                : "border-slate-200 bg-white hover:border-purple-200 hover:shadow-md"
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-slate-400">
                                  {aiFailed ? "Template Generated" : "AI Generated"}
                                </span>
                              </div>
                              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                                {suggestion}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReviewIndex(index);
                                setContent(suggestion);
                                try {
                                  navigator.clipboard.writeText(suggestion);
                                  setCopiedIndex(index);
                                  setTimeout(() => setCopiedIndex(null), 2000);
                                  fetch("/api/reviews/mark-copied", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ content: suggestion, slug }),
                                  }).catch(() => {});
                                } catch (err) {}
                              }}
                              className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                                copiedIndex === index
                                  ? "bg-green-600 text-white"
                                  : "bg-purple-600 hover:bg-purple-700 text-white"
                              }`}
                            >
                              {copiedIndex === index ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !content || generating}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {submitting ? "Submitting..." : "Copy & Submit to Google"}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
              {branch && rating >= branch.lowRatingThreshold && (
                <>
                  <p className="text-slate-600 mb-4">
                    Your review's been copied! Just paste it into the Google
                    review box and hit submit.
                  </p>
                  {branch.googleReviewUrl && (
                    <a
                      href={branch.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Google Reviews
                    </a>
                  )}
                </>
              )}
              {branch && rating < branch.lowRatingThreshold && (
                <p className="text-slate-600">
                  Thanks for letting us know. Your message has been passed along to the team.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
