export interface AirlineInfo {
  code: string;
  name: string;
  alliance: string;
  route: string; // 相关航线
  direct: boolean;
  aircraft: string;
  ecoPitch: string; // 经济舱座位间距
  pePitch: string; // 超级经济舱座位间距
  baggage: string;
  service: string[];
  comment: string; // 推荐语
  site: string;
}

/**
 * 航司参考信息（整理自航司官网公开资料与权威媒体报道，2026 年 10 月核校。
 * 座位间距/行李额可能随机型版本与票档变动，购票时请以官网为准。）
 */
export const AIRLINES: AirlineInfo[] = [
  {
    code: "NZ",
    name: "新西兰航空",
    alliance: "星空联盟",
    route: "上海浦东 ⇌ 奥克兰（直飞）",
    direct: true,
    aircraft: "波音 787-9 梦想客机",
    ecoPitch: "31–33 英寸（78–83 cm）",
    pePitch: "41 英寸（104 cm）",
    baggage: "经济舱通常 1×23kg 托运（以票档为准）",
    service: [
      "招牌 Skycouch 空中沙发：三连座可拼成平躺空间，适合多人出行",
      "全舱个人娱乐系统 + USB/电源插座",
      "新西兰风味餐食与葡萄酒，KIWI 式热情服务",
    ],
    comment: "目的地国家航司，中土氛围从登机那一刻就开始 🧙‍♂️ 超级经济舱口碑极佳。",
    site: "https://www.airnewzealand.cn",
  },
  {
    code: "MU",
    name: "中国东方航空",
    alliance: "天合联盟",
    route: "上海浦东 ⇌ 奥克兰（直飞 MU779/780）",
    direct: true,
    aircraft: "宽体客机执飞（以当季排班为准）",
    ecoPitch: "约 31–32 英寸（以官网为准）",
    pePitch: "部分机型设超经舱（以排班为准）",
    baggage: "澳新航线经济舱通常 1–2×23kg（以票档为准）",
    service: ["中文服务无障碍，餐食偏中式", "天合联盟里程可累积", "上海主场航线，班次稳定"],
    comment: "离你最近的直飞选择之一：从安徽去上海浦东最方便，省时省力。",
    site: "https://www.ceair.com",
  },
  {
    code: "CA",
    name: "中国国际航空",
    alliance: "星空联盟",
    route: "北京首都 ⇌ 奥克兰（直飞 CA783/784）",
    direct: true,
    aircraft: "波音 787-9 梦想客机",
    ecoPitch: "约 31–32 英寸（以官网为准）",
    pePitch: "超经舱约 38–39 英寸（以官网为准）",
    baggage: "澳新航线经济舱通常 1–2×23kg（以票档为准）",
    service: ["凌晨起飞傍晚到，时差过渡较顺", "787 客舱湿度与气压更舒适", "中文服务"],
    comment: "若北京出发票价明显更低才值得考虑——别忘了算上安徽到北京的高铁/机票成本。",
    site: "https://www.airchina.com.cn",
  },
  {
    code: "3U",
    name: "四川航空",
    alliance: "无联盟",
    route: "成都天府 ⇌ 奥克兰（直飞 3U3811/3812，周四/周日）",
    direct: true,
    aircraft: "空客 A350-900 超宽体",
    ecoPitch: "约 32 英寸（以官网为准）",
    pePitch: "暂以经济舱为主（以官网为准）",
    baggage: "国际经济舱通常 1–2×23kg（以票档为准）",
    service: ["川味餐食 + 特色茶饮，喂猪航空名不虚传", "A350 全景舷窗、舱内安静", "中西部唯一直飞新西兰航线"],
    comment: "每周仅两班、班期少，但常有惊喜价；成都顺路玩两天也是不错的选择 🐼",
    site: "https://www.sichuanair.com",
  },
  {
    code: "CZ",
    name: "中国南方航空",
    alliance: "无联盟（原天合）",
    route: "广州 ⇌ 奥克兰（直飞，可全国联程中转）",
    direct: false,
    aircraft: "波音 787 / 空客 A350",
    ecoPitch: "约 31–32 英寸（以官网为准）",
    pePitch: "超经舱约 38 英寸（以官网为准）",
    baggage: "联程经济舱通常 1–2×23kg（以票档为准）",
    service: ["广州中转联程覆盖面广", "常有促销价", "中文服务"],
    comment: "从南京/上海飞广州中转再飞奥克兰，价格常比直飞低一截，适合预算优先。",
    site: "https://www.csair.com",
  },
  {
    code: "CX",
    name: "国泰航空",
    alliance: "寰宇一家",
    route: "香港中转 ⇌ 奥克兰",
    direct: false,
    aircraft: "空客 A350 / 波音 777",
    ecoPitch: "约 32 英寸",
    pePitch: "超经舱约 38 英寸，口碑出色",
    baggage: "经济舱通常 1×23kg 起（以票档为准）",
    service: ["服务与餐食口碑常年在线", "香港中转顺路、衔接成熟", "可在香港顺道停留"],
    comment: "想要服务品质又不想太贵时的均衡之选，超级经济舱值得重点比较。",
    site: "https://www.cathaypacific.com",
  },
  {
    code: "SQ",
    name: "新加坡航空",
    alliance: "星空联盟",
    route: "新加坡中转 ⇌ 奥克兰",
    direct: false,
    aircraft: "空客 A350 / 波音 777",
    ecoPitch: "约 32 英寸",
    pePitch: "超经舱约 38 英寸",
    baggage: "经济舱通常 1×25kg 起（以票档为准）",
    service: ["全球服务标杆航司", "樟宜机场中转体验一流", "转机总时长偏长"],
    comment: "航程更长但体验顶级，适合把旅途本身也当作旅行一部分的人。",
    site: "https://www.singaporeair.com",
  },
];

export const QUEENSTOWN_NOTE =
  "皇后镇机场（ZQN）没有直飞中国的航班，返程需经奥克兰、悉尼或墨尔本中转——" +
  "可以把皇后镇安排在旅程最后一站，玩完直接回家。";
