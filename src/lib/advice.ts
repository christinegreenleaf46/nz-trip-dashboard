import type { FlightsData, RatePoint } from "./types";
import { daysToDeparture } from "./types";

export interface Advice {
  icon: "ring" | "gem" | "plane" | "compass";
  title: string;
  text: string;
  tone: "good" | "warn" | "info";
}

/** 最近 N 个交易日切片 */
export function lastN(series: RatePoint[], n: number): RatePoint[] {
  return series.slice(-n);
}

/** 当前值在过去 N 日数据中的分位（0~1，越低越便宜） */
export function percentile(series: RatePoint[], n: number): number {
  const slice = lastN(series, n);
  if (!slice.length) return 0.5;
  const cur = slice[slice.length - 1].v;
  const below = slice.filter((p) => p.v <= cur).length;
  return below / slice.length;
}

export function mean(series: RatePoint[], n: number): number {
  const slice = lastN(series, n);
  if (!slice.length) return 0;
  return slice.reduce((s, p) => s + p.v, 0) / slice.length;
}

export function rateAdvice(ccyName: string, series: RatePoint[]): Advice {
  if (!series.length) {
    return { icon: "gem", title: `${ccyName}汇率`, text: "数据加载中…", tone: "info" };
  }
  const cur = series[series.length - 1].v;
  const pctY = percentile(series, 250);
  const avg90 = mean(series, 90);
  const diff = ((cur - avg90) / avg90) * 100;

  if (pctY <= 0.25) {
    return {
      icon: "gem",
      title: `${ccyName} · 近一年低位`,
      text: `当前 1 ${ccyName === "纽币" ? "NZD" : "GBP"} ≈ ${cur.toFixed(4)} 元，处于近一年 ${(pctY * 100).toFixed(0)}% 分位（低于 90 日均值 ${Math.abs(diff).toFixed(1)}%）。甘道夫说：可以考虑分批换汇，先把旅费底仓建起来。`,
      tone: "good",
    };
  }
  if (pctY >= 0.75) {
    return {
      icon: "gem",
      title: `${ccyName} · 近一年高位`,
      text: `当前汇率处于近一年 ${(pctY * 100).toFixed(0)}% 分位（高于 90 日均值 ${diff.toFixed(1)}%）。建议观望或只换少量急用额度，等回落再补仓。`,
      tone: "warn",
    };
  }
  return {
    icon: "gem",
    title: `${ccyName} · 中位震荡`,
    text: `当前汇率在近一年中位附近（${(pctY * 100).toFixed(0)}% 分位）。可换 1/3 底仓，剩余分批跟随行情，平滑波动风险。`,
    tone: "info",
  };
}

export function flightAdvice(flights: FlightsData | null): Advice[] {
  const out: Advice[] = [];
  const days = daysToDeparture();

  if (days > 150) {
    out.push({
      icon: "compass",
      title: "购票窗口 · 尚早",
      text: `距出发还有 ${days} 天。国际航线通常在提前 2–5 个月出现较好价格，现在以观察和建立价格基准为主。`,
      tone: "info",
    });
  } else if (days > 60) {
    out.push({
      icon: "compass",
      title: "购票窗口 · 黄金期",
      text: `距出发 ${days} 天，正处于国际票价的传统低位窗口（提前 2–5 个月）。一旦看到低于近期均价的报价，建议果断出手。`,
      tone: "good",
    });
  } else {
    out.push({
      icon: "compass",
      title: "购票窗口 · 尾声",
      text: `距出发仅 ${days} 天！临近出发票价大概率上行，请尽快锁定机票，不要再等"更便宜"。`,
      tone: "warn",
    });
  }

  if (flights?.routes) {
    let best: { route: string; date: string; low: number } | null = null;
    const allLows: number[] = [];
    for (const [route, dates] of Object.entries(flights.routes)) {
      for (const [date, snaps] of Object.entries(dates)) {
        const last = snaps[snaps.length - 1];
        if (!last) continue;
        allLows.push(last.low);
        if (!best || last.low < best.low) best = { route, date, low: last.low };
      }
    }
    if (best && allLows.length >= 5) {
      const avg = allLows.reduce((s, v) => s + v, 0) / allLows.length;
      const discount = ((avg - best.low) / avg) * 100;
      out.push({
        icon: "plane",
        title: discount >= 5 ? "机票 · 出现好价" : "机票 · 行情跟踪中",
        text:
          `目前全网最低：${best.route.replace("-", " → ")} ${best.date}，人均 ¥${Math.round(best.low).toLocaleString("zh-CN")}` +
          `（3 人约 ¥${Math.round(best.low * 3).toLocaleString("zh-CN")}），` +
          (discount >= 5
            ? `低于跟踪均价 ${discount.toFixed(1)}%，可以认真考虑入手。下单前记得点页面里的去哪网/Trip 链接再比一次价。`
            : `与跟踪均价持平。继续观察，页面会每天更新。`),
        tone: discount >= 5 ? "good" : "info",
      });
    } else {
      out.push({
        icon: "plane",
        title: "机票 · 数据积累中",
        text: "机票价格历史还在积累（云端任务每天自动记录）。积累几天后，这里会给出「当前价 vs 近期均价」的买入建议。现在可以先点下方比价链接感受行情。",
        tone: "info",
      });
    }
  }
  return out;
}
