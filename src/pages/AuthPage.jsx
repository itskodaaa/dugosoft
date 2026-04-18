import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft, Sparkles, Globe2, FileText,
  Languages, Target, Star, Shield, Zap, Lock, Mail, User
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
  const { login, register, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  const nextUrl = new URLSearchParams(window.location.search).get("next") || "/dashboard";

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(p => (p + 1) % TESTIMONIALS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
      } else {
        await register(formData);
        toast.success("Account created successfully!");
      }
      navigate(nextUrl);
    } catch (error) {
      toast.error(error.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-[#0a0f1e]">

      {/* ── Left: Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b3e] via-[#0f2460] to-[#0a0f1e]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

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

        <div className="relative z-10 space-y-10">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/8 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
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
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <Link to="/" className="absolute top-5 left-5 z-50">
          <Button variant="outline" size="sm" className="rounded-full gap-2 shadow-sm font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-foreground mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Enter your credentials to access your workspace" : "Join 50,000+ professionals today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-black/5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      className="pl-10 h-11 rounded-xl"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="h-11 rounded-xl"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-11 rounded-xl"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-xl"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-accent to-blue-600 shadow-lg shadow-accent/20 mt-2"
            >
              {isLoadingAuth ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-accent hover:underline font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing, you agree to our{" "}
            <Link to="/privacy" className="text-accent hover:underline font-medium">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}