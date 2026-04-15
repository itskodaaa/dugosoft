import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

// Pricing by region
export const REGION_PRICES = {
  global: { pro: 12, business: 29, currency: "USD", label: "Global" },
  africa: { pro: 4,  business: 12, currency: "USD", label: "Africa" },
};

// Countries classified as "africa" region
const AFRICA_COUNTRIES = new Set([
  "NG","GH","KE","ZA","TZ","UG","SN","CM","CI","ET","RW","ZM","ZW","MW","MZ","AO","MG","BJ","BF","ML","NE","GN","CD","TG","GA","BI","MR","SL","LR","GM","GW","ER","DJ","SO","SS","SD","TD","CF","CG","GQ","ST","CV","KM","SC","MU","NA","BW","LS","SZ","EG","MA","DZ","TN","LY","LR"
]);

async function detectRegionByIP() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return AFRICA_COUNTRIES.has(data.country_code) ? "africa" : "global";
  } catch {
    // Fallback: use browser locale
    const lang = navigator.language || "";
    return "global";
  }
}

export function useGeoPrice() {
  const { user, setUser } = useAuth();
  const [region, setRegion] = useState(user?.user_region || "global");
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    if (user?.user_region) {
      setRegion(user.user_region);
      return;
    }
    // Auto-detect if no saved region
    setDetecting(true);
    detectRegionByIP().then(async (detected) => {
      setRegion(detected);
      await base44.auth.updateMe({ user_region: detected });
      if (setUser) setUser(prev => ({ ...prev, user_region: detected }));
    }).finally(() => setDetecting(false));
  }, [user?.id]);

  const setManualRegion = async (r) => {
    setRegion(r);
    await base44.auth.updateMe({ user_region: r });
    if (setUser) setUser(prev => ({ ...prev, user_region: r }));
  };

  const prices = REGION_PRICES[region] || REGION_PRICES.global;

  return { region, prices, detecting, setManualRegion };
}