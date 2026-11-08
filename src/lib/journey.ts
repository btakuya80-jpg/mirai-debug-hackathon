/* 1本道の流れ（2026-11-08 依頼）
   入社1週間 → … → 1年 →（2年 → 3年 → 5年：選んだ年数まで「任される」段階の場面）→ 分かれ道（場面の絵の上で選ぶ）
   → 選んだ道の場面2つ（職場の絵・登場人物・セリフを道に合わせる。前の会社の人は出さない）→ 結局どう成長した？ → 持ち帰り
   会社・人物・数字はすべて架空。Lv は 0＝まだ、1＝知った、2＝できる、3＝任される、4＝教えられる。 */

import { episodesOf, type Episode } from "./episodes";
import { knowOf, stageAt, type Know, type Years } from "./know";
import { simpleBranch, type Act, type BranchId, type Job, type Place, type Who } from "./life";

export type JEpisode = Episode & {
  /** 入社から何年目か（年齢の表示用） */
  yr: number;
  /** 背景の絵（道の場面だけ。無ければ place の絵） */
  bg?: string;
  /** この場面だけの呼び名（新しい職場の人など） */
  names?: Partial<Record<Who, string>>;
  /** 主のスキルのほかに、この場面までに育ったスキル */
  extra?: { know: string; from: number; to: number }[];
  /** 選んだ道の場面か */
  road?: BranchId;
};

type Later = Omit<Episode, "up" | "id" | "place" | "act"> & { yr: 2 | 3 | 5; know: string };
const L = (x: Later) => x;

