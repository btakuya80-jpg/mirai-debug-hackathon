/* チームの案：会社情報のURLと、本人が読んだ口コミの文章を貼ると、職場の空気として場面に出す。
   口コミサイトを自動で読み取ることはしない。本人が読んで貼った文章の中の言葉だけを見る。
   見本のURL・口コミはすべて架空。 */

import type { Mood, Talk } from "./life";

export type Vibe = {
  id: string;
  /** 画面に出す短い言葉 */
  label: string;
  tone: "good" | "care";
  /** どの場面（入社=0, 1か月後=1, 1年後=2, 3年後=3）に出すか */
  at: number;
  talk: Talk;
  event: string;
  /** 場面の色の変え方 */
  tint?: "night" | "sweat" | "warm";
  mood?: Mood;
  /** 何から読み取ったか */
  from: "口コミ" | "会社情報";
  /** 読み取った元の文（貼った文・会社ページの1行） */
  quote: string;
};

type Rule = Omit<Vibe, "from" | "quote"> & { keys: string[] };

export const RULES: Rule[] = [
  { id: "teach", keys: ["教え方が丁寧", "教え方がていねい", "丁寧に教", "ていねいに教", "面倒見", "研修が手厚", "研修制度"], label: "教え方がていねい", tone: "good", at: 0, talk: { who: "senpai", text: "分からない所、もう一回いっしょにやろう" }, event: "先輩が横について、手順をていねいに教えてくれる", tint: "warm" },
  { id: "overtime", keys: ["残業が多", "残業多", "帰りが遅", "終電", "残業は多"], label: "残業が多い", tone: "care", at: 1, talk: { who: "senpai", text: "今日も、あと2時間だけ残ろうか" }, event: "残業で、帰りが遅い日が続く", tint: "night" },
  { id: "holiday", keys: ["休みが取りにく", "有給が取りにく", "休めない", "休みづら"], label: "休みが取りにくい", tone: "care", at: 1, talk: { who: "me", text: "（来月の連休、言い出しにくいな…）" }, event: "休みの希望を出しにくく、疲れがたまる", mood: "しんどい" },
  { id: "physical", keys: ["体力的にきつ", "立ちっぱなし", "重い物", "夜勤明け", "体がきつ"], label: "体力的にきつい", tone: "care", at: 1, talk: { who: "peer", text: "腰、だいじょうぶ？ 交代しようか" }, event: "体力的にきつい日が続き、帰るとすぐ寝てしまう", tint: "sweat" },
  { id: "strict", keys: ["厳しい", "きびしい", "怒鳴", "体育会"], label: "上司がきびしい", tone: "care", at: 1, talk: { who: "boss", text: "言い訳はいい。次、どうする？" }, event: "上司の言い方がきつく、報告の前に緊張する" },
  { id: "kind", keys: ["人間関係が良", "人間関係がよ", "雰囲気が良", "雰囲気がよ", "仲が良", "仲がよ", "アットホーム"], label: "人間関係がよい", tone: "good", at: 2, talk: { who: "peer", text: "お昼、みんなで行こうよ" }, event: "昼休みに同僚と話す時間が、楽しみになる", tint: "warm" },
  { id: "trust", keys: ["任せてもらえ", "若手でも", "裁量", "挑戦させて"], label: "若手に任せる", tone: "good", at: 2, talk: { who: "boss", text: "この件、やってみるか" }, event: "入社1年で、小さな仕事を丸ごと任される" },
  { id: "pay", keys: ["給料が上が", "昇給", "評価が公平", "資格手当"], label: "がんばりが給料に出る", tone: "good", at: 3, talk: { who: "boss", text: "資格の分、来月から手当がつくぞ" }, event: "資格や役割が、給料にきちんと反映される" },
];

export function readVibes(text: string, from: Vibe["from"]): Vibe[] {
  const t = text.replace(/\s/g, "");
  if (!t) return [];
  const sentences = t.split(/(?<=[。！？!?\n])/).filter(Boolean);
  return RULES.filter((r) => r.keys.some((k) => t.includes(k))).map(({ keys, ...r }) => {
    const key = keys.find((k) => t.includes(k))!;
    const quote = (sentences.find((x) => x.includes(key)) ?? key).replace(/[。！？!?]$/, "");
    return { ...r, from, quote };
  });
}

/* ---------- 見本の会社情報（架空） ---------- */
export type CompanyInfo = { url: string; founded: string; staff: string; avgAge: string; points: string[] };

export const COMPANY_INFO: Record<string, CompanyInfo> = {
  tsumugi: { url: "https://kaisha.example/tsumugi-seiko", founded: "1978年", staff: "社員 186人", avgAge: "平均 38歳", points: ["研修制度：入社3か月は先輩がつく", "資格手当あり（機械保全・品質管理）", "海外に工場が2つ"] },
  soyokaze: { url: "https://kaisha.example/soyokaze-kikaku", founded: "2009年", staff: "社員 42人", avgAge: "平均 31歳", points: ["毎月、AIの道具の勉強会", "若手でも企画を任せてもらえる", "転勤なし"] },
  tamayura: { url: "https://kaisha.example/tamayura-kensetsu", founded: "1965年", staff: "社員 230人", avgAge: "平均 44歳", points: ["資格手当あり（施工管理技士）", "現場は九州が中心", "女性の施工管理が増えている"] },
  shiosai: { url: "https://kaisha.example/shiosai-butsuryu", founded: "1999年", staff: "社員 95人・パート 300人", avgAge: "平均 35歳", points: ["フォークリフト免許の費用を会社が負担", "正社員登用は年2回", "年末と春が繁忙期"] },
  komugi: { url: "https://kaisha.example/komugi-shokudo", founded: "2012年", staff: "社員 18人・パート 40人", avgAge: "平均 29歳", points: ["のれん分けの制度あり", "まかない付き", "地元の農家と直接取引"] },
};

export function companyByUrl(url: string): [string, CompanyInfo] | undefined {
  const u = url.trim();
  if (!u) return undefined;
  return Object.entries(COMPANY_INFO).find(([id, c]) => c.url === u || u.includes(c.url.replace("https://", "")) || u.includes(id));
}

/* ---------- 見本の口コミ（架空。本人が自分で読んだ口コミを貼る想定の例） ---------- */
export const SAMPLE_REVIEWS: Record<string, string> = {
  tsumugi: "先輩の教え方が丁寧で、未経験でもなじめました。ただ繁忙期は残業が多いです。夜勤明けは体力的にきついけど、資格手当があるのはうれしい。",
  soyokaze: "若手でも企画を任せてもらえる会社です。人間関係が良く、相談しやすい。締め切り前は帰りが遅くなります。",
  tamayura: "所長は厳しいけど筋は通っています。現場によっては休みが取りにくい。資格手当で給料が上がりました。",
  shiosai: "教え方が丁寧なリーダーが多いです。年末は残業が多く、立ちっぱなしで体力的にきつい。",
  komugi: "店の雰囲気が良く、仲が良いです。ピークは体力的にきついけど、若手でも新メニューを任せてもらえます。",
};
