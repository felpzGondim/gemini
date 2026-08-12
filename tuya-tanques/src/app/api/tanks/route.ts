import { NextResponse } from "next/server";
import { getAllTanksWithStatus } from "@/lib/tank-service";
import { createTank } from "@/lib/tanks-store";
import type { TankAlerts, TankShape } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAllTanksWithStatus();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      location?: string;
      tuyaDeviceId?: string;
      shape?: TankShape;
      capacityLiters?: number;
      dimensions?: {
        widthOrRadius: number;
        length?: number;
        height: number;
      };
      alerts?: TankAlerts;
    };

    if (!body.name?.trim() || !body.tuyaDeviceId?.trim()) {
      return NextResponse.json(
        { error: "Nome e ID do dispositivo Tuya são obrigatórios." },
        { status: 400 },
      );
    }

    const shape: TankShape = body.shape === "rectangular" ? "rectangular" : "cylindrical";
    const dimensions = body.dimensions ?? {
      widthOrRadius: 0.55,
      height: 1,
      length: shape === "rectangular" ? 1 : undefined,
    };

    const alerts: TankAlerts = body.alerts ?? {
      lowPercent: 25,
      criticalLowPercent: 12,
      highPercent: 95,
      enabled: true,
    };

    const tank = await createTank({
      name: body.name,
      location: body.location,
      tuyaDeviceId: body.tuyaDeviceId,
      shape,
      capacityLiters: body.capacityLiters,
      dimensions,
      alerts,
    });

    return NextResponse.json(tank, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar o tanque." }, { status: 500 });
  }
}
