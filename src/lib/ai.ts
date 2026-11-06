/* Claude で求人を読む（11/6 決定：Claude を1回呼び、決まった形の JSON で返させる）。
 *
 * どうやって Claude を呼ぶか：
 *   claude.ai の Artifact で開いた時は、ページから Claude に問い合わせる仕組み（sample）を使う。
 *   見ている人自身の Claude の利用枠で動くので、API キーをコードに書かない・持たない。
 *   最初の1回だけ「このページに Claude の利用を許可しますか」と聞かれる。
 *   Artifact の外（GitHub から開いた時など）や、許可されなかった・失敗した時は、見本データに戻す。
 *
 * ページはインターネットに出られないため、求人URLの中身は取りに行かない。
 *   見本のURL → 用意した架空の求人本文を Claude に渡す。
 *   それ以外のURL → 本人が貼った求人の本文を Claude に渡す。読めない所は「不明」のまま（補わない）。
 *
 * 返してもらう形：会社まとめ・身につく専門知識・6本の道の判定・場面の文（入社1年の場面、分かれ道、6本の道）。
 */

import type { Episode } from "./episodes";
import { EPISODES } from "./episodes";
import { KNOW, type Fit, type Know } from "./know";
import { BRANCHES, JOBS, type Act, type BranchId, type Chapter, type Job, type Place, type Who } from "./life";
import { CHECKS, FORK_Y1, FORK_Y5 } from "./years";

/* ---------- Claude を呼ぶ（Artifact の sample 機能） ---------- */
type SampleFn = ((input: string, opts?: Record<string, unknown>) => Promise<{ text: string }>) & {
  json: <T>(input: string, opts?: Record<string, unknown>) => Promise<T>;
};
type ClaudeHost = { use: (name: string) => Promise<unknown> };

let samplePromise: Promise<SampleFn | null> | null = null;
/** このページから Claude を呼べるか（Artifact の中で、sample が使える時だけ関数が返る） */
export function getSample(): Promise<SampleFn | null> {
  if (samplePromise) return samplePromise;
  const host = (typeof window !== "undefined" ? (window as unknown as { claude?: ClaudeHost }).claude : undefined) ?? null;
  samplePromise = host?.use ? host.use("sample").then((s) => (s as SampleFn) ?? null).catch(() => null) : Promise.resolve(null);
  return samplePromise;
}

/* ---------- 返してもらう形 ---------- */
export type AiFit = { fit: Fit; why: string };
export type AiRead = {
  job: { company: string; title: string; place: Place; area: string | null; pay: string | null; hours: string | null };
  karte: { label: string; value: string | null; where: string | null }[];
  people: { boss: { role: string; name: string }; senpai: { role: string; name: string }; peer: { role: string; name: string } };
  knows: { id: string; name: string; what: string; quote: string | null; assumed: boolean; lv: { y1: number; y3: number; y5: number }; fits: Record<BranchId, AiFit> }[];
  episodes: {
    when: string;
    title: string;
    mean: string;
    role: string;
    work: { text: string; line: string };
    wall: { text: string; think: string };
    learn: { who: "boss" | "senpai" | "peer" | "me"; text: string; line: string };
    up: { know: string; from: number; to: number };
    after: { when: string; text: string };
  }[];
  fork: { y1: string; y3: string; y5: string; line: string };
  roads: Record<BranchId, string>;
  checks: string[];
  points?: { good?: string[]; care?: string[] };
};

export type AiMeta = {
  /** Claude が読んだ結果か、見本データか */
  source: "claude";
  karte: AiRead["karte"];
  roads: Record<BranchId, string>;
  checks: string[];
  /** 合いそうな所・気をつけたい所（Claude が求人から書く） */
  points: { good: string[]; care: string[] };
  /** 貼られた求人の本文（出典の表示に使う） */
  text: string;
};
/** Claude が読んだ求人の、会社まとめ・道の場面・確かめること（job.id ごと） */
export const AI_META: Record<string, AiMeta> = {};

