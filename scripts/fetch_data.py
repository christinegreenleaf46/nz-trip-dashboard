#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
每日数据抓取脚本（GitHub Actions 云端运行，无需个人电脑开机）

数据源：
  1. 汇率：frankfurter.dev（欧洲央行基准汇率，免费、稳定）
     - 纽币 NZD → 人民币 CNY
     - 英镑 GBP → 人民币 CNY
  2. 机票：SerpApi 的 Google Flights 接口（票价为航司官方发布价）
     - 去程：上海浦东 PVG / 南京禄口 NKG（日常轮换）+ 北京 PEK / 成都 CTU（每周日加查）→ 奥克兰 AKL
     - 返程：皇后镇 ZQN → 上述四地
     - 免费额度 250 次/月，脚本按「去程/返程交错」轮换计划每天查 6 次（周日远途加查 6 次），
       12 个近途组合每 2 天全覆盖，月度约 204 次，留有安全余量

输出：public/data/rates.json、public/data/flights.json
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "public" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# ---------------- 行程配置 ----------------
OUTBOUND_DEST = "AKL"                       # 奥克兰
INBOUND_ORIGIN = "ZQN"                      # 皇后镇
NEAR_AIRPORTS = ["PVG", "NKG"]              # 离安徽近：上海浦东、南京禄口（日常跟踪）
FAR_AIRPORTS = ["PEK", "CTU"]               # 较远：北京首都、成都天府（每周日加查）
OUTBOUND_DATES = ["2027-01-26", "2027-01-27", "2027-01-28", "2027-01-29"]
INBOUND_DATES = ["2027-02-11", "2027-02-12"]
DAILY_CALLS = 6                             # 平日每天机票查询次数（12 个近途组合每 2 天全覆盖）
SUNDAY_CALLS = 6                            # 周日远途航线加查次数
HISTORY_CAP = 240                           # 每个航线+日期最多保留的历史快照数

CN_TZ = timezone(timedelta(hours=8))


def now_iso() -> str:
    return datetime.now(CN_TZ).isoformat(timespec="seconds")


def today_str() -> str:
    return datetime.now(CN_TZ).strftime("%Y-%m-%d")


def http_get(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "nz-trip-dashboard/1.0"})
    with urllib.request.urlopen(req, timeout=40) as resp:
        return json.load(resp)


# ---------------- 1. 汇率 ----------------
def fetch_rates() -> None:
    print("[rates] 抓取 NZD/GBP → CNY 汇率（含 2024 年以来全部历史）…")
    out = {
        "updated": now_iso(),
        "source": "frankfurter.dev（欧洲央行基准汇率）",
        "series": {},
    }
    for ccy in ("NZD", "GBP"):
        j = http_get(f"https://api.frankfurter.dev/v1/2024-01-01..?base={ccy}&symbols=CNY")
        series = [{"d": d, "v": round(v["CNY"], 4)} for d, v in sorted(j["rates"].items())]
        out["series"][ccy] = series
        print(f"[rates] {ccy}/CNY：{len(series)} 条，最新 {series[-1]['d']} = {series[-1]['v']}")
    (DATA_DIR / "rates.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")


# ---------------- 2. 机票 ----------------
def load_flights() -> dict:
    p = DATA_DIR / "flights.json"
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"updated": None, "state": {"idx": 0}, "routes": {}}


