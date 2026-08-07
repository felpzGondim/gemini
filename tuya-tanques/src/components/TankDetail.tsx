"use client";

import { useEffect, useState } from "react";
import type { TankAlerts, TankWithStatus } from "@/lib/types";
import { formatLiters, resolveCapacityLiters } from "@/lib/volume";
import { TankGauge } from "./TankGauge";

type TankDetailProps = {
  tank: TankWithStatus;
  onClose: () => void;
  onUpdated: () => void;
};

export function TankDetail({ tank, onClose, onUpdated }: TankDetailProps) {
  const [alerts, setAlerts] = useState<TankAlerts>(tank.alerts);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setAlerts(tank.alerts);
    setMessage(null);
  }, [tank]);

  async function saveAlerts() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/tanks/${tank.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alerts }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      setMessage("Alertas atualizados.");
      onUpdated();
    } catch {
      setMessage("Não foi possível salvar os alertas.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTank() {
    if (!confirm(`Remover "${tank.name}"?`)) return;
    const res = await fetch(`/api/tanks/${tank.id}`, { method: "DELETE" });
    if (res.ok) {
      onUpdated();
      onClose();
    }
  }

  const tone = tank.activeAlerts.some((a) => a.severity === "critical")
    ? "critical"
    : tank.activeAlerts.length
      ? "warning"
      : "ok";

  return (
    <div
      className="fade-up fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl p-5 sm:p-6"
        style={{
          background: "var(--foam)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label={tank.name}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="m-0 font-[family-name:var(--font-display)] text-2xl tracking-tight">
              {tank.name}
            </h2>
            <p className="mt-1 mb-0 text-sm" style={{ color: "var(--ink-soft)" }}>
              Sensor Tuya: {tank.tuyaDeviceId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm"
            style={{ border: "1px solid var(--line)", background: "white" }}
          >
            Fechar
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
          <TankGauge percent={tank.reading.percent} size="md" alert={tone} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Volume" value={formatLiters(tank.volumeLiters)} />
            <Stat label="Capacidade" value={formatLiters(resolveCapacityLiters(tank))} />
            <Stat
              label="Profundidade"
              value={`${(tank.reading.liquidDepthM * 100).toFixed(0)} cm`}
            />
            <Stat
              label="Fonte"
              value={tank.reading.source === "tuya" ? "Tuya Cloud" : "Demo"}
            />
          </div>
        </div>

        <section className="mt-6">
          <h3 className="mb-3 mt-0 font-[family-name:var(--font-display)] text-lg">
            Níveis de alerta
          </h3>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={alerts.enabled}
              onChange={(e) => setAlerts((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            Alertas ativos para este tanque
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField
              label="Baixo %"
              value={alerts.lowPercent}
              onChange={(lowPercent) => setAlerts((prev) => ({ ...prev, lowPercent }))}
            />
            <NumberField
              label="Crítico %"
              value={alerts.criticalLowPercent}
              onChange={(criticalLowPercent) =>
                setAlerts((prev) => ({ ...prev, criticalLowPercent }))
              }
            />
            <NumberField
              label="Alto %"
              value={alerts.highPercent}
              onChange={(highPercent) => setAlerts((prev) => ({ ...prev, highPercent }))}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={saveAlerts}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--teal-deep)" }}
            >
              {saving ? "Salvando..." : "Salvar alertas"}
            </button>
            <button
              type="button"
              onClick={removeTank}
              className="rounded-xl px-4 py-2 text-sm"
              style={{
                border: "1px solid rgba(179,58,58,0.35)",
                color: "var(--alert-crit)",
                background: "rgba(179,58,58,0.06)",
              }}
            >
              Remover tanque
            </button>
          </div>
          {message && (
            <p className="mt-3 mb-0 text-sm" style={{ color: "var(--ink-soft)" }}>
              {message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: "white", border: "1px solid var(--line)" }}
    >
      <div className="text-xs" style={{ color: "var(--ink-soft)" }}>
        {label}
      </div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-xl px-3 py-2"
        style={{ border: "1px solid var(--line)", background: "white" }}
      />
    </label>
  );
}
