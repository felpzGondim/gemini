import type { TankConfig, TankReading } from "./types";

/** Três caixas de demonstração — úteis sem credenciais Tuya. */
export const DEMO_TANKS: TankConfig[] = [
  {
    id: "demo-casa",
    name: "Caixa da Casa",
    location: "Telhado principal",
    tuyaDeviceId: "demo-device-casa",
    shape: "cylindrical",
    capacityLiters: 1000,
    dimensions: {
      widthOrRadius: 0.55,
      height: 1.05,
    },
    alerts: {
      lowPercent: 25,
      criticalLowPercent: 12,
      highPercent: 95,
      enabled: true,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-reserva",
    name: "Reservatório Inferior",
    location: "Área de serviço",
    tuyaDeviceId: "demo-device-reserva",
    shape: "rectangular",
    capacityLiters: 5000,
    dimensions: {
      widthOrRadius: 2,
      length: 2.5,
      height: 1,
    },
    alerts: {
      lowPercent: 30,
      criticalLowPercent: 15,
      highPercent: 92,
      enabled: true,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-poco",
    name: "Caixa do Poço",
    location: "Fundo do quintal",
    tuyaDeviceId: "demo-device-poco",
    shape: "cylindrical",
    capacityLiters: 2000,
    dimensions: {
      widthOrRadius: 0.75,
      height: 1.15,
    },
    alerts: {
      lowPercent: 20,
      criticalLowPercent: 10,
      highPercent: 90,
      enabled: true,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

/** Níveis base para o modo demo (variam levemente ao longo do tempo). */
const DEMO_BASE_PERCENT: Record<string, number> = {
  "demo-casa": 68,
  "demo-reserva": 18,
  "demo-poco": 96,
};

function wobble(seed: string, amplitude = 3): number {
  const minutes = Math.floor(Date.now() / 60_000);
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 97;
  }
  const wave = Math.sin((minutes + hash) / 4) * amplitude;
  return wave;
}

export function demoReadingForTank(tank: TankConfig): TankReading {
  const base = DEMO_BASE_PERCENT[tank.id] ?? 55;
  const percent = Math.min(100, Math.max(0, Math.round(base + wobble(tank.id))));
  const liquidDepthM = (percent / 100) * tank.dimensions.height;

  let liquidState: TankReading["liquidState"] = "normal";
  if (percent <= tank.alerts.criticalLowPercent || percent <= tank.alerts.lowPercent) {
    liquidState = "lower_alarm";
  } else if (percent >= tank.alerts.highPercent) {
    liquidState = "upper_alarm";
  }

  return {
    percent,
    liquidDepthM: Number(liquidDepthM.toFixed(3)),
    liquidState,
    online: true,
    updatedAt: new Date().toISOString(),
    source: "demo",
  };
}
