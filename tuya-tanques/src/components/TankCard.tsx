"use client";

import type { TankWithStatus } from "@/lib/types";
import { formatLiters, resolveCapacityLiters } from "@/lib/volume";
import { TankGauge } from "./TankGauge";

type TankCardProps = {
  tank: TankWithStatus;
  onSelect: (id: string) => void;
};

function alertTone(tank: TankWithStatus): "ok" | "warning" | "critical" {
  if (tank.activeAlerts.some((a) => a.severity === "critical")) return "critical";
  if (tank.activeAlerts.length > 0) return "warning";
  return "ok";
}

export function TankCard({ tank, onSelect }: TankCardProps) {
  const tone = alertTone(tank);
  const capacity = resolveCapacityLiters(tank);

  return (
    <button
      type="button"
      onClick={() => onSelect(tank.id)}
      className="group w-full rounded-3xl p-5 text-left transition duration-300 hover:-translate-y-0.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 font-[family-name:var(--font-display)] text-xl tracking-tight">
            {tank.name}
          </h3>
          <p className="mt-1 mb-0 text-sm" style={{ color: "var(--ink-soft)" }}>
            {tank.location || "Sem local definido"}
          </p>
        </div>
        <span
          className="rounded-md px-2 py-1 text-xs font-medium"
          style={{
            background:
              tank.reading.online
                ? "rgba(47, 143, 107, 0.12)"
                : "rgba(179, 58, 58, 0.12)",
            color: tank.reading.online ? "var(--ok)" : "var(--alert-crit)",
          }}
        >
          {tank.reading.online ? "Online" : "Offline"}
        </span>
      </div>

      <TankGauge percent={tank.reading.percent} alert={tone} />

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div style={{ color: "var(--ink-soft)" }}>Volume</div>
          <div className="font-semibold">{formatLiters(tank.volumeLiters)}</div>
        </div>
        <div>
          <div style={{ color: "var(--ink-soft)" }}>Capacidade</div>
          <div className="font-semibold">{formatLiters(capacity)}</div>
        </div>
        <div>
          <div style={{ color: "var(--ink-soft)" }}>Profundidade</div>
          <div className="font-semibold">
            {(tank.reading.liquidDepthM * 100).toFixed(0)} cm
          </div>
        </div>
        <div>
          <div style={{ color: "var(--ink-soft)" }}>Alertas</div>
          <div className="font-semibold">
            {tank.alerts.enabled
              ? `${tank.alerts.lowPercent}% / ${tank.alerts.highPercent}%`
              : "Desligados"}
          </div>
        </div>
      </div>
    </button>
  );
}
