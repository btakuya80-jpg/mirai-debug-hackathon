/* 専門知識（この作品の核）。
   「どこで出てくるか（どの仕事・場面）」「どう育つか（知った→できる→任される→教えられる）」
   「その後の道でどう活きるか（活きる・少し活きる・活きない）」を求人ごとに持つ。
   出典は求人原稿の何段落目か。原稿に書いていない物は「シナリオ上の想定」と正直に書く。
   会社・人物・数字はすべて架空。点数や％は持たない。 */

import type { BranchId, Job } from "./life";

export const STAGES = ["知った", "できる", "任される", "教えられる"] as const;
export type Fit = "活きる" | "少し活きる" | "活きない";
export const FIT_MARK: Record<Fit, string> = { 活きる: "◎", 少し活きる: "△", 活きない: "−" };

export type Know = {
  id: string;
  name: string;
  /** ひとことで何ができるようになるか */
  what: string;
  /** どの仕事・どの場面で身につくか */
  where: string;
  /** 出典（求人原稿の段落）。null はシナリオ上の想定 */
  src: { para: number; quote: string } | null;
  /** 入社・1か月後・1年後・3年後の育ち具合（STAGES の番号。-1＝まだ） */
  grow: [number, number, number, number];
  /** 作り込んだ道の、各場面での育ち具合 */
  detail?: Partial<Record<BranchId, number[]>>;
  /** 作り込んだ道で、この知識が活きた場面（その道の何番目の場面か） */
  shine?: Partial<Record<BranchId, number>>;
  fits: Record<BranchId, { fit: Fit; why: string }>;
  /** 求人に書いていない、シナリオ上の仮定（AIスキルなど）。画面に「仮定」と出す */
  assumed?: boolean;
  /** 5年目の育ち具合。会社・職務ごとに決める（年数だけで機械的に上げない） */
  y5?: number;
};

const F = (fit: Fit, why: string) => ({ fit, why });

