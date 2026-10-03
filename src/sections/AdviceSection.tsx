import { Scroll, Gem, Plane, Compass, CircleDot } from "lucide-react";
import type { Advice } from "../lib/advice";
import { rateAdvice, flightAdvice } from "../lib/advice";
import type { FlightsData, RatesData } from "../lib/types";

const ICONS = {
  ring: CircleDot,
  gem: Gem,
  plane: Plane,
  compass: Compass,
};

const TONE_STYLE: Record<Advice["tone"], { border: string; badge: string; label: string }> = {
  good: { border: "rgba(105,181,131,.55)", badge: "rgba(46,125,82,.5)", label: "建议行动" },
  warn: { border: "rgba(224,122,95,.55)", badge: "rgba(184,80,63,.45)", label: "注意" },
  info: { border: "rgba(212,175,55,.4)", badge: "rgba(201,162,39,.35)", label: "观察" },
};

export default function AdviceSection({ rates, flights }: { rates: RatesData | null; flights: FlightsData | null }) {
  const advices: Advice[] = [];
  if (rates?.series?.NZD) advices.push(rateAdvice("纽币", rates.series.NZD));
  if (rates?.series?.GBP) advices.push(rateAdvice("英镑", rates.series.GBP));
  advices.push(...flightAdvice(flights));

  return (
    <section id="advice" className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="vine-title font-heading text-2xl font-bold" style={{ color: "#f0d878" }}>
        <Scroll className="mr-2 inline" size={22} /> 甘道夫的指引 · 行动建议
      </h2>
      <p className="mt-5 text-sm" style={{ color: "#9db0a0" }}>
        基于面板数据的统计性建议，仅供参考，不构成投资或购票保证
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {advices.map((a, i) => {
          const Icon = ICONS[a.icon];
          const tone = TONE_STYLE[a.tone];
          return (
            <div key={i} className="elven-card p-5" style={{ borderColor: tone.border }}>
              <div className="flex items-center justify-between">
                <h3 className="font-heading flex items-center gap-2 text-base font-bold" style={{ color: "#f0d878" }}>
                  <Icon size={17} /> {a.title}
                </h3>
                <span className="rounded-full px-2.5 py-0.5 text-xs" style={{ background: tone.badge, color: "#f5ecc8" }}>
                  {tone.label}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "#c8d4bb" }}>{a.text}</p>
            </div>
          );
        })}
      </div>

      <div className="elven-card mt-6 p-5">
        <h3 className="font-heading text-base font-bold" style={{ color: "#f0d878" }}>远征小贴士</h3>
        <ul className="mt-3 list-inside space-y-2 text-sm leading-relaxed" style={{ color: "#c8d4bb" }}>
          <li>🧳 三人同行：订票时分开查 1 人与 3 人价格，有时拆单更便宜。</li>
          <li>💱 换汇节奏：把预算分成 3–4 批，在纽币低于 90 日均值时逐批买入，平滑风险。</li>
          <li>💳 英镑还款：纽币消费若以英镑记账，关注 GBP/CNY；在英镑低位时提前还款更划算（请以发卡行实际记账规则为准）。</li>
          <li>🛫 远途出发地规则：北京/成都出发只有比上海/南京便宜约 ¥800+/人 以上时，才值得算上高铁与时间成本。</li>
          <li>🗓️ 1 月底正值新西兰盛夏旺季，也是春节前后出行高峰，票价易涨——看到好价别犹豫太久。</li>
        </ul>
      </div>
    </section>
  );
}
