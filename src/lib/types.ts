export interface RatePoint {
  d: string;
  v: number;
}

export interface RatesData {
  updated: string;
  source: string;
  series: Record<"NZD" | "GBP", RatePoint[]>;
}

export interface FlightOffer {
  price: number;
  airlines: string[];
  stops: number;
  dur: number | null; // 分钟
  dep: string;
  arr: string;
  flight: string;
}

export interface FlightSnap {
  t: string; // 记录时间
  low: number;
  offers: FlightOffer[];
}

// routes[航线][出行日期] = 历史快照（按记录时间升序）
export interface FlightsData {
  updated: string | null;
  routes: Record<string, Record<string, FlightSnap[]>>;
}

export const AIRPORT_CN: Record<string, string> = {
  PVG: "上海浦东",
  NKG: "南京禄口",
  PEK: "北京首都",
  CTU: "成都天府",
  AKL: "奥克兰",
  ZQN: "皇后镇",
};

export const OUTBOUND_DATES = ["2027-01-26", "2027-01-27", "2027-01-28", "2027-01-29"];
export const INBOUND_DATES = ["2027-02-11", "2027-02-12"];
export const OUTBOUND_ORIGINS = ["PVG", "NKG", "PEK", "CTU"];
export const INBOUND_DESTS = ["PVG", "NKG", "PEK", "CTU"];

/** 距离 2027-01-26 出发日的天数 */
export function daysToDeparture(now = new Date()): number {
  const target = new Date("2027-01-26T00:00:00+13:00");
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}
