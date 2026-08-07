"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActiveAlert, TankWithStatus } from "@/lib/types";
import { formatLiters } from "@/lib/volume";
import { AlertBanner } from "./AlertBanner";
import { TankCard } from "./TankCard";
import { TankDetail } from "./TankDetail";
import { TankForm } from "./TankForm";

type ApiResponse = {
  tanks: TankWithStatus[];
  alerts: ActiveAlert[];
  mode: "tuya" | "demo";
};

export function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tanks", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao carregar tanques");
      const json = (await res.json()) as ApiResponse;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 30_000);
    return () => clearInterval(timer);
  }, [load]);

  const selected = data?.tanks.find((tank) => tank.id === selectedId) ?? null;
  const totalVolume = data?.tanks.reduce((sum, tank) => sum + tank.volumeLiters, 0) ?? 0;

  return (
    <div className="app-shell mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <header className="fade-up mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--teal)" }}
            >
              Monitoramento Tuya
            </p>
            <h1 className="brand-mark m-0 font-[family-name:var(--font-display)] text-5xl leading-none sm:text-6xl">
              AquaNível
            </h1>
            <p className="mt-3 max-w-xl text-base sm:text-lg" style={{ color: "var(--ink-soft)" }}>
              Acompanhe o volume das suas caixas d&apos;água e receba alertas nos níveis que você
              configurar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{ border: "1px solid var(--line)", background: "white" }}
            >
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--teal-deep)" }}
            >
              Adicionar tanque
            </button>
          </div>
        </div>
      </header>

      {loading && !data && (
        <p className="fade-up" style={{ color: "var(--ink-soft)" }}>
          Carregando tanques...
        </p>
      )}

      {error && (
        <p className="fade-up" style={{ color: "var(--alert-crit)" }}>
          {error}
        </p>
      )}

      {data && (
        <>
          <section className="fade-up fade-up-delay-1 mb-6 grid gap-3 sm:grid-cols-3">
            <Summary
              label="Tanques"
              value={String(data.tanks.length)}
              hint={data.mode === "demo" ? "Modo demonstração" : "Conectado à Tuya"}
            />
            <Summary
              label="Volume total"
              value={formatLiters(totalVolume)}
              hint="Soma dos níveis atuais"
            />
            <Summary
              label="Alertas ativos"
              value={String(data.alerts.length)}
              hint={data.alerts.length ? "Verifique os avisos abaixo" : "Tudo sob controle"}
            />
          </section>

          <section className="fade-up fade-up-delay-2 mb-8">
            <AlertBanner alerts={data.alerts} />
          </section>

          <section className="fade-up fade-up-delay-3">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="m-0 font-[family-name:var(--font-display)] text-2xl tracking-tight">
                Suas caixas
              </h2>
              <p className="m-0 text-sm" style={{ color: "var(--ink-soft)" }}>
                Atualiza a cada 30s
              </p>
            </div>

            {data.tanks.length === 0 ? (
              <div
                className="rounded-3xl p-8 text-center"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                }}
              >
                <p className="mt-0 mb-4" style={{ color: "var(--ink-soft)" }}>
                  Nenhum tanque cadastrado ainda.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "var(--teal-deep)" }}
                >
                  Cadastrar primeiro tanque
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.tanks.map((tank) => (
                  <TankCard key={tank.id} tank={tank} onSelect={setSelectedId} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {selected && (
        <TankDetail
          tank={selected}
          onClose={() => setSelectedId(null)}
          onUpdated={() => void load()}
        />
      )}

      <TankForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => void load()}
      />
    </div>
  );
}

function Summary({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--teal)" }}>
        {label}
      </div>
      <div className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
        {hint}
      </div>
    </div>
  );
}
