import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateAlerts } from "./alerts";
import type { TankConfig, TankReading } from "./types";
import {
  capacityFromDimensions,
  resolveCapacityLiters,
  volumeFromPercent,
} from "./volume";

describe("volume", () => {
  it("calcula capacidade cilíndrica em litros", () => {
    const liters = capacityFromDimensions("cylindrical", 0.5, 1);
    assert.equal(liters, Math.round(Math.PI * 0.5 * 0.5 * 1 * 1000));
  });

  it("calcula capacidade retangular em litros", () => {
    const liters = capacityFromDimensions("rectangular", 2, 1, 2.5);
    assert.equal(liters, 5000);
  });

  it("converte percentual em volume", () => {
    assert.equal(volumeFromPercent(1000, 68), 680);
    assert.equal(volumeFromPercent(1000, 0), 0);
    assert.equal(volumeFromPercent(1000, 150), 1000);
  });

  it("prioriza capacityLiters quando informado", () => {
    const tank = {
      capacityLiters: 1000,
      shape: "cylindrical" as const,
      dimensions: { widthOrRadius: 10, height: 10 },
    };
    assert.equal(resolveCapacityLiters(tank as TankConfig), 1000);
  });
});

describe("alerts", () => {
  const tank: TankConfig = {
    id: "t1",
    name: "Teste",
    tuyaDeviceId: "dev",
    shape: "cylindrical",
    capacityLiters: 1000,
    dimensions: { widthOrRadius: 0.5, height: 1 },
    alerts: {
      lowPercent: 25,
      criticalLowPercent: 12,
      highPercent: 95,
      enabled: true,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const baseReading: TankReading = {
    percent: 50,
    liquidDepthM: 0.5,
    liquidState: "normal",
    online: true,
    updatedAt: "2026-01-01T00:00:00.000Z",
    source: "demo",
  };

  it("dispara alerta crítico em nível muito baixo", () => {
    const alerts = evaluateAlerts(tank, { ...baseReading, percent: 10 });
    assert.ok(alerts.some((a) => a.severity === "critical"));
  });

  it("dispara alerta alto perto do topo", () => {
    const alerts = evaluateAlerts(tank, { ...baseReading, percent: 97 });
    assert.ok(alerts.some((a) => a.id.endsWith("-high")));
  });

  it("não alerta quando desabilitado", () => {
    const alerts = evaluateAlerts(
      { ...tank, alerts: { ...tank.alerts, enabled: false } },
      { ...baseReading, percent: 5 },
    );
    assert.equal(alerts.length, 0);
  });
});
