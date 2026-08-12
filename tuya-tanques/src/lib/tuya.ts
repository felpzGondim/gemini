import crypto from "crypto";
import type { LiquidState, TankReading } from "./types";

const REGION_BASE: Record<string, string> = {
  us: "https://openapi.tuyaus.com",
  eu: "https://openapi.tuyaeu.com",
  cn: "https://openapi.tuyacn.com",
  in: "https://openapi.tuyain.com",
  /** América Latina / Brasil costuma usar Western America */
  westus: "https://openapi-ueaz.tuyaus.com",
};

type TokenCache = {
  accessToken: string;
  expireAt: number;
};

let tokenCache: TokenCache | null = null;

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function isTuyaConfigured(): boolean {
  return Boolean(env("TUYA_ACCESS_ID") && env("TUYA_ACCESS_SECRET"));
}

function baseUrl(): string {
  const region = (env("TUYA_REGION") || "us").toLowerCase();
  return REGION_BASE[region] ?? REGION_BASE.us;
}

function signPayload(
  accessId: string,
  secret: string,
  timestamp: string,
  method: string,
  pathWithQuery: string,
  body: string,
  accessToken = "",
): string {
  const contentHash = crypto.createHash("sha256").update(body).digest("hex");
  const stringToSign = [method.toUpperCase(), contentHash, "", pathWithQuery].join("\n");
  const signStr = accessId + accessToken + timestamp + stringToSign;
  return crypto.createHmac("sha256", secret).update(signStr, "utf8").digest("hex").toUpperCase();
}

async function getAccessToken(): Promise<string> {
  const accessId = env("TUYA_ACCESS_ID");
  const secret = env("TUYA_ACCESS_SECRET");
  if (!accessId || !secret) {
    throw new Error("Credenciais Tuya não configuradas (TUYA_ACCESS_ID / TUYA_ACCESS_SECRET).");
  }

  if (tokenCache && tokenCache.expireAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const path = "/v1.0/token?grant_type=1";
  const timestamp = String(Date.now());
  const signature = signPayload(accessId, secret, timestamp, "GET", path, "");

  const response = await fetch(`${baseUrl()}${path}`, {
    method: "GET",
    headers: {
      client_id: accessId,
      sign: signature,
      t: timestamp,
      sign_method: "HMAC-SHA256",
    },
    cache: "no-store",
  });

  const json = (await response.json()) as {
    success: boolean;
    msg?: string;
    result?: { access_token: string; expire_time: number };
  };

  if (!json.success || !json.result?.access_token) {
    throw new Error(json.msg || "Falha ao obter token Tuya");
  }

  tokenCache = {
    accessToken: json.result.access_token,
    expireAt: Date.now() + (json.result.expire_time || 7200) * 1000,
  };

  return tokenCache.accessToken;
}

async function tuyaRequest<T>(method: string, path: string): Promise<T> {
  const accessId = env("TUYA_ACCESS_ID")!;
  const secret = env("TUYA_ACCESS_SECRET")!;
  const accessToken = await getAccessToken();
  const timestamp = String(Date.now());
  const signature = signPayload(accessId, secret, timestamp, method, path, "", accessToken);

  const response = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: {
      client_id: accessId,
      access_token: accessToken,
      sign: signature,
      t: timestamp,
      sign_method: "HMAC-SHA256",
    },
    cache: "no-store",
  });

  const json = (await response.json()) as {
    success: boolean;
    msg?: string;
    result?: T;
  };

  if (!json.success) {
    throw new Error(json.msg || `Erro na API Tuya (${path})`);
  }

  return json.result as T;
}

type StatusItem = { code: string; value: string | number | boolean };

function parseScale(value: number, scale: number): number {
  return value / 10 ** scale;
}

function toLiquidState(value: unknown): LiquidState {
  if (value === "normal" || value === "lower_alarm" || value === "upper_alarm") {
    return value;
  }
  if (value === "low" || value === "lower") return "lower_alarm";
  if (value === "high" || value === "upper") return "upper_alarm";
  return "unknown";
}

function readingFromStatus(
  status: StatusItem[],
  online: boolean,
): TankReading {
  const map = new Map(status.map((item) => [item.code, item.value]));

  const percentRaw = map.get("liquid_level_percent");
  const depthRaw = map.get("liquid_depth");
  const stateRaw = map.get("liquid_state");

  let percent = typeof percentRaw === "number" ? percentRaw : Number(percentRaw ?? NaN);
  let liquidDepthM =
    typeof depthRaw === "number" ? parseScale(depthRaw, 2) : Number(depthRaw ?? NaN);

  if (!Number.isFinite(percent)) percent = 0;
  if (!Number.isFinite(liquidDepthM)) liquidDepthM = 0;

  return {
    percent: Math.min(100, Math.max(0, percent)),
    liquidDepthM,
    liquidState: toLiquidState(stateRaw),
    online,
    updatedAt: new Date().toISOString(),
    source: "tuya",
  };
}

export async function fetchTuyaDeviceReading(deviceId: string): Promise<TankReading> {
  if (!deviceId) {
    throw new Error("Device ID Tuya não informado");
  }

  const [status, state] = await Promise.all([
    tuyaRequest<StatusItem[]>(
      "GET",
      `/v1.0/iot-03/devices/${encodeURIComponent(deviceId)}/status`,
    ).catch(async () =>
      tuyaRequest<StatusItem[]>(
        "GET",
        `/v2.0/cloud/thing/${encodeURIComponent(deviceId)}/shadow/properties`,
      ).then((props) => {
        // Formato alternativo: properties -> status items
        if (Array.isArray(props)) return props;
        const maybe = props as unknown as { properties?: StatusItem[] };
        return maybe.properties ?? [];
      }),
    ),
    tuyaRequest<{ online?: boolean }>(
      "GET",
      `/v1.0/iot-03/devices/${encodeURIComponent(deviceId)}`,
    ).catch(() => ({ online: true })),
  ]);

  return readingFromStatus(status ?? [], Boolean(state?.online ?? true));
}