/* ---------- 2年後・3年後・5年後（任される・教えられる段階） ---------- */
const LATER: Record<string, Later[]> = {
  tsumugi: [
    L({ yr: 2, know: "safety", when: "2年後", title: "夜の見回りで、危ないことに先に気づく", mean: "2年目。自分の機械だけでなく、ライン全体の安全を任されはじめた", role: "夜勤の見回り役",
      work: { text: "夜勤の班で、ライン全体の見回りを任される", talk: { who: "boss", to: "me", text: "今夜の見回り、お願いできるかな" } },
      wall: { text: "新しく入った機械の下に、油が広がっているのを見つける。ラインを止めるほどか迷う", think: "（止めたら、また迷惑をかけるかな…）", tint: "night" },
      learn: { who: "senpai", how: "教わる", text: "久保さんと、止める前に周りへ声をかける順番を決め、紙に書いて機械に貼る", line: "止めてから考える、でいいんだよ" },
      after: { when: "3年後", text: "この見回りのやり方が、班の決まりになる" } }),
    L({ yr: 3, know: "teach", when: "3年後", title: "新人2人の教え係になる", mean: "3年目。自分ができるだけでなく、人に教えることを任された", role: "新人2人の教え係",
      work: { text: "新しく入った2人に、機械の動かし方を教える係を任される", talk: { who: "boss", to: "me", text: "次の新人2人、教え係を頼めるかな" } },
      wall: { text: "口で説明しても伝わらず、2人とも同じところでつまずく", think: "（自分は分かるのに、どう言えば伝わるんだろう）" },
      learn: { who: "me", how: "工夫", text: "自分がつまずいた所を思い出し、写真つきの手順書を作って、見せながら教える", line: "写真で見せたら、一回で伝わった" },
      after: { when: "5年後", text: "この手順書が、工場の新人用の教材になる" } }),
    L({ yr: 5, know: "safety", when: "5年後", title: "班長として、安全の決まりを教える", mean: "5年目。安全のやり方を、人に教えられる段階になった", role: "班長",
      work: { text: "班長になり、朝の集まりで安全の決まりを話す", talk: { who: "peer", to: "me", text: "班長、今日の話も分かりやすかったよ" } },
      wall: { text: "新人が「決まりは面倒」と感じているのが分かる", think: "（決まりを押しつけるだけでは、守ってもらえない）" },
      learn: { who: "me", how: "工夫", text: "決まりができた理由を、自分の1年目の失敗の話といっしょに伝える", line: "自分の失敗を話したら、みんなが顔を上げた" },
      after: { when: "その後", text: "ほかの班からも、安全の話を聞きに来るようになる" } }),
  ],
  soyokaze: [
    L({ yr: 2, know: "sheet", when: "2年後", title: "取引先との打ち合わせに、1人で出る", mean: "2年目。資料を作るだけでなく、自分で説明することを任された", role: "打ち合わせを1人で担当",
      work: { text: "取引先との打ち合わせに、1人で数字の資料を持っていく", talk: { who: "boss", to: "me", text: "今回の打ち合わせ、1人で行ってみようか" } },
      wall: { text: "取引先から急に「この数字の根拠は？」と聞かれ、答えられない", think: "（表は作ったのに、説明できない…）", tint: "sweat" },
      learn: { who: "senpai", how: "教わる", text: "宮内さんに、数字ごとに出どころを1行で書いておくやり方を教わる", line: "数字の横に、出どころを1行。それだけで強くなるよ" },
      after: { when: "3年後", text: "企画の予算づくりを、丸ごと任される" } }),
    L({ yr: 3, know: "ai", when: "3年後", title: "AIの下書きを、確かめる役を任される", mean: "3年目。AIの道具を使うだけでなく、答えを確かめる役を任された", role: "AIの下書きの確かめ役",
      work: { text: "チームの資料づくりで、AIが作った下書きを確かめる役を任される", talk: { who: "boss", to: "me", text: "AIの下書き、確かめる役をお願いできる？" } },
      wall: { text: "AIの下書きに、もっともらしいけれど間違った数字が混ざっていた", think: "（このまま出していたら、大変だった）", tint: "sweat" },
      learn: { who: "me", how: "工夫", text: "元の資料と1つずつ照らし合わせる「確かめ方の表」を作り、チームに配る", line: "AIの答えは、元の資料で確かめてから使う" },
      after: { when: "5年後", text: "社内で、AIの答えの確かめ方を教える役になる" } }),
    L({ yr: 5, know: "plan", when: "5年後", title: "地域のイベントを、最初から最後まで仕切る", mean: "5年目。企画を丸ごと任される段階になった", role: "企画のまとめ役",
      work: { text: "地域の夏祭りの企画を、最初から最後まで任される", talk: { who: "boss", to: "me", text: "今年の夏祭りの企画、任せてもいいかな" } },
      wall: { text: "準備が重なり、当日の段取りが決まらない", think: "（どこから手をつければいいんだろう）" },
      learn: { who: "senpai", how: "教わる", text: "宮内さんと、終わりの日から逆に予定を並べてみる", line: "終わりから逆に並べると、抜けが見えるよ" },
      after: { when: "その後", text: "企画のまとめ役として、後輩の相談にのる" } }),
  ],
  tamayura: [
    L({ yr: 2, know: "draw", when: "2年後", title: "図面のずれに、先に気づく", mean: "2年目。図面から、明日の現場の動きを読む役を任された", role: "資材の段取り役",
      work: { text: "次の工事の図面を見て、資材を運ぶ順番を決める", talk: { who: "boss", to: "me", text: "明日の資材、どこから入れるか決めてくれる？" } },
      wall: { text: "図面どおりに置くと、クレーンの通り道がふさがると気づく", think: "（このまま置いたら、明日の作業が止まる…）" },
      learn: { who: "senpai", how: "教わる", text: "新井さんと職人さんに相談し、置き場所を図面に書き足す", line: "図面は、現場で見て書き足すものなんだよ" },
      after: { when: "3年後", text: "図面から、1週間先の段取りまで言えるようになる" } }),
    L({ yr: 3, know: "plan", when: "3年後", title: "小さな現場を、1つ任される", mean: "3年目。現場の工程を、自分で組む段階になった", role: "小さな現場の担当",
      work: { text: "小さな工事の現場を1つ、まるごと任される", talk: { who: "boss", to: "me", text: "この現場、まるごと任せるよ" } },
      wall: { text: "台風で3日止まり、引き渡しの日に間に合わないかもしれない", think: "（どこを詰めればいいんだ…）", tint: "night" },
      learn: { who: "me", how: "工夫", text: "職人さんの都合を1人ずつ聞き、作業の順番を組み直す", line: "順番を変えれば、2日取り戻せる" },
      after: { when: "5年後", text: "大きな現場の工程を任される" } }),
    L({ yr: 5, know: "license", when: "5年後", title: "施工管理の資格に挑む", mean: "5年目。現場を任される条件になる資格に挑む", role: "資格の勉強",
      work: { text: "会社の支えで、施工管理の資格の試験を受ける", talk: { who: "peer", to: "me", text: "一緒に受けるよ。一緒に勉強しよう" } },
      wall: { text: "仕事のあとで、勉強の時間がとれない", think: "（今日も、問題集を開けなかった）", tint: "night" },
      learn: { who: "me", how: "工夫", text: "現場で見た決まりを、そのまま問題集の答えに結びつけて覚える", line: "現場で見たことなら、忘れない" },
      after: { when: "その後", text: "現場を任される条件がそろう" } }),
  ],
  shiosai: [
    L({ yr: 2, know: "fork", when: "2年後", title: "荷物の流れを任される", mean: "2年目。フォークリフトで、入荷の流れを任された", role: "入荷の流れの担当",
      work: { text: "フォークリフトで、入ってきた荷物を棚まで運ぶ流れを任される", talk: { who: "boss", to: "me", text: "入荷の流れ、任せてもいいかな" } },
      wall: { text: "荷物が重なる時間に、通路でフォークリフト同士がぶつかりそうになる", think: "（危なかった…）", tint: "sweat" },
      learn: { who: "senpai", how: "教わる", text: "堀さんと、通る道を一方通行に決めて、床に矢印を引く", line: "道を決めれば、ぶつからないよ" },
      after: { when: "3年後", text: "通路の決まりとして、倉庫の全員が使う" } }),
    L({ yr: 3, know: "stock", when: "3年後", title: "新人に、棚卸しを教える", mean: "3年目。在庫の数え方を、人に教える段階になった", role: "棚卸しの教え係",
      work: { text: "月末の棚卸しで、新人に数え方を教える", talk: { who: "boss", to: "me", text: "新人の2人、棚卸しで見てあげてくれる？" } },
      wall: { text: "新人が数をまちがえ、記録と棚の数が合わない", think: "（どう伝えれば、まちがえないんだろう）" },
      learn: { who: "me", how: "工夫", text: "3か月目に教わった「動かしたその場で記録する」を、写真つきで見せて伝える", line: "自分もそう教わった。動かしたその場で記録する" },
      after: { when: "5年後", text: "棚卸しのやり方を、センター全体に教える" } }),
    L({ yr: 5, know: "shift", when: "5年後", title: "来月のシフトを組む", mean: "5年目。人の配置を任される段階になった", role: "シフトづくり",
      work: { text: "繁忙期のシフトを組む役を任される", talk: { who: "boss", to: "me", text: "来月のシフト、組んでみてくれるかな" } },
      wall: { text: "休みの希望が重なり、全員の希望はかなえられない", think: "（だれかに我慢してもらうしかないのかな）" },
      learn: { who: "me", how: "工夫", text: "去年の出荷の数を見て、忙しい日だけ人を厚くする", line: "忙しい日が分かれば、休みも組める" },
      after: { when: "その後", text: "リーダーとして、センターの人の配置を任される" } }),
  ],
  komugi: [
    L({ yr: 2, know: "cost", when: "2年後", title: "発注を任される", mean: "2年目。求人のとおり、発注（仕入れの注文）を任された", role: "発注の担当",
      work: { text: "求人のとおり、2年目から発注を担当する", talk: { who: "boss", to: "me", text: "今週から、発注をお願いできるかな" } },
      wall: { text: "雨の日に仕入れすぎて、野菜を捨てることになる", think: "（もったいないことをした…）", tint: "sweat" },
      learn: { who: "boss", how: "教わる", text: "三浦店長に、天気と曜日で注文の数を変えるやり方を教わる", line: "天気予報も、発注の材料なんだよ" },
      after: { when: "3年後", text: "食材を捨てる量が、半分になる" } }),
    L({ yr: 3, know: "prep", when: "3年後", title: "2号店の副店長の話が来る", mean: "3年目。新しい店の仕込みを、1から任される段階になった", role: "2号店の副店長候補",
      work: { text: "新しい2号店の仕込みの流れを、1から作る", talk: { who: "boss", to: "me", text: "2号店の副店長、考えてみてくれる？" } },
      wall: { text: "2号店は調理場がせまく、本店と同じ仕込みができない", think: "（同じやり方じゃ、回らない…）" },
      learn: { who: "senpai", how: "教わる", text: "中西さんと、仕込みの順番を調理場の広さに合わせて組み直す", line: "場所に合わせて、順番を変えればいい" },
      after: { when: "5年後", text: "2号店の仕込みの決まりになる" } }),
    L({ yr: 5, know: "run", when: "5年後", title: "2号店を回す", mean: "5年目。人・仕込み・お客さんの流れを見る段階になった", role: "2号店の副店長",
      work: { text: "2号店で、人・仕込み・お客さんの流れを見る", talk: { who: "peer", to: "me", text: "ホールは任せて。厨房は頼んだよ" } },
      wall: { text: "ピークに、ホールと厨房の声がかみ合わない", think: "（声が多すぎて、伝わらない）", tint: "sweat" },
      learn: { who: "me", how: "工夫", text: "注文の伝え方を、短い合図に決める", line: "合図を決めたら、声が少なくて済む" },
      after: { when: "その後", text: "2号店の店長を任される" } }),
  ],
};

