import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Gem, TrendingDown, TrendingUp } from "lucide-react";
import type { RatePoint, RatesData } from "../lib/types";
import { fmtRate } from "../lib/data";
import { lastN, mean, percentile } from "../lib/advice";

const RANGES = [
  { label: "30 天", days: 30 },
  { label: "90 天", days: 90 },
  { label: "一年", days: 365 },
  { label: "全部", days: 9999 },
];

function RateCard({ title, symbol, series, note }: { title: string; symbol: string; series: RatePoint[]; note: string }) {
  const cur = series[series.length - 1];
  const prev = series[series.length - 2];
  const change = cur && prev ? cur.v - prev.v : 0;
  // 分位基于近一年（约 250 个交易日），避免短窗口把正常波动顶到 0%/100% 两端
  const pctY = percentile(series, 250);
  const sliceY = lastN(series, 250);
  const lo = Math.min(...sliceY.map((p) => p.v));
  const hi = Math.max(...sliceY.map((p) => p.v));
  const marker = Math.min(98, Math.max(2, pctY * 100)); // 标尺视觉钳制
  const up = change >= 0;

  return (
    <div className="elven-card p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-heading text-lg font-bold" style={{ color: "#f0d878" }}>{title}</h3>
        <span className="text-xs" style={{ color: "#7e9478" }}>{note}</span>
      </div>
      <div className="mt-3 flex items-end gap-3">
        <span className="num text-4xl font-bold" style={{ color: "#e9e2c9" }}>{cur ? fmtRate(cur.v) : "—"}</span>
        <span className="text-xs" style={{ color: "#9db0a0" }}>{symbol} → 人民币</span>
        {cur && prev && (
          <span className="num flex items-center gap-1 text-sm" style={{ color: up ? "#e07a5f" : "#69b583" }}>
            {up ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {up ? "+" : ""}{change.toFixed(4)}
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg py-2" style={{ background: "rgba(0,0,0,.25)" }}>
          <div style={{ color: "#7e9478" }}>一年最低</div>
          <div className="num mt-1" style={{ color: "#69b583" }}>{isFinite(lo) ? fmtRate(lo) : "—"}</div>
        </div>
        <div className="rounded-lg py-2" style={{ background: "rgba(0,0,0,.25)" }}>
          <div style={{ color: "#7e9478" }}>一年最高</div>
          <div className="num mt-1" style={{ color: "#e07a5f" }}>{isFinite(hi) ? fmtRate(hi) : "—"}</div>
        </div>
        <div className="rounded-lg py-2" style={{ background: "rgba(0,0,0,.25)" }}>
          <div style={{ color: "#7e9478" }}>一年分位</div>
          <div className="num mt-1" style={{ color: "#f0d878" }}>{(pctY * 100).toFixed(0)}%</div>
        </div>
      </div>
      {/* 分位标尺 */}
      <div className="mt-3 h-2 w-full rounded-full" style={{ background: "linear-gradient(90deg,#2e7d52,#c9a227,#b8503f)" }}>
        <div className="relative h-full">
          <div className="absolute -top-1 h-4 w-1 rounded" style={{ left: `calc(${marker.toFixed(1)}% - 2px)`, background: "#f5ecc8" }} />
        </div>
      </div>
      <p className="mt-2 text-xs" style={{ color: "#7e9478" }}>基于近一年约 250 个交易日 · 越靠左越便宜（换汇越划算）</p>
    </div>
  );
}

export default function RatesSection({ rates }: { rates: RatesData | null }) {
  const [range, setRange] = useState(90);
  const [ccy, setCcy] = useState<"NZD" | "GBP">("NZD");

  const chartData = useMemo(() => {
    if (!rates) return [];
    const s = lastN(rates.series[ccy] ?? [], range);
    return s.map((p) => ({ date: p.d.slice(2), value: p.v }));
  }, [rates, ccy, range]);

  const avg = useMemo(() => (rates ? mean(rates.series[ccy] ?? [], Math.min(range, 9999)) : 0), [rates, ccy, range]);

  return (
    <section id="rates" className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="vine-title font-heading text-2xl font-bold" style={{ color: "#f0d878" }}>
        <Gem className="mr-2 inline" size={22} /> 精灵宝库 · 汇率瞭望塔
      </h2>
      <p className="mt-5 text-sm" style={{ color: "#9db0a0" }}>
        纽币（旅费）与英镑（Visa 还款）兑人民币 · 数据来自欧洲央行基准汇率，每个交易日更新
        {rates?.updated && <span className="ml-2">· 更新于 {rates.updated.slice(0, 16).replace("T", " ")}</span>}
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <RateCard title="纽币 NZD" symbol="1 NZD" series={rates?.series.NZD ?? []} note="旅行花销" />
        <RateCard title="英镑 GBP" symbol="1 GBP" series={rates?.series.GBP ?? []} note="Visa 还款" />
      </div>

      {/* 历史曲线 */}
      <div className="elven-card mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["NZD", "GBP"] as const).map((c) => (
              <button key={c} onClick={() => setCcy(c)}
                className="rounded-full px-4 py-1 text-sm transition-colors"
                style={ccy === c
                  ? { background: "rgba(212,175,55,.9)", color: "#1a2416", fontWeight: 700 }
                  : { border: "1px solid rgba(212,175,55,.35)", color: "#c8bd93" }}>
                {c === "NZD" ? "纽币" : "英镑"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button key={r.days} onClick={() => setRange(r.days)}
                className="rounded-full px-3 py-1 text-xs transition-colors"
                style={range === r.days
                  ? { background: "rgba(105,181,131,.9)", color: "#10231a", fontWeight: 700 }
                  : { border: "1px solid rgba(105,181,131,.3)", color: "#9db0a0" }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <XAxis dataKey="date" tick={{ fill: "#7e9478", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "rgba(212,175,55,.2)" }} minTickGap={40} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#7e9478", fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
              <Tooltip
                contentStyle={{ background: "#14261e", border: "1px solid rgba(212,175,55,.4)", borderRadius: 10, color: "#e9e2c9" }}
                labelStyle={{ color: "#f0d878" }}
                formatter={(v) => [fmtRate(Number(v)), ccy === "NZD" ? "纽币/人民币" : "英镑/人民币"]}
              />
              <ReferenceLine y={avg} stroke="#69b583" strokeDasharray="5 4" strokeOpacity={0.7}
                label={{ value: "均值", fill: "#69b583", fontSize: 11, position: "insideTopRight" }} />
              <Line type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: "#f0d878" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
