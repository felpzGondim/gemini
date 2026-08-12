export type TankShape = "cylindrical" | "rectangular";

export type AlertSeverity = "info" | "warning" | "critical";

export type LiquidState = "normal" | "lower_alarm" | "upper_alarm" | "unknown";

export interface TankAlerts {
  /** Alerta quando o nível fica abaixo deste percentual */
  lowPercent: number;
  /** Alerta crítico quando o nível fica abaixo deste percentual */
  criticalLowPercent: number;
  /** Alerta quando o nível fica acima deste percentual */
  highPercent: number;
  enabled: boolean;
}

export interface TankConfig {
  id: string;
  name: string;
  location?: string;
  /** ID do dispositivo na nuvem Tuya */
  tuyaDeviceId: string;
  shape: TankShape;
  /** Capacidade total em litros (opcional se dimensões forem informadas) */
  capacityLiters?: number;
  /** Dimensões em metros */
  dimensions: {
    /** Raio (cilíndrico) ou largura (retangular) */
    widthOrRadius: number;
    /** Comprimento — só retangular */
    length?: number;
    /** Altura útil da coluna d'água em metros */
    height: number;
  };
  alerts: TankAlerts;
  createdAt: string;
  updatedAt: string;
}

export interface TankReading {
  percent: number;
  /** Profundidade do líquido em metros */
  liquidDepthM: number;
  liquidState: LiquidState;
  online: boolean;
  updatedAt: string;
  source: "tuya" | "demo";
}

export interface ActiveAlert {
  id: string;
  tankId: string;
  tankName: string;
  severity: AlertSeverity;
  message: string;
  percent: number;
  createdAt: string;
}

export interface TankWithStatus extends TankConfig {
  reading: TankReading;
  volumeLiters: number;
  activeAlerts: ActiveAlert[];
}

export interface AppConfig {
  tanks: TankConfig[];
}
