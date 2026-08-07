"use client";

type TankGaugeProps = {
  percent: number;
  size?: "sm" | "md" | "lg";
  alert?: "ok" | "warning" | "critical";
};

const SIZE_MAP = {
  sm: 120,
  md: 168,
  lg: 220,
};

export function TankGauge({ percent, size = "md", alert = "ok" }: TankGaugeProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const px = SIZE_MAP[size];
  const fillHeight = `${clamped}%`;

  const waterColor =
    alert === "critical" ? "#c45a5a" : alert === "warning" ? "#d09a3d" : "#3eb7c6";
  const waterBright =
    alert === "critical" ? "#e08a8a" : alert === "warning" ? "#e8c06a" : "#6fd4df";

  return (
    <div
      className="relative mx-auto"
      style={{ width: px, height: px * 1.25 }}
      aria-label={`Nível ${clamped}%`}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: "18% 18% 14% 14% / 10% 10% 18% 18%",
          border: "3px solid rgba(16, 42, 51, 0.18)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(232,242,244,0.9))",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55), var(--shadow)",
        }}
      >
        <div
          className="water-fill absolute inset-x-0 bottom-0"
          style={{ height: fillHeight }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${waterBright}, ${waterColor} 55%, #157a8c)`,
            }}
          />
          <svg
            className="wave-layer absolute -top-3 left-[-10%] w-[120%] h-6"
            viewBox="0 0 120 20"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 10 Q 15 0 30 10 T 60 10 T 90 10 T 120 10 V20 H0 Z"
              fill={waterBright}
              opacity="0.9"
            />
          </svg>
          <svg
            className="wave-layer-slow absolute -top-1 left-[-15%] w-[130%] h-5"
            viewBox="0 0 120 16"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 8 Q 12 0 24 8 T 48 8 T 72 8 T 96 8 T 120 8 V16 H0 Z"
              fill={waterColor}
              opacity="0.55"
            />
          </svg>
        </div>

        {/* Marcas de nível */}
        {[25, 50, 75].map((mark) => (
          <div
            key={mark}
            className="absolute left-2 right-2 border-t border-dashed"
            style={{
              bottom: `${mark}%`,
              borderColor: "rgba(16,42,51,0.12)",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-3 text-center">
        <span
          className="inline-block rounded-md px-2 py-0.5 text-sm font-semibold tracking-tight"
          style={{
            background: "rgba(255,255,255,0.82)",
            color: "var(--ink)",
            backdropFilter: "blur(4px)",
          }}
        >
          {clamped}%
        </span>
      </div>
    </div>
  );
}
