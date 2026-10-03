export default function SiteFooter() {
  return (
    <footer className="mt-10" style={{ background: "#08110d" }}>
      <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: 60 }} aria-hidden>
        <path d="M0,60 L0,35 L180,10 L360,40 L540,15 L720,42 L900,12 L1080,40 L1260,18 L1440,38 L1440,60 Z" fill="#08110d" transform="translate(0,-2)" opacity="0.4" />
      </svg>
      <div className="mx-auto max-w-5xl px-6 py-8 text-center text-xs leading-relaxed" style={{ color: "#6e8570" }}>
        <p>
          数据来源：汇率 — frankfurter.dev（欧洲央行基准汇率）· 机票 — Google Flights（经 SerpApi，航司官方发布价）
        </p>
        <p className="mt-2">
          面板数据由云端任务每日自动更新 · 页面建议仅为统计性参考，不构成投资或购票保证 · 下单前请以下单页实时价格为准
        </p>
        <p className="mt-3 italic" style={{ color: "#8a9a80" }}>
          “并非所有流浪者都迷失了方向。” —— 《魔戒》
        </p>
      </div>
    </footer>
  );
}
