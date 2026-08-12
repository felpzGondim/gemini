import type { TankConfig, TankShape } from "./types";

/** Volume máximo em litros a partir das dimensões. */
export function capacityFromDimensions(
  shape: TankShape,
  widthOrRadius: number,
  height: number,
  length?: number,
): number {
  const heightM = Math.max(0, height);
  let volumeM3 = 0;

  if (shape === "cylindrical") {
    const radius = Math.max(0, widthOrRadius);
    volumeM3 = Math.PI * radius * radius * heightM;
  } else {
    const width = Math.max(0, widthOrRadius);
    const len = Math.max(0, length ?? widthOrRadius);
    volumeM3 = width * len * heightM;
  }

  return Math.round(volumeM3 * 1000);
}

export function resolveCapacityLiters(tank: TankConfig): number {
  if (tank.capacityLiters && tank.capacityLiters > 0) {
    return tank.capacityLiters;
  }

  return capacityFromDimensions(
    tank.shape,
    tank.dimensions.widthOrRadius,
    tank.dimensions.height,
    tank.dimensions.length,
  );
}

/** Volume atual em litros a partir do percentual. */
export function volumeFromPercent(capacityLiters: number, percent: number): number {
  const clamped = Math.min(100, Math.max(0, percent));
  return Math.round((capacityLiters * clamped) / 100);
}

/** Volume a partir da profundidade medida (m). */
export function volumeFromDepth(tank: TankConfig, depthM: number): number {
  const usefulHeight = Math.max(0.001, tank.dimensions.height);
  const percent = Math.min(100, Math.max(0, (depthM / usefulHeight) * 100));
  return volumeFromPercent(resolveCapacityLiters(tank), percent);
}

export function formatLiters(liters: number): string {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(2)} m³`;
  }
  return `${liters.toLocaleString("pt-BR")} L`;
}
