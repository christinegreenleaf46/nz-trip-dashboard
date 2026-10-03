import { useEffect, useState } from "react";

/** 读取 public/data 下的 JSON（带 no-cache，保证每天看到最新） */
export function useJson<T>(file: string): { data: T | null; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`data/${file}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => alive && setData(j as T))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, [file]);

  return { data, error };
}

export function fmtMoney(n: number): string {
  return "¥" + Math.round(n).toLocaleString("zh-CN");
}

export function fmtRate(n: number): string {
  return n.toFixed(4);
}

export function fmtDuration(min: number | null): string {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}小时${m}分` : `${h}小时`;
}

export function fmtTime(s: string): string {
  // "2027-01-26 14:35" -> "14:35"
  const parts = s.split(" ");
  return parts[1] || s;
}

export function fmtDateCN(d: string): string {
  const [, m, day] = d.split("-");
  return `${Number(m)}月${Number(day)}日`;
}

export function weekdayCN(d: string): string {
  const w = ["日", "一", "二", "三", "四", "五", "六"][new Date(d + "T12:00:00").getDay()];
  return `周${w}`;
}
