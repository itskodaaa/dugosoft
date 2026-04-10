import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, CheckCircle2, Globe2, FileText, Languages,
  ScanText, Target, MessageCircle, Zap, Star, Users, TrendingUp,
  Shield, Play, RefreshCw, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobeVisualization from "../components/landing/GlobeVisualization";
import PricingSection from "../components/landing/PricingSection";
import Footer from "../components/landing/Footer";
import Navbar from "../components/landing/Navbar";

const HERO_WORDS = ["Documents", "Resumes", "Careers", "Teams", "Growth"];

const LIVE_STATS = [
  { label: "Users Online",           value: "2,847",  delta: "+12",   color: "text-green-500" },
  { label: "Docs Processed Today",   value: "14,392", delta: "+234",  color: "text-accent" },
  { label: "Resumes Optimized",      value: "8,615",  delta: "+87",   color: "text-orange-500" },
  { label: "AI Matches Completed",   value: "3,211",  delta: "+45",   color: "text-purple-500" },
  { label: "Languages Translated",   value: "11,840", delta: "+310",  color: "text-emerald-500" },
  { label: "Countries Active",       value: "94",     delta: "+3",    color: "text-blue-500" },
];

const FEATURES = [
  { icon: RefreshCw,     title: "Document Converter",  desc: "Convert PDF, Word, Excel, Images and more with lightning speed.",         color: "from-orange-500 to-amber-400",   bg: "bg-orange-500/10" },
  { icon: Languages,     title: "AI Translator",       desc: "Translate documents into 50+ languages preserving formatting perfectly.",  color: "from-blue-500 to-cyan-400",      bg: "bg-blue-500/10" },
  { icon: ScanText,      title: "OCR & Extraction",    desc: "Extract text from scanned PDFs and images with 99% accuracy.",            color: "from-purple-500 to-violet-400",  bg: "bg-purple-500/10" },
  { icon: FileText,      title: "Resume Builder",      desc: "Create ATS-optimized resumes with professional templates and AI help.",    color: "from-accent to-blue-400",        bg: "bg-accent/10" },
  { icon: Target,        title: "Career Matcher",      desc: "Get your ATS score, missing skills, and matching jobs worldwide.",         color: "from-green-500 to-emerald-400",  bg: "bg-green-500/10" },
  { icon: Globe2,        title: "CV Vault",            desc: "Store your CV translated in 12+ languages, shareable and downloadable.",  color: "from-emerald-500 to-teal-400",   bg: "bg-emerald-500/10" },
  { icon: MessageCircle, title: "Chat with Document",  desc: "Ask questions, summarize, and extract insights from any document.",       color: "from-pink-500 to-rose-400",      bg: "bg-pink-500/10" },
  { icon: Users,         title: "Team Workspaces",     desc: "Collaborate with your team on documents with granular permissions.",       color: "from-indigo-500 to-blue-400",    bg: "bg-indigo-500/10" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Upload or paste",   desc: "Drop any document, paste text, or import from LinkedIn." },
  { step: "02", title: "AI processes it",   desc: "Our AI analyzes, converts, translates, or enhances your content." },
  { step: "03", title: "Get results",       desc: "Download, share, or save to your vault in seconds." },
];

const TESTIMONIALS = [
  { name: "Sofia Melo", role: "Product Manager, Lisbon", text: "Softdugo translated my CV into 4 languages in minutes. Got interviews in Germany, France, and the UK!", avatar: "SM", color: "bg-orange-100 text-orange-600" },
  { name: "James Okafor", role: "Software Engineer, Lagos", text: "The AI Career Matcher is insane. It told me exactly which skills I was missing and even gave me job links.", avatar: "JO", color: "bg-green-100 text-green-600" },
  { name: "Nina Patel", role: "Recruiter, Singapore", text: "We use Workspaces for all our hiring docs. The team collaboration features are exactly what we needed.", avatar: "NP", color: "bg-blue-100 text-blue-600" },
  { name: "Marco Bianchi", role: "Consultant, Milan", text: "The country-adapted CV for Italy was spot on — right format, right tone. Saved me hours of manual work.", avatar: "MB", color: "bg-purple-100 text-purple-600" },
];

const TRUST = [
  { label: "Documents Processed", value: "1M+" },
  { label: "Active Users",        value: "50K+" },
  { label: "Countries",           value: "94" },
  { label: "Uptime",              value: "99.9%" },
];

export default function Landing() {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(p => (p + 1) % HERO_WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[100px]" />
          <div className="absolute top-0 left-1/3 w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" /> AI-Powered · Used in 94+ Countries
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight mb-4">
                Your AI Workspace<br />for{" "}
                <span className="relative inline-block">
                  <AnimatePresence mode="wait">
                    <motion.span key={wordIdx}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.35 }}
                      className="inline-block bg-gradient-to-r from-orange-500 via-accent to-green-500 bg-clip-text text-transparent">
                      {HERO_WORDS[wordIdx]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                Convert, translate, build resumes, match careers, and collaborate — all in one premium platform powered by AI.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-accent to-blue-600 hover:opacity-90 text-white rounded-full px-8 font-bold shadow-lg shadow-accent/25 gap-2 h-12">
                    Start Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 font-bold gap-2">
                  <Play className="w-4 h-4 fill-current" /> Watch Demo
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4">
                {["No credit card required", "Free plan available", "GDPR compliant"].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Globe */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center justify-center relative">
              <GlobeVisualization />
              {/* Floating stats */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                className="absolute top-10 right-0 bg-card/90 backdrop-blur border border-border rounded-2xl p-3 shadow-xl text-xs">
                <p className="font-bold text-foreground">2,847 users online</p>
                <p className="text-green-500 font-semibold">● Live worldwide</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
                className="absolute bottom-20 left-0 bg-card/90 backdrop-blur border border-border rounded-2xl p-3 shadow-xl text-xs">
                <p className="font-bold text-foreground">14,392 docs today</p>
                <p className="text-accent font-semibold">+234 last hour</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST METRICS ── */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {TRUST.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-3xl font-black text-foreground mb-1">{t.value}</p>
                <p className="text-sm text-muted-foreground">{t.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE ACTIVITY ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Platform Activity
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3">Dugosoft in Action, Right Now</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Real-time activity across the platform as teams worldwide get work done.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {LIVE_STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-card ink-border rounded-2xl p-6 flex items-center gap-4 hover:shadow-md transition-all">
                <div>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
                </div>
                <div className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${s.color.replace("text-","bg-").replace("500","500/10")} ${s.color}`}>
                  {s.delta}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl font-black text-foreground mb-3">Everything You Need in One Platform</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From converting your first document to landing your dream job globally.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="group bg-card ink-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4`}>
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl font-black text-foreground mb-3">Simple Workflow, Powerful Results</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="text-center relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] h-px border-t-2 border-dashed border-border" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                  <span className="text-2xl font-black text-white">{s.step}</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl font-black text-foreground mb-3">Loved by Professionals Worldwide</h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              <span className="ml-2 text-sm text-muted-foreground font-medium">4.9/5 from 2,400+ reviews</span>
            </div>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-card ink-border rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-sm shrink-0`}>{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* ── CTA BANNER ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-green-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(0,0,0,0.2) 0%, transparent 50%)" }} />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black mb-4">Ready to Transform Your Career?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Join 50,000+ professionals using Dugosoft to convert, optimize, and advance globally.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/95 font-bold rounded-full px-10 h-12 gap-2">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-white/60 text-xs mt-4">Free plan available · No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}