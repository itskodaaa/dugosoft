import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const cycleWords = ["Resumes", "Data", "Documents", "Insights"];

export default function HeroSection({ heroImage }) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cycleWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(213 56% 14% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(213 56% 14% / 0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Gradient orb */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                AI-Powered Document Intelligence
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
                Turn Documents
                <br />
                into{" "}
                <span className="relative inline-block w-[200px] sm:w-[280px] h-[1.2em] align-bottom overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute left-0 text-accent"
                    >
                      {cycleWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
                Build ATS-ready resumes, translate documents, and extract
                structured data using AI — all in one powerful platform.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-12 text-base font-semibold gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/dashboard/resume-builder">
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-semibold border-foreground/20 hover:bg-foreground/5">
                    Try Resume Builder
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl blur-2xl" />
              <img
                src={heroImage}
                alt="AI document intelligence visualization with refractive glass prism"
                className="relative rounded-2xl ink-border shadow-2xl shadow-accent/10"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}