export const KNOW: Record<string, Know[]> = {
  tsumugi: [
    {
      id: "safety",
      name: "安全の手順",
      what: "機械の止め方と、危ないことを先に気づく見方",
      where: "入社1週間の異音と、1か月後にラインを止めてしまった場面",
      src: { para: 1, quote: "自動車部品の加工ラインで、機械の操作と検査をします。" },
      grow: [0, 1, 1, 2],
      detail: { stay: [2, 3, 3, 3, 3, 3], abroad: [2, 3, 3, 3, 3, 3] },
      fits: {
        stay: F("活きる", "班長・工場長として、現場の安全を守る役になる"),
        same: F("活きる", "どの工場でも、最初に求められる知識"),
        other: F("少し活きる", "物流のフォークリフト作業の安全に通じる"),
        indep: F("少し活きる", "請け負う現場で、安全の書類が書ける"),
        relearn: F("少し活きる", "安全管理の資格の土台になる"),
        abroad: F("活きる", "新しい工場の立ち上げで、最初に教えるのがこれ"),
      },
    },
    {
      id: "qc",
      name: "品質の検査",
      what: "見落としを減らす記録の付け方と、2回確かめる習慣",
      where: "3か月後の検査の当番と、半年後に自分で作った引き継ぎメモ",
      src: { para: 1, quote: "自動車部品の加工ラインで、機械の操作と検査をします。" },
      grow: [-1, -1, 1, 2],
      detail: { stay: [2, 2, 2, 3, 3, 3], abroad: [2, 2, 3, 3, 3, 3] },
      fits: {
        stay: F("活きる", "工程が自動化されても、検査の目は機械の見張りに使える"),
        same: F("活きる", "検査の記録の付け方は、業界で共通"),
        other: F("少し活きる", "物流の検品にそのまま使える"),
        indep: F("活きない", "1人の請負では、検査の仕組みを持ちにくい"),
        relearn: F("少し活きる", "品質管理の資格に進める"),
        abroad: F("活きる", "写真つき手順書の中身になる"),
      },
    },
    {
      id: "maint",
      name: "機械保全",
      what: "設備の音や温度で調子を見て、止まる前に直す",
      where: "1年後に機械の音のちがいに気づく場面。3年後に資格の勉強を始める",
      src: { para: 3, quote: "機械保全や品質管理の資格をとる人を、会社が支えます。" },
      grow: [-1, -1, 0, 0],
      detail: { stay: [1, 2, 2, 3, 3, 3], abroad: [0, 0, 0, 0, 1, 1] },
      shine: { stay: 3 },
      fits: {
        stay: F("活きる", "自動化で担当工程がなくなっても、機械の見張り役として残れる"),
        same: F("活きる", "保全ができる人は、どの工場でも足りていない"),
        other: F("活きない", "物流の機械とは種類が違い、ほぼ一から覚え直し"),
        indep: F("活きる", "工場の設備点検を請け負う仕事になる"),
        relearn: F("活きる", "学び直しで電気の資格と組み合わせられる"),
        abroad: F("少し活きる", "立ち上げで使うが、主役は教える力"),
      },
    },
    {
      id: "teach",
      name: "手順を教える",
      what: "言葉に頼らず、写真と手順書で人に伝える",
      where: "3年後に新人2人の教え係になる場面",
      src: { para: 2, quote: "班は6人。最初の3か月は先輩がつきます。" },
      grow: [-1, -1, -1, 1],
      detail: { stay: [2, 2, 2, 3, 3, 3], abroad: [2, 3, 3, 3, 3, 3] },
      shine: { stay: 5, abroad: 1 },
      fits: {
        stay: F("活きる", "定年後、工業高校で機械の安全を教える"),
        same: F("少し活きる", "移った先でも新人教育を任されやすい"),
        other: F("活きる", "どの業界にも、新人に教える仕事はある"),
        indep: F("少し活きる", "人をやとった時に効く"),
        relearn: F("活きる", "教える側に回る勉強につながる"),
        abroad: F("活きる", "言葉が通じなくても、手順は見せて伝わった"),
      },
    },
  ],
  soyokaze: [
    {
      id: "sheet",
      name: "数字のまとめ",
      what: "表計算で、合計の合う資料を作る",
      where: "入社1か月、合計が合わなかった場面と、半年後にひな形を作った場面",
      src: { para: 2, quote: "資料づくり・数字のまとめ・取引先との連絡が中心です。" },
      grow: [-1, 0, 1, 2],
      fits: {
        stay: F("活きる", "企画の予算づくりで毎回使う"),
        same: F("活きる", "企画会社ならどこでも使う"),
        other: F("少し活きる", "飲食の原価の計算に通じる"),
        indep: F("活きる", "自分の会社のお金の管理に使う"),
        relearn: F("少し活きる", "経理の勉強の入口になる"),
        abroad: F("少し活きる", "表の作り方は国を問わない"),
      },
    },
    {
      id: "ai",
      name: "AIの答えを確かめて使う",
      what: "AIの下書きを、数字と事実で確かめてから企画に組み込む",
      where: "1年後、資料の下書きを半分の時間にした場面",
      src: { para: 3, quote: "AIの道具を、毎月みんなで試しています。" },
      grow: [-1, -1, 0, 2],
      fits: {
        stay: F("活きる", "社内で教える役になる"),
        same: F("活きる", "どの会社でも求められている"),
        other: F("活きる", "業界が変わっても、事務の仕事は軽くできる"),
        indep: F("活きる", "1人でも仕事の量をこなせる"),
        relearn: F("少し活きる", "道具は変わるので、学び続けが前提"),
        abroad: F("少し活きる", "言葉の壁を下げる道具として使える"),
      },
    },
    {
      id: "plan",
      name: "企画を回す",
      what: "小さなイベントを、最初から最後まで仕切る",
      where: "3年後、企画を丸ごと任される場面",
      src: { para: 1, quote: "地域のイベントや店の販促を企画する会社です。" },
      grow: [-1, -1, -1, 0],
      fits: {
        stay: F("活きる", "まとめ役への近道"),
        same: F("活きる", "大手でも同じ仕事"),
        other: F("少し活きる", "店の販促なら使える"),
        indep: F("活きる", "小さな企画の請負で独立できる"),
        relearn: F("活きない", "学び直す分野によっては使わない"),
        abroad: F("少し活きる", "現地の商習慣を学び直す必要がある"),
      },
    },
  ],
  tamayura: [
    {
      id: "draw",
      name: "図面を読む",
      what: "図面から、どこに何をいつ置くかを読み取る",
      where: "入社1週間、所長について現場を見て回る場面",
      src: { para: 2, quote: "最初は所長について、図面の読み方から覚えます。" },
      grow: [-1, 0, 0, 2],
      fits: {
        stay: F("活きる", "現場を任される前提の知識"),
        same: F("活きる", "どの建設会社でも共通"),
        other: F("少し活きる", "製造の設計図にも通じる"),
        indep: F("活きる", "小さな工事を請け負える"),
        relearn: F("活きる", "設計の勉強の土台になる"),
        abroad: F("少し活きる", "図面の決まりが国で違う"),
      },
    },
    {
      id: "plan",
      name: "工程の段取り",
      what: "天気や職人さんの都合を見て、作業の順番を組み直す",
      where: "1か月後に雨で工程がずれた場面と、1年後に職人さんの名前を覚えた場面",
      src: { para: 1, quote: "マンションや学校の工事現場で、工程と安全を管理します。" },
      grow: [-1, 0, 1, 2],
      fits: {
        stay: F("活きる", "現場の責任者の仕事そのもの"),
        same: F("活きる", "規模が大きくなっても同じ"),
        other: F("活きる", "段取りの力は、どの業界でも買われる"),
        indep: F("活きる", "自分で現場を回す時の中心"),
        relearn: F("少し活きる", "学び直しの間は使う場面が少ない"),
        abroad: F("少し活きる", "職人さんとの関係を一から作り直す"),
      },
    },
    {
      id: "license",
      name: "施工管理の資格の知識",
      what: "法律と安全の決まりを、試験に通る形で覚える",
      where: "3年後、資格の試験を受けるか迷う場面",
      src: { para: 3, quote: "建築施工管理技士の資格取得を支援します。" },
      grow: [-1, -1, -1, 0],
      fits: {
        stay: F("活きる", "現場を任される条件になる"),
        same: F("活きる", "転職の時に一番見られる"),
        other: F("活きない", "建設の外ではほとんど使わない"),
        indep: F("活きる", "独立して請け負う時に必要"),
        relearn: F("少し活きる", "上の資格への足場"),
        abroad: F("活きない", "日本の資格は、そのままでは使えない"),
      },
    },
  ],
  shiosai: [
    {
      id: "stock",
      name: "在庫管理",
      what: "番号の決まりで探さずに取り出し、記録と棚の数を合わせる",
      where: "入社1週間の棚さがし・1か月後の返品・3か月後の月末の棚卸し",
      src: { para: 1, quote: "通販の商品を保管し、注文に合わせて出荷します。" },
      grow: [0, 1, 2, 3],
      fits: {
        stay: F("活きる", "センターの改善役になる"),
        same: F("活きる", "どの倉庫でも同じ考え方"),
        other: F("少し活きる", "店のバックヤードの整理に使える"),
        indep: F("少し活きる", "小さな倉庫の請負なら使える"),
        relearn: F("少し活きる", "物流の資格の土台"),
        abroad: F("活きる", "海外の拠点でも棚の決まりは共通"),
      },
    },
    {
      id: "fork",
      name: "フォークリフト",
      what: "重い荷物を、体を壊さずに動かす",
      where: "1年後、腰を痛めて免許をとる場面",
      src: { para: 2, quote: "フォークリフトの免許取得を支援します。" },
      grow: [-1, -1, 0, 2],
      fits: {
        stay: F("活きる", "現場の要になる"),
        same: F("活きる", "物流ならどこでも使う"),
        other: F("少し活きる", "製造の工場でも使う場面がある"),
        indep: F("活きない", "1人の仕事ではあまり使わない"),
        relearn: F("活きない", "学び直しの分野では使わない"),
        abroad: F("少し活きる", "国によって免許の決まりが違う"),
      },
    },
    {
      id: "shift",
      name: "シフトの組み方",
      what: "繁忙期に合わせて、人の配置を組む",
      where: "3年後、来月のシフトを任される場面",
      src: null,
      grow: [-1, -1, -1, 0],
      fits: {
        stay: F("活きる", "リーダーへの入口"),
        same: F("活きる", "どの現場でも求められる"),
        other: F("活きる", "飲食や小売でもシフトは要る"),
        indep: F("少し活きる", "人をやとった時に使う"),
        relearn: F("少し活きる", "事務・企画の勉強につながる"),
        abroad: F("少し活きる", "働き方の決まりが国で違う"),
      },
    },
  ],
  komugi: [
    {
      id: "prep",
      name: "仕込みと包丁",
      what: "毎日の量を、速く同じ味で準備する",
      where: "入社1週間の玉ねぎ20個と、1か月後にピークで材料が切れた場面",
      src: { para: 2, quote: "仕込みから始めて、2年目からは発注も担当します。" },
      grow: [0, 1, 1, 2],
      fits: {
        stay: F("活きる", "店長の前提"),
        same: F("活きる", "どの店でも通じる"),
        other: F("活きない", "事務・企画では使わない"),
        indep: F("活きる", "自分の店の味の土台"),
        relearn: F("少し活きる", "調理の専門学校で伸ばせる"),
        abroad: F("活きる", "日本の家庭料理は海外で求められる"),
      },
    },
    {
      id: "cost",
      name: "原価の計算と発注",
      what: "材料の値段から、1皿いくらで出せるかを決める",
      where: "1年後、材料の値段が上がった場面",
      src: { para: 2, quote: "仕込みから始めて、2年目からは発注も担当します。" },
      grow: [-1, -1, 0, 1],
      fits: {
        stay: F("活きる", "2号店を任される条件"),
        same: F("活きる", "どの飲食店でも同じ"),
        other: F("少し活きる", "事務の数字のまとめに通じる"),
        indep: F("活きる", "独立した店がつぶれないための中心"),
        relearn: F("少し活きる", "経営の勉強の入口"),
        abroad: F("少し活きる", "仕入れ先と値段が国で違う"),
      },
    },
    {
      id: "run",
      name: "店を回す",
      what: "人・仕込み・お客さんの流れを、1人で見渡す",
      where: "3年後、2号店の副店長の話が来る場面",
      src: { para: 3, quote: "のれん分けで独立した先輩が2人います。" },
      grow: [-1, -1, -1, 0],
      fits: {
        stay: F("活きる", "2号店の店長へ"),
        same: F("活きる", "店長として移れる"),
        other: F("少し活きる", "人を回す力はどこでも使う"),
        indep: F("活きる", "のれん分けで自分の店を持てる"),
        relearn: F("少し活きる", "学び直す分野しだい"),
        abroad: F("活きる", "海外の日本食店で店長を任される"),
      },
    },
  ],
};

