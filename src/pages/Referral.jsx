import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, CheckCircle2, Users, Calendar, Loader2, Share2, Twitter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const STATUS_CFG = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-700" },
  completed: { label: "Joined",    cls: "bg-blue-100 text-blue-700" },
  rewarded:  { label: "Rewarded",  cls: "bg-green-100 text-green-700" },
};

export default function Referral() {
  const { user, setUser } = useAuth();
  const [referralCode, setReferralCode] = useState(user?.referral_code || "");
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const referralLink = referralCode
    ? `${window.location.origin}?ref=${referralCode}`
    : "";

  useEffect(() => {
    if (user?.referral_code) {
      setReferralCode(user.referral_code);
    }
    if (user?.id) {
      base44.entities.Referral.filter({ referrer_id: user.id })
        .then(setReferrals)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateReferralCode", {});
      const code = res.data?.referral_code;
      setReferralCode(code);
      setUser(prev => ({ ...prev, referral_code: code }));
      toast.success("Referral code generated!");
    } catch {
      toast.error("Failed to generate code.");
    }
    setGenerating(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const submitReferralCode = async () => {
    if (!inputCode.trim()) return;
    setSubmitting(true);
    try {
      await base44.functions.invoke("referralSignup", { referral_code: inputCode.trim().toUpperCase() });
      toast.success("Referral applied! Your referrer earned a reward.");
      setUser(prev => ({ ...prev, referred_by: inputCode.trim().toUpperCase() }));
      setInputCode("");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Invalid or already used referral code.");
    }
    setSubmitting(false);
  };

  const completedReferrals = referrals.filter(r => r.status !== "pending").length;
  const credits = user?.referral_credits || 0;

  return (
    <div className="max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2 mb-1">
          <Gift className="w-6 h-6 text-accent" /> Referral Program
        </h1>
        <p className="text-muted-foreground text-sm">Invite friends to Dugosoft. Earn 7 days of free Pro when they sign up <strong>and purchase any plan</strong>.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Referrals", value: referrals.length, color: "text-accent" },
          { label: "Successful",      value: completedReferrals, color: "text-green-600" },
          { label: "Days Earned",     value: credits, color: "text-amber-500" },
        ].map((s, i) => (
          <div key={i} className="bg-card ink-border rounded-2xl p-4 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card ink-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-foreground">Your Referral Link</h2>
          </div>

          {referralCode ? (
            <>
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
                <code className="text-sm text-foreground flex-1 truncate font-mono">{referralLink}</code>
                <Button size="sm" variant="ghost" onClick={copyLink} className="gap-1.5 h-8 text-xs shrink-0">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </Button>
              </div>
              <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Your code: <code className="text-accent">{referralCode}</code></p>
                  <p className="text-xs text-muted-foreground">You earn 7 free Pro days when your friend purchases any paid plan</p>
                </div>
              </div>
              {/* Share buttons */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`Join Dugosoft with my link and get started for free! ${referralLink}`)}`, color: "bg-[#25D366] text-white" },
                  { label: "Twitter",  href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I use Dugosoft for AI career tools — join with my referral link! ${referralLink}`)}`, color: "bg-[#1DA1F2] text-white" },
                  { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, color: "bg-[#0A66C2] text-white" },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-90 ${s.color}`}>
                    <Share2 className="w-3 h-3" /> {s.label}
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">Generate your unique referral link to start earning rewards.</p>
              <Button onClick={generateCode} disabled={generating} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-2">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                Generate Referral Link
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Enter a referral code */}
      {!user?.referred_by && (
        <div className="bg-card ink-border rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-foreground text-sm">Have a referral code?</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code (e.g. DGS-AB12-XY34)"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <Button onClick={submitReferralCode} disabled={submitting || !inputCode.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        </div>
      )}
      {user?.referred_by && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          You signed up with referral code <code className="font-mono font-bold">{user.referred_by}</code>
        </div>
      )}

      {/* Referral list */}
      <div className="bg-card ink-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-bold text-foreground text-sm">Your Referrals</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
        ) : referrals.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No referrals yet. Share your link to get started!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {referrals.map((r, i) => {
              const cfg = STATUS_CFG[r.status] || STATUS_CFG.pending;
              return (
                <div key={r.id || i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                    {(r.referred_email?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.referred_email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(r.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                  {r.status !== "pending" && (
                    <span className="text-xs text-green-600 font-bold">+{r.reward_days}d</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-muted/40 rounded-2xl p-5">
        <h3 className="font-bold text-foreground text-sm mb-3">How it works</h3>
        <div className="space-y-2">
          {[
            "Generate your unique referral link above",
            "Share it with friends, colleagues, or on social media",
            "Your friend signs up and purchases any paid plan (Pro or Business)",
            "You earn 7 free Pro days — credits stack with no limit!",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}