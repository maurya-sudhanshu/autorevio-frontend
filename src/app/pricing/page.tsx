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

export default function PricingPage() {
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState({ upi_id: "", qr_code: "" });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  
  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchPaymentSettings();
    fetchPlans();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Pick a plan that works for your business. Designed for business growth in India and internationally.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs inline-flex items-center gap-1">
            <button
              onClick={() => setCurrency("INR")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 border rounded-3xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${plan.color}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}
                
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
                
                <button
                  onClick={() => {
                    if (plan.id === "free" || plan.id === "free_trial_plan") {
                      window.location.href = "/dashboard/pricing";
                      return;
                    }
                    setSelectedPlan(plan);
                    setUtrNumber("");
                    setStatusMessage("");
                  }}
                  className={`w-full font-bold py-3.5 px-6 rounded-2xl text-center transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] shadow-md ${plan.btnColor}`}
                >
                  {plan.id === "free" || plan.id === "free_trial_plan" ? "Start Free Trial" : "Buy Plan"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual QR & UTR Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden transition-all transform scale-100 border border-slate-100">
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

