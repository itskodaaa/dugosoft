/**
 * useAI — frontend hook for all AI service calls.
 * Centralizes error handling, loading states, and usage guard.
 */
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useUsageGuard } from "./useUsageGuard";

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const guard = useUsageGuard("ai_requests");

  const call = async (action, params) => {
    setError(null);
    setLoading(true);
    const token = localStorage.getItem('auth_token');

    // Check usage limit before calling
    const allowed = await guard();
    if (!allowed) {
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch('http://localhost:3001/api/ai/invoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, ...params })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data?.error === "ai_not_configured") {
          setError({ type: "not_configured", message: data.message });
          toast.error("AI service not configured. Contact the administrator.", { duration: 5000 });
          return null;
        }

        if (data?.error === "limit_exceeded") {
          toast.error(data.message, {
            action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/pricing" }
          });
          setError({ type: "limit_exceeded", message: data.message });
          return null;
        }

        const msg = data?.message || "AI request failed";
        setError({ type: "error", message: msg });
        toast.error(msg);
        return null;
      }

      return data.result;
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "AI request failed";
      setError({ type: "error", message: msg });
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { call, loading, error };
}