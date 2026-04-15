import React, { useState } from "react";
import { motion } from "framer-motion";
import { MailCheck, RefreshCw, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function EmailVerification({ user, onLogout }) {
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Verify your Dugosoft account",
        body: `Hello ${user.full_name || "there"},\n\nPlease verify your email address to access all Dugosoft features.\n\nIf you have already verified, please log out and log in again.\n\nThank you,\nThe Dugosoft Team`,
      });
      setSent(true);
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to send email. Try again.");
    }
    setResending(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card ink-border rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <MailCheck className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Verify Your Email</h1>
        <p className="text-muted-foreground text-sm mb-2">
          We sent a verification link to:
        </p>
        <p className="font-bold text-foreground mb-6">{user?.email}</p>
        <p className="text-muted-foreground text-sm mb-8">
          Please verify your email to continue using Dugosoft. Check your inbox (and spam folder).
        </p>

        {sent ? (
          <div className="flex items-center justify-center gap-2 text-green-600 font-semibold mb-6">
            <CheckCircle2 className="w-4 h-4" /> Email sent — check your inbox
          </div>
        ) : (
          <Button onClick={handleResend} disabled={resending}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2 mb-3">
            <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Sending..." : "Resend Verification Email"}
          </Button>
        )}

        <button onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mx-auto transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </motion.div>
    </div>
  );
}