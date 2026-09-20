import Link from "next/link";
import {
  Star,
  QrCode,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  MessageSquare,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bot,
  FileText,
  Image as ImageIcon,
  Send,
  Award,
  Search,
} from "lucide-react";
import { LandingClient } from "./landing-client";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100/80 shadow-sm shadow-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" href="/" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#how" className="text-sm font-medium text-slate-600 hover:text-purple-600 hover-underline transition-colors">
                How it Works
              </a>
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-purple-600 hover-underline transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-purple-600 hover-underline transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-purple-600 hover-underline transition-colors">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-700 hover:text-purple-600 px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-full hover:from-purple-700 hover:to-indigo-700 transition shadow-md shadow-purple-200/50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_60%)]" />
        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-drift" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-drift" style={{ animationDelay: '3s' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-purple-100 mb-6 animate-shimmer">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">
                Used by 30+ businesses across India every day
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Your Customers Love You.{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Let Google Know.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Most happy customers never leave a review. Not because they don't want to,
              but because it's a hassle. We make it dead simple with a QR code and a little AI help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-300/40 animate-pulse-glow hover:shadow-purple-400/50 hover:scale-105"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-semibold hover:border-purple-300 hover:shadow-md transition-all"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Dashboard preview mock */}
          <div className="relative max-w-5xl mx-auto mt-16 animate-float">
            <div className="bg-white rounded-2xl shadow-[0_20px_80px_-20px_rgba(147,51,234,0.25)] border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-xs text-slate-500">
                  app.autorevio.com/dashboard
                </div>
              </div>
              <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-purple-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">
                      Total Reviews
                    </div>
                    <div className="text-3xl font-bold text-slate-900">847</div>
                    <div className="text-xs text-green-600 mt-1">
                      +24% this month
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">
                      Avg Rating
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-slate-900">
                        4.8
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${s <= 4
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-yellow-400/50 text-yellow-400/50"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">
                      Auto Replies
                    </div>
                    <div className="text-3xl font-bold text-slate-900">312</div>
                    <div className="text-xs text-slate-500 mt-1">
                      AI-powered
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold">Recent Reviews</div>
                    <div className="text-xs text-slate-500">Live analytics</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Priya M.", rating: 5, text: "Walked in without an appointment and they still fit me in. The staff was super friendly, will definitely be back!" },
                      { name: "Rohit S.", rating: 5, text: "Honestly didn't expect this level of quality for the price. Really impressed with the attention to detail." },
                      { name: "Ananya K.", rating: 4, text: "Good experience overall. Wait was a bit long but the end result made up for it." },
                    ].map((r, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                          {r.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {r.name}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= r.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-200"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              It takes less than a minute for your customer. Here's the whole flow,
              start to finish.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: QrCode,
                title: "Customer Scans a QR Code",
                desc: "You put up a QR code at your counter, table, or receipt. Customers just point their phone camera at it. No app downloads, no sign-ups.",
                color: "from-purple-500 to-indigo-500",
              },
              {
                icon: Star,
                title: "They Pick a Star Rating",
                desc: "A clean, simple page opens up and asks how their experience was. They tap a star and that's it.",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: Sparkles,
                title: "Happy? AI Writes the Review for Them",
                desc: "If they gave 4 or 5 stars, we suggest a ready-made review they can copy and post in seconds. No more staring at a blank text box.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "Unhappy? You Hear About It First",
                desc: "If the rating is low, the feedback comes straight to your dashboard, not Google. You get a chance to fix things before it goes public.",
                color: "from-emerald-500 to-teal-500",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up group"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} text-white font-bold flex items-center justify-center text-sm shadow-lg`}>
                  {i + 1}
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Why Businesses Switch to This
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              You're already doing great work. This just makes sure people
              hear about it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Stop Chasing Customers for Reviews",
                desc: "No more awkward 'Can you leave us a review?' conversations. The QR code does the asking for you.",
              },
              {
                icon: Search,
                title: "Show Up Higher on Google Maps",
                desc: "Google rewards businesses with more reviews and better ratings. It's that straightforward.",
              },
              {
                icon: Check,
                title: "Set Up in Under 5 Minutes",
                desc: "Seriously, just create an account, add your Google link, and print your QR code. You're done.",
              },
              {
                icon: Shield,
                title: "Win Over New Customers Before They Walk In",
                desc: "9 out of 10 people read reviews before choosing a business. A strong Google profile fills seats.",
              },
              {
                icon: Send,
                title: "Reviews Come In While You Work",
                desc: "Customers leave reviews right there at the table or counter. You'll see them pop up in your dashboard.",
              },
              {
                icon: BarChart3,
                title: "Know What Customers Actually Think",
                desc: "See trends in your feedback over time. Spot recurring complaints early and fix them before they become a pattern.",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Works for Any Customer-Facing Business
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              If your customers walk through a door, sit in a chair, or eat at a
              table, this is built for you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { name: "Restaurants", emoji: "🍽️" },
              { name: "Healthcare", emoji: "🏥" },
              { name: "Retail", emoji: "🛍️" },
              { name: "Automotive", emoji: "🚗" },
              { name: "Hotels", emoji: "🏨" },
              { name: "Salons", emoji: "💇" },
              { name: "Gyms", emoji: "🏋️" },
              { name: "Real Estate", emoji: "🏠" },
              { name: "Legal", emoji: "⚖️" },
              { name: "Education", emoji: "🎓" },
              { name: "Finance", emoji: "💰" },
              { name: "Travel", emoji: "✈️" },
              { name: "Dental", emoji: "🦷" },
              { name: "Veterinary", emoji: "🐾" },
              { name: "Home Services", emoji: "🔧" },
            ].map((industry) => (
              <div
                key={industry.name}
                className="bg-white border border-slate-200/80 px-5 py-3 rounded-full font-medium text-slate-700 hover:shadow-lg hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <span className="mr-1.5">{industry.emoji}</span>{industry.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need, Nothing You Don't
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We kept things focused. Here's what's in the box and what
              it does for your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "AI Writes Reviews People Actually Post",
                desc: "Our AI drafts reviews that read like something a real person would say, because customers tweak and post them as their own.",
              },
              {
                icon: QrCode,
                title: "One QR Code, Zero Friction",
                desc: "Print it, stick it on the counter, and forget about it. Customers scan and review in under a minute.",
              },
              {
                icon: BarChart3,
                title: "Got Multiple Locations? No Problem",
                desc: "Each branch gets its own QR code and review page. You manage everything from one dashboard.",
              },
              {
                icon: Shield,
                title: "Bad Reviews Stay Off Google",
                desc: "Low ratings are routed to your private inbox so you can address the issue directly, before it shows up publicly.",
              },
              {
                icon: Check,
                title: "See Every Review in One Place",
                desc: "Your dashboard shows every review that comes in: who left it, when, and what they said. No digging around Google.",
              },
              {
                icon: Search,
                title: "Climb the Google Maps Rankings",
                desc: "More reviews = higher ranking. It's how Google decides who shows up first when someone searches near you.",
              },
              {
                icon: MessageSquare,
                title: "Make It Sound Like Your Brand",
                desc: "Set the tone and keywords for AI-generated reviews so they match how your customers naturally talk about you.",
              },
              {
                icon: BarChart3,
                title: "Simple Dashboard, Clear Numbers",
                desc: "Track how many reviews you're getting, your average rating over time, and what people love (or don't).",
              },
              {
                icon: Bot,
                title: "Auto-Reply to Every Review",
                desc: "Never leave a review hanging. Our AI writes a thoughtful reply within seconds. You can edit it or let it fly.",
              },
              {
                icon: FileText,
                title: "Google Business Profile Health Check",
                desc: "Find out what's missing or outdated on your profile. Get a clear checklist of fixes you can download as a PDF.",
              },
              {
                icon: Search,
                title: "SEO-Ready Business Descriptions",
                desc: "Let AI rewrite your Google profile description and services list so they actually help you rank for local searches.",
              },
              {
                icon: ImageIcon,
                title: "Promo Posters in One Click",
                desc: "Need a quick social media post or in-store flyer? Generate a branded poster with a caption, ready to share.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group ${i % 2 === 0 ? 'bg-white' : 'bg-gradient-to-br from-slate-50/50 to-purple-50/30'
                  }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-purple-300/50 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden noise-overlay">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-drift" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-drift" style={{ animationDelay: '4s' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="relative">
              <div className="text-8xl font-black text-white/5 absolute -top-6 left-1/2 -translate-x-1/2 select-none">50</div>
              <div className="text-5xl md:text-6xl font-bold mb-2 relative">50+</div>
              <div className="text-purple-100">Types of Businesses Using It</div>
            </div>
            <div className="relative">
              <div className="text-8xl font-black text-white/5 absolute -top-6 left-1/2 -translate-x-1/2 select-none">10K</div>
              <div className="text-5xl md:text-6xl font-bold mb-2 relative">10K+</div>
              <div className="text-purple-100">Reviews Collected So Far</div>
            </div>
            <div className="relative">
              <div className="text-8xl font-black text-white/5 absolute -top-6 left-1/2 -translate-x-1/2 select-none">3x</div>
              <div className="text-5xl md:text-6xl font-bold mb-2 relative">3x</div>
              <div className="text-purple-100">More Reviews on Average</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              No hidden fees, no long contracts. Pick a plan, start collecting
              reviews today.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "SILVER",
                yearly: 2999,
                monthly: 199,
                tokens: "10,000",
                branches: 2,
                highlighted: false,
              },
              {
                name: "GOLD",
                yearly: 4999,
                monthly: 299,
                tokens: "100",
                branches: 2,
                highlighted: true,
              },
              {
                name: "PLATINUM",
                yearly: 6999,
                monthly: 399,
                tokens: "50,000",
                branches: 4,
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${plan.highlighted
                    ? "border-purple-500 bg-gradient-to-b from-purple-50 to-white shadow-[0_8px_40px_-12px_rgba(147,51,234,0.3)] relative"
                    : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-lg"
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    POPULAR
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">₹{plan.yearly}</span>
                    <span className="text-slate-500">/year</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    or ₹{plan.monthly}/month
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>{plan.tokens}</strong> AI Tokens/month
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>{plan.branches}</strong> Branches per business
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Google Auto Reply</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>GBP SEO rewrite</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>GBP profile report</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>GBP post (AI + publish)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>AI Poster (promotional)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Dynamic QR codes</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Review Activity Tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>24/7 Support</span>
                  </li>
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition ${plan.highlighted
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you'd want to know before getting started.
            </p>
          </div>
          <LandingClient />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        {/* Floating decorative shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-drift" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-drift" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/10 rounded-full blur-lg animate-drift" style={{ animationDelay: '5s' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start Getting Reviews on Autopilot
          </h2>
          <div className="flex flex-wrap gap-4 justify-center mb-8 text-purple-100">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>More customers find you</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Rank higher on Google Maps</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Build real credibility</span>
            </div>
          </div>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-full font-bold hover:bg-purple-50 transition-all shadow-2xl hover:scale-105 hover:shadow-white/25"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Logo size="md" darkMode showTagline href="/" />
              </div>
              <p className="text-sm">
                A simple way for local businesses to get more Google reviews and build trust online.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#how" className="hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@autorevio.com</li>
                <li>24/7 Expert Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm">
            © {new Date().getFullYear()} Autorevio. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