/** 作り込んでいない求人（Claude が読んだ求人など）の 2年後・3年後・5年後。スキルの育ち方から、任される場面を組む */
function laterGeneric(job: Job, ks: Know[], target: (id: string) => number): Later[] {
  const order = [...ks].sort((a, z) => target(z.id) - target(a.id));
  const k1 = order[0];
  const k2 = order[1] ?? order[0];
  const k3 = order[2] ?? order[0];
  if (!k1) return [];
  const p = job.people;
  return [
    { yr: 2, know: k1.id, when: "2年後", title: `「${k1.name}」を任される`, mean: "2年目。教わる側から、任される側になった", role: `${k1.name}の担当`,
      work: { text: `2年目、「${k1.name}」の仕事を1人で任される`, talk: { who: "boss", to: "me", text: `${k1.name}、任せてもいいかな` } },
      wall: { text: "任されたことで、1人では決めきれない場面がふえる", think: "（自分の判断で、大丈夫かな）" },
      learn: { who: "senpai", how: "教わる", text: `${p.senpai.name}さんに、迷った時に決まりへ戻って確かめるやり方を教わる`, line: "迷ったら、決まりに戻って確かめよう" },
      after: { when: "3年後", text: `${k1.what}を、自分の判断でできるようになる` } },
    { yr: 3, know: k2.id, when: "3年後", title: "新人に教える係になる", mean: "3年目。自分ができるだけでなく、人に教えることを任された", role: "新人の教え係",
      work: { text: `新しく入った人に、「${k2.name}」を教える係を任される`, talk: { who: "boss", to: "me", text: "新人に教える係、お願いできる？" } },
      wall: { text: "自分は分かるのに、うまく伝えられない", think: "（どう言えば伝わるんだろう）" },
      learn: { who: "me", how: "工夫", text: "自分がつまずいた所から順に、手順を見せて教える", line: "自分のつまずきが、教える材料になる" },
      after: { when: "5年後", text: "教えた手順が、職場の新人用の決まりになる" } },
    { yr: 5, know: k3.id, when: "5年後", title: `「${k3.name}」のまとめ役になる`, mean: "5年目。仕事のまとめ役を任される段階になった", role: "まとめ役",
      work: { text: `「${k3.name}」のまとめ役を任される`, talk: { who: "peer", to: "me", text: "まとめ役、似合ってるよ" } },
      wall: { text: "みんなのやり方がばらばらで、仕事がそろわない", think: "（どこから、そろえればいいんだろう）" },
      learn: { who: "me", how: "工夫", text: "1年目に自分が教わったことを、みんなで使える手順にまとめる", line: "教わったことを、次の人へ渡す" },
      after: { when: "その後", text: "職場のまとめ役として、頼られるようになる" } },
  ];
}

