import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Sparkles, CheckCircle2, Globe2, FileText,
  Languages, Target, Star, Shield, Zap
} from "lucide-react";

const FEATURES = [
  { icon: FileText,  text: "AI Resume Builder & ATS Checker" },
  { icon: Languages, text: "Translate docs into 50+ languages" },
  { icon: Target,    text: "Career Matcher & Interview Prep" },
  { icon: Globe2,    text: "CV Vault in 12+ languages" },
  { icon: Shield,    text: "Secure document storage & e-sign" },
  { icon: Zap,       text: "All tools in one AI workspace" },
];

const TESTIMONIALS = [
  { name: "Sofia M.", text: "Got interviews in 3 countries after translating my CV!", avatar: "SM", color: "bg-orange-100 text-orange-600" },
  { name: "James O.", text: "The ATS Checker literally got me my dream job.", avatar: "JO", color: "bg-green-100 text-green-600" },
  { name: "Nina P.", text: "Best document platform I've ever used. Period.", avatar: "NP", color: "bg-blue-100 text-blue-600" },
];

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Detect if we're being redirected to a payment
  const nextUrl = new URLSearchParams(window.location.search).get("next") || "/dashboard";

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(p => (p + 1) % TESTIMONIALS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleLogin = () => {
    setLoading(true);
    base44.auth.redirectToLogin(nextUrl);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* ── Left: Visual Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-accent to-green-600 flex-col justify-between p-12 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-green-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        </div>

        {/* Person illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
            alt="Professional"
            className="w-full h-full object-cover opacity-20 object-top"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-accent/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent" />
        </div>

        {/* Content over image */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png"
              alt="Dugosoft"
              className="h-10 w-10 object-contain"
            />
            <span className="text-white font-extrabold text-xl tracking-tight">DUGOSOFT</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Your AI Workspace<br />for Career Success
            </h2>
            <p className="text-white/75 text-base leading-relaxed">
              Join 50,000+ professionals using Dugosoft to land better jobs worldwide.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{f.text}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Rotating testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full ${TESTIMONIALS[testimonialIdx].color} flex items-center justify-center font-bold text-sm`}>
                    {TESTIMONIALS[testimonialIdx].avatar}
                  </div>
                  <p className="text-white font-semibold text-sm">{TESTIMONIALS[testimonialIdx].name}</p>
                  <div className="flex ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
                </div>
                <p className="text-white/85 text-sm italic">"{TESTIMONIALS[testimonialIdx].text}"</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[["50K+", "Users"], ["94", "Countries"], ["1M+", "Docs"]].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <p className="text-2xl font-black text-white">{val}</p>
              <p className="text-xs text-white/60">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Auth Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative">
        {/* Fixed Home Button */}
        <Link to="/" className="fixed top-5 left-5 z-50">
          <Button variant="outline" size="sm" className="rounded-full gap-2 shadow-sm bg-background/90 backdrop-blur font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Button>
        </Link>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img
            src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png"
            alt="Dugosoft"
            className="h-10 w-10 object-contain"
          />
          <span className="font-extrabold text-xl tracking-tight text-foreground">DUGOSOFT</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Free plan · No credit card needed
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight">
              Welcome to Dugosoft
            </h1>
            <p className="text-muted-foreground text-base">
              Sign in or create your free account to get started.
            </p>
          </div>

          {/* Sign in card */}
          <div className="bg-card ink-border rounded-2xl p-8 shadow-xl mb-6">
            {nextUrl.includes("pricing") || nextUrl.includes("plan") ? (
              <div className="mb-5 flex items-start gap-3 bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-accent">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <p><strong>Please sign in first</strong> to complete your plan upgrade securely.</p>
              </div>
            ) : null}

            <Button
              onClick={handleLogin}
              disabled={loading}
              size="lg"
              className="w-full h-13 rounded-xl bg-gradient-to-r from-accent to-blue-600 hover:opacity-90 text-white font-bold text-base gap-3 shadow-lg shadow-accent/25 py-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Redirecting…
                </span>
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4 rounded-sm" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or</span></div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              size="lg"
              variant="outline"
              className="w-full h-12 rounded-xl font-bold text-sm gap-2"
            >
              ✉️ Continue with Email
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
              By continuing, you agree to our{" "}
              <Link to="/privacy" className="text-accent hover:underline font-medium">Privacy Policy</Link>.
              New users get a free account instantly.
            </p>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { icon: Shield, text: "GDPR Compliant" },
              { icon: CheckCircle2, text: "Free Forever Plan" },
              { icon: Globe2, text: "94+ Countries" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-green-500" />
                {text}
              </div>
            ))}
          </div>

          {/* Mobile features */}
          <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
            {FEATURES.slice(0, 4).map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{f.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}