/* ---------- AIスキル（11/6 決定：専門知識の1つとして入れる） ----------
   「AIを使える」ではなく「AIの答えを確かめて、仕事に組み込める」と描く。
   求人に書いていない会社では「仮定」と表示する。 */
const AI_SKILL = (where: string, grow: Know["grow"], y5: number): Know => ({
  id: "ai",
  name: "AIの答えを確かめて使う",
  what: "AIが出した答えを、現場の記録や決まりで確かめてから仕事に組み込む",
  where,
  src: null,
  assumed: true,
  grow,
  y5,
  fits: {
    stay: F("活きる", "社内で、確かめ方を教える役になる"),
    same: F("活きる", "どの会社でも、確かめてから使える人は少ない"),
    other: F("少し活きる", "業界が変わっても確かめ方は同じ。ただ、確かめる元になる現場の知識は一から"),
    indep: F("活きる", "1人でも、書類や見積もりを速く正しく作れる"),
    relearn: F("少し活きる", "学び直しの道具として使える。確かめる力は、学ぶ分野の知識しだい"),
    abroad: F("少し活きる", "言葉の壁を越える道具になる。確かめ方は現地の決まりに合わせる"),
  },
});
for (const [id, where, grow, y5] of [
  ["tsumugi", "3年後、点検の記録をAIにまとめさせ、自分で確かめて使う（求人に書いていない仮定）", [-1, -1, -1, 0], 1],
  ["tamayura", "3年後、工程表の下書きをAIに作らせ、現場で確かめて使う（求人に書いていない仮定）", [-1, -1, -1, 0], 2],
  ["shiosai", "3年後、出荷の予定をAIに出させ、棚の数と照らして使う（求人に書いていない仮定）", [-1, -1, -1, 0], 1],
  ["komugi", "3年後、仕込みの量の見通しをAIに出させ、伝票で確かめて使う（求人に書いていない仮定）", [-1, -1, -1, 0], 1],
] as const) {
  if (!KNOW[id].some((k) => k.id === "ai")) KNOW[id].push(AI_SKILL(where, [...grow] as Know["grow"], y5));
}