const ACT_OF: Record<Place, Act> = { office: "pc", factory: "machine", construction: "build", logistics: "carry", food: "cook", home: "rest", school: "teach", overseas: "talk" };

/** 場面の主のスキルと、ほかのスキルの Lv を順に足していく */
function lvAfter(eps: JEpisode[]): Record<string, number> {
  const lv: Record<string, number> = {};
  for (const ep of eps) for (const u of [ep.up, ...(ep.extra ?? [])]) lv[u.know] = Math.max(lv[u.know] ?? 0, u.to);
  return lv;
}

/** 分かれ道までの場面（選んだ年数まで）。分かれ道の時点の Lv は know.ts の育ち方と必ず合わせる */
export function journeyPre(job: Job, years: Years, forkIdx: number): JEpisode[] {
  const one: JEpisode[] = episodesOf(job).map((e) => ({ ...e, yr: e.when.includes("1年") ? 1 : 0 }));
  const ks = knowOf(job);
  const target = (id: string) => {
    const k = ks.find((x) => x.id === id);
    return k ? stageAt(k, forkIdx, forkIdx, null) + 1 : 0;
  };
  const list = [...one];
  for (const x of LATER[job.id] ?? laterGeneric(job, ks, target)) {
    if (x.yr > years) continue;
    const lv = lvAfter(list);
    const from = lv[x.know] ?? 0;
    const to = Math.min(4, Math.max(from + 1, x.yr === years ? target(x.know) : Math.min(target(x.know), from + 1)));
    const { yr, know, ...rest } = x;
    list.push({ ...rest, id: `${job.id}-y${yr}`, yr, place: job.place, act: ACT_OF[job.place], up: { know, from, to } });
  }
  /* 分かれ道の時点で、ほかのスキルも know.ts の育ち方にそろえる（最後の場面の「ほかに育ったスキル」として見せる） */
  const lv = lvAfter(list);
  const last = list[list.length - 1];
  const extra = ks.filter((k) => k.id !== last.up.know && target(k.id) > (lv[k.id] ?? 0)).map((k) => ({ know: k.id, from: lv[k.id] ?? 0, to: target(k.id) }));
  if (extra.length) list[list.length - 1] = { ...last, extra: [...(last.extra ?? []), ...extra] };
  return list;
}

