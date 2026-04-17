import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  X, Loader2, BarChart3, Sparkles, ChevronUp, ChevronDown
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const REGIONS = [
  { id: "us", label: "United States", flag: "🇺🇸" },
  { id: "uk", label: "United Kingdom", flag: "🇬🇧" },
  { id: "eu", label: "Europe (avg)", flag: "🇪🇺" },
  { id: "ca", label: "Canada", flag: "🇨🇦" },
  { id: "au", label: "Australia", flag: "🇦🇺" },
  { id: "ng", label: "Nigeria", flag: "🇳🇬" },
  { id: "in", label: "India", flag: "🇮🇳" },
  { id: "sg", label: "Singapore", flag: "🇸🇬" },
];

function BarRow({ label, min, max, currency, maxVal }) {
  const pMin = (min / maxVal) * 100;
  const pMax = (max / maxVal) * 100;
  const width = pMax - pMin;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-muted rounded-full relative overflow-hidden">
        <div
          className="absolute top-0 h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
          style={{ left: `${pMin}%`, width: `${Math.max(width, 4)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-32 shrink-0 text-right">
        {currency}{(min/1000).toFixed(0)}k – {currency}{(max/1000).toFixed(0)}k
      </span>
    </div>
  );
}

export default function SalaryAnalysisModal({ job, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeRegion, setActiveRegion] = useState("us");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compensation benchmarking expert. Provide realistic salary data for the following role across multiple global regions.

Job Title: ${job.title}
Company Type: ${job.company}
Required Skills: ${(job.skills || []).join(", ")}

Return salary ranges (min/max in local currency) for each region, plus insights on market demand, negotiation tips, and top-paying companies for this role. Be realistic and data-driven.`,
        response_json_schema: {
          type: "object",
          properties: {
            role_summary: { type: "string" },
            market_demand: { type: "string", description: "high, medium, or low" },
            yoy_growth: { type: "number", description: "Year-over-year salary growth percentage" },
            regions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  region_id: { type: "string" },
                  currency: { type: "string" },
                  currency_symbol: { type: "string" },
                  min_salary: { type: "number" },
                  max_salary: { type: "number" },
                  median_salary: { type: "number" },
                  remote_premium: { type: "number", description: "% premium for remote work" }
                }
              }
            },
            top_paying_companies: { type: "array", items: { type: "string" } },
            negotiation_tips: { type: "array", items: { type: "string" } },
            high_value_skills: { type: "array", items: { type: "string" } }
          }
        }
      });
      setData(res);
    } catch {
      toast.error("Failed to fetch salary data.");
    }
    setLoading(false);
  };

  const activeData = data?.regions?.find(r => r.region_id === activeRegion) || data?.regions?.[0];
  const maxVal = data?.regions ? Math.max(...data.regions.map(r => r.max_salary)) : 1;

  const demandColor = {
    high: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-red-100 text-red-700 border-red-200",
  }[data?.market_demand?.toLowerCase()] || "bg-muted text-muted-foreground";

  const yoy = data?.yoy_growth || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" /> Salary Benchmark
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{job.title} · AI-powered global market data</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-sm text-muted-foreground">Benchmarking salaries across global markets…</p>
            </div>
          ) : data ? (
            <>
              {/* Summary pills */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`border text-xs px-3 py-1 ${demandColor}`}>
                  Market Demand: {data.market_demand}
                </Badge>
                <Badge className={`border text-xs px-3 py-1 ${yoy >= 0 ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                  {yoy >= 0 ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                  {Math.abs(yoy)}% YoY Growth
                </Badge>
              </div>

              {/* Region selector */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Region</p>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(r => {
                    const rData = data.regions?.find(d => d.region_id === r.id);
                    if (!rData) return null;
                    return (
                      <button key={r.id} onClick={() => setActiveRegion(r.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          activeRegion === r.id
                            ? "bg-accent text-white border-accent shadow-sm"
                            : "bg-card border-border text-muted-foreground hover:border-accent/40"
                        }`}>
                        <span>{r.flag}</span> {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active region card */}
              {activeData && (
                <motion.div key={activeRegion} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-accent/5 to-blue-500/5 border border-accent/20 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {REGIONS.find(r => r.id === activeRegion)?.flag} {REGIONS.find(r => r.id === activeRegion)?.label}
                      </p>
                      <p className="text-3xl font-black text-foreground">
                        {activeData.currency_symbol}{(activeData.median_salary / 1000).toFixed(0)}k
                        <span className="text-sm font-normal text-muted-foreground ml-2">median / year</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Range: {activeData.currency_symbol}{(activeData.min_salary/1000).toFixed(0)}k – {activeData.currency_symbol}{(activeData.max_salary/1000).toFixed(0)}k
                      </p>
                    </div>
                    {activeData.remote_premium > 0 && (
                      <div className="bg-green-100 border border-green-200 rounded-xl px-3 py-2 text-center">
                        <p className="text-[10px] text-green-700 font-bold">Remote Premium</p>
                        <p className="text-lg font-black text-green-700">+{activeData.remote_premium}%</p>
                      </div>
                    )}
                  </div>
                  {/* Salary bar */}
                  <div className="w-full h-4 bg-muted rounded-full overflow-hidden relative">
                    <div className="absolute top-0 h-full rounded-full bg-gradient-to-r from-accent/50 to-accent"
                      style={{
                        left: `${(activeData.min_salary / activeData.max_salary) * 100 * 0.3}%`,
                        width: "60%"
                      }}
                    />
                    <div className="absolute top-0 h-full w-0.5 bg-white/80"
                      style={{ left: `${(activeData.median_salary / activeData.max_salary) * 100 * 0.6 + 15}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Min: {activeData.currency_symbol}{(activeData.min_salary/1000).toFixed(0)}k</span>
                    <span className="text-accent font-bold">Median: {activeData.currency_symbol}{(activeData.median_salary/1000).toFixed(0)}k</span>
                    <span>Max: {activeData.currency_symbol}{(activeData.max_salary/1000).toFixed(0)}k</span>
                  </div>
                </motion.div>
              )}

              {/* All regions comparison */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Global Comparison</p>
                <div className="space-y-2.5">
                  {data.regions?.map(r => {
                    const regionInfo = REGIONS.find(ri => ri.id === r.region_id);
                    return (
                      <BarRow
                        key={r.region_id}
                        label={`${regionInfo?.flag || ""} ${regionInfo?.label || r.region_id}`}
                        min={r.min_salary}
                        max={r.max_salary}
                        currency={r.currency_symbol}
                        maxVal={maxVal}
                      />
                    );
                  })}
                </div>
              </div>

              {/* High-value skills */}
              {data.high_value_skills?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Skills That Increase Salary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.high_value_skills.map((s, i) => (
                      <span key={i} className="text-xs bg-accent/10 text-accent border border-accent/20 px-2.5 py-1 rounded-full font-semibold">
                        +{s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top companies */}
              {data.top_paying_companies?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Paying Companies</p>
                  <div className="flex flex-wrap gap-2">
                    {data.top_paying_companies.map((c, i) => (
                      <span key={i} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Negotiation tips */}
              {data.negotiation_tips?.length > 0 && (
                <div className="bg-muted/40 rounded-2xl p-4">
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" /> Negotiation Tips
                  </p>
                  <ul className="space-y-1.5">
                    {data.negotiation_tips.map((t, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-accent font-bold shrink-0">{i + 1}.</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}