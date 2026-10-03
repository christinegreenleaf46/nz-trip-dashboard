import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plane, ExternalLink, Compass } from "lucide-react";
import type { FlightsData, FlightSnap } from "../lib/types";
import { AIRPORT_CN, OUTBOUND_DATES, INBOUND_DATES, OUTBOUND_ORIGINS, INBOUND_DESTS } from "../lib/types";
import { fmtMoney, fmtDuration, fmtTime, fmtDateCN, weekdayCN } from "../lib/data";

/** 比价跳转链接（实时价格请以下单页为准） */
function qunarUrl(depCN: string, arrCN: string, date: string) {
  return `https://flight.qunar.com/site/oneway_list.htm?searchDepartureAirport=${encodeURIComponent(depCN)}&searchArrivalAirport=${encodeURIComponent(arrCN)}&searchDepartureTime=${date}&nextNDays=0&startSearch=true&fromCode=${depCN}&toCode=${arrCN}&from=qunarindex`;
}
function tripUrl(dep: string, arr: string, date: string) {
  return `https://flights.trip.com/online/list/oneway-${dep.toLowerCase()}-${arr.toLowerCase()}?depdate=${date}&cabin=y&adult=1&child=0&infant=0`;
}

function priceColor(low: number | null, allLows: number[]): string {
  if (low == null) return "rgba(255,255,255,.06)";
  const lo = Math.min(...allLows);
  const hi = Math.max(...allLows);
  if (hi === lo) return "rgba(201,162,39,.5)";
  const t = (low - lo) / (hi - lo); // 0 最便宜 → 1 最贵
  if (t <= 0.33) return "rgba(46,125,82,.65)";
  if (t <= 0.66) return "rgba(201,162,39,.5)";
  return "rgba(184,80,63,.55)";
}