/* ---------- 求人の本文 ---------- */
export function jobText(j: Job): string {
  return [`会社名：${j.company}`, `職種：${j.title}`, `勤務地：${j.area}`, `給与：${j.pay}`, `勤務時間：${j.hours}`, `特徴：${j.tags.join("・")}`, "", ...j.body].join("\n");
}

const PLACES: Place[] = ["factory", "office", "construction", "logistics", "food"];
const B_IDS = BRANCHES.map((b) => b.id);

export function buildPrompt(text: string, url: string): string {
  return `あなたは、求職者が「応募する前に、その会社での将来を試運転する」ためのシナリオ（筋書き）を作る役です。
下の求人の本文だけを読んで、決まった形の JSON を1つだけ返してください。説明文は書かないでください。

# 守ること
- 求人に書いていないことは補わない。会社まとめで読み取れない項目は value を null にする（画面では「不明」と出す）。
- 実在の人名・実在の会社名を新しく作らない。上司・先輩・同期の名前は、ありふれた名字だけの架空の名前にする。
- 点数・％・合否・「当たる」などの言葉は使わない。未来を断定しない。給料の金額を作らない。
- お金の借入・保険・投資の提案はしない。
- 文は中学生にも分かるやさしい日本語。1文は短く。
- 場面は前向きに：壁はあってよいが、主役は「しっかり対処できた」手応えにする。
- セリフは、初めて見た人でも何を言いたいか分かる、自然でやさしい話し言葉にする。命令口調（「〜しろ」「〜しておけ」「お前」）や、意味の分かりにくい短すぎる言い方にしない。

# JSON の形（キーと型を必ず守る）
{
  "job": {"company": "求人に書いてある会社名", "title": "職種名", "place": "factory|office|construction|logistics|food のどれか（職場がいちばん近いもの）", "area": "勤務地 または null", "pay": "求人に書いてある給与の書き方そのまま または null", "hours": "勤務時間 または null"},
  "karte": [ {"label": "仕事の内容", "value": "…" , "where": "求人のどの部分から読んだか（例：2段落目）"}, … 8項目前後。必ず入れる label：仕事の内容／最初の教わり方／会社の支え／勤務地／給与／働く時間／平均の残業時間／3年後も働いている人の割合。書いていない項目は value と where を null ],
  "people": {"boss": {"role": "班長・課長など", "name": "名字"}, "senpai": {"role": "先輩", "name": "名字"}, "peer": {"role": "同期", "name": "名字"}},
  "knows": [ 専門知識を3つ ＋ 最後に AIスキルを1つ（id は "ai"、name は「AIの答えを確かめて使う」）。
    {"id": "k1", "name": "8文字以内", "what": "何ができるようになるか（30字以内）", "quote": "根拠になる求人の一文をそのまま または null", "assumed": 求人に書いていない仮定なら true,
     "lv": {"y1": 0〜2, "y3": 1〜3, "y5": 1〜4},   ← Lv は 0=まだ 1=知った 2=できる 3=任される 4=教えられる。1年は「知った・できる」まで、3年で「任される」、5年で「教えられる」が目安。年数だけで一律に上げず、この仕事の中身で差をつける。
     "fits": {"stay": {"fit": "活きる|少し活きる|活きない", "why": "20字以内"}, "same": …, "other": …, "indep": …, "relearn": …, "abroad": …}} ],
  "episodes": [ 入社1年の場面を4つ。when は順に "入社1週間" "1か月後" "3か月後" "1年後"。
    {"when": "入社1週間", "title": "15字以内", "mean": "この出来事が何を意味するか（例：先輩が離れ、1人で任されはじめた）", "role": "この場面のあとの役割（10字以内）",
     "work": {"text": "どんな仕事をしているか", "line": "上司か先輩があなたに話しかける自然な一言（命令口調にしない）"},
     "wall": {"text": "つまずいたこと（短く）", "think": "（心の声。かっこで囲む）"},
     "learn": {"who": "boss|senpai|peer|me（me は自分で工夫した時）", "text": "だれに何を教わったか／何を工夫したか", "line": "その時の一言"},
     "up": {"know": "k1 など knows の id", "from": 0, "to": 1},  ← 同じ知識の Lv は場面ごとに1つずつ上がる
     "after": {"when": "その後の時点（例：3年後）", "text": "このスキルがあとでどう役に立ったか"}} ],
  "fork": {"y1": "1年後の分かれ道の時点の様子（1文）", "y3": "3年後の様子（1文）", "y5": "5年後の様子（1文）", "line": "3年後に上司があなたにかける一言"},
  "roads": {"stay": "この会社に残る道での場面（2文。身についた知識がどう活きるか）", "same": "同じ業界で移る道", "other": "違う業界へ移る道", "indep": "独立する道", "relearn": "学び直す道", "abroad": "海外へ行く道"},
  "checks": ["面接で聞ける質問の形（「〜ですか？」）。求人に書いていない所や「不明」の所を確かめる質問", "…", "…"],
  "points": { "good": ["この仕事が合いそうな人（求人の中身から。2〜3個）"], "care": ["応募の前に気をつけたい所（求人の中身から。2〜3個。悪口にしない）"] }
}

# 求人の本文（URL：${url || "なし"}）
${text.slice(0, 6000)}`;
}

