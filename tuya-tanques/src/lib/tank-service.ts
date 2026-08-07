import { evaluateAlerts } from "./alerts";
import { demoReadingForTank } from "./demo-data";
import { fetchTuyaDeviceReading, isTuyaConfigured } from "./tuya";
import { getTank, listTanks } from "./tanks-store";
import type { ActiveAlert, TankConfig, TankWithStatus } from "./types";
import { resolveCapacityLiters, volumeFromPercent } from "./volume";

async function readTankStatus(tank: TankConfig): Promise<TankWithStatus> {
  const useDemo =
    process.env.TUYA_DEMO_MODE === "true" ||
    !isTuyaConfigured() ||
    tank.tuyaDeviceId.startsWith("demo-");

  let reading;
  if (useDemo) {
    reading = demoReadingForTank(tank);
  } else {
    try {
      reading = await fetchTuyaDeviceReading(tank.tuyaDeviceId);
    } catch (error) {
      console.error(`Falha ao ler dispositivo ${tank.tuyaDeviceId}:`, error);
      reading = {
        ...demoReadingForTank(tank),
        online: false,
        source: "demo" as const,
      };
    }
  }

  const capacity = resolveCapacityLiters(tank);
  const volumeLiters = volumeFromPercent(capacity, reading.percent);
  const activeAlerts = evaluateAlerts(tank, reading);

  return {
    ...tank,
    reading,
    volumeLiters,
    activeAlerts,
  };
}

export async function getAllTanksWithStatus(): Promise<{
  tanks: TankWithStatus[];
  alerts: ActiveAlert[];
  mode: "tuya" | "demo";
}> {
  const tanks = await listTanks();
  const withStatus = await Promise.all(tanks.map((tank) => readTankStatus(tank)));
  const alerts = withStatus.flatMap((tank) => tank.activeAlerts);
  const mode =
    process.env.TUYA_DEMO_MODE === "true" || !isTuyaConfigured() ? "demo" : "tuya";

  return { tanks: withStatus, alerts, mode };
}

export async function getTankWithStatus(id: string): Promise<TankWithStatus | null> {
  const tank = await getTank(id);
  if (!tank) return null;
  return readTankStatus(tank);
}
