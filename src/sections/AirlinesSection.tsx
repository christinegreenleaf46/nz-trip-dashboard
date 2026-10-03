import { Crown, ExternalLink } from "lucide-react";
import { AIRLINES, QUEENSTOWN_NOTE } from "../lib/airlines";

export default function AirlinesSection() {
  return (
    <section id="airlines" className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="vine-title font-heading text-2xl font-bold" style={{ color: "#f0d878" }}>
        <Crown className="mr-2 inline" size={22} /> 护戒同盟 · 航司图鉴
      </h2>
      <p className="mt-5 text-sm" style={{ color: "#9db0a0" }}>
        座位间距、行李额等整理自航司官网公开资料（2026 年 10 月核校），实际以购票时官网为准
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {AIRLINES.map((a) => (
          <div key={a.code} className="elven-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold" style={{ color: "#f0d878" }}>{a.name}</h3>
                <p className="mt-0.5 text-xs" style={{ color: "#7e9478" }}>{a.alliance} · {a.route}</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={a.direct
                  ? { background: "rgba(46,125,82,.5)", color: "#a8e0bf" }
                  : { background: "rgba(201,162,39,.3)", color: "#f0d878" }}>
                {a.direct ? "直飞" : "中转"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div><span style={{ color: "#7e9478" }}>机型：</span><span style={{ color: "#e9e2c9" }}>{a.aircraft}</span></div>
              <div><span style={{ color: "#7e9478" }}>经济舱间距：</span><span style={{ color: "#e9e2c9" }}>{a.ecoPitch}</span></div>
              <div><span style={{ color: "#7e9478" }}>超级经济舱：</span><span style={{ color: "#e9e2c9" }}>{a.pePitch}</span></div>
              <div><span style={{ color: "#7e9478" }}>行李额：</span><span style={{ color: "#e9e2c9" }}>{a.baggage}</span></div>
            </div>

            <ul className="mt-3 space-y-1 text-xs leading-relaxed" style={{ color: "#9db0a0" }}>
              {a.service.map((s, i) => <li key={i}>✦ {s}</li>)}
            </ul>

            <p className="mt-3 rounded-lg p-3 text-xs leading-relaxed" style={{ background: "rgba(212,175,55,.1)", color: "#e6d9a8" }}>
              {a.comment}
            </p>

            <a href={a.site} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs" style={{ color: "#69b583" }}>
              前往官网查价 <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>

      <div className="elven-card mt-6 p-5">
        <h3 className="font-heading text-base font-bold" style={{ color: "#f0d878" }}>🏔️ 关于皇后镇返程</h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#c8d4bb" }}>{QUEENSTOWN_NOTE}</p>
      </div>
    </section>
  );
}