/** e 番目の場面の beat 段まで進んだ時の、各スキルの Lv */
export function journeyLevels(eps: JEpisode[], e: number, beat: number): Record<string, number> {
  const lv: Record<string, number> = {};
  eps.forEach((ep, i) => {
    if (i > e) return;
    const done = i < e || beat >= 3;
    for (const u of [ep.up, ...(ep.extra ?? [])]) lv[u.know] = Math.max(lv[u.know] ?? 0, done ? u.to : u.from);
  });
  return lv;
}

/* ---------- 選んだ道の場面（2つ）。職場の絵・人・セリフを道に合わせる ---------- */
const FIT_ORDER = { 活きる: 2, 少し活きる: 1, 活きない: 0 } as const;
function pickKnows(job: Job, b: BranchId, lv: Record<string, number>): [Know, Know] {
  const ks = knowOf(job)
    .map((k) => ({ k, w: FIT_ORDER[k.fits[b].fit] * 10 + (lv[k.id] ?? 0) }))
    .sort((a, z) => z.w - a.w)
    .map((x) => x.k);
  return [ks[0], ks[1] ?? ks[0]];
}

export function journeyRoad(job: Job, b: BranchId, years: Years, age: number, bgOf: (b: BranchId) => string, pre: JEpisode[]): JEpisode[] {
  const lv = lvAfter(pre);
  const [k1, k2] = pickKnows(job, b, lv);
  const up = (k: Know, cur: Record<string, number>) => ({ know: k.id, from: cur[k.id] ?? 0, to: Math.min(4, (cur[k.id] ?? 0) + 1) });
  const firstLine = episodesOf(job).find((e) => e.learn.who !== "me")?.learn.line ?? "分からない時は、すぐ聞いて";
  const sb = simpleBranch(job, b, age);
  const place: Place = b === "abroad" ? "overseas" : b === "relearn" ? "school" : b === "other" ? sb.place : job.place;
  const ind = job.industry;
  const p = job.people;
  type T = Omit<JEpisode, "id" | "up" | "place" | "act" | "road" | "bg"> & { k: Know };
  const tpl: T[] = (() => {
    switch (b) {
      case "stay":
        return [
          { k: k1, yr: years + 2, when: `${years + 2}年後`, title: "まとめ役を任される", mean: `${job.company}に残り、チームのまとめ役になった`, role: "まとめ役",
            work: { text: `${job.company}で、${p.boss.role === "班長" ? "班" : "チーム"}のまとめ役を任される`, talk: { who: "boss", to: "me", text: "これからは、まとめ役として頼むよ" } },
            wall: { text: "自分の仕事だけでなく、みんなの仕事の遅れも見なければならない", think: "（全部は、見きれない…）", tint: "sweat" },
            learn: { who: "senpai", how: "教わる", text: `${p.senpai.name}さんに、毎朝5分で仕事を分け合うやり方を教わる`, line: "1人で抱えないで、朝に分けよう" },
            after: { when: "その後", text: k1.fits.stay.why } },
          { k: k2, yr: years + 8, when: `${years + 8}年後`, title: "若手を育てる", mean: "長く残ったからこそ、若手を育てる役が回ってきた", role: "若手の育て役",
            work: { text: "新しく入った若手に、仕事を教える役になる", talk: { who: "peer", to: "me", text: "もう、すっかり教える側だね" } },
            wall: { text: "若手が、昔の自分と同じ所でつまずいている", think: "（あの時、どう教わったんだっけ）" },
            learn: { who: "me", how: "工夫", text: "1年目に自分が教わった言葉を、そのまま若手に伝える", line: firstLine },
            after: { when: "その後", text: k2.fits.stay.why } },
        ];
      case "same":
        return [
          { k: k1, yr: years + 1, when: `${years + 1}年後`, title: `同じ${ind}の、大きな会社へ移る`, mean: "同じ業界の、規模の大きな会社で働きはじめた", role: "移った先の新人",
            names: { local: `新しい会社の${p.boss.role}`, student: "新しい会社の後輩" },
            work: { text: `同じ${ind}の、規模の大きな会社で働きはじめる`, talk: { who: "local", to: "me", text: `${k1.name}の経験があるなら、すぐ任せられそうだね` } },
            wall: { text: "同じ仕事なのに、前の会社と決まりが違い、最初の1か月はとまどう", think: "（同じ仕事なのに、やり方が違う…）" },
            learn: { who: "me", how: "工夫", text: `身につけた「${k1.name}」と、新しい会社の決まりを紙に並べ、違う所だけ覚え直す`, line: "違う所だけ覚えればいい" },
            after: { when: "その後", text: k1.fits.same.why } },
          { k: k2, yr: years + 6, when: `${years + 6}年後`, title: "部署のまとめ役になる", mean: "経験を買われて、新しい会社でもまとめ役を任された", role: "部署のまとめ役",
            names: { local: `新しい会社の${p.boss.role}`, student: "新しい会社の後輩" },
            work: { text: "経験を買われて、部署のまとめ役を任される", talk: { who: "local", to: "me", text: "あなたのやり方、みんなに教えてもらえる？" } },
            wall: { text: "自分の言い方が、この会社の人にはうまく伝わらない", think: "（言い方を変えないと…）" },
            learn: { who: "student", how: "教わる", text: "後輩が、この会社の言葉で言い直すと伝わると教えてくれる", line: "うちの言い方で話してもらえると、すぐ伝わります" },
            after: { when: "その後", text: k2.fits.same.why } },
        ];
      case "other":
        return [
          { k: k1, yr: years + 1, when: `${years + 1}年後`, title: `${job.otherIndustry}の仕事へ移る`, mean: `${ind}から、${job.otherIndustry}の業界へ移った`, role: "新しい業界の新人",
            names: { local: `${job.otherIndustry}の職場の先輩`, student: "新しい職場の後輩" },
            work: { text: `${job.otherIndustry}の会社で、一から働きはじめる`, talk: { who: "local", to: "me", text: "ようこそ。最初は分からなくて当たり前だからね" } },
            wall: { text: `${ind}の言葉が通じず、最初は何も分からない`, think: "（また1年目からだ…）", tint: "sweat" },
            learn: { who: "me", how: "工夫", text: `${ind}で身につけた「${k1.name}」が、ここでも使えると気づく。${k1.fits.other.why}`, line: "前の仕事で覚えたこと、ここでも使える" },
            after: { when: "その後", text: k1.fits.other.why } },
          { k: k2, yr: years + 5, when: `${years + 5}年後`, title: "2つの業界をつなぐ", mean: "2つの業界を知る人として、頼られるようになった", role: "2つの業界をつなぐ役",
            names: { local: `${job.otherIndustry}の職場の先輩`, student: "新しい職場の後輩" },
            work: { text: `${ind}と${job.otherIndustry}の両方を知る人として、相談を受ける`, talk: { who: "student", to: "me", text: `${ind}のこと、教えてもらえますか？` } },
            wall: { text: "どちらの業界の人にも、相手の事情がうまく伝わらない", think: "（同じことを、違う言葉で話している）" },
            learn: { who: "me", how: "工夫", text: "2つの業界の言葉を言い換える、早見表を作る", line: "言葉をそろえたら、話が進んだ" },
            after: { when: "その後", text: "2つの業界をつなぐ役として、頼られる" } },
        ];
      case "indep":
        return [
          { k: k1, yr: years + 7, when: `${years + 7}年後`, title: "小さく独立する", mean: "会社で身につけたスキルで、自分の仕事を始めた", role: "自分で仕事を請け負う",
            names: { local: "最初のお客さん", student: "やとった仲間" },
            work: { text: `${ind}の仕事を、自分で請け負いはじめる`, talk: { who: "local", to: "me", text: "評判を聞いて来ました。お願いできますか" } },
            wall: { text: "仕事を取る・お金を管理する・自分で作業する、を全部1人でやることになる", think: "（全部、自分で決めないといけない）", tint: "night" },
            learn: { who: "me", how: "工夫", text: `身につけた「${k1.name}」を、仕事の売りにする。${k1.fits.indep.why}`, line: "自分の強みは、これだ" },
            after: { when: "その後", text: k1.fits.indep.why } },
          { k: k2, yr: years + 15, when: `${years + 15}年後`, title: "仲間をやとう", mean: "仕事がふえ、人をやとう立場になった", role: "人をやとう立場",
            names: { local: "最初のお客さん", student: "やとった仲間" },
            work: { text: "仕事がふえ、仲間を3人やとう", talk: { who: "student", to: "me", text: "どこから覚えればいいですか？" } },
            wall: { text: "人に任せるのがこわく、自分で全部やってしまう", think: "（任せて、失敗されたらどうしよう）" },
            learn: { who: "me", how: "工夫", text: "1年目に教わったやり方で、手順を見せてから任せる", line: firstLine },
            after: { when: "その後", text: k2.fits.indep.why } },
        ];
      case "relearn":
        return [
          { k: k1, yr: years + 3, when: `${years + 3}年後`, title: "働きながら、夜の学校で学び直す", mean: "仕事を続けながら、もう一度学ぶ道を選んだ", role: "働きながら学ぶ",
            names: { local: "学校の先生", student: "同じクラスの学生" },
            work: { text: "仕事のあと、夜の学校に通いはじめる", talk: { who: "local", to: "me", text: "現場を知っている人の質問は、するどいですね" } },
            wall: { text: "仕事と勉強の両立で、時間が足りない", think: "（今日も寝不足だ…）", tint: "night" },
            learn: { who: "me", how: "工夫", text: `現場で使った「${k1.name}」の例を、勉強のノートに書き足して覚える`, line: "現場の例があると、すぐ分かる" },
            after: { when: "その後", text: k1.fits.relearn.why } },
          { k: k2, yr: years + 7, when: `${years + 7}年後`, title: "資格を生かして、専門の仕事へ", mean: "学び直した資格を生かして、専門の仕事を任された", role: "専門の仕事",
            names: { local: "新しい職場の上司", student: "同じクラスの学生" },
            work: { text: "取った資格を生かして、専門の仕事を任される", talk: { who: "local", to: "me", text: "資格と現場の両方を知っている人は、少ないんだ" } },
            wall: { text: "教科書どおりにいかない現場の相談が来る", think: "（教科書には、こんな例はなかった）" },
            learn: { who: "me", how: "工夫", text: "現場の経験と、学んだことを組み合わせて答える", line: "両方を知っているから、答えられる" },
            after: { when: "その後", text: k2.fits.relearn.why } },
        ];
      case "abroad":
        return [
          { k: k1, yr: years + 2, when: `${years + 2}年後`, title: "海外の拠点へ", mean: "海外の新しい拠点で、働きはじめた", role: "海外の拠点の担当",
            names: { local: "現地の仲間", student: "現地の新人" },
            work: { text: "海外の新しい拠点で働きはじめる", talk: { who: "local", to: "me", text: "ようこそ！ 一緒にやってみよう" } },
            wall: { text: "言葉が通じず、日本と同じやり方が伝わらない", think: "（日本と同じやり方が、通じない…）", tint: "sweat" },
            learn: { who: "me", how: "工夫", text: `写真と手順で見せて伝える。${k1.fits.abroad.why}`, line: "見せたら、言葉がなくても伝わった" },
            after: { when: "その後", text: k1.fits.abroad.why } },
          { k: k2, yr: years + 10, when: `${years + 10}年後`, title: "現地の仲間と、拠点を立ち上げる", mean: "現地の仲間と、新しい拠点を立ち上げる役になった", role: "拠点の立ち上げ役",
            names: { local: "現地の仲間", student: "現地の新人" },
            work: { text: "現地の仲間と、新しい拠点を立ち上げる", talk: { who: "student", to: "me", text: "あなたのやり方を、覚えたいです" } },
            wall: { text: "国によって決まりが違い、日本のやり方をそのまま持ち込めない", think: "（ここの決まりに、合わせないと）" },
            learn: { who: "local", how: "教わる", text: "現地の仲間に、この国の決まりを教わり、手順を作り直す", line: "この国では、こうするんだよ" },
            after: { when: "その後", text: "国内と海外の両方に、仲間ができる" } },
        ];
    }
  })();
  const cur = { ...lv };
  return tpl.map(({ k, ...t }, i) => {
    const u = up(k, cur);
    cur[k.id] = u.to;
    return { ...t, id: `${job.id}-${b}-${i}`, place, act: ACT_OF[place], bg: bgOf(b), road: b, up: u };
  });
}
