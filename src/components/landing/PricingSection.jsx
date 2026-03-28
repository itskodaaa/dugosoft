import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with core features",
    features: [
      "3 resume generations / month",
      "5 ATS checks / month",
      "Basic translations",
      "PDF to Excel (limited)",
    ],
    cta: "Get Started",
    active: true,
    highlight: false,
  },
  {
    name: "Pro",
    price: "—",
    period: "coming soon",
    description: "Unlock the full power of Softdugo",
    features: [
      "Unlimited resume generations",
      "Unlimited ATS checks",
      "Priority translations",
      "Advanced PDF extraction",
      "Financial Analyzer",
      "Chat with Document",
    ],
    cta: "Coming Soon",
    active: false,
    highlight: true,
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

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative p-8 rounded-xl bg-card ink-border ${
                plan.highlight ? "ring-2 ring-accent" : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-widest px-4 py-1 rounded-full">
                  Recommended
                </span>
              )}
              <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">/ {plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.active ? (
                <Link to="/dashboard">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-11 font-semibold">
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full rounded-full h-11 font-semibold gap-2">
                  <Lock className="w-4 h-4" />
                  {plan.cta}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}