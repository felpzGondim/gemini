import { NextResponse } from "next/server";
import { getTankWithStatus } from "@/lib/tank-service";
import { deleteTank, updateTank } from "@/lib/tanks-store";
import type { TankAlerts, TankShape } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const tank = await getTankWithStatus(id);
  if (!tank) {
    return NextResponse.json({ error: "Tanque não encontrado." }, { status: 404 });
  }
  return NextResponse.json(tank);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
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

    const tank = await updateTank(id, body);
    if (!tank) {
      return NextResponse.json({ error: "Tanque não encontrado." }, { status: 404 });
    }

    const withStatus = await getTankWithStatus(id);
    return NextResponse.json(withStatus);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar o tanque." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ok = await deleteTank(id);
  if (!ok) {
    return NextResponse.json({ error: "Tanque não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
