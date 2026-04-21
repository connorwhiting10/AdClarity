import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Check,
  X,
  Zap,
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowLeft,
  ArrowRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const ZAR_BASIC = 279;
const ZAR_PRO = 999;
const ZAR_BASIC_ANNUAL = 2790;
const ZAR_PRO_ANNUAL = 9990;
const USD_BASIC = 15;
const USD_PRO = 49;
const USD_BASIC_ANNUAL = 150;
const USD_PRO_ANNUAL = 490;

const FEATURES = {
  free: [
    { text: "1 free report (no sign-up)", included: true },
    { text: "3 reports/month after sign-up", included: true },
    { text: "Core summary cards", included: true },
    { text: "Campaign & age breakdown", included: true },
    { text: "CSV export", included: true },
    { text: "Full performance analysis", included: false },
    { text: "Report history", included: false },
    { text: "PDF export", included: false },
    { text: "Multi-user access", included: false },
    { text: "Priority support", included: false },
  ],
  basic: [
    { text: "Unlimited reports", included: true },
    { text: "Core summary cards", included: true },
    { text: "Campaign & age breakdown", included: true },
    { text: "CSV export", included: true },
    { text: "Full performance analysis", included: true },
    { text: "30-day report history", included: true },
    { text: "PDF export", included: false },
    { text: "Multi-user access", included: false },
    { text: "Priority support", included: false },
  ],
  pro: [
    { text: "Unlimited reports", included: true },
    { text: "Core summary cards", included: true },
    { text: "Campaign & age breakdown", included: true },
    { text: "CSV export", included: true },
    { text: "Full performance analysis", included: true },
    { text: "Full report history", included: true },
    { text: "PDF export", included: true },
    { text: "Multi-user access (3–10 users)", included: true },
    { text: "Priority support", included: true },
  ],
};

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, absolutely. Cancel anytime from your account settings. You'll keep access until the end of your current billing period — no hidden fees, no questions asked.",
  },
  {
    q: "What happens when I hit my free limit?",
    a: "After your free reports run out, you'll be prompted to upgrade. Your existing reports are never deleted — upgrading instantly unlocks everything.",
  },
  {
    q: "Do you support agencies?",
    a: "Yes! The Pro plan is built for agencies and includes multi-user access for 3 to 10 team members, advanced insights, PDF exports, and priority support.",
  },
  {
    q: "Can I upgrade later?",
    a: "Of course. Start on the Free plan and upgrade whenever you're ready. Your reports stay safe and your history carries over.",
  },
  {
    q: "Which payment methods do you support?",
    a: "South African users can pay via PayFast (credit card, EFT, Instant EFT, SnapScan). International users are billed via Stripe (all major credit cards).",
  },
  {
    q: "Is there an annual plan?",
    a: "Yes! Pay annually and get 2 months free — a 17% saving. Toggle the billing switch above to see annual pricing.",
  },
];