def build_plan(flights: dict) -> list:
    """返回今天应查询的 (出发地, 目的地, 日期) 列表。"""
    weekday = datetime.now(CN_TZ).weekday()  # 周日 = 6
    if weekday == 6:
        plan = []
        for o in FAR_AIRPORTS:
            for d in OUTBOUND_DATES[1:3]:    # 远途只查中间两个出发日，节省额度
                plan.append((o, OUTBOUND_DEST, d))
            plan.append((INBOUND_ORIGIN, o, INBOUND_DATES[0]))
        return plan[:SUNDAY_CALLS]

    # 去程/返程交错排列：每个出发日后面紧跟同序返程日，返程第 2 天即有数据
    near = []
    for i, od in enumerate(OUTBOUND_DATES):
        for o in NEAR_AIRPORTS:
            near.append((o, OUTBOUND_DEST, od))
        if i < len(INBOUND_DATES):
            for o in NEAR_AIRPORTS:
                near.append((INBOUND_ORIGIN, o, INBOUND_DATES[i]))
    idx = flights.get("state", {}).get("idx", 0) % len(near)
    plan = [near[(idx + i) % len(near)] for i in range(DAILY_CALLS)]
    flights.setdefault("state", {})["idx"] = (idx + DAILY_CALLS) % len(near)
    return plan


def serpapi_flights(api_key: str, dep: str, arr: str, date: str) -> list:
    q = urllib.parse.urlencode({
        "engine": "google_flights",
        "departure_id": dep,
        "arrival_id": arr,
        "outbound_date": date,
        "type": "2",               # 单程
        "adults": "1",             # 按人均价跟踪；页面展示时 ×3 人估算
        "currency": "CNY",
        "hl": "zh-cn",
        "travel_class": "1",       # 经济舱
        "api_key": api_key,
    })
    j = http_get("https://serpapi.com/search.json?" + q)
    if "error" in j:
        raise RuntimeError(str(j["error"]))
    pool = j.get("best_flights", []) + j.get("other_flights", [])
    offers = []
    for f in pool:
        segs = f.get("flights", [])
        if not segs:
            continue
        offers.append({
            "price": f.get("price"),
            "airlines": sorted({s.get("airline", "") for s in segs if s.get("airline")}),
            "stops": max(len(segs) - 1, 0),
            "dur": f.get("total_duration"),          # 分钟
            "dep": segs[0].get("departure_airport", {}).get("time", ""),
            "arr": segs[-1].get("arrival_airport", {}).get("time", ""),
            "flight": "/".join(s.get("flight_number", "") for s in segs),
        })
    offers = [o for o in offers if o.get("price")]
    offers.sort(key=lambda o: o["price"])
    return offers[:5]


def fetch_flights() -> None:
    api_key = os.environ.get("SERPAPI_KEY", "").strip()
    flights = load_flights()
    if not api_key:
        print("[flights] 未配置 SERPAPI_KEY，跳过机票抓取（保留既有数据）。")
        if not (DATA_DIR / "flights.json").exists():
            (DATA_DIR / "flights.json").write_text(json.dumps(flights, ensure_ascii=False), encoding="utf-8")
        return

    plan = build_plan(flights)
    print(f"[flights] 今日查询计划：{plan}")
    ok, fail = 0, 0
    for dep, arr, date in plan:
        route = f"{dep}-{arr}"
        try:
            offers = serpapi_flights(api_key, dep, arr, date)
            if not offers:
                print(f"[flights] {route} {date}：无结果")
                continue
            snap = {"t": now_iso(), "low": offers[0]["price"], "offers": offers}
            cell = flights.setdefault("routes", {}).setdefault(route, {}).setdefault(date, [])
            cell.append(snap)
            del cell[:-HISTORY_CAP]
            ok += 1
            print(f"[flights] {route} {date}：最低 ¥{snap['low']}（{len(offers)} 条报价）")
        except Exception as e:  # 配额用尽或网络错误：保留旧数据，明天继续
            fail += 1
            print(f"[flights] {route} {date} 查询失败：{e}", file=sys.stderr)
            if "quota" in str(e).lower() or "limit" in str(e).lower():
                print("[flights] 疑似额度用尽，提前结束今日机票抓取。")
                break
    if ok:
        flights["updated"] = now_iso()
    (DATA_DIR / "flights.json").write_text(json.dumps(flights, ensure_ascii=False), encoding="utf-8")
    print(f"[flights] 完成：成功 {ok}，失败 {fail}")


if __name__ == "__main__":
    fetch_rates()
    fetch_flights()
    print("全部完成 ✔")
