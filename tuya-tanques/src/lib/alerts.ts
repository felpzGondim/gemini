import type { ActiveAlert, TankConfig, TankReading } from "./types";

export function evaluateAlerts(
  tank: TankConfig,
  reading: TankReading,
): ActiveAlert[] {
  if (!tank.alerts.enabled) return [];

  const alerts: ActiveAlert[] = [];
  const now = new Date().toISOString();
  const { percent } = reading;

  if (percent <= tank.alerts.criticalLowPercent) {
    alerts.push({
      id: `${tank.id}-critical-low`,
      tankId: tank.id,
      tankName: tank.name,
      severity: "critical",
      message: `${tank.name} em nível crítico (${percent}%). Abaixo de ${tank.alerts.criticalLowPercent}%.`,
      percent,
      createdAt: now,
    });
  } else if (percent <= tank.alerts.lowPercent) {
    alerts.push({
      id: `${tank.id}-low`,
      tankId: tank.id,
      tankName: tank.name,
      severity: "warning",
      message: `${tank.name} com nível baixo (${percent}%). Limite: ${tank.alerts.lowPercent}%.`,
      percent,
      createdAt: now,
    });
  }

  if (percent >= tank.alerts.highPercent) {
    alerts.push({
      id: `${tank.id}-high`,
      tankId: tank.id,
      tankName: tank.name,
      severity: "warning",
      message: `${tank.name} quase cheia (${percent}%). Limite alto: ${tank.alerts.highPercent}%.`,
      percent,
      createdAt: now,
    });
  }

  if (reading.liquidState === "lower_alarm" && alerts.length === 0) {
    alerts.push({
      id: `${tank.id}-device-low`,
      tankId: tank.id,
      tankName: tank.name,
      severity: "warning",
      message: `${tank.name}: sensor Tuya reportou alarme de nível baixo.`,
      percent,
      createdAt: now,
    });
  }

  if (reading.liquidState === "upper_alarm" && !alerts.some((a) => a.id.endsWith("-high"))) {
    alerts.push({
      id: `${tank.id}-device-high`,
      tankId: tank.id,
      tankName: tank.name,
      severity: "warning",
      message: `${tank.name}: sensor Tuya reportou alarme de nível alto.`,
      percent,
      createdAt: now,
    });
  }

  if (!reading.online) {
    alerts.push({
      id: `${tank.id}-offline`,
      tankId: tank.id,
      tankName: tank.name,
      severity: "critical",
      message: `${tank.name} está offline. Verifique a conexão do sensor.`,
      percent,
      createdAt: now,
    });
  }

  return alerts;
}
