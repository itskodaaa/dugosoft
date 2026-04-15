import React from "react";
import { Globe, ChevronDown, MapPin } from "lucide-react";
import { REGION_PRICES } from "@/lib/useGeoPrice";

export default function GeoPricingBadge({ region, onChangeRegion, detecting }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {region === "africa" && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 border border-green-300 text-xs font-semibold text-green-800">
          <MapPin className="w-3 h-3" />
          Regional pricing applied 🌍
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <select
          value={region}
          onChange={e => onChangeRegion(e.target.value)}
          disabled={detecting}
          className="text-xs font-medium text-foreground bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none"
          style={{ backgroundImage: "none" }}
        >
          {Object.entries(REGION_PRICES).map(([key, val]) => (
            <option key={key} value={key}>{val.label} pricing</option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-muted-foreground -ml-3" />
      </div>
    </div>
  );
}