/* 5年目の育ち具合（会社・職務で差を出す）。書いていない知識は3年目のまま */
const Y5: Record<string, Record<string, number>> = {
  tsumugi: { safety: 3, qc: 3, maint: 1, teach: 2 },
  soyokaze: { sheet: 3, ai: 3, plan: 2 },
  tamayura: { draw: 3, plan: 3, license: 2 },
  shiosai: { stock: 3, fork: 3, shift: 2 },
  komugi: { prep: 3, cost: 2, run: 1 },
};

/* ---------- 分かれ道の時点（1年／3年／5年）。初期は3年 ---------- */
export type Years = 1 | 3 | 5;
let YEARS: Years = 3;
/** useLife が毎回の描画で呼ぶ。knowOf はこの時点に合わせて知識を返す */
export const setKnowYears = (y: Years) => {
  YEARS = y;
};
export const getKnowYears = () => YEARS;

const DOWN: Record<Fit, Fit> = { 活きる: "少し活きる", 少し活きる: "活きない", 活きない: "活きない" };
const UP: Record<Fit, Fit> = { 活きる: "活きる", 少し活きる: "活きる", 活きない: "少し活きる" };

function atYears(job: Job, k: Know, y: Years): Know {
  if (y === 3) return k;
  if (y === 1) {
    /* 1年＝「知った・できる」まで。移る道は淡く狭い（独立・海外・違う業界は1段下げる） */
    const fits = { ...k.fits };
    for (const b of ["other", "indep", "abroad", "relearn"] as BranchId[]) fits[b] = { fit: DOWN[k.fits[b].fit], why: `1年目ではまだ浅い。${k.fits[b].why}` };
    return { ...k, grow: [k.grow[0], k.grow[1], k.grow[2], k.grow[2]], fits };
  }
  /* 5年＝「教えられる」まで育つ知識がある。会社・職務ごとの Y5 表で決める */
  const s5 = Math.max(k.grow[3], k.y5 ?? Y5[job.id]?.[k.id] ?? k.grow[3]);
  const fits = { ...k.fits };
  if (s5 >= 3) for (const b of ["indep", "abroad", "same"] as BranchId[]) fits[b] = { fit: UP[k.fits[b].fit], why: `教えられるまで育つと、${k.fits[b].why}` };
  return { ...k, grow: [...k.grow, s5] as unknown as Know["grow"], fits };
}