function FeatureRow({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      {included ? (
        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
      )}
      <span className={included ? "text-foreground/80" : "text-muted-foreground/40 line-through decoration-muted-foreground/20"}>
        {text}
      </span>
    </li>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="border border-white/5 rounded-xl overflow-hidden bg-card/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="font-semibold text-foreground">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pb-5"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [currency, setCurrency] = useState<"ZAR" | "USD">("ZAR");
  const [, navigate] = useLocation();
  const { isLoggedIn, signup } = useAuth();

  const fmt = (zar: number, usd: number) =>
    currency === "ZAR" ? `R${zar.toLocaleString()}` : `$${usd}`;

  const basicMonthly = fmt(ZAR_BASIC, USD_BASIC);
  const proMonthly = fmt(ZAR_PRO, USD_PRO);
  const basicAnnual = fmt(ZAR_BASIC_ANNUAL, USD_BASIC_ANNUAL);
  const proAnnual = fmt(ZAR_PRO_ANNUAL, USD_PRO_ANNUAL);

  const basicPrice = annual ? basicAnnual : basicMonthly;
  const proPrice = annual ? proAnnual : proMonthly;
  const basicPerMonth = annual
    ? fmt(Math.round(ZAR_BASIC_ANNUAL / 12), Math.round(USD_BASIC_ANNUAL / 12))
    : null;
  const proPerMonth = annual
    ? fmt(Math.round(ZAR_PRO_ANNUAL / 12), Math.round(USD_PRO_ANNUAL / 12))
    : null;

  const handleStartFree = () => {
    if (isLoggedIn) {
      navigate("/");
    } else {
      signup();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 sm:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_-3px_rgba(24,119,242,0.5)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">AdClarity</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 font-medium px-4 py-1">
            Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-5 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight">
            Simple, Powerful Ad Insights —<br className="hidden md:block" /> Without the Confusion
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Understand your ad performance in seconds and know exactly what to fix.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/30 px-8" onClick={handleStartFree}>
              Start Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 px-8" onClick={() => {
              document.getElementById("pricing-cards")?.scrollIntoView({ behavior: "smooth" });
            }}>
              View Plans
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            No credit card required · Get 3 free reports per month after sign-up
          </p>

          {/* Billing controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            {/* Currency toggle */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-full p-1 border border-white/5">
              <button
                onClick={() => setCurrency("ZAR")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${currency === "ZAR" ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-foreground"}`}
              >
                🇿🇦 ZAR (R)
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${currency === "USD" ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-foreground"}`}
              >
                🌍 USD ($)
              </button>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted/50 border border-white/10"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-6" : ""}`} />
              </button>
              <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
                Annual{" "}
                <span className="text-emerald-400 font-bold text-xs">(2 months free)</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div id="pricing-cards" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* FREE */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="h-full rounded-2xl border border-white/5 bg-card/40 p-7 flex flex-col">
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-muted/40 border border-white/5 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-1">Free</h3>
                <p className="text-sm text-muted-foreground">Try it out</p>
              </div>
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-black text-foreground">
                    {currency === "ZAR" ? "R0" : "$0"}
                  </span>
                  <span className="text-muted-foreground mb-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">No credit card required</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {FEATURES.free.map((f, i) => <FeatureRow key={i} {...f} />)}
              </ul>
              <Button
                variant="outline"
                className="w-full border-white/10 hover:bg-white/5"
                onClick={handleStartFree}
              >
                Start Free
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">No credit card needed</p>
            </div>
          </motion.div>

          {/* BASIC — Most Popular */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <div className="h-full rounded-2xl border-2 border-primary/60 bg-card/60 p-7 flex flex-col relative shadow-[0_0_40px_-10px_rgba(24,119,242,0.25)] ring-1 ring-primary/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-white font-bold px-4 py-1 shadow-lg shadow-primary/40 text-xs tracking-wide">
                  MOST POPULAR
                </Badge>
              </div>
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-1">Basic</h3>
                <p className="text-sm text-muted-foreground">Perfect for individuals</p>
              </div>
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-black text-primary">
                    {annual ? basicPerMonth : basicPrice}
                  </span>
                  <span className="text-muted-foreground mb-1">/month</span>
                </div>
                {annual && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed {basicPrice}/year · <span className="text-emerald-400">Save 2 months</span>
                  </p>
                )}
                {!annual && <p className="text-xs text-muted-foreground mt-1">Cancel anytime</p>}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {FEATURES.basic.map((f, i) => <FeatureRow key={i} {...f} />)}
              </ul>
              <Button className="w-full shadow-lg shadow-primary/30">
                Get Started
              </Button>
            </div>
          </motion.div>

          {/* PRO */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}>
            <div className="h-full rounded-2xl border border-violet-500/20 bg-card/40 bg-gradient-to-b from-violet-500/5 to-transparent p-7 flex flex-col">
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-1">Pro</h3>
                <p className="text-sm text-muted-foreground">Built for teams & agencies</p>
              </div>
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-black text-violet-400">
                    {annual ? proPerMonth : proPrice}
                  </span>
                  <span className="text-muted-foreground mb-1">/month</span>
                </div>
                {annual && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed {proPrice}/year · <span className="text-emerald-400">Save 2 months</span>
                  </p>
                )}
                {!annual && <p className="text-xs text-muted-foreground mt-1">Cancel anytime</p>}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {FEATURES.pro.map((f, i) => <FeatureRow key={i} {...f} />)}
              </ul>
              <Button
                variant="outline"
                className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/50"
              >
                Upgrade to Pro
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-20 text-sm text-muted-foreground"
        >
          {["No credit card for Free plan", "Cancel anytime", "Secure payments via Stripe & PayFast", "ZAR & USD billing"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              {t}
            </span>
          ))}
        </motion.div>

        {/* Compare plans table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-20">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Full Plan Comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-muted/10">
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Feature</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Free</th>
                  <th className="px-6 py-4 font-bold text-primary text-center bg-primary/5">Basic</th>
                  <th className="px-6 py-4 font-semibold text-violet-400 text-center">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Reports per month", "1 (then 3/mo)", "Unlimited", "Unlimited"],
                  ["Summary cards", "✓", "✓", "✓"],
                  ["Campaign & age breakdown", "✓", "✓", "✓"],
                  ["CSV export", "✓", "✓", "✓"],
                  ["Full performance analysis", "—", "✓", "✓"],
                  ["Report history", "—", "30 days", "Full"],
                  ["PDF export", "—", "—", "✓"],
                  ["Multi-user access", "—", "—", "Up to 10"],
                  ["Priority support", "—", "—", "✓"],
                  ["Price (monthly)", currency === "ZAR" ? "Free" : "Free", currency === "ZAR" ? "R279/mo" : "$15/mo", currency === "ZAR" ? "R999/mo" : "$49/mo"],
                ].map(([feat, free, basic, pro], i) => (
                  <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"}`}>
                    <td className="px-6 py-3.5 text-foreground/80">{feat}</td>
                    <td className="px-6 py-3.5 text-center text-muted-foreground">{free}</td>
                    <td className="px-6 py-3.5 text-center font-semibold text-foreground bg-primary/[0.04]">{basic}</td>
                    <td className="px-6 py-3.5 text-center text-violet-400">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-20">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center rounded-2xl border border-primary/20 bg-primary/5 px-8 py-14"
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h3 className="text-2xl font-display font-bold mb-3">Ready to make sense of your ad data?</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Upload your first report for free — no account, no credit card. Upgrade when you're ready to unlock the full picture.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/30 px-8" onClick={handleStartFree}>
              Start Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 px-8" onClick={() => navigate("/")}>
              Try Without Sign-up
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-5">No credit card required · Cancel anytime</p>
        </motion.div>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-16 pt-8 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground/50">
            <span>© {new Date().getFullYear()} AdClarity</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/legal")} className="hover:text-muted-foreground transition-colors">Privacy Policy</button>
              <button onClick={() => navigate("/legal")} className="hover:text-muted-foreground transition-colors">Terms of Service</button>
              <button onClick={() => navigate("/legal")} className="hover:text-muted-foreground transition-colors">Disclaimer</button>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile sticky CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-xl border-t border-white/5">
        <Button size="lg" className="w-full shadow-lg shadow-primary/30" onClick={handleStartFree}>
          <Zap className="w-4 h-4 mr-2" />
          Start Free — No Credit Card
        </Button>
      </div>

    </div>
  );
}
