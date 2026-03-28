import React from "react";

export default function InputModeToggle({ modes, active, onChange }) {
  return (
    <div className="inline-flex items-center bg-muted rounded-lg p-1 gap-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = active === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}