/* 成長のまとめ（2026-11-06 依頼 7）と、給料の筋書き（依頼 6）。
   給料は求人原稿の金額だけを出典つきで出し、その後は金額を断定せず「上がりやすい／横ばい／下がることもある」で見せる。 */

import type { BranchId, Chapter, Job, Level } from "./life";

export type PayTrend = "上がりやすい" | "横ばい" | "下がることもある" | "大きく変わる";
export const PAY_MARK: Record<PayTrend, string> = { 上がりやすい: "↗", 横ばい: "→", 下がることもある: "↘", 大きく変わる: "↕" };

/** 分かれ道の先の、道ごとの給料の筋書き */
export const BRANCH_PAY: Record<BranchId, { trend: PayTrend; why: string }> = {
  stay: { trend: "上がりやすい", why: "役職や資格の手当がつくと上がる筋書き" },
  same: { trend: "上がりやすい", why: "経験を買われて移れば上がることが多い。会社しだい" },
  other: { trend: "下がることもある", why: "未経験の業界では、いったん下がることがある" },
  indep: { trend: "大きく変わる", why: "仕事の取れ方しだいで、上がることも下がることもある" },
  relearn: { trend: "下がることもある", why: "学ぶ間は働く時間が減る。学んだ後に上がる筋書きもある" },
  abroad: { trend: "上がりやすい", why: "海外の手当がつく筋書き。物価や為替で手取りは変わる" },
};

const LV: Record<Level, number> = { 低: 0, 中: 1, 高: 2 };

/** 前の場面と比べた給料の筋書き（お金のゆとり 高・中・低 の変化と、その場面の出来事から） */
export function payTrendOf(prev: Chapter | undefined, ch: Chapter): { trend: PayTrend; why: string } {
  const ev = ch.events.join("");
  const why = /班長|リーダー|任され|副店長|店長|工場長|責任者|補佐/.test(ev)
    ? "役割がついた"
    : /資格|免許/.test(ev)
      ? "資格・免許の手当"
      : /独立/.test(ev)
        ? "独立して収入の形が変わる"
        : /日勤|介護|子ども|行き来/.test(ev)
          ? "働き方を変えた"
          : /定年|教える/.test(ev)
            ? "定年後の働き方"
            : "大きな変化なし";
  if (!prev) return { trend: "横ばい", why };
  const d = LV[ch.life.money] - LV[prev.life.money];
  const role = why === "役割がついた" || why === "資格・免許の手当";
  return { trend: d > 0 || (d === 0 && role) ? "上がりやすい" : d < 0 ? "下がることもある" : "横ばい", why };
}

/** 求人原稿の給与（出典つき）と、昇給の書き方 */
export function payOfJob(job: Job) {
  const raise = job.body.find((b) => /昇給|賞与|手当/.test(b)) ?? null;
  return { pay: job.pay, src: "求人原稿（給与の欄）", raise };
}

/** 作り込んだ道の役割（場面ごと） */
export const ROLE_DETAIL: Partial<Record<string, Partial<Record<BranchId, string[]>>>> = {
  tsumugi: {
    stay: ["班長", "班長（日勤）・保全の資格", "担当工程がなくなる", "機械の見張り役・若手の指導", "工場長", "工業高校の講師（定年後）"],
    abroad: ["海外工場の立ち上げメンバー", "手順書づくりの担当", "立ち上げ責任者の補佐", "日本と行き来する担当", "3か国の立ち上げ専門家", "若手の相談役"],
  },
};

export function roleOfChapter(job: Job, branch: BranchId | null, j: number): string | null {
  if (!branch) return null;
  return ROLE_DETAIL[job.id]?.[branch]?.[j] ?? null;
}
