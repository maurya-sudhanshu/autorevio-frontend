"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Okay, but what exactly does this do?",
    a: "It helps you get more Google reviews without bugging your customers. You set up a QR code at your business. When someone scans it, they rate their experience. If it's a good rating, we suggest a review they can copy and post to Google in seconds. If it's bad, the feedback comes to you privately instead.",
  },
  {
    q: "How do customers leave a review?",
    a: "They scan your QR code with their phone camera. A page opens up, they tap a star rating, and if they're happy, they get a suggested review they can post to Google with one tap. The whole thing takes about 30 seconds.",
  },
  {
    q: "Will this actually help my business?",
    a: "If you rely on local customers, absolutely. Google ranks businesses with more reviews higher in search results and Maps. More reviews also means more people trust you enough to walk through the door. Most of our users see a noticeable jump within the first couple of weeks.",
  },
  {
    q: "Does it work for my type of business?",
    a: "If you have customers who visit in person, like restaurants, clinics, salons, repair shops, gyms, or hotels, then yes. It works for any business with a Google listing.",
  },
  {
    q: "How quickly will I start seeing more reviews?",
    a: "Most businesses start seeing new reviews within the first few days. It depends on foot traffic, but the QR code does the heavy lifting. You just need to make sure it's visible where customers can see it.",
  },
  {
    q: "Can I change how the suggested reviews sound?",
    a: "Yes. You can set your preferred tone, add keywords that matter to your business, and the AI will tailor its suggestions to match. It won't sound like a robot wrote it. That's the whole point.",
  },
  {
    q: "I'm not great with tech. Is this hard to set up?",
    a: "Not at all. You create an account, paste your Google review link, and print your QR code. That's it. If you get stuck, our support team is available around the clock to help you out.",
  },
];

export function LandingClient() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 ${
              isOpen
                ? "border-purple-200 shadow-lg shadow-purple-100/50"
                : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                {isOpen && (
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500 flex-shrink-0" />
                )}
                <span className={`font-semibold transition-colors ${isOpen ? 'text-purple-900' : 'text-slate-800'}`}>
                  {faq.q}
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-purple-500" : ""
                }`}
              />
            </button>
            <div className={isOpen ? "grid-rows-expand" : "grid-rows-collapse"}>
              <div>
                <div className="px-5 pb-5 pl-9 text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
