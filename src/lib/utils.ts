// Small helper to join class names conditionally
export function cn(...inputs: Array<string | undefined | null | false>) {
  return inputs.filter(Boolean).join(" ");
}

export function slug() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export const PLANS = {
  silver: {
    name: "SILVER",
    yearly: 2999,
    monthly: 199,
    tokens: 10000,
    branches: 2,
    features: [
      "10,000 AI Tokens / month",
      "2 Branches per business",
      "Google Auto Reply",
      "GBP SEO rewrite",
      "GBP profile report",
      "GBP post (AI + publish)",
      "AI Poster (promotional)",
      "Dynamic QR codes",
      "AI Smart Review Redirection",
      "Review Activity Tracking",
      "Mobile Friendly Dashboard",
      "24/7 Support",
    ],
  },
  gold: {
    name: "GOLD",
    yearly: 4999,
    monthly: 299,
    tokens: 100,
    branches: 2,
    features: [
      "100 AI Tokens / month",
      "2 Branches per business",
      "Google Auto Reply",
      "GBP SEO rewrite",
      "GBP profile report",
      "GBP post (AI + publish)",
      "AI Poster (promotional)",
      "Dynamic QR codes",
      "AI Smart Review Redirection",
      "Review Activity Tracking",
      "Mobile Friendly Dashboard",
      "24/7 Support",
    ],
  },
  platinum: {
    name: "PLATINUM",
    yearly: 6999,
    monthly: 399,
    tokens: 50000,
    branches: 4,
    features: [
      "50,000 AI Tokens / month",
      "4 Branches per business",
      "Google Auto Reply",
      "GBP SEO rewrite",
      "GBP profile report",
      "GBP post (AI + publish)",
      "AI Poster (promotional)",
      "Dynamic QR codes",
      "AI Smart Review Redirection",
      "Review Activity Tracking",
      "Mobile Friendly Dashboard",
      "24/7 Support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
