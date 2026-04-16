import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Sparkles, CheckCircle2, Globe2, FileText,
  Languages, Target, Star, Shield, Zap, Lock
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
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-[#0a0f1e]">

      {/* ── Left: Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b3e] via-[#0f2460] to-[#0a0f1e]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* TOP: Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-4 group w-fit">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-accent/30 blur-xl scale-110" />
              <img
                src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png"
                alt="Dugosoft"
                className="relative h-16 w-16 object-contain drop-shadow-2xl"
              />
            </div>
            <span className="text-white font-black text-3xl tracking-tight">DUGOSOFT</span>
          </Link>
        </div>

        {/* MIDDLE: Hero copy + features */}
        <div className="relative z-10 space-y-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold mb-5">
                <Sparkles className="w-3 h-3" /> Trusted by 50,000+ professionals
              </div>
              <h2 className="text-4xl font-black text-white leading-tight mb-4">
                Your AI Workspace<br />
                <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
                  for Career Success
                </span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed max-w-md">
                Build standout resumes, translate documents, and land better jobs — all in one powerful platform.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + 0.2 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-white/80 text-xs font-medium leading-tight">{f.text}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Rotating testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/8 backdrop-blur-md rounded-2xl p-5 border border-white/10"
          >
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full ${TESTIMONIALS[testimonialIdx].color} flex items-center justify-center font-bold text-sm shrink-0`}>
                    {TESTIMONIALS[testimonialIdx].avatar}
                  </div>
                  <p className="text-white font-semibold text-sm">{TESTIMONIALS[testimonialIdx].name}</p>
                  <div className="flex ml-auto gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
                <p className="text-white/75 text-sm italic">"{TESTIMONIALS[testimonialIdx].text}"</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* BOTTOM: Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[["50K+", "Active Users"], ["94", "Countries"], ["1M+", "Documents"]].map(([val, lbl]) => (
            <div key={lbl} className="text-center p-4 rounded-2xl bg-white/5 border border-white/8">
              <p className="text-2xl font-black text-white">{val}</p>
              <p className="text-xs text-white/50 mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Auth Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative bg-background">
        {/* Subtle top decoration on right panel */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        {/* Back home */}
        <Link to="/" className="absolute top-5 left-5 z-50">
          <Button variant="outline" size="sm" className="rounded-full gap-2 shadow-sm font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Button>
        </Link>

        {/* Mobile logo — large */}
        <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-accent/20 blur-2xl scale-150" />
            <img
              src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png"
              alt="Dugosoft"
              className="relative h-20 w-20 object-contain"
            />
          </div>
          <span className="font-black text-2xl tracking-tight text-foreground">DUGOSOFT</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo shown LARGE beside title on desktop too (inside right panel) */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative lg:block">
                <div className="absolute inset-0 rounded-2xl bg-accent/25 blur-xl scale-125" />
                <img
                  src="https://media.base44.com/images/public/69c7f271f712e2f213ac7d0b/3cd00a9ca_Gemini_Generated_Image_6abwj06abwj06abw-removebg-preview.png"
                  alt="Dugosoft"
                  className="relative h-16 w-16 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-black text-foreground tracking-tight leading-tight">DUGOSOFT</h1>
                <p className="text-xs text-muted-foreground font-medium">AI Career Platform</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Free plan · No credit card needed
            </div>

            <h2 className="text-xl font-bold text-foreground mb-1">Welcome back 👋</h2>
            <p className="text-muted-foreground text-sm">
              Sign in or create your free account to get started.
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-black/5 mb-6">
            {nextUrl.includes("pricing") || nextUrl.includes("plan") ? (
              <div className="mb-5 flex items-start gap-3 bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-accent">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <p><strong>Please sign in first</strong> to complete your plan upgrade securely.</p>
              </div>
            ) : null}

            {/* Google button */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              size="lg"
              className="w-full h-14 rounded-2xl font-bold text-base gap-3 shadow-lg mb-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                  Redirecting…
                </span>
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5 rounded-sm" />
                  Continue with Google
                </>
              )}
            </Button>

            {/* Email button */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              size="lg"
              className="w-full h-14 rounded-2xl font-bold text-sm gap-2 bg-gradient-to-r from-accent to-blue-600 hover:opacity-90 text-white border-0 shadow-lg shadow-accent/20"
            >
              <Lock className="w-4 h-4" />
              Continue with Email
            </Button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">Secure sign-in powered by Base44</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to our{" "}
              <Link to="/privacy" className="text-accent hover:underline font-medium">Privacy Policy</Link>.
              <br />New users get a free account instantly.
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

          {/* Mobile features grid */}
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