"use client";

import { useEffect, useState } from "react";
import { Check, QrCode as QrIcon, Copy, ArrowLeft, Loader2, Info, X } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: string;
  numPrice: number;
  popular?: boolean;
  color: string;
  btnColor: string;
  features: string[];
};

type UserSub = {
  plan: string;
  aiTokensUsed: number;
  aiTokensLimit: number;
  maxBranches: number;
  maxStoreOwners: number;
  createdAt: string;
  expiresAt: string | null;
  isExpired: boolean;
  trialStatus?: "NOT_STARTED" | "ACTIVE" | "EXPIRED";
  remainingDays?: number | null;
  remainingHours?: number | null;
  canSubmitReviews?: boolean;
};

export default function PricingPage() {
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState({ upi_id: "", qr_code: "" });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [userSub, setUserSub] = useState<UserSub | null>(null);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [startingTrial, setStartingTrial] = useState(false);
  
  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchPaymentSettings();
    fetchPlans();
    fetchUserSubscription();
  }, []);

  const fetchUserSubscription = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUserSub(data.user.subscription || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartTrial = async () => {
    setStartingTrial(true);
    try {
      const res = await fetch("/api/payments/start-trial", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("🎉 14-Day Free Trial activated successfully!");
        fetchUserSubscription();
      } else {
        alert(data.error || "Failed to start trial.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while activating free trial.");
    } finally {
      setStartingTrial(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch("/api/payments/settings");
      const data = await res.json();
      setPaymentSettings(data);
    } catch (e) {
      console.error("Failed to load payment settings:", e);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/payments/plans");
      const data = await res.json();
      if (data.plans) {
        setPlans(
          data.plans.map((p: any) => ({
            id: p.plan_key,
            name: p.name,
            price: p.price == 0 ? "Free" : `$${p.price}/mo`,
            numPrice: p.price,
            features: p.features
              ? (p.features.includes("|")
                  ? p.features.split("|")
                  : p.features.replace(/(\d),(\d)/g, '$1__COMMA__$2').split(',')
                )
                  .map((f: string) => f.replace(/__COMMA__/g, ',').trim())
                  .filter(Boolean)
              : [],
            color: p.plan_key === "gold" ? "border-indigo-600 bg-white ring-4 ring-indigo-50" : "border-slate-100 bg-white",
            btnColor: p.plan_key === "gold" ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-100" : "bg-slate-900 hover:bg-slate-800 text-white",
            popular: p.plan_key === "gold"
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlans(false);
    }
  };

  const formatPlanPrice = (rawPrice: number) => {
    if (rawPrice === 0) return "Free";
    if (currency === "INR") {
      const inrAmount = rawPrice < 500 ? Math.round(rawPrice * 80) : rawPrice;
      return `₹${inrAmount.toLocaleString("en-IN")}/mo`;
    } else {
      const usdAmount = rawPrice >= 500 ? Math.round(rawPrice / 80) : rawPrice;
      return `$${usdAmount.toLocaleString()}/mo`;
    }
  };

  const handleCopyUpi = () => {
    if (!paymentSettings.upi_id) return;
    navigator.clipboard.writeText(paymentSettings.upi_id);
    alert("UPI ID copied to clipboard!");
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    if (!utrNumber.trim()) {
      alert("Please enter a valid UTR number.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan.id,
          utr_number: utrNumber.trim(),
          amount: selectedPlan.numPrice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage("success");
      } else {
        alert(data.error || "Failed to submit verification request");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPlanDisplayName = (planKey: string) => {
    if (!planKey) return "14-Day Free Trial";
    const pk = planKey.toLowerCase();
    if (pk === "free" || pk === "trial") return "14-Day Free Trial";
    if (pk === "silver") return "Silver Plan";
    if (pk === "gold") return "Gold Plan";
    if (pk === "platinum") return "Platinum Plan";
    return `${planKey} Plan`;
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {userSub && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-10 shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Your Current Subscription</span>
                {userSub.plan === "free" && userSub.trialStatus === "NOT_STARTED" ? (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                    Trial Inactive
                  </span>
                ) : userSub.plan === "free" && userSub.trialStatus === "ACTIVE" ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                    Trial Active
                  </span>
                ) : userSub.isExpired || userSub.plan === "expired" ? (
                  <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                    Subscription Expired
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                    Active Plan
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold capitalize text-white">
                {getPlanDisplayName(userSub.plan)}
              </h3>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-300">
                {userSub.plan === "free" && userSub.trialStatus === "ACTIVE" && userSub.remainingDays !== undefined && userSub.remainingDays !== null && (
                  <span className="text-emerald-300 font-semibold">
                    ⏳ {userSub.remainingDays} days {userSub.remainingHours || 0} hours remaining
                  </span>
                )}
                <span>Start Date: <strong className="text-white">{new Date(userSub.createdAt).toLocaleDateString()}</strong></span>
                <span>Expiry Date: <strong className="text-white">{userSub.expiresAt ? new Date(userSub.expiresAt).toLocaleDateString() : "Unlimited / Lifetime"}</strong></span>
              </div>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-xs space-y-1 sm:min-w-[220px]">
              <div className="text-slate-300">AI Tokens Usage:</div>
              <div className="font-bold text-sm text-white">
                {userSub.aiTokensUsed || 0} / {userSub.aiTokensLimit?.toLocaleString() || 0}
              </div>
              <div className="text-slate-300 pt-1">Max Branches: <strong className="text-white">{userSub.maxBranches || 0}</strong></div>
            </div>
          </div>
        )}

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Boost your Google business reviews and automate custom AI responses. Choose the plan that best fits your business goals.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-xs inline-flex items-center gap-1">
            <button
              onClick={() => setCurrency("INR")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currency === "INR"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              🇮🇳 India (INR ₹)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currency === "USD"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              🌐 Global (USD $)
            </button>
          </div>
        </div>

        {loadingPlans ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-x-8 items-stretch">
            {plans.map((plan) => {
              const isFreePlan = plan.id === "free" || plan.id === "free_trial_plan";
              const isUserOnFreePlan = userSub?.plan?.toLowerCase() === "free";
              const isActive = isFreePlan
                ? isUserOnFreePlan && userSub?.trialStatus === "ACTIVE"
                : userSub?.plan?.toLowerCase() === plan.id.toLowerCase();
              const isTrialNotStarted = isFreePlan && isUserOnFreePlan && userSub?.trialStatus === "NOT_STARTED";
              const isTrialExpired = isFreePlan && isUserOnFreePlan && (userSub?.trialStatus === "EXPIRED" || userSub?.isExpired);

              return (
                <div
                  key={plan.id}
                  className={`relative p-8 border rounded-3xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isActive
                      ? "border-2 border-emerald-500 bg-emerald-50/20 ring-4 ring-emerald-100/50 shadow-md"
                      : isTrialExpired
                      ? "border-red-200 bg-red-50/10 opacity-90"
                      : plan.color
                  }`}
                >
                  {isActive ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-white" /> Active Plan
                    </span>
                  ) : isTrialExpired ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      Trial Expired
                    </span>
                  ) : isTrialNotStarted ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      14-Day Free Trial
                    </span>
                  ) : plan.popular ? (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      Most Popular
                    </span>
                  ) : null}
                  
                  <div className="flex-1">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <p className="mt-4 flex items-baseline text-slate-900">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{formatPlanPrice(plan.numPrice)}</span>
                      </p>
                    </div>
                    
                    <div className="w-full h-px bg-slate-100 my-6" />

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="ml-3 text-sm text-slate-600 font-medium leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {isFreePlan ? (
                    <button
                      onClick={() => {
                        if (isTrialNotStarted) {
                          handleStartTrial();
                        }
                      }}
                      disabled={isActive || !isUserOnFreePlan || isTrialExpired || startingTrial}
                      className={`w-full font-bold py-3.5 px-6 rounded-2xl text-center transition-all duration-200 ${
                        isTrialNotStarted
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 active:scale-[0.98]"
                          : isActive
                          ? "bg-emerald-600 text-white cursor-default shadow-none"
                          : isTrialExpired
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      }`}
                    >
                      {startingTrial
                        ? "Activating Trial..."
                        : isTrialNotStarted
                        ? "Start Free Trial"
                        : isActive
                        ? "Trial Active"
                        : isTrialExpired
                        ? "Trial Expired"
                        : "Free Trial (Completed)"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (isActive) return;
                        setSelectedPlan(plan);
                        setUtrNumber("");
                        setStatusMessage("");
                      }}
                      disabled={isActive}
                      className={`w-full font-bold py-3.5 px-6 rounded-2xl text-center transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-600 text-white cursor-default shadow-none"
                          : `active:scale-[0.98] ${plan.btnColor}`
                      }`}
                    >
                      {isActive ? "Current Active Plan" : "Upgrade Plan"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual QR & UTR Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transition-all transform scale-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Scan & Pay</h3>
              <button onClick={() => setSelectedPlan(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMessage === "success" ? (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">UTR Submitted Successfully!</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our administrators are verifying your transaction reference code. 
                  Your account limits will update automatically once approved.
                </p>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition"
                >
                  Return to Pricing
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="p-6 space-y-6">
                <div className="bg-indigo-50/50 rounded-2xl p-4 flex items-start gap-3 border border-indigo-100/50">
                  <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950 leading-relaxed font-medium">
                    You selected the <span className="font-bold text-indigo-900">{selectedPlan.name}</span>. Please scan the UPI QR code below or copy the UPI ID to make a payment of <span className="font-bold text-indigo-900">{formatPlanPrice(selectedPlan.numPrice)}</span>.
                  </div>
                </div>

                {/* QR Code and UPI detail */}
                <div className="flex flex-col items-center justify-center space-y-4 py-2">
                  {paymentSettings.qr_code ? (
                    <div className="border-2 border-slate-100 rounded-2xl p-2.5 bg-white shadow-md">
                      <img src={paymentSettings.qr_code} alt="UPI Payment QR" className="w-40 h-40 object-contain" />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300">
                      <QrIcon className="w-10 h-10 mb-2 text-slate-300" />
                      <span className="text-[11px] font-medium">No QR Uploaded</span>
                    </div>
                  )}

                  {paymentSettings.upi_id && (
                    <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/60 w-full justify-between transition-colors">
                      <span className="font-mono text-xs text-slate-800 font-semibold truncate">{paymentSettings.upi_id}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-indigo-600 hover:text-indigo-800 transition p-1 hover:bg-indigo-50 rounded-lg"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* UTR Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Enter UTR / Transaction ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 123456789012"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                    Typically a 12-digit transaction ID or reference number.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-100"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit UTR"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