/* ---------- 返ってきた JSON を確かめて、画面のデータにする ---------- */
const FITS: Fit[] = ["活きる", "少し活きる", "活きない"];
const clamp = (n: unknown, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));
const str = (v: unknown, d = "") => (typeof v === "string" && v.trim() ? v.trim() : d);
const strOrNull = (v: unknown) => (typeof v === "string" && v.trim() && !/^(null|不明|なし)$/i.test(v.trim()) ? v.trim() : null);
const fitOf = (v: unknown): AiFit => {
  const o = (v ?? {}) as { fit?: unknown; why?: unknown };
  const f = FITS.includes(o.fit as Fit) ? (o.fit as Fit) : "少し活きる";
  return { fit: f, why: str(o.why, "シナリオ上の見立て") };
};

let seq = 0;

/** Claude の答えから、求人（Job）・専門知識・場面を作って登録する。登録した job を返す */
export function registerAiRead(raw: unknown, url: string, text: string): Job {
  const r = (raw ?? {}) as Partial<AiRead>;
  const rj = (r.job ?? {}) as Partial<AiRead["job"]>;
  const place: Place = PLACES.includes(rj.place as Place) ? (rj.place as Place) : "office";
  const tpl = JOBS.find((j) => j.place === place && !j.id.startsWith("ai-")) ?? JOBS[0];
  const id = `ai-${++seq}`;

  /* 専門知識：3つ＋AIスキル。Lv は 0〜4、育ち具合（STAGES の番号）は Lv-1 */
  let knows = Array.isArray(r.knows) ? r.knows.slice(0, 5) : [];
  knows = knows.filter((k) => k && str(k.name));
  if (!knows.some((k) => k.id === "ai"))
    knows.push({ id: "ai", name: "AIの答えを確かめて使う", what: "AIの答えを、記録や決まりで確かめてから仕事に組み込む", quote: null, assumed: true, lv: { y1: 0, y3: 1, y5: 2 }, fits: Object.fromEntries(B_IDS.map((b) => [b, { fit: "活きる", why: "どの道でも、確かめて使える人は少ない" }])) as Record<BranchId, AiFit> });
  const ids = knows.map((k, i) => (k.id === "ai" ? "ai" : str(k.id, `k${i + 1}`)));

  /* 入社1年の場面：同じ知識の Lv は場面ごとに1つずつ上がるように整える */
  const lvNow: Record<string, number> = {};
  const whens = ["入社1週間", "1か月後", "3か月後", "1年後"];
  const eps: Episode[] = (Array.isArray(r.episodes) ? r.episodes.slice(0, 5) : []).map((e, i) => {
    const know = ids.includes(e?.up?.know) ? e.up.know : ids[i % Math.max(1, ids.length - 1)];
    const from = lvNow[know] ?? 0;
    const to = Math.min(4, from + 1);
    lvNow[know] = to;
    const who = (["boss", "senpai", "peer", "me"] as const).includes(e?.learn?.who as never) ? (e.learn.who as Who) : "senpai";
    const think = str(e?.wall?.think, "（どうしたらいいんだろう）");
    return {
      id: `${id}-e${i + 1}`,
      when: str(e?.when, whens[i] ?? "1年後"),
      place,
      act: tpl.trunk[1]?.act ?? ("pc" as Act),
      title: str(e?.title, "最初の壁"),
      mean: str(e?.mean, "仕事に慣れてきた"),
      role: str(e?.role, "見習い"),
      work: { text: str(e?.work?.text, "仕事を覚える"), talk: { who: "boss", to: "me", text: str(e?.work?.line, "わからないことは、いつでも聞いてね") } },
      wall: { text: str(e?.wall?.text, "うまくいかないことがあった"), think: think.startsWith("（") ? think : `（${think}）` },
      learn: { who, how: who === "me" ? "工夫" : "教わる", text: str(e?.learn?.text, "やり方を教わった"), line: str(e?.learn?.line, "一緒にやってみよう") },
      up: { know, from, to },
      after: { when: str(e?.after?.when, "その後"), text: str(e?.after?.text, "同じことで迷わなくなった") },
    };
  });

  const KS: Know[] = knows.map((k, i) => {
    const kid = ids[i];
    const y1 = lvNow[kid] ?? clamp(k.lv?.y1, 0, 2);
    const y3 = Math.max(y1, clamp(k.lv?.y3, 0, 4));
    const y5 = Math.max(y3, clamp(k.lv?.y5, 0, 4));
    const early = eps.filter((e, j) => j < 2 && e.up.know === kid).reduce((m, e) => Math.max(m, e.up.to), 0);
    const quote = strOrNull(k.quote);
    return {
      id: kid,
      name: str(k.name, `知識${i + 1}`),
      what: str(k.what),
      where: eps.filter((e) => e.up.know === kid).map((e) => `${e.when}「${e.title}」`).join("・") || "3年目までの仕事の中で（シナリオ上の想定）",
      src: quote ? { para: 0, quote } : null,
      assumed: kid === "ai" ? !quote : !!k.assumed,
      grow: [-1, early - 1, y1 - 1, y3 - 1],
      y5: y5 - 1,
      fits: Object.fromEntries(B_IDS.map((b) => [b, fitOf(k.fits?.[b])])) as Record<BranchId, AiFit>,
    };
  });

  /* 分かれ道の時点の文 */
  const fk = (r.fork ?? {}) as Partial<AiRead["fork"]>;
  const pp = (r.people ?? {}) as Partial<AiRead["people"]>;
  const person = (p: { role?: string; name?: string } | undefined, d: Job["people"]["boss"]) => ({ role: str(p?.role, d.role), name: str(p?.name, d.name), trait: "" });
  const trunk: Chapter[] = tpl.trunk.map((c, i) => {
    if (i === 2 && fk.y1) return { ...c, events: [str(fk.y1)], talks: [] };
    if (i === 3) return { ...c, events: [str(fk.y3, c.events[0])], talks: [{ who: "boss", to: "me", text: str(fk.line, "この3年で、ずいぶん任せられるようになったね") }], cutin: undefined, lifeEvent: undefined };
    return { ...c, events: c.events.slice(0, 1), talks: [] };
  });

  const job: Job = {
    ...tpl,
    id,
    company: str(rj.company, "（会社名は読み取れませんでした）"),
    title: str(rj.title, "（職種は読み取れませんでした）"),
    area: strOrNull(rj.area) ?? "不明",
    pay: strOrNull(rj.pay) ?? "不明",
    hours: strOrNull(rj.hours) ?? "不明",
    tags: ["Claude が求人の本文から読み取り"],
    body: text.split(/\n+/).map((x) => x.trim()).filter(Boolean).slice(0, 6),
    url: url || "（URLなし・本文を貼り付け）",
    people: { boss: person(pp.boss, tpl.people.boss), senpai: person(pp.senpai, tpl.people.senpai), peer: person(pp.peer, tpl.people.peer) },
    trunk,
    detailed: undefined,
  };

  JOBS.push(job);
  KNOW[id] = KS;
  EPISODES[id] = eps;
  FORK_Y1[id] = { event: str(fk.y1, trunk[2].events[0]), talk: { who: "boss", to: "me", text: "1年でここまで来たね" } };
  FORK_Y5[id] = { event: str(fk.y5, "5年が過ぎ、身についた知識を人に教える立場になる"), talk: { who: "boss", to: "me", text: "次は、教える側をお願いしたい" } };
  const roads = (r.roads ?? {}) as Partial<Record<BranchId, string>>;
  AI_META[id] = {
    source: "claude",
    karte: (Array.isArray(r.karte) ? r.karte : []).slice(0, 12).map((k) => ({ label: str(k?.label, "項目"), value: strOrNull(k?.value), where: strOrNull(k?.where) })),
    roads: Object.fromEntries(B_IDS.map((b) => [b, str(roads[b], "")])) as Record<BranchId, string>,
    checks: (Array.isArray(r.checks) ? r.checks : []).map((x) => str(x)).filter(Boolean).slice(0, 4),
    points: {
      good: (Array.isArray(r.points?.good) ? r.points.good : []).map((x) => str(x)).filter(Boolean).slice(0, 3),
      care: (Array.isArray(r.points?.care) ? r.points.care : []).map((x) => str(x)).filter(Boolean).slice(0, 3),
    },
    text,
  };
  CHECKS[id] = AI_META[id].checks;
  return job;
}