export default function FlightsSection({ flights }: { flights: FlightsData | null }) {
  const [direction, setDirection] = useState<"out" | "in">("out");
  const [airport, setAirport] = useState("PVG");
  const [selDate, setSelDate] = useState(OUTBOUND_DATES[0]);
  const [stopFilter, setStopFilter] = useState<"all" | "direct" | "conn">("all");

  const dates = direction === "out" ? OUTBOUND_DATES : INBOUND_DATES;
  const route = direction === "out" ? `${airport}-AKL` : `ZQN-${airport}`;
  const dateMap = flights?.routes?.[route] ?? {};

  const allLows = useMemo(
    () => Object.values(dateMap).map((s) => s[s.length - 1]?.low).filter((v): v is number => typeof v === "number"),
    [dateMap]
  );

  const effDate = dates.includes(selDate) ? selDate : dates[0];
  const snaps: FlightSnap[] = dateMap[effDate] ?? [];
  const latest = snaps[snaps.length - 1];
  const shownOffers = latest
    ? latest.offers.filter((o) => (stopFilter === "all" ? true : stopFilter === "direct" ? o.stops === 0 : o.stops > 0))
    : [];

  const history = useMemo(
    () => snaps.map((s) => ({ time: s.t.slice(5, 10), low: s.low })),
    [snaps]
  );

  const depCN = direction === "out" ? AIRPORT_CN[airport] : AIRPORT_CN.ZQN;
  const arrCN = direction === "out" ? AIRPORT_CN.AKL : AIRPORT_CN[airport];
  const depCode = direction === "out" ? airport : "ZQN";
  const arrCode = direction === "out" ? "AKL" : airport;
  const hasAnyData = !!flights?.routes && Object.keys(flights.routes).length > 0;

  return (
    <section id="flights" className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="vine-title font-heading text-2xl font-bold" style={{ color: "#f0d878" }}>
        <Plane className="mr-2 inline" size={22} /> 巨鹰驿站 · 机票行情
      </h2>
      <p className="mt-5 text-sm" style={{ color: "#9db0a0" }}>
        票价为航司官方发布价（Google Flights，单人经济舱），报价同时涵盖直飞与中转组合；云端每天自动记录 2 条航线、周日加查远途航线，轮换覆盖全部组合
        {flights?.updated && <span className="ml-2">· 更新于 {flights.updated.slice(0, 16).replace("T", " ")}</span>}
      </p>

      {/* 方向与出发地选择 */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {([["out", "去程 · 到奥克兰"], ["in", "返程 · 皇后镇出发"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => { setDirection(k); setSelDate(k === "out" ? OUTBOUND_DATES[0] : INBOUND_DATES[0]); }}
              className="rounded-full px-4 py-1.5 text-sm"
              style={direction === k
                ? { background: "rgba(212,175,55,.9)", color: "#1a2416", fontWeight: 700 }
                : { border: "1px solid rgba(212,175,55,.35)", color: "#c8bd93" }}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(direction === "out" ? OUTBOUND_ORIGINS : INBOUND_DESTS).map((a) => (
            <button key={a} onClick={() => setAirport(a)}
              className="rounded-full px-3 py-1.5 text-xs"
              style={airport === a
                ? { background: "rgba(105,181,131,.9)", color: "#10231a", fontWeight: 700 }
                : { border: "1px solid rgba(105,181,131,.3)", color: "#9db0a0" }}>
              {AIRPORT_CN[a]}
            </button>
          ))}
        </div>
      </div>

      {/* 日期热力格 */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {dates.map((d) => {
          const cell = dateMap[d];
          const low = cell?.[cell.length - 1]?.low ?? null;
          const active = effDate === d;
          return (
            <button key={d} onClick={() => setSelDate(d)}
              className="rounded-xl p-4 text-left transition-transform hover:-translate-y-0.5"
              style={{
                background: priceColor(low, allLows.length ? allLows : [0, 1]),
                border: active ? "2px solid #f0d878" : "1px solid rgba(212,175,55,.2)",
              }}>
              <div className="text-sm font-bold" style={{ color: "#f5ecc8" }}>{fmtDateCN(d)} <span className="text-xs font-normal">{weekdayCN(d)}</span></div>
              <div className="num mt-2 text-xl font-bold" style={{ color: "#fff" }}>
                {low != null ? fmtMoney(low) : "待采集"}
              </div>
              <div className="mt-1 text-xs" style={{ color: "rgba(245,236,200,.75)" }}>
                {low != null ? `单人 · ${cell!.length} 次记录` : "轮换计划中"}
              </div>
            </button>
          );
        })}
      </div>

      {/* 报价明细 + 历史 */}
      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="elven-card p-5 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-heading text-base font-bold" style={{ color: "#f0d878" }}>
              {AIRPORT_CN[depCode]} → {AIRPORT_CN[arrCode]} · {fmtDateCN(effDate)} 报价榜
            </h3>
            <div className="flex gap-1.5">
              {([["all", "全部"], ["direct", "仅直飞"], ["conn", "仅中转"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setStopFilter(k)}
                  className="rounded-full px-3 py-1 text-xs"
                  style={stopFilter === k
                    ? { background: "rgba(212,175,55,.9)", color: "#1a2416", fontWeight: 700 }
                    : { border: "1px solid rgba(212,175,55,.3)", color: "#9db0a0" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {latest ? (
            <div className="mt-3 space-y-2">
              {shownOffers.length === 0 && (
                <p className="text-sm" style={{ color: "#9db0a0" }}>本次记录中没有符合筛选的报价，换个筛选或看看其他日期。</p>
              )}
              {shownOffers.map((o, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5"
                     style={{ background: i === 0 ? "rgba(46,125,82,.3)" : "rgba(0,0,0,.25)", border: i === 0 ? "1px solid rgba(105,181,131,.5)" : "1px solid transparent" }}>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#e9e2c9" }}>
                      {i === 0 && <span className="mr-1">👑</span>}{o.airlines.join(" + ") || "多家承运"}
                      <span className="ml-2 text-xs font-normal" style={{ color: "#7e9478" }}>{o.flight}</span>
                    </div>
                    <div className="mt-0.5 text-xs" style={{ color: "#9db0a0" }}>
                      {fmtTime(o.dep)} 出发 · {fmtTime(o.arr)} 到达 · {o.stops === 0 ? "直飞" : `${o.stops} 次中转`} · {fmtDuration(o.dur)}
                    </div>
                  </div>
                  <div className="num text-lg font-bold" style={{ color: i === 0 ? "#69b583" : "#e9e2c9" }}>{fmtMoney(o.price)}</div>
                </div>
              ))}
              <p className="pt-1 text-xs" style={{ color: "#7e9478" }}>记录于 {latest.t.slice(0, 16).replace("T", " ")} · 3 人合计约 {fmtMoney(latest.low * 3)}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "#9db0a0" }}>
              {hasAnyData
                ? "这个组合暂未轮到采集（云端按轮换计划每天记录，近途组合约 6 天一轮，远途每周日加查）。点右侧按钮可看实时价格。"
                : "机票数据管道已就绪，等待首次云端采集（每天北京时间清晨自动运行）。在配置好 SerpApi 密钥后，这里会逐日积累价格历史。"}
            </p>
          )}
        </div>

        <div className="elven-card p-5 lg:col-span-2">
          <h3 className="font-heading text-base font-bold" style={{ color: "#f0d878" }}>最低价走势</h3>
          {history.length >= 2 ? (
            <div className="mt-3 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <XAxis dataKey="time" tick={{ fill: "#7e9478", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "rgba(212,175,55,.2)" }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "#7e9478", fontSize: 11 }} tickLine={false} axisLine={false} width={64} />
                  <Tooltip contentStyle={{ background: "#14261e", border: "1px solid rgba(212,175,55,.4)", borderRadius: 10, color: "#e9e2c9" }}
                    formatter={(v) => [fmtMoney(Number(v)), "最低价"]} />
                  <Line type="monotone" dataKey="low" stroke="#69b583" strokeWidth={2} dot={{ r: 3, fill: "#69b583" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-4 text-sm" style={{ color: "#9db0a0" }}>积累 2 次以上记录后自动生成走势曲线。</p>
          )}

          <h3 className="font-heading mt-5 text-base font-bold" style={{ color: "#f0d878" }}>
            <Compass className="mr-1 inline" size={16} /> 实时比价传送门
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={qunarUrl(depCN, arrCN, effDate)} target="_blank" rel="noreferrer"
              className="rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: "rgba(212,175,55,.9)", color: "#1a2416" }}>
              去哪网 <ExternalLink className="inline" size={13} />
            </a>
            <a href={tripUrl(depCode, arrCode, effDate)} target="_blank" rel="noreferrer"
              className="rounded-full px-4 py-1.5 text-sm" style={{ border: "1px solid rgba(212,175,55,.45)", color: "#f0d878" }}>
              Trip 携程 <ExternalLink className="inline" size={13} />
            </a>
            <a href="https://www.airnewzealand.cn" target="_blank" rel="noreferrer"
              className="rounded-full px-4 py-1.5 text-sm" style={{ border: "1px solid rgba(105,181,131,.4)", color: "#69b583" }}>
              纽航官网 <ExternalLink className="inline" size={13} />
            </a>
          </div>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "#7e9478" }}>
            下单前点传送门横向比价：面板记录航司官方价，去哪网常有平台补贴价。
          </p>
        </div>
      </div>
    </section>
  );
}
