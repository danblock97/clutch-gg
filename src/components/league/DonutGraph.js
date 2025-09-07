import React from "react";

// Subtle circular score indicator for dark theme
export default function DonutGraph({ score = 0, result = "win", height = 36, width = 36 }) {
  const size = Math.max(Number(width) || 36, Number(height) || 36);
  const stroke = Math.max(3, Math.floor(size * 0.12));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = circumference * (1 - value / 100);

  const colors = {
    win: getCssVar("--success", "#10b981"),
    loss: getCssVar("--error", "#ef4444"),
    neutral: "#64748b", // slate-500
  };

  const ringColor = result === "loss" ? colors.loss : result === "neutral" ? colors.neutral : colors.win;
  const trackColor = "rgba(255,255,255,0.08)";

  return (
    <div
      className="relative flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-white/90"
      style={{ width: size, height: size }}
      aria-label={`C-Score ${value}`}
      title={`C-Score: ${value}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="relative z-10 font-semibold" style={{ fontSize: Math.max(10, Math.floor(size * 0.35)) }}>
        {Math.round(value)}
      </div>
    </div>
  );
}

function getCssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}