/** 求人の本文を Claude に1回渡し、登録した job を返す。使えない・失敗した時は理由を返す */
export async function readWithClaude(text: string, url: string, onText?: (t: string) => void, signal?: AbortSignal): Promise<{ job: Job } | { error: string }> {
  const sample = await getSample();
  if (!sample) return { error: "unavailable" };
  /* 形が崩れた答え（invalid_json）だけ、もう1回だけ頼み直す */
  for (let tryNo = 0; tryNo < 2; tryNo++) {
    try {
      const raw = await sample.json<AiRead>(buildPrompt(text, url), { modelTier: "default", signal, onText: onText ? ({ text: t }: { text: string }) => onText(t) : undefined });
      return { job: registerAiRead(raw, url, text) };
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "upstream_error";
      if (code === "invalid_json" && tryNo === 0) continue;
      return { error: code };
    }
  }
  return { error: "invalid_json" };
}

/** エラーの言い方（画面用） */
export const AI_ERROR: Record<string, string> = {
  unavailable: "このページでは Claude を呼べません（claude.ai の Artifact で開くと使えます）。見本データで続けます。",
  not_granted: "Claude の利用が許可されませんでした。見本データで続けます。",
  sampling_disabled: "このアカウントでは、ページから Claude を使えません。見本データで続けます。",
  rate_limited: "いまは Claude が混み合っています。少し待ってからもう一度お試しください。",
  invalid_json: "Claude の答えを読み取れませんでした。もう一度お試しください。",
  cancelled: "読み取りを止めました。",
  refused: "この本文は読み取れませんでした。別の求人でお試しください。",
};
export const aiErrorText = (code: string) => AI_ERROR[code] ?? "Claude との通信がうまくいきませんでした。もう一度お試しください。";

/** 見本データに戻った理由（会社まとめの画面に出す） */
export const AI_NOTE: { text: string } = { text: "" };
