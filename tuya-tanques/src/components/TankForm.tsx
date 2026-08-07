"use client";

import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { TankShape } from "@/lib/types";

type TankFormProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const inputStyle: CSSProperties = {
  width: "100%",
  marginTop: "0.35rem",
  borderRadius: "0.75rem",
  border: "1px solid var(--line)",
  background: "white",
  padding: "0.55rem 0.75rem",
};

export function TankForm({ open, onClose, onCreated }: TankFormProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [tuyaDeviceId, setTuyaDeviceId] = useState("");
  const [shape, setShape] = useState<TankShape>("cylindrical");
  const [capacityLiters, setCapacityLiters] = useState(1000);
  const [widthOrRadius, setWidthOrRadius] = useState(0.55);
  const [length, setLength] = useState(1);
  const [height, setHeight] = useState(1.05);
  const [lowPercent, setLowPercent] = useState(25);
  const [criticalLowPercent, setCriticalLowPercent] = useState(12);
  const [highPercent, setHighPercent] = useState(95);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/tanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          tuyaDeviceId,
          shape,
          capacityLiters,
          dimensions: {
            widthOrRadius,
            length: shape === "rectangular" ? length : undefined,
            height,
          },
          alerts: {
            lowPercent,
            criticalLowPercent,
            highPercent,
            enabled: true,
          },
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Erro ao criar");
      }

      setName("");
      setLocation("");
      setTuyaDeviceId("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tanque");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fade-up fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-5 sm:p-6"
        style={{
          background: "var(--foam)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 font-[family-name:var(--font-display)] text-2xl tracking-tight">
            Nova caixa d&apos;água
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm"
            style={{ border: "1px solid var(--line)", background: "white" }}
          >
            Fechar
          </button>
        </div>

        <div className="grid gap-3">
          <Field label="Nome">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Caixa da casa"
              style={inputStyle}
            />
          </Field>
          <Field label="Local">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Telhado"
              style={inputStyle}
            />
          </Field>
          <Field label="ID do dispositivo Tuya">
            <input
              required
              value={tuyaDeviceId}
              onChange={(e) => setTuyaDeviceId(e.target.value)}
              placeholder="device_id da Tuya Cloud"
              style={inputStyle}
            />
          </Field>

          <Field label="Formato">
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as TankShape)}
              style={inputStyle}
            >
              <option value="cylindrical">Cilíndrica</option>
              <option value="rectangular">Retangular</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacidade (L)">
              <input
                type="number"
                min={1}
                value={capacityLiters}
                onChange={(e) => setCapacityLiters(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
            <Field label="Altura útil (m)">
              <input
                type="number"
                min={0.1}
                step={0.01}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
            <Field label={shape === "cylindrical" ? "Raio (m)" : "Largura (m)"}>
              <input
                type="number"
                min={0.1}
                step={0.01}
                value={widthOrRadius}
                onChange={(e) => setWidthOrRadius(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
            {shape === "rectangular" && (
              <Field label="Comprimento (m)">
                <input
                  type="number"
                  min={0.1}
                  step={0.01}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  style={inputStyle}
                />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Alerta baixo %">
              <input
                type="number"
                min={0}
                max={100}
                value={lowPercent}
                onChange={(e) => setLowPercent(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
            <Field label="Crítico %">
              <input
                type="number"
                min={0}
                max={100}
                value={criticalLowPercent}
                onChange={(e) => setCriticalLowPercent(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
            <Field label="Alto %">
              <input
                type="number"
                min={0}
                max={100}
                value={highPercent}
                onChange={(e) => setHighPercent(Number(e.target.value))}
                style={inputStyle}
              />
            </Field>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm" style={{ color: "var(--alert-crit)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white"
          style={{ background: "var(--teal-deep)" }}
        >
          {saving ? "Salvando..." : "Adicionar tanque"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      {children}
    </label>
  );
}
