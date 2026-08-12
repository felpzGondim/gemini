import { promises as fs } from "fs";
import path from "path";
import { DEMO_TANKS } from "./demo-data";
import type { AppConfig, TankAlerts, TankConfig, TankShape } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tanks.json");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initial: AppConfig = { tanks: DEMO_TANKS };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

export async function readConfig(): Promise<AppConfig> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as AppConfig;
  if (!parsed.tanks || !Array.isArray(parsed.tanks)) {
    return { tanks: DEMO_TANKS };
  }
  return parsed;
}

async function writeConfig(config: AppConfig): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(config, null, 2), "utf8");
}

export async function listTanks(): Promise<TankConfig[]> {
  const config = await readConfig();
  return config.tanks;
}

export async function getTank(id: string): Promise<TankConfig | null> {
  const tanks = await listTanks();
  return tanks.find((tank) => tank.id === id) ?? null;
}

export type UpsertTankInput = {
  name: string;
  location?: string;
  tuyaDeviceId: string;
  shape: TankShape;
  capacityLiters?: number;
  dimensions: TankConfig["dimensions"];
  alerts: TankAlerts;
};

function createId(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "tanque"}-${Date.now().toString(36)}`;
}

export async function createTank(input: UpsertTankInput): Promise<TankConfig> {
  const config = await readConfig();
  const now = new Date().toISOString();
  const tank: TankConfig = {
    id: createId(input.name),
    name: input.name.trim(),
    location: input.location?.trim() || undefined,
    tuyaDeviceId: input.tuyaDeviceId.trim(),
    shape: input.shape,
    capacityLiters: input.capacityLiters,
    dimensions: input.dimensions,
    alerts: input.alerts,
    createdAt: now,
    updatedAt: now,
  };
  config.tanks.push(tank);
  await writeConfig(config);
  return tank;
}

export async function updateTank(
  id: string,
  input: Partial<UpsertTankInput>,
): Promise<TankConfig | null> {
  const config = await readConfig();
  const index = config.tanks.findIndex((tank) => tank.id === id);
  if (index < 0) return null;

  const current = config.tanks[index];
  const updated: TankConfig = {
    ...current,
    ...input,
    name: input.name?.trim() || current.name,
    location: input.location !== undefined ? input.location.trim() || undefined : current.location,
    tuyaDeviceId: input.tuyaDeviceId?.trim() || current.tuyaDeviceId,
    dimensions: input.dimensions ?? current.dimensions,
    alerts: input.alerts ?? current.alerts,
    updatedAt: new Date().toISOString(),
  };

  config.tanks[index] = updated;
  await writeConfig(config);
  return updated;
}

export async function deleteTank(id: string): Promise<boolean> {
  const config = await readConfig();
  const next = config.tanks.filter((tank) => tank.id !== id);
  if (next.length === config.tanks.length) return false;
  await writeConfig({ tanks: next });
  return true;
}
