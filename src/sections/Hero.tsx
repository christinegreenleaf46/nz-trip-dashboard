import { useMemo } from "react";
import { daysToDeparture } from "../lib/types";

/** 随机但稳定的星星布局 */
function useStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37.7 + 13) % 100}%`,
        top: `${(i * 23.3 + 7) % 55}%`,
        size: 1 + ((i * 7) % 3),
        delay: `${(i % 9) * 0.45}s`,
      })),
    [count]
  );
}

export default function Hero() {
  const stars = useStars(70);
  const days = daysToDeparture();

  return (
    <header className="relative overflow-hidden" style={{ background: "linear-gradient(180deg,#08131f 0%,#0c2018 55%,#0a1611 100%)" }}>
      {/* 星空 */}
      {stars.map((s, i) => (
        <span key={i} className="star" style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }} />
      ))}

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-16 pb-6 text-center">
        {/* 至尊戒倒计时 */}
        <div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center">
          <div className="one-ring relative flex h-32 w-32 items-center justify-center rounded-full"
               style={{ border: "7px solid #d4af37", boxShadow: "inset 0 0 14px rgba(0,0,0,.6)" }}>
            <div className="text-center">
              <div className="num text-4xl font-bold" style={{ color: "#f0d878" }}>{days}</div>
              <div className="mt-1 text-xs tracking-widest" style={{ color: "#c8bd93" }}>天后出发</div>
            </div>
          </div>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl font-bold" style={{ color: "#f0d878", textShadow: "0 2px 24px rgba(212,175,55,.35)" }}>
          中土远征 · 新西兰旅行面板
        </h1>
        <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: "#b9c9ae" }}>
          2027 年 1 月 26–29 日启程 · 上海 / 南京 / 北京 / 成都 → 奥克兰 · 三人同行
          <br className="hidden md:block" />
          2 月 11–12 日自皇后镇归来 · 汇率与机票行情每日由云端自动更新
        </p>
        <p className="mt-3 text-xs italic" style={{ color: "#7e9478" }}>
          “世界并不在地图和笔记里……它在外面呢。” —— 比尔博 · 巴金斯
        </p>
      </div>

      {/* 迷雾山脉 */}
      <svg className="mountain-divider relative z-0" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden>
        <path d="M0,90 L0,55 L120,20 L210,58 L330,12 L430,55 L560,25 L680,62 L800,18 L920,58 L1040,30 L1180,64 L1300,26 L1440,60 L1440,90 Z"
              fill="#0d2018" opacity="0.9" />
        <path d="M0,90 L0,70 L160,42 L300,72 L470,38 L640,74 L820,44 L990,74 L1160,46 L1330,72 L1440,50 L1440,90 Z"
              fill="#0a1611" />
        <path d="M330,12 L352,30 L330,24 L308,30 Z M800,18 L820,34 L800,28 L780,34 Z M120,20 L138,34 L120,29 L102,34 Z"
              fill="#e9e2c9" opacity="0.55" />
      </svg>
    </header>
  );
}
