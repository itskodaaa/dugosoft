import React from "react";

export default function ProcessingBorder({ processing, children, className = "" }) {
  return (
    <div className={`relative rounded-xl ${className}`}>
      {processing && (
        <div
          className="absolute -inset-[2px] rounded-xl animate-race-border"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(219 100% 61%), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      )}
      <div className="relative bg-card rounded-xl">
        {children}
      </div>
    </div>
  );
}