import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Star, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with core features",
    icon: Zap,
    color: "text-muted-foreground",
    highlight: false,
    features: [
      { label: "3 Resume generations / month", included: true },
      { label: "ATS Checker (basic)", included: true },
      { label: "1 Cover Letter / month", included: true },
      { label: "File Sharing (up to 100MB)", included: true },
      { label: "Translator (500 words)", included: true },
      { label: "LinkedIn Integration", included: false },
      { label: "Priority AI model", included: false },
      { label: "PDF & DOCX export", included: false },
      { label: "Career Performance analytics", included: false },
    ],
    cta: "Get Started",
    ctaStyle: "bg-accent hover:bg-accent/90 text-accent-foreground",
  },
  {
    name: "Pro",
    price: "$12",
    period: "month",
    description: "Unlock the full power of Softdugo",
    icon: Star,
    color: "text-accent",
    highlight: true,
    features: [
      { label: "Unlimited Resume generations", included: true },
      { label: "ATS Checker (advanced + AI)", included: true },
      { label: "Unlimited Cover Letters", included: true },
      { label: "File Sharing (up to 5GB)", included: true },
      { label: "Translator (unlimited)", included: true },
      { label: "LinkedIn Integration", included: true },
      { label: "Priority AI model", included: true },
      { label: "PDF & DOCX export", included: true },
      { label: "Career Performance analytics", included: false },
    ],
    cta: "Start Pro",
    ctaStyle: "bg-accent hover:bg-accent/90 text-accent-foreground",
  },
  {
    name: "Business",
    price: "$29",
    period: "month",
    description: "For teams and power users",
    icon: Crown,
    color: "text-amber-500",
    highlight: false,
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Career Performance analytics", included: true },
      { label: "Unlimited history", included: true },
      { label: "Team workspace (up to 5 users)", included: true },
      { label: "API access", included: true },
      { label: "Priority support", included: true },
      { label: "Custom branding on exports", included: true },
      { label: "Bulk processing", included: true },
      { label: "Dedicated account manager", included: true },
    ],
    cta: "Start Business",
    ctaStyle: "bg-amber-500 hover:bg-amber-500/90 text-white",
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 px-6 bg-secondary/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest text-accent mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            Simple, transparent pricing
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-7 rounded-2xl bg-card ink-border flex flex-col ${
                  plan.highlight ? "ring-2 ring-accent shadow-lg shadow-accent/10" : ""
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2 text-xs">
                      {f.included ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard">
                  <Button className={`w-full rounded-full h-11 font-semibold ${plan.ctaStyle}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}