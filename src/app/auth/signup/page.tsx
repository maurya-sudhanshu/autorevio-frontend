"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to sign up");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
        {/* Decorative floating shapes */}
        <div className="absolute top-32 right-16 w-28 h-28 bg-white/10 rounded-full blur-xl animate-drift" />
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-drift" style={{animationDelay: '4s'}} />
        <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-md animate-drift" style={{animationDelay: '7s'}} />
        <div className="relative">
          <div className="mb-12">
            <Logo size="lg" darkMode showTagline href="/" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Get set up in a few minutes
          </h2>
          <p className="text-purple-100 text-lg">
            Create your account, connect your Google listing, and start
            collecting reviews right away.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:-translate-y-1 transition-transform duration-300">
            <div className="text-3xl font-bold">50+</div>
            <div className="text-sm text-purple-100">Business types</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:-translate-y-1 transition-transform duration-300">
            <div className="text-3xl font-bold">10K+</div>
            <div className="text-sm text-purple-100">Reviews collected</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:-translate-y-1 transition-transform duration-300">
            <div className="text-3xl font-bold">3x</div>
            <div className="text-sm text-purple-100">More reviews</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Logo size="md" href="/" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-slate-600 mb-8">
            It only takes a couple of minutes
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-lg focus:shadow-purple-100/50 outline-none transition-all"
                placeholder="Rahul Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-lg focus:shadow-purple-100/50 outline-none transition-all"
                placeholder="you@business.in"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-lg focus:shadow-purple-100/50 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:shadow-lg focus:shadow-purple-100/50 outline-none transition-all"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