export const knowOf = (job: Job) => (KNOW[job.id] ?? []).map((k) => atYears(job, k, YEARS));

/** いまの場面での育ち具合（STAGES の番号。-1＝まだ） */
export function stageAt(k: Know, idx: number, forkIdx: number, branch: BranchId | null): number {
  if (idx <= forkIdx || !branch) return k.grow[Math.min(idx, forkIdx, k.grow.length - 1)];
  const j = idx - forkIdx - 1;
  return k.detail?.[branch]?.[j] ?? k.grow[Math.min(forkIdx, k.grow.length - 1)];
}

/** この場面で新しく身についた・育った知識 */
export function gainsAt(job: Job, idx: number, forkIdx: number, branch: BranchId | null) {
  if (idx === 0) return knowOf(job).filter((k) => k.grow[0] >= 0).map((k) => ({ k, from: -1, to: k.grow[0] }));
  return knowOf(job)
    .map((k) => ({ k, from: stageAt(k, idx - 1, forkIdx, branch), to: stageAt(k, idx, forkIdx, branch) }))
    .filter((x) => x.to > x.from);
}

/** この場面で活きた知識（作り込んだ道のみ） */
export function shinesAt(job: Job, idx: number, forkIdx: number, branch: BranchId | null) {
  if (!branch || idx <= forkIdx) return [];
  const j = idx - forkIdx - 1;
  return knowOf(job).filter((k) => k.shine?.[branch] === j);
}

/** 1年・3年・5年それぞれの分かれ道の時点の Lv（持ち帰り画面の比べ用。いまの年数の設定を変えない） */
export function lvByYears(job: Job, y: Years): Record<string, number> {
  return Object.fromEntries((KNOW[job.id] ?? []).map((k) => {
    const a = atYears(job, k, y);
    return [k.id, Math.max(0, a.grow[a.grow.length - 1] + 1)];
  }));
}
/** Lv を「〜できる」の一言にする（名前が「〜る」で終わる時は「〜こと」にする） */
export const nounOf = (name: string) => (name.endsWith("る") ? `${name}こと` : name);
export function canSay(name: string, lv: number): string {
  const n = nounOf(name);
  return lv >= 4 ? `${n}を、人に教えられる` : lv === 3 ? `${n}を、任される` : lv === 2 ? `ひとりで、${n}ができる` : lv === 1 ? `${n}を、知っている` : `${n}は、まだこれから`;
}
