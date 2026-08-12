"use client";

import type { ActiveAlert } from "@/lib/types";

type AlertBannerProps = {
  alerts: ActiveAlert[];
};

const SEVERITY_STYLE: Record<
  ActiveAlert["severity"],
  { bg: string; border: string; label: string }
> = {
  critical: {
    bg: "rgba(179, 58, 58, 0.1)",
    border: "rgba(179, 58, 58, 0.35)",
    label: "Crítico",
  },
  warning: {
    bg: "rgba(196, 122, 34, 0.12)",
    border: "rgba(196, 122, 34, 0.4)",
    label: "Atenção",
  },
  info: {
    bg: "rgba(21, 122, 140, 0.1)",
    border: "rgba(21, 122, 140, 0.3)",
    label: "Info",
  },
};

export function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts.length) {
    return (
      <div
        className="fade-up rounded-2xl px-4 py-3 text-sm"
        style={{
          background: "rgba(47, 143, 107, 0.1)",
          border: "1px solid rgba(47, 143, 107, 0.28)",
          color: "var(--ok)",
        }}
      >
        Todos os tanques dentro dos níveis configurados.
      </div>
    );
  }

  return (
    <div className="fade-up flex flex-col gap-2">
      {alerts.map((alert) => {
        const style = SEVERITY_STYLE[alert.severity];
        return (
          <div
            key={alert.id}
            className="rounded-2xl px-4 py-3 text-sm"
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              color: "var(--ink)",
            }}
          >
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] opacity-70">
              {style.label}
            </div>
            <p className="m-0 leading-snug">{alert.message}</p>
          </div>
        );
      })}
    </div>
  );
}
