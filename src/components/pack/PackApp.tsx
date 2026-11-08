"use client";

/* G案・H案（Higgsfield の絵）。この作品の核＝「その会社で、どんな専門知識が身につき、その後の人生でどう活きるか」。
   G（/g・/g2）＝「育つ」が主役：場面ごとに専門知識が 知った→できる→任される→教えられる と育つ。手帳とカットインで刻む。
   H（/h・/h2）＝「分かれる」が主役：町の模型の上の「道の地図」が年表。持っていく知識が、どの道で活きる／活きないかを地図で見せる。
   共通：最初の画面（30秒で何の道具か）→ 会社のまとめ（出典・不明）→ 自分を設定 → 生涯 → 人生を並べる。
   見せ場は「分かれ道で、身につけた知識が6本の道に配られる瞬間」。 */

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import InfoWindow, { type HelpItem } from "@/components/InfoWindow";
import { CompanyExtras, JobBoard, MakeForm, SaveCompare, SimpleBranchView } from "@/components/life/parts";
import { karteOf } from "@/lib/karte";
import { AI_META, AI_NOTE, aiErrorText, jobText, readWithClaude } from "@/lib/ai";
import { BEATS, BRIDGE, LV_NAME, ROLE_AT_FORK, episodeOfVibe, episodesOf, levelsAt, trunkIdxOf, type Beat, type Episode } from "@/lib/episodes";
import { BRANCH_PAY, PAY_MARK, payOfJob, payTrendOf, roleOfChapter, type PayTrend } from "@/lib/growth";
import { FIT_MARK, STAGES, canSay, gainsAt, knowOf, lvByYears, nounOf, shinesAt, stageAt, type Know, type Years } from "@/lib/know";
import { CHECKS, POINTS } from "@/lib/years";
import { LFEATURES, LHELP, LNOTE } from "@/lib/life-help";
import {
  BRANCHES,
  END_AGE,
  JOBS,
  PLACE_LABEL,
  PSTEPS,
  LSTEP_LABEL,
  ageAt,
  chapterLabel,
  changesOf,
  jobByUrl,
  nameOf,
  simpleBranch,
  useFx,
  useLife,
  type BranchId,
  type Chapter,
  type CutKind,
  type Job,
  type LifeState,
  type LStep,
  type Mood,
  type Talk,
  type Who,
} from "@/lib/life";
import { usePrefersReducedMotion } from "@/lib/mirai";
import type { Vibe } from "@/lib/reviews";
import type { Place } from "@/lib/life";
import { journeyLevels, journeyPre, journeyRoad, type JEpisode } from "@/lib/journey";
import { PACKS, PLACE_ART, art, eventArt, meArt, newArt, whoArt, type Look, type PackKey, type StyleId } from "@/lib/packs";

type Fam = "g" | "h";
type Ctx = { style: StyleId; fam: Fam; look: Look };

const COPY: Record<Fam, { tag: string; make: string; start: string; life: string; saves: string; savesSub: string; book: string; gain: string }> = {
  g: {
    tag: "専門知識が、育っていく",
    make: "試運転する自分を設定",
    start: "働きはじめる",
    life: "専門知識の育ち方を見る",
    saves: "セーブデータを並べる",
    savesSub: "道ごとに、持っていった専門知識がどう使われたかを並べます。",
    book: "専門知識の手帳",
    gain: "専門知識 GET!",
  },
  h: {
    tag: "専門知識で、道が分かれる",
    make: "試運転する自分を設定",
    start: "地図の上を歩きはじめる",
    life: "道の地図を進む",
    saves: "地図の上に、人生を並べる",
    savesSub: "選んだ道を地図に重ね、持っていった知識が活きた道・活きなかった道を見比べます。",
    book: "持っていく知識（荷物）",
    gain: "知識を荷物に入れた",
  },
};

export default function PackApp({ style }: { style: StyleId }) {
  const s = useLife();
  const [look, setLook] = useState<Look>("m");
  const fam: Fam = style.startsWith("g") ? "g" : "h";
  const c: Ctx = { style, fam, look };
  const T = COPY[fam];
  const SRC = "依頼（2026-11-06・見せ方の作り直し）";
  const help: (HelpItem & { step: LStep })[] = [
    { id: "hero", step: "jobs", sel: '[data-h="hero"]', name: "最初の画面（30秒で何の道具か）", what: "一文・3つの段（求人URL→専門知識→75歳までの道）・見本の求人ボタンだけを最初に出す。", why: "初めて見た人が説明なしで、求人1件から人生を試す道具だと分かるようにするため。", src: SRC },
    ...LHELP.filter((x) => x.id !== "company" && x.id !== "reviews"),
    { id: "karte", step: "karte", sel: '[data-h="karte"]', name: "会社のまとめ（出典つき）", what: "求人原稿と会社のページから読み取った項目だけを並べ、1項目ずつ出典を付ける。読み取れない項目は「不明」。", why: "誤った情報を出さないため。推測で埋めると、利用者も企業も信じられなくなる。", src: "チームの案／" + SRC },
    { id: "learn", step: "karte", sel: '[data-h="learn"]', name: "ここで身につく専門知識", what: "求人原稿のどの段落から読み取ったかと、どの仕事・場面で身につくかを並べる。原稿に無い物は「シナリオ上の想定」と書く。", why: "この作品の核。利用者は自分に合うかが分かり、企業は自社で身につく専門性が伝わる。", src: SRC },
    { id: "company", step: "karte", sel: '[data-h="company"]', name: "会社情報のURL（任意）", what: "貼ると、まとめの「不明」の一部が出典つきで埋まる。いまは kaisha.example の見本5社だけ。", why: "求人原稿だけでは分からない会社の様子を、出典つきで足すため。", src: "チームの案" },
    { id: "reviews", step: "karte", sel: '[data-h="reviews"]', name: "自分で読んだ口コミを貼る（任意）", what: "貼った文のどの言葉が、どの場面・できごとに入るかを、まとめと年表と場面に印で出す。自動の読み取りはしない。", why: "口コミの印象を、働く場面で確かめられるようにするため。", src: "チームの案" },
    { id: "look", step: "make", sel: '[data-h="look"]', name: "見た目と表情", what: "試運転する自分の見た目は2種類から選べる。場面のきもちに合わせて、元気・普通・しんどいの3つの表情に変わる。", why: "同じ人物がどの場面でも同じ見た目で出ることで、自分の分身として追いかけやすくする。", src: SRC },
    { id: "episode", step: "life", sel: '[data-h="scene"]', name: "1つの場面（仕事→壁→学び→スキルアップ→その後）", what: "スキルが上がる時は、毎回この5つの段で見せる。どんな仕事で、何につまずき、だれに何を教わったか（自分で何を工夫したか）、Lv がいくつ上がり、そのスキルが後でどう役に立ったか。", why: "「何をやっていて、どのスキルが上がったのか」を、理由の場面ごと分かるようにするため（使った人の感想「間の何かが足りない」への答え）。", src: "依頼（2026-11-06・スキルが上がる理由の場面）" },
    { id: "yearone", step: "life", sel: '[data-h="yearone"]', name: "入社3年の年表（初期は3年）", what: "入社1週間・1か月後・3か月後・半年後・1年後の場面を並べ、最後に分かれ道（初期は3年後。上で1年・5年に切り替えられる）。10年後・75歳は道を選んだ後で開く。", why: "決定：初期表示は3年（1年＝知った・できる、3年＝任される、5年＝教えられる）。最初から75歳まで一気に見せると早すぎるため。", src: "引き継ぎ・合議の決定（2026-11-06）" },
    { id: "future", step: "life", sel: '[data-h="future"]', name: "分かれ道へ進む・どこまで見るか", what: "最初の1年の場面を見終わると、選んだ年数（初期3年）の分かれ道へ進む。10年後まで・生涯までも選べる。", why: "その先を見るかどうか、どこまで見るかを、利用者が決められるようにするため。", src: "依頼（2026-11-06）" },
    { id: "growth", step: "life", sel: '[data-h="growth"]', name: "成長のまとめ（ビフォー・アフター）", what: "入社した時といま見ている時点の自分を並べ、専門スキルの Lv の変化（押すとその場面を見返せる）・任される役割の階段・給料の筋書き・この先活きる道を1枚で見せる。", why: "「結局どう成長したのか」をひと目で分かるようにするため。", src: "依頼（2026-11-06・追加7）" },
    { id: "pay", step: "life", sel: '[data-h="pay"]', name: "給料（出典つき）と給料の筋書き", what: "求人原稿の給与だけを出典つきで出す。その後は金額を断定せず「上がりやすい／横ばい／下がることもある／大きく変わる」を理由つきで出す。", why: "働く上で大事な給料を、誤った数字を出さずに見せるため。", src: "依頼（2026-11-06・6）" },
    fam === "g"
      ? { id: "book", step: "life", sel: '[data-h="book"]', name: "専門知識の手帳（G案の主役）", what: "知識ごとに Lv.1 知った → Lv.2 できる → Lv.3 任される → Lv.4 教えられる の4段で、どの場面で上がったかを刻む。", why: "「その会社でどんな専門知識が、どう育つか」を、時間の流れで見せるため。点数ではなく段の名前で見せる。", src: SRC }
      : { id: "map", step: "life", sel: '[data-h="lifeline"]', name: "道の地図（H案の主役・年表を兼ねる）", what: "入社から分かれ道までの道と、6本の分かれ道。道の端に、持っていく知識が活きる（◎）・少し（△）・活きない（−）を出す。", why: "専門知識で人生の道がどう分かれるかを、1枚の地図で見せるため。", src: SRC },
    { id: "deal", step: "life", sel: '[data-h="branches"]', name: "分かれ道で知識を配る（見せ場）", what: "身についた専門知識が6本の道に配られ、道ごとに活きる・活きないと理由が出る。ここから選び直せる。", why: "デモで一番伝えたい瞬間。知識が将来の選択肢をどう広げるかが、ひと目で分かる。", src: SRC },
  ];
  return (
    <div className={`lf pk pk-${fam} pk-${style}`}>
      <header className="pk-top">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          {!SINGLE && (
            <Link href="/" className="pk-back text-[13px]">
              ← 案の一覧へ
            </Link>
          )}
          <p className="flex items-baseline gap-2">
            <span className="lf-h pk-brand text-[19px]">未来デバッグ</span>
            <span className="text-[12px] text-[var(--lf-sub)]">{SINGLE ? "" : fam === "g" ? "G案　" : "H案　"}{T.tag}</span>
          </p>
          <nav className="pk-steps ml-auto flex flex-wrap gap-1.5" aria-label="進み具合">
            {PSTEPS.map((x, i) => (
              <button key={x} type="button" aria-current={x === s.step} onClick={() => s.go(x)} className="px-3 py-1.5 text-[12.5px]">
                <span className="pk-stepno">{i + 1}</span>
                {LSTEP_LABEL[x]}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-7 pb-20 sm:px-6">
        {s.step === "jobs" && <Entry c={c} s={s} />}
        {s.step === "karte" && <Karte c={c} s={s} />}
        {s.step === "make" && (
          <section>
            <Title eyebrow={`STEP 3　${T.make}`} t={T.make} sub="職種は貼った求人から読み取ってあります。あなたが入れるのは、年齢と働き方の条件・こだわりだけ。見た目は2種類から選べます。" />
            <MakeForm s={s} avatar={<AvatarCard c={c} s={s} setLook={setLook} />} cta={T.start} />
          </section>
        )}
        {s.step === "life" && <LifeView c={c} s={s} />}
        {s.step === "saves" && (
          <section className="grid gap-6">
            <PromiseNote />
            <Title eyebrow="STEP 5　人生を並べる" t={T.saves} sub={T.savesSub} />
            {fam === "h" && <RoadMap c={c} s={s} compare />}
            <details className="pk-fitwrap">
              <summary className="lf-btn px-5 py-2.5 text-[14px]">専門知識がどの道で活きるか見る ▼</summary>
              <FitTable s={s} />
            </details>
            <SaveCompare
              s={s}
              thumb={(b) => {
                const d = s.job.detailed?.[b];
                const last = d?.chapters[d.chapters.length - 1];
                return (
                  <div className="pk-thumb">
                    <img src={art(style, destArt(s.job, b, s.profile.age))} alt="" className="pk-thumb-bg" />
                    <img src={art(style, meArt(look, last?.mood ?? "普通"))} alt="" className="pk-thumb-me" />
                    {last?.lifeEvent && <img src={art(style, eventArt(last.lifeEvent))} alt="" className="pk-thumb-ev" />}
                  </div>
                );
              }}
            />
          </section>
        )}
        {s.step === "take" && <Takeaway c={c} s={s} />}
      </main>
      <p className="pb-6 text-center text-[12px] text-[var(--lf-sub)]">
        {AI_META[s.job.id] ? "会社のまとめ・専門知識・場面の文は、Claude が貼られた求人の本文から書いたシナリオです。" : "この画面は見本の求人（架空）で動いています。"}登場する見本の会社・人物・口コミはすべて架空です。絵は Higgsfield で生成したオリジナルです。
      </p>
      <InfoWindow
        screen={`${fam === "g" ? "G案（育つ）" : "H案（分かれる）"}／${LSTEP_LABEL[s.step]}`}
        screenNote={LNOTE[s.step]}
        items={help}
        features={[
          "最初の画面：一文と3つの段、見本の求人ボタン",
          "求人URL → 会社のまとめ（出典つき・読み取れない項目は「不明」）→ 試運転する自分を設定（年齢と本人の条件だけ。職種は求人から読み取る）→ 生涯 → 人生を並べる",
          "専門知識：どこで身につくか／4段の育ち方（知った・できる・任される・教えられる）／道ごとに活きる・少し活きる・活きない",
          fam === "g" ? "G案の主役：専門知識の手帳と「専門知識 GET」のカットイン" : "H案の主役：道の地図（年表を兼ねる）と、道の端の知識の印",
          "見せ場：分かれ道で、身につけた知識が6本の道に配られる",
          ...LFEATURES.slice(1),
          `絵：${PACKS[style].touch}（Higgsfield で生成。public/packs/${style}/ にまとめて置き、src/lib/packs.ts で1枚ずつ差し替えられる）`,
        ]}
        accent="#1f8a7f"
        onBeforeFlash={(it) => {
          const h = help.find((x) => x.id === it.id);
          if (h && h.step !== s.step) s.go(h.step);
        }}
      />
    </div>
  );
}

function Title({ eyebrow, t, sub }: { eyebrow: string; t: string; sub: string }) {
  return (
    <div className="mb-6">
      <p className="pk-eyebrow text-[12px]">{eyebrow}</p>
      <h1 className="lf-h mt-1 text-[27px] leading-tight sm:text-[36px]">{t}</h1>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-7 text-[var(--lf-sub)]">{sub}</p>
    </div>
  );
}

/** 道の行き先の絵 */
function destArt(job: Job, b: BranchId, age: number): PackKey {
  if (b === "indep") return "ev-independent";
  if (b === "relearn") return "ev-relearn";
  if (b === "abroad") return "ev-overseas";
  if (b === "other") return PLACE_ART[simpleBranch(job, b, age).place];
  return PLACE_ART[job.place];
}

/* 場面ごとの呼び名（新しい職場の人など）。いま見せている場面の物を入れる */
let SCENE_NAMES: Partial<Record<Who, string>> = {};
const nm = (job: Job, w: Who) => SCENE_NAMES[w] ?? nameOf(job, w);

/** 書いている途中の JSON から、最後の日本語の文を取り出す */
function lastPhrase(t: string): string {
  const all = [...t.matchAll(/"([^"\\]*[\u3041-\u3093\u30a1-\u30f3\u4e00-\u9fa5][^"\\]*)("|$)/g)];
  return all.length ? all[all.length - 1][1].slice(-60) : "";
}

/* ---------- 1. 最初の画面（30秒で何の道具か分かる） ---------- */
function Entry({ c, s }: { c: Ctx; s: LifeState }) {
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  /* 求人URLを貼る → Claude で読む。見本のURLは用意した求人本文を、それ以外は貼ってもらった本文を Claude に渡す */
  const [paste, setPaste] = useState<string | null>(null);
  const [reading, setReading] = useState<{ chars: number; tail: string } | null>(null);
  const ctl = useRef<AbortController | null>(null);
  const sample = JOBS[0];
  const run = async (text: string, u: string, fallback?: Job) => {
    setMsg(null);
    setReading({ chars: 0, tail: "" });
    ctl.current = new AbortController();
    /* Claude が書いている途中の文を、そのまま画面に出す（本当に Claude が書いていることが見える） */
    const r = await readWithClaude(text, u, (t) => setReading({ chars: t.length, tail: lastPhrase(t) }), ctl.current.signal);
    setReading(null);
    if ("job" in r) {
      AI_NOTE.text = "";
      s.pickJob(r.job.id);
      s.go("karte");
      return;
    }
    if (fallback && r.error !== "cancelled") {
      /* Claude を使えない時は、見本データで続ける（見た目と流れは本番と同じ。「Claude が読んだ」の札だけ出さない） */
      AI_NOTE.text = aiErrorText(r.error);
      s.pickJob(fallback.id);
      s.go("karte");
      return;
    }
    setMsg(aiErrorText(r.error));
  };
  const open = (u: string) => {
    const j = jobByUrl(u);
    if (j) return void run(jobText(j), j.url, j);
    if (!u.trim()) return setMsg("求人のURLを貼ってください。");
    setPaste("");
    setMsg(null);
  };
  const ks = knowOf(sample);
  return (
    <section className="grid gap-10">
      <div className="pk-hero" data-h="hero">
        <div className="grid content-center gap-5">
          <PromiseNote />
          <p className="pk-eyebrow text-[12px]">求人1件から、入社3年とその先を試運転</p>
          <p className="pk-problem">入社してみないと、合うか分からない。</p>
          <h1 className="lf-h text-[34px] leading-[1.25] sm:text-[48px]">
            <span className="w">応募する前に、</span>
            <br />
            <span className="w">その会社での</span>
            <span className="w">人生を試運転。</span>
          </h1>
          <p className="max-w-[40ch] text-[15px] leading-8 text-[var(--lf-sub)]">
            その会社で<b className="text-[var(--lf-ink)]">どんな専門知識が身につき</b>、その知識が<b className="text-[var(--lf-ink)]">転職・独立・海外でどう活きるか</b>を、分身が働く姿で試せます。予測ではなく、シナリオです。
          </p>
          <form
            className="pk-urlbox"
            data-h="url"
            onSubmit={(e) => {
              e.preventDefault();
              open(url);
            }}
          >
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="求人のURLを貼る（https://kyujin.example/…）" aria-label="求人のURL" inputMode="url" className="lf-input min-w-0 flex-1 px-4 py-3 text-[15px]" />
            <button type="submit" className="lf-btn px-5 py-3 text-[15px]">
              読み込む
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="lf-btn pk-bigbtn px-6 py-3.5 text-[16px]" onClick={() => open(sample.url)}>
              見本の求人で試す ▶
            </button>
            <span className="text-[12.5px] text-[var(--lf-sub)]">{sample.company}「{sample.title}」</span>
          </div>
          {paste !== null && !reading && (
            <div className="pk-paste" data-h="paste">
              <p className="text-[14px] font-bold">このURLの求人の本文を、下に貼ってください</p>
              <p className="text-[12.5px] leading-6 text-[var(--lf-sub)]">このページはインターネットに出られないため、URLの中身を取りに行けません。貼った本文だけを Claude が読み、書いていない所は「不明」にします。</p>
              <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={6} className="lf-input w-full px-3 py-2 text-[14px]" placeholder="仕事の内容・給与・勤務地・勤務時間など、求人ページの文章をそのまま貼る" aria-label="求人の本文" />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="lf-btn px-5 py-2.5 text-[14px]" disabled={paste.trim().length < 40} onClick={() => run(paste, url)}>
                  Claude で読む ▶
                </button>
                <button type="button" className="pk-futbtn px-4 py-2 text-[13px]" onClick={() => setPaste(null)}>
                  やめる
                </button>
              </div>
            </div>
          )}
          {reading && (
            <div className="pk-reading" role="status" data-h="reading">
              <span className="pk-reading-dot" aria-hidden />
              <div>
                <p className="text-[14px] font-bold">Claude が求人を読んでいます…</p>
                <p className="text-[12.5px] text-[var(--lf-sub)]">会社のまとめ・身につく専門知識・6本の道・場面の文を作っています。{reading.chars > 0 ? `（${reading.chars.toLocaleString()}文字 受け取り）` : "（考え中。30秒〜1分ほどかかります）"}</p>
                {reading.tail && (
                  <p className="pk-reading-tail" aria-live="polite">
                    <small>Claude がいま書いている文</small>「{reading.tail}」
                  </p>
                )}
              </div>
              <button type="button" className="pk-futbtn px-3 py-1.5 text-[12.5px]" onClick={() => ctl.current?.abort()}>
                止める
              </button>
            </div>
          )}
          {msg && <p className="text-[13px] font-bold text-[var(--lf-accent)]">{msg}</p>}
        </div>
        <ol className="pk-how">
          <li>
            <span className="pk-how-no">1</span>
            <span className="pk-how-pic">
              <img src={art(c.style, PLACE_ART[sample.place])} alt="" />
              <span className="pk-how-url">kyujin.example/job/…</span>
            </span>
            <b>求人URLを貼る</b>
            <span>会社のまとめが、出典つきで出る</span>
          </li>
          <li>
            <span className="pk-how-no">2</span>
            <span className="pk-how-pic is-know">
              {ks.slice(0, 3).map((k, i) => (
                <span key={k.id} className="pk-mini" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
                  {k.name}
                  <i>{STAGES[Math.min(3, i + 1)]}</i>
                </span>
              ))}
            </span>
            <b>身につく専門知識が分かる</b>
            <span>どの仕事・場面で育つか</span>
          </li>
          <li>
            <span className="pk-how-no">3</span>
            <span className="pk-how-pic">
              <img src={art(c.style, "cut-fork")} alt="" />
            </span>
            <b>入社3年を、場面で見る</b>
            <span>仕事→壁→学び→スキルアップ。3年後に分かれ道</span>
          </li>
        </ol>
      </div>
      <div className="grid gap-4">
        {PACKS[c.style].town && (
          <figure className="pk-town">
            <img src={art(c.style, "town")} alt="架空の町の模型。オフィス・工場・建設現場・物流倉庫・飲食店・家・学校が並ぶ" />
            <figcaption className="text-[13px]">架空の町。5つの職場の求人があります。</figcaption>
          </figure>
        )}
        <h2 className="lf-h text-[20px]">または、架空の求人から選ぶ（押すと会社のまとめへ）</h2>
        <JobBoard s={s} thumb={(j) => <JobThumb c={c} job={j} />} cta="この会社のまとめを見る" next="karte" showUrl={false} showExtras={false} direct />
      </div>
      <div className="lf-card pk-future-entry p-5" data-h="futureentry">
        <p className="pk-eyebrow text-[12px]">将来の導線（イメージ・いまは動きません）</p>
        <div className="mt-2 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="pk-mockjob">
            <small>kyujin.example（架空の求人サイト）</small>
            <b>{sample.title}</b>
            <span>
              {sample.company}　{sample.area}　{sample.pay}
            </span>
            <span className="pk-mockjob-btns">
              <i>応募する</i>
              <i className="is-mirai">▶ この会社での未来を試走する</i>
            </span>
          </div>
          <p className="max-w-[340px] text-[13px] leading-6">
            将来は、求人サイトの1件ごとにこのボタンを置き、押すとこの画面が開く形にします。
          </p>
        </div>
      </div>
    </section>
  );
}

/* 求人カードに立つ人は、職場ごとに変える */
const THUMB_WHO: Partial<Record<Place, PackKey>> = { factory: "boss", office: "partner-f", construction: "senpai", logistics: "peer", food: "partner-m" };
function JobThumb({ c, job }: { c: Ctx; job: Job }) {
  return (
    <span className="pk-thumb block">
      <img src={art(c.style, PLACE_ART[job.place])} alt="" className="pk-thumb-bg" loading="lazy" />
      <img src={art(c.style, THUMB_WHO[job.place] ?? "boss")} alt="" className="pk-thumb-boss" loading="lazy" />
      <span className="pk-thumb-tag">{PLACE_LABEL[job.place]}</span>
    </span>
  );
}

/* ---------- 2. 会社のまとめ（出典・不明） ---------- */
function Karte({ c, s }: { c: Ctx; s: LifeState }) {
  const k = karteOf(s.job, s.companyInfo);
  const ks = knowOf(s.job);
  const host = s.job.url.replace("https://", "");
  return (
    <section className="grid gap-6" data-h="karte">
      <div className="pk-karte-head">
        <span className="pk-karte-pic">
          <img src={art(c.style, PLACE_ART[s.job.place])} alt="" />
        </span>
        <div className="grid gap-2">
          <p className="pk-eyebrow text-[12px]">STEP 2　会社のまとめ</p>
          {AI_META[s.job.id] && <p className="pk-aibadge is-ai">Claude が求人の本文から読み取りました（読めない所は「不明」のまま）</p>}
          <h1 className="lf-h text-[26px] leading-tight sm:text-[34px]">
            {s.job.company}は、
            <br className="sm:hidden" />
            こういう会社です
          </h1>
          <p className="text-[15px] leading-8">
            {AI_META[s.job.id] ? (AI_META[s.job.id].karte.find((x) => x.label === "仕事の内容")?.value ?? s.job.body[0]) : `${s.job.industry}の会社。${s.job.body[0]}`}
            <br />
            ここでは <b>{ks.map((x) => x.name).join("・")}</b> が身につく筋書きです。
          </p>
          <p className="text-[12.5px] text-[var(--lf-sub)]">
            読み取った元：求人原稿（{host}）{s.companyInfo ? `・会社の公式ページ（${s.companyInfo.url.replace("https://", "")}）` : "・会社情報のURLは未入力"}　｜　読み取れた項目 {k.known}・不明 {k.unknown}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-5">
          <div className="lf-card p-5" data-h="learn">
            <p className="lf-h text-[18px]">ここで身につく専門知識</p>
            <p className="mt-1 text-[12.5px] text-[var(--lf-sub)]">押すと、身につく場面と出典が開きます。</p>
            <ul className="mt-3 grid gap-3">
              {ks.map((x) => (
                <li key={x.id} className="pk-learn">
                  <details>
                    <summary>
                      <b className="lf-h text-[16px]">{x.name}</b>
                      {!x.src && <span className="pk-assume">仮定</span>}
                      <span className="block text-[13.5px] leading-6">{x.what}</span>
                    </summary>
                    <p className="mt-1 text-[12.5px] text-[var(--lf-sub)]">身につく場面：{x.where}</p>
                    {x.src ? (
                      <p className="pk-src">
                        出典：{x.src.para ? `求人原稿 ${x.src.para}段落目` : "求人の本文"}「{x.src.quote}」
                      </p>
                    ) : (
                      <p className="pk-src is-guess">{x.assumed ? "仮定：" : "出典なし："}求人に書いていないため、シナリオ上の想定です</p>
                    )}
                  </details>
                </li>
              ))}
            </ul>
          </div>
          <details className="lf-card pk-kartebox p-5">
            <summary className="lf-h text-[16px]">
              読み取った項目　<span className="text-[14px]">読み取れた {k.known}・<b className="pk-unknown">不明 {k.unknown}</b></span>
              <small className="pk-open-hint">押して開く</small>
            </summary>
            <table className="pk-karte mt-3 w-full text-[13.5px]">
              <tbody>
                {k.items.map((it) => (
                  <tr key={it.label} className={it.value ? "" : "is-unknown"}>
                    <th>{it.label}</th>
                    <td>
                      {it.value ?? <b className="pk-unknown">不明</b>}
                      {it.value && it.src && (
                        <span className="pk-src">
                          {it.src.kind}（{it.src.where}）
                        </span>
                      )}
                      {!it.value && it.why && <span className="pk-src is-guess">{it.why}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
        <div className="grid content-start gap-5">
          <CompanyExtras s={s} stack />
          <div className="lf-card p-5" data-h="reflect">
            <p className="lf-h text-[16px]">口コミ・会社情報が入る場面</p>
            {s.vibes.length === 0 ? (
              <p className="mt-2 text-[13px] text-[var(--lf-sub)]">口コミを貼るか会社情報のURLを入れると、どの言葉がどの場面に入るかがここに出ます。</p>
            ) : (
              <ul className="mt-2 grid gap-2">
                {s.vibes.map((v) => {
                  const ch = s.job.trunk[v.at];
                  const ei = episodeOfVibe(s.job, v);
                  const ep = ei == null ? null : episodesOf(s.job)[ei];
                  return (
                    <li key={v.id} className={`pk-reflect is-${v.tone}`}>
                      <span className="text-[12.5px]">
                        {v.from}「{v.quote}」
                      </span>
                      <span className="text-[13px] font-bold">
                        → {ep ? `${ep.when}「${ep.title}」` : `${ch.label}（${PLACE_LABEL[ch.place]}）`}の場面に「{v.event}」
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <button type="button" className="lf-btn pk-bigbtn justify-self-start px-6 py-3.5 text-[16px]" onClick={() => s.go("make")}>
            この会社で、{COPY[c.fam].make} ▶
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. 試運転する自分を設定 ---------- */
function AvatarCard({ c, s, setLook }: { c: Ctx; s: LifeState; setLook: (l: Look) => void }) {
  return (
    <div className="grid w-full gap-3" data-h="look">
      <div className="pk-thumb pk-avatar">
        <img src={art(c.style, PLACE_ART[s.job.place])} alt="" className="pk-thumb-bg" />
        <img key={c.look} src={art(c.style, meArt(c.look, "元気"))} alt="あなた" className="pk-avatar-me pk-pop" />
      </div>
      <div className="pk-seg" role="group" aria-label="見た目">
        {(["m", "f"] as Look[]).map((l) => (
          <button key={l} type="button" aria-pressed={c.look === l} onClick={() => setLook(l)}>
            {l === "m" ? "見た目 A" : "見た目 B"}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-3 gap-1">
        {(["元気", "普通", "しんどい"] as Mood[]).map((m) => (
          <li key={m} className="pk-face">
            <img src={art(c.style, meArt(c.look, m))} alt="" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 4. 生涯 ----------
   phase "ep"：入社1年を「場面」で見せる（仕事 → 壁 → 学び → スキルアップ → その後）。
   phase "ch"：利用者が「先を見る」を選んだ時だけ、3年後（分かれ道）・10年後・生涯へ進む。どこまで見るかは horizon で選ぶ。 */
const HORIZONS = [
  { y: 3, label: "3年後（分かれ道）まで" },
  { y: 10, label: "10年後まで" },
  { y: 20, label: "20年後まで" },
  { y: 99, label: "生涯（75歳）まで" },
];
/** 「3年後（25歳）」。見出しがもう年齢の時は、年齢を重ねて書かない */
const withAge = (ch: Chapter, start: number) => {
  const l = chapterLabel(ch, start);
  return l.endsWith("歳") ? l : `${l}（${ageAt(ch, start)}歳）`;
};
const yearsOf = (ch: Chapter) => (ch.at === "end" ? 999 : ch.at);

function LifeView({ c, s: s0 }: { c: Ctx; s: LifeState }) {
  const eps = episodesOf(s0.job);
  const [phase, setPhase] = useState<"ep" | "ch">(() => (eps.length && !s0.branch && s0.idx < s0.forkIdx ? "ep" : "ch"));
  const [horizon, setHorizon] = useState(s0.branch ? 99 : 3);
  const [pos, setPos] = useState<{ e: number; beat: Beat }>({ e: 0, beat: 0 });
  /* 進む速さは、入社1年と3年後から先で共通（「自分で進める」の時は自動で進めない） */
  const [speed, setSpeed] = useState<Speed>("slow");
  /* 道を選んだら、少なくとも10年後までは見せる（分かれ道の先が空にならないように） */
  const s: LifeState = {
    ...s0,
    choose: (b: BranchId) => {
      setHorizon((h) => Math.max(h, 10));
      s0.choose(b);
    },
  };
  const toFuture = (y: number) => {
    setHorizon(Math.max(y, s0.years));
    setPhase("ch");
    if (!s0.branch) s0.jump(s0.forkIdx);
  };
  const toYearOne = (e = eps.length - 1) => {
    setPhase("ep");
    setPos({ e: Math.max(0, e), beat: 0 });
    if (s0.branch) s0.rewind();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (eps.length) return <Journey c={c} s={s0} speed={speed} setSpeed={setSpeed} />;
  return <LaterLife c={c} s={s} horizon={Math.max(horizon, s0.years)} setHorizon={setHorizon} onYearOne={toYearOne} speed={speed} setSpeed={setSpeed} />;
}

/* 入社1年：場面を重ねて、じっくり */
type Speed = "slow" | "normal" | "manual";
const SPEED_LABEL: Record<Speed, string> = { slow: "ゆっくり", normal: "ふつう", manual: "自分で進める" };
/* 落ち込む時間（②壁）は短く、乗り越えた瞬間（④）とその後（⑤）を長く見せる */
const SPEED_MS: Record<Exclude<Speed, "manual">, number[]> = { slow: [7500, 4500, 8500, 8500], normal: [5000, 3200, 5500, 5500] };
const INTRO_MS = 3400;
/* 場面が終わってから、次の場面へ自動で移るまでの時間（手に入れたスキルと道のつながりを読む時間） */
const NEXT_MS: Record<Exclude<Speed, "manual">, number> = { slow: 11000, normal: 7500 };
/* 3年後から先の1つの場面を見せる時間 */
const CH_MS: Record<Exclude<Speed, "manual">, number> = { slow: 14000, normal: 9000 };

/** 自動で次へ進む合図：あと何秒で、どこへ移るかを見せる。「止める」で自分で進めるに切り替わる */
function AutoNext({ label, ms, onGo, onStop }: { label: string; ms: number; onGo: () => void; onStop: () => void }) {
  const go = useRef(onGo);
  useEffect(() => {
    go.current = onGo;
  });
  const [left, setLeft] = useState(Math.ceil(ms / 1000));
  useEffect(() => {
    const t0 = Date.now();
    const iv = window.setInterval(() => setLeft(Math.max(0, Math.ceil((ms - (Date.now() - t0)) / 1000))), 250);
    const t = window.setTimeout(() => go.current(), ms);
    return () => (clearInterval(iv), clearTimeout(t));
  }, [ms, label]);
  return (
    <div className="pk-autonext" role="status" data-h="autonext">
      <span className="pk-autonext-bar" style={{ animationDuration: `${ms}ms` }} aria-hidden />
      <span className="pk-autonext-txt">
        <small>自動で進みます　あと {left} 秒</small>
        <b>{label}</b>
      </span>
      <span className="pk-autonext-btns">
        <button type="button" className="pk-futbtn px-3 py-1.5 text-[12.5px]" onClick={onStop}>
          ■ 止める（自分で進める）
        </button>
      </span>
    </div>
  );
}

/** 速さの切り替え（ゆっくり・ふつう・自分で進める） */
function SpeedSwitch({ speed, setSpeed }: { speed: Speed; setSpeed: (v: Speed) => void }) {
  return (
    <span className="pk-speed is-light" role="group" aria-label="進む速さ">
      {(Object.keys(SPEED_LABEL) as Speed[]).map((v) => (
        <button key={v} type="button" aria-pressed={speed === v} onClick={() => setSpeed(v)}>
          {SPEED_LABEL[v]}
        </button>
      ))}
    </span>
  );
}

/* 人生の出来事：選んだ道の場面1つ目の終わりに出会い、2つ目の終わりに結婚（選んだら必ず次へ進む） */
const jlife = () => (["meet", "marry"] as const).map((k) => LIFE_STEPS.find((x) => x.key === k)!);

/** 1本道：入社 → 選んだ年数まで → 分かれ道（絵の上で選ぶ）→ 選んだ道の場面2つ → 結局どう成長した？ → 持ち帰り */
function Journey({ c, s, speed, setSpeed }: { c: Ctx; s: LifeState; speed: Speed; setSpeed: (v: Speed) => void }) {
  const age0 = s.profile.age;
  const bgOf = (b: BranchId) => destArt(s.job, b, age0);
  const pre = journeyPre(s.job, s.years, s.forkIdx);
  const road = s.branch ? journeyRoad(s.job, s.branch, s.years, age0, bgOf, pre) : [];
  const eps = [...pre, ...road];
  const [pos, setPosRaw] = useState<{ e: number; beat: Beat }>({ e: 0, beat: 0 });
  const [life, setLife] = useState<Record<string, string>>({});
  const [end, setEnd] = useState(false);
  const [partner] = useState<"m" | "f">(c.look === "m" ? "f" : "m");
  const e = Math.min(pos.e, eps.length - 1);
  const beat = pos.e > eps.length - 1 ? 0 : pos.beat;
  const ep = eps[e];
  SCENE_NAMES = ep.names ?? {};
  const k = knowOf(s.job).find((x) => x.id === ep.up.know)!;
  const lv = journeyLevels(eps, e, beat);
  const lvFork = journeyLevels(pre, pre.length - 1, 4);
  const vibes = e < episodesOf(s.job).length ? s.vibes.filter((v) => episodeOfVibe(s.job, v) === e) : [];
  const age = age0 + ep.yr;
  const JL = jlife();
  /* 人生の出来事を選ぶ場面：3年・5年は「2年後」で出会い、分かれ道の直前で結婚。1年は道の場面1つ目・2つ目 */
  const slotOf = (i: number): (typeof JL)[number] | null => {
    const lat = pre.map((x, j) => (x.yr >= 2 ? j : -1)).filter((j) => j >= 0);
    if (lat.length >= 2) return i === lat[0] ? JL[0] : i === pre.length - 1 ? JL[1] : null;
    const r = i - pre.length;
    return r >= 0 ? JL[r] ?? null : null;
  };
  const [after, setAfter] = useState<{ key: keyof LifeChoice; v: string; i: number } | null>(null);
  const slot = beat === 4 ? slotOf(e) : null;
  const lifeNow = slot && !life[slot.key] && !after ? slot : null;
  const afterScenes = after ? lifeAfter(s.job, after.key, after.v, payOfJob(s.job).raise) : [];
  const atFork = !s.branch && e === pre.length - 1 && beat === 4 && !lifeNow && !after;
  const lastRoad = !!s.branch && e === eps.length - 1;
  const top = () => document.querySelector('[data-h="topbar"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
  const setPos = (p: { e: number; beat: Beat }) => {
    setEnd(false);
    setPosRaw(p);
  };
  const finish = () => {
    setEnd(true);
    window.setTimeout(() => document.querySelector('[data-h="final"]')?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };
  const advance = () => {
    if (lastRoad) return finish();
    if (!s.branch && e === pre.length - 1) return; /* 分かれ道のカードが出る */
    if (e < eps.length - 1) {
      setPos({ e: e + 1, beat: 0 });
      top();
    }
  };
  const goBeat = (b: number) => {
    if (b <= 4) return setPos({ e, beat: Math.max(0, b) as Beat });
    if (atFork || lifeNow || after) return;
    advance();
  };
  const choose = (b: BranchId) => {
    s.choose(b);
    setPos({ e: pre.length, beat: 0 });
    top();
  };
  const pickLife = (o: string) => {
    setLife({ ...life, [lifeNow!.key]: o });
    if (lifeAfter(s.job, lifeNow!.key, o, null).length) setAfter({ key: lifeNow!.key, v: o, i: 0 });
    else advance();
  };
  const afterNext = () => {
    if (after && after.i + 1 < afterScenes.length) return setAfter({ ...after, i: after.i + 1 });
    setAfter(null);
    advance();
  };
  const lines = Object.fromEntries(BRANCHES.map((b) => [b.id, journeyRoad(s.job, b.id, s.years, age0, bgOf, pre)[0].title])) as Record<BranchId, string>;
  const overlay = after && afterScenes[after.i] ? <LifeAfterView c={c} sc={afterScenes[after.i]} i={after.i} n={afterScenes.length} age={age} partner={partner} onNext={afterNext} /> : atFork ? <ForkPick c={c} s={s} lines={lines} lv={lvFork} onChoose={choose} /> : lifeNow ? <LifePick c={c} st={lifeNow} age={age} partner={partner} job={s.job} onPick={pickLife} /> : undefined;
  const next = eps[e + 1];
  const pay = payOfJob(s.job);
  return (
    <section className="grid gap-3">
      <div className="pk-topbar" data-h="topbar">
        <h1 className="pk-topbar-title">
          <small>STEP 4</small>
          {s.job.company}で働く、最初の{s.years}年{s.branch ? `　→　${BRANCHES.find((b) => b.id === s.branch)!.label}` : ""}
        </h1>
        <YearsSwitch s={s} thin />
      </div>
      <JourneyLine c={c} s={s} eps={eps} preLen={pre.length} cur={e} beat={beat} onPick={(i) => setPos({ e: i, beat: 0 })} />
      <EpisodeStage key={`${ep.id}-${c.look}`} c={c} s={s} ep={ep} prev={eps[e - 1]} beat={beat} vibes={vibes} speed={speed} setSpeed={setSpeed} onBeat={goBeat} overlay={overlay} age={age} />
      {beat === 4 && speed !== "manual" && !overlay && !end && (
        <AutoNext
          key={`auto-${ep.id}`}
          label={lastRoad ? "結局どう成長した？" : next ? `次の場面へ：${next.when}「${next.title}」` : ""}
          ms={NEXT_MS[speed]}
          onGo={() => goBeat(5)}
          onStop={() => setSpeed("manual")}
        />
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-3">
          <details className="pk-ephead" data-h="ephead">
            <summary className="pk-ephead-sum">
              場面 {e + 1} / {s.branch ? eps.length : `${pre.length}＋道の場面2つ`}　{ep.when}（{age}歳）　<b>「{ep.title}」</b>
              <small className="pk-open-hint">場面の説明を開く</small>
            </summary>
            <p className="pk-mean">
              <b>どういうこと？</b>
              {ep.mean}
            </p>
            <p className="pk-ephead-what">
              <span>
                <small>{ep.road ? "この道での仕事" : `${s.job.company}の仕事`}</small>
                {ep.work.text}
              </span>
              <span className="pk-ephead-arrow" aria-hidden>
                →
              </span>
              <span className="is-know">
                <small>身につく専門スキル</small>
                {k.name}　Lv.{ep.up.from} → Lv.{ep.up.to}
              </span>
            </p>
          </details>
          <StoryCard s={s} ep={ep} k={k} beat={beat} last={lastRoad} next={next} onBeat={goBeat} />
          {end && <FinalGrowth c={c} s={s} pre={pre} eps={eps} life={life} />}
        </div>
        <aside className="grid content-start gap-4">
          <FeelBox c={c} s={s} feels={feelsOfEpisode(ep, beat)} />
          <details className="pk-bookwrap" open={beat >= 3}>
            <summary className="lf-h text-[15px]">専門知識の手帳を開く</summary>
            <KnowBook c={c} s={s} lv={lv} justUp={beat >= 3 ? ep.up.know : null} upTo={e} upBeat={beat} eps={eps} />
          </details>
          <div className="lf-card p-4" data-h="pay">
            <p className="lf-h text-[15px]">給料</p>
            <p className="mt-1 text-[16px] font-bold">{pay.pay}</p>
            <p className="pk-src">出典：{pay.src}（{s.job.url.replace("https://", "")}）</p>
            <p className="mt-2 text-[12.5px] leading-6">
              昇給：{pay.raise ? `求人原稿に「${pay.raise}」` : <b className="pk-unknown">不明</b>}
              {!pay.raise && <span className="text-[var(--lf-sub)]">（求人原稿に書いていません）</span>}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

/** 年表：入社からの場面 → 分かれ道 → 選んだ道の場面 */
function JourneyLine({ c, s, eps, preLen, cur, beat, onPick }: { c: Ctx; s: LifeState; eps: JEpisode[]; preLen: number; cur: number; beat: number; onPick: (e: number) => void }) {
  const b = s.branch ? BRANCHES.find((x) => x.id === s.branch)! : null;
  const node = (ep: JEpisode, i: number) => {
    const k = knowOf(s.job).find((x) => x.id === ep.up.know)!;
    const seen = i < cur || (i === cur && beat >= 3);
    return (
      <li key={ep.id}>
        <button type="button" aria-current={i === cur} onClick={() => onPick(i)} className="pk-node">
          <span className="pk-node-pic">
            <img src={art(c.style, (ep.bg as PackKey | undefined) ?? PLACE_ART[ep.place])} alt="" loading="lazy" />
          </span>
          <span className="pk-node-age">{ep.when}</span>
          <span className="pk-node-sub">
            {k.name} {seen ? `Lv.${ep.up.to}` : `Lv.${ep.up.from}→?`}
          </span>
        </button>
      </li>
    );
  };
  return (
    <div className={`pk-life pk-yr is-thin ${c.fam === "h" ? "is-road" : ""}`} data-h="yearone">
      <ol className="pk-nodes" aria-label="入社からの場面">
        {eps.slice(0, preLen).map(node)}
        <li>
          <span className="pk-node is-ghost is-forknode">
            <span className="pk-node-pic">◆</span>
            <span className="pk-node-age">{s.years}年後</span>
            <span className="pk-node-sub">{b ? `分かれ道：${b.label}` : "分かれ道（道を選ぶ）"}</span>
          </span>
        </li>
        {b
          ? eps.slice(preLen).map((ep, j) => node(ep, preLen + j))
          : (
            <li>
              <span className="pk-node is-ghost">
                <span className="pk-node-pic">?</span>
                <span className="pk-node-age">選んだ道</span>
                <span className="pk-node-sub">場面2つ</span>
              </span>
            </li>
          )}
      </ol>
    </div>
  );
}

/** 最後に1回だけ：結局どう成長した？（「残る」と並べて、持ち帰りへ） */
function FinalGrowth({ c, s, pre, eps, life }: { c: Ctx; s: LifeState; pre: JEpisode[]; eps: JEpisode[]; life: Record<string, string> }) {
  const lvF = journeyLevels(pre, pre.length - 1, 4);
  const lvE = journeyLevels(eps, eps.length - 1, 4);
  const b = BRANCHES.find((x) => x.id === s.branch)!;
  const roadEps = eps.slice(pre.length);
  return (
    <div className="grid gap-3" data-h="final">
      <div className="lf-card pk-final p-5">
        <p className="pk-eyebrow text-[12px]">ふり返り</p>
        <p className="lf-h text-[22px]">結局どう成長した？</p>
        <ul className="pk-final-rows mt-3">
          {knowOf(s.job).map((k) => (
            <li key={k.id}>
              <b>{k.name}</b>
              <span>入社 Lv.0</span>
              <i aria-hidden>→</i>
              <span>{s.years}年後 Lv.{lvF[k.id] ?? 0}</span>
              <i aria-hidden>→</i>
              <span className={(lvE[k.id] ?? 0) > (lvF[k.id] ?? 0) ? "is-up" : ""}>
                {b.label}の先 <b>Lv.{lvE[k.id] ?? 0}</b>（{LV_NAME[lvE[k.id] ?? 0]}）
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13.5px] leading-7">
          <b>選んだ道：{b.label}</b>　{roadEps.map((x) => `${s.profile.age + x.yr}歳「${x.title}」`).join(" → ")}
        </p>
        {Object.keys(life).length > 0 && (
          <p className="text-[13px] leading-7">
            <b>人生の出来事：</b>
            {jlife().filter((x) => life[x.key]).map((x) => `${x.label}「${life[x.key]}」`).join("　")}
          </p>
        )}
      </div>
      <StayCompare s={s} />
    </div>
  );
}

/** 吹き出し：話す人の頭の上から出し、相手の方へ体を向ける。見出しは「だれ → だれ」 */
function Bubble({ s, talk, sx, review, k }: { s: LifeState; talk: Talk; sx: number; review?: boolean; k: string }) {
  const think = talk.text.startsWith("（");
  const bx = Math.min(78, Math.max(22, sx));
  const to = talk.to ?? (talk.who === "me" ? null : "me");
  return (
    <p key={k} className={`pk-bubble is-anchored ${talk.who === "me" ? "is-me" : ""} ${think ? "is-think" : ""} ${review ? "is-review" : ""}`} style={{ left: `${bx}%`, ["--tail" as string]: `${sx - bx}cqi` }}>
      <b>
        {nm(s.job, talk.who)}
        {think ? "（心の声）" : to ? ` → ${nm(s.job, to)}` : ""}
        {review && <em>口コミから</em>}
      </b>
      {talk.text}
    </p>
  );
}

/* ---------- 人物の立ち位置と向き（2026-11-06 第3弾） ----------
   絵はどれも右向き（顔が画面の右を向く）で描かれている。左を向かせる時は左右反転して使う。
   動く時は歩く向きを向き、話す時は相手の方を、聞く時は話す人の方を向く。傾ける演出は使わない。 */
type Pos = Record<string, number>;
const WALK_MS = 1300;
const dirTo = (from: number, to: number): 1 | -1 => (to >= from ? 1 : -1);

function Actors({ c, s, cast, prev, cur, talk, meMood, meAct, review, reduced, partner }: { c: Ctx; s: LifeState; cast: Who[]; prev: Pos; cur: Pos; talk: Talk | null; meMood: Mood; meAct: string; review?: Set<string>; reduced: boolean; partner?: Who }) {
  const [go, setGo] = useState(reduced);
  const [arrived, setArrived] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
    const t = window.setTimeout(() => setArrived(true), WALK_MS + 120);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t);
    };
  }, [reduced]);
  const pos = go ? cur : prev;
  const all: Who[] = ["me", ...cast];
  const think = !!talk?.text.startsWith("（");
  const listener: Who | null = talk && !think ? (talk.to ?? (talk.who === "me" ? (cast[0] ?? partner ?? null) : "me")) : null;
  const moving = (w: Who) => !arrived && Math.abs((cur[w] ?? 0) - (prev[w] ?? 0)) > 0.5;
  const face = (w: Who): 1 | -1 => {
    if (moving(w)) return dirTo(prev[w], cur[w]);
    if (talk && !think && listener) {
      const other = w === talk.who ? listener : w === listener ? talk.who : null;
      if (other && cur[other] != null) return dirTo(cur[w], cur[other]);
      if (other) return 1; /* 絵のない相手（家族など）は画面の右にいる扱い */
    }
    if (w === "me") return cast.length ? dirTo(cur.me, cur[cast[0]]) : 1;
    return dirTo(cur[w], cur.me);
  };
  const shown = arrived ? talk : null;
  /* 絵のない相手（家族・現地の仲間・教え子）は、画面の右に名札で立たせる */
  const off = shown && !think ? ([shown.who, listener].find((w) => w && w !== "me" && cur[w] == null) ?? null) : null;
  return (
    <>
      {off && c.style === "g1" && SCENE_NAMES[off] && newArt(off, "普通") && (
        <span className="pk-actor is-newface is-talking" style={{ left: "84%" }}>
          <img src={art(c.style, newArt(off, shown?.who === off ? (meMood === "しんどい" ? "普通" : "元気") : "普通")!)} alt={nm(s.job, off)} style={{ ["--sx" as string]: -1 }} />
          <b className="pk-newface-name">{nm(s.job, off)}</b>
        </span>
      )}
      {off && !(c.style === "g1" && SCENE_NAMES[off] && newArt(off, "普通")) && (
        <span className="pk-offstage" style={{ left: "84%" }}>
          <span className="pk-offstage-face">
            <DrawnFace lv={1} who={off === "student" ? "student" : off === "family" ? "family" : "local"} />
          </span>
          <b>{nm(s.job, off)}</b>
        </span>
      )}
      {all.map((w) => {
        const isMe = w === "me";
        const src = isMe ? meArt(c.look, meMood) : whoArt(w, c.look, "普通")!;
        const st = moving(w) ? "is-walking" : shown && (shown.who === w || listener === w) ? (shown.who === w ? "is-talking" : "is-listening") : isMe ? `act-${meAct}` : "is-idle";
        return (
          <span key={w} className={`pk-actor ${isMe ? "is-me" : ""} ${st}`} style={{ left: `${pos[w]}%` }}>
            <img key={isMe ? meMood : w} src={art(c.style, src)} alt={isMe ? "あなた" : nm(s.job, w)} style={{ ["--sx" as string]: face(w) }} />
            {isMe && meAct === "down" && <span className="pk-sweat" aria-hidden />}
          </span>
        );
      })}
      {shown && <Bubble s={s} talk={listener ? { ...shown, to: listener } : shown} sx={cur[shown.who] ?? 84} review={review?.has(shown.text)} k={shown.text} />}
    </>
  );
}

/** 1つの場面を5つの段で見せる舞台 */
function EpisodeStage({ c, s, ep, prev, beat, vibes, speed, setSpeed, onBeat, overlay, age }: { c: Ctx; s: LifeState; ep: JEpisode; prev?: JEpisode; beat: Beat; vibes: Vibe[]; speed: Speed; setSpeed: (v: Speed) => void; onBeat: (b: number) => void; overlay?: ReactNode; age?: number }) {
  const reduced = usePrefersReducedMotion();
  const [intro, setIntro] = useState(!reduced);
  const [k, setK] = useState(0);
  const cb = useRef(onBeat);
  useEffect(() => {
    cb.current = onBeat;
  });
  useEffect(() => {
    if (!intro) return;
    const t = window.setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(t);
  }, [intro]);
  useEffect(() => {
    if (reduced || intro || speed === "manual" || beat >= 4 || overlay) return;
    const t = window.setTimeout(() => cb.current(beat + 1), SPEED_MS[speed][beat]);
    return () => clearTimeout(t);
  }, [beat, speed, reduced, intro]);
  /* 仕事の段では、口コミから入った会話も順に出す */
  const workTalks: Talk[] = [ep.work.talk, ...vibes.map((v) => v.talk)];
  useEffect(() => {
    if (beat !== 0 || intro || workTalks.length < 2 || reduced) return;
    const t = window.setInterval(() => setK((x) => Math.min(x + 1, workTalks.length - 1)), 3200);
    return () => clearInterval(t);
  }, [beat, intro, workTalks.length, reduced]);
  const kw = knowOf(s.job).find((x) => x.id === ep.up.know)!;
  const slot = SLOTS[c.fam];
  const others = Array.from(new Set([ep.work.talk.who, ep.learn.who].filter((w) => w !== "me" && whoArt(w, c.look, "普通")))).slice(0, 2) as Who[];
  const base = (w: Who) => (w === "me" ? slot.me : others.includes(w) ? slot.others[others.indexOf(w)] : slot.side);
  const near = c.fam === "g" ? 17 : 11;
  /* 段ごとの立ち位置：①話しかける人が近づく ②あなたは1人で真ん中へ、ほかの人は離れる ③教える人がそばに来る ⑤あなたが前に出る */
  const layout = (b: number): Pos => {
    const p: Pos = { me: slot.me };
    others.forEach((w) => (p[w] = base(w)));
    if (b === 0 && others.includes(ep.work.talk.who)) p[ep.work.talk.who] = slot.me + near;
    if (b === 1) {
      p.me = slot.me + (c.fam === "g" ? 9 : 5);
      others.forEach((w) => (p[w] = Math.min(93, base(w) + 9)));
    }
    if (b === 2 && ep.learn.who !== "me") {
      others.forEach((w) => (p[w] = w === ep.learn.who ? slot.me + near : Math.min(93, base(w) + 10)));
    }
    if (b === 2 && ep.learn.how === "工夫") p.me = slot.me + 6;
    if (b >= 3) p.me = slot.me + (c.fam === "g" ? 12 : 6);
    return p;
  };
  /* 場面の最初は、ほかの人が画面の右から歩いて入ってくる */
  const enter: Pos = { me: slot.me - 12 };
  others.forEach((w) => (enter[w] = 108));
  const prevPos = beat === 0 ? enter : layout(beat - 1);
  const talk: Talk | null = intro ? null : beat === 0 ? workTalks[Math.min(k, workTalks.length - 1)] : beat === 1 ? { who: "me", text: ep.wall.think } : beat === 2 ? (ep.learn.who === "me" ? { who: "me", text: `（${(ep.learn.line.startsWith("（") && ep.learn.line.endsWith("）") ? ep.learn.line.slice(1, -1) : ep.learn.line)}）` } : { who: ep.learn.who, to: "me", text: ep.learn.line }) : null;
  const vibeTalk = new Set(vibes.map((v) => v.talk.text));
  const tints = [...(beat <= 1 ? vibes.map((v) => v.tint) : []), beat === 1 ? ep.wall.tint : beat === 2 ? "warm" : undefined].filter(Boolean);
  const mood: Mood = beat === 1 ? "しんどい" : beat >= 3 ? "元気" : "普通";
  const act = beat === 1 ? "down" : ep.act;
  const cap = [ep.work.text, ep.wall.text, ep.learn.text, `${kw.name}　Lv.${ep.up.from} → Lv.${ep.up.to}。理由：${ep.learn.text}`, ep.after.text];
  return (
    <div className="pk-stagewrap" data-h="scene">
      <div className={`pk-stage pk-epstage beat-${beat} ${beat === 1 && !intro ? "is-down" : ""} ${tints.map((t) => `tint-${t}`).join(" ")}`}>
        <img src={art(c.style, (ep.bg as PackKey | undefined) ?? PLACE_ART[ep.place])} alt={`${PLACE_LABEL[ep.place]}の場面`} className="pk-bg" />
        <span className="pk-tint" aria-hidden />
        {!intro && beat !== 3 && <Actors key={`${beat}`} c={c} s={s} cast={others} prev={prevPos} cur={layout(beat)} talk={talk} meMood={mood} meAct={beat === 4 ? "cheer" : act} review={vibeTalk} reduced={reduced} />}
        {beat === 4 && (
          <div className="pk-after">
            <img src={art(c.style, meArt(c.look, "元気"))} alt="" />
            <span>
              <small>その後｜{ep.after.when}</small>
              {ep.after.text}
            </span>
          </div>
        )}
        {beat === 3 && (
          <button type="button" className="pk-rank is-gain is-ep" onClick={() => onBeat(4)} aria-label="次の段へ">
            <img src={art(c.style, "cut-rankup")} alt="" className="pk-cut-bg" />
            <span className="pk-cut-flash" aria-hidden />
            <img src={art(c.style, meArt(c.look, "元気"))} alt="" className="pk-rank-me" />
            <span className="pk-rank-box">
              <span className="pk-cut-kind">SKILL UP　スキルアップ</span>
              <span className="lf-h pk-rank-title is-ep">{kw.name}</span>
              <span className="pk-lvjump">
                <span>Lv.{ep.up.from}</span>
                <i aria-hidden>→</i>
                <b>Lv.{ep.up.to}</b>
              </span>
              <span className="pk-lvname">
                {LV_NAME[ep.up.from]} → <b>{LV_NAME[ep.up.to]}</b>
              </span>
              {(ep.extra?.length ?? 0) > 0 && (
                <span className="pk-lvextra">
                  ほかに育ったスキル：
                  {ep.extra!.map((x) => `${knowOf(s.job).find((k) => k.id === x.know)?.name ?? x.know} Lv.${x.to}`).join("・")}
                </span>
              )}
            </span>
          </button>
        )}
        {overlay && !intro && overlay}
        {intro && (
          <button type="button" className="pk-timeskip" onClick={() => setIntro(false)} aria-label="時間が進む演出を飛ばす">
            <span className="pk-ts-label">{prev ? "次の場面へ　時間が進みます" : "場面のはじまり"}</span>
            <span className="pk-ts-when">
              {prev && <s>{prev.when}</s>}
              {prev && <i aria-hidden>▶</i>}
              <b>{ep.when}</b>
            </span>
            <span className="pk-ts-mean">{ep.mean}</span>
            <span className="pk-ts-bar" aria-hidden />
          </button>
        )}
      </div>
      <div className={`pk-cap beat-${beat}`} aria-live="polite">
        <span className="pk-cap-tag">{intro ? "時間が進む" : `${"①②③④⑤"[beat]} ${BEATS[beat]}${beat === 2 ? (ep.learn.how === "工夫" ? "（自分で工夫）" : `（${nm(s.job, ep.learn.who)}さんに教わる）`) : ""}`}</span>
        <span className="pk-cap-txt">{intro ? `${prev ? `${prev.when}から、` : ""}${ep.when}へ。` : beat === 4 ? `${ep.after.when}、${cap[4]}` : cap[beat]}</span>
        <span className="pk-cap-ctl">
          <span className="pk-speed" role="group" aria-label="進む速さ">
            {(Object.keys(SPEED_LABEL) as Speed[]).map((v) => (
              <button key={v} type="button" aria-pressed={speed === v} onClick={() => setSpeed(v)}>
                {SPEED_LABEL[v]}
              </button>
            ))}
          </span>
          <button type="button" className="pk-cap-next" disabled={!!overlay && !intro} onClick={() => (intro ? setIntro(false) : onBeat(beat + 1))}>
            次へ ▶
          </button>
        </span>
      </div>
      {beat <= 1 && !intro && vibes.length > 0 && (
        <ul className="pk-stagestrip is-top" aria-label="口コミから入った言葉">
          {vibes.map((v) => (
            <li key={v.id} className={`lf-vibe is-${v.tone}`}>
              {v.from}「{v.quote.length > 16 ? `${v.quote.slice(0, 16)}…` : v.quote}」
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 場面の5つの段を、文で並べる（押すとその段へ） */
function StoryCard({ s, ep, k, beat, last, next, onBeat }: { s: LifeState; ep: Episode; k: Know; beat: Beat; last: boolean; next?: Episode; onBeat: (b: number) => void }) {
  const rows = [
    ep.work.text,
    ep.wall.text,
    `${ep.learn.how === "工夫" ? "自分で工夫" : `${nm(s.job, ep.learn.who)}さんに教わる`}：${ep.learn.text}`,
    `${k.name}　Lv.${ep.up.from}（${LV_NAME[ep.up.from]}）→ Lv.${ep.up.to}（${LV_NAME[ep.up.to]}）`,
    `${ep.after.when}：${ep.after.text}`,
  ];
  return (
    <div className="lf-card pk-story p-4 sm:p-5" data-h="episode">
      <p className="lf-h text-[15px]">この場面の流れ</p>
      <ol className="mt-2 grid gap-1.5">
        {rows.map((r, i) => (
          <li key={i}>
            <button type="button" onClick={() => onBeat(i)} aria-current={i === beat} className={`pk-storyrow ${i < beat ? "is-past" : i > beat ? "is-next" : ""} ${i === 3 ? "is-up" : ""}`}>
              <span className="pk-storyno">{"①②③④⑤"[i]}</span>
              <span>
                <b>{BEATS[i]}</b>
                {i <= beat ? <span className="pk-storytxt">{r}</span> : <span className="pk-storytxt is-hidden">…</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {beat > 0 && (
          <button type="button" className="lf-rewind px-4 py-2 text-[13px]" onClick={() => onBeat(0)}>
            ↺ この場面を最初から
          </button>
        )}
      </div>
    </div>
  );
}

/** 場面で手に入れたスキルと、そのスキルで進める道（6本）を線でつなぐ。太い線＝活きる、点線＝少し活きる */
const FIT_PT: Record<string, number> = { 活きる: 2, 少し活きる: 1, 活きない: 0 };
/** 道ごとの太さ：持っているスキルの「活きる・少し活きる」を、段（Lv）と、この場面で上がった物を重くして足す。6本を比べて、上から2本＝太い、次の2本＝ふつう、残り＝細い */
function roadRank(s: LifeState, lv: Record<string, number>, gainedIds: Set<string>) {
  const ks = knowOf(s.job).filter((k) => (lv[k.id] ?? 0) > 0 || gainedIds.has(k.id));
  const rows = BRANCHES.map((b, order) => {
    const fit = ks
      .map((k) => ({ k, f: k.fits[b.id].fit, w: FIT_PT[k.fits[b.id].fit] * (1 + (lv[k.id] ?? 1) * 0.25) * (gainedIds.has(k.id) ? 1.6 : 1) }))
      .filter((x) => x.f !== "活きない")
      .sort((a, z) => z.w - a.w);
    const later = knowOf(s.job).reduce((n, k) => n + FIT_PT[k.fits[b.id].fit], 0);
    /* 今のスキルの重みが同じ道は、この先に身につくスキルも含めた見込み（later）で差をつける */
    const now = fit.reduce((n, x) => n + x.w, 0);
    return { b, order, score: now === 0 ? 0 : Math.round((now + later * 0.15) * 100) / 100, later, skills: fit.slice(0, 3) };
  }).sort((a, z) => z.score - a.score || z.later - a.later || a.order - z.order);
  /* 太さは6本を比べた順番で決める（上の2本＝太い、次の2本＝ふつう、残り＝細い）。同じ重みの道は同じ太さにそろえる。点数・％は画面に出さない */
  return rows.map((r) => {
    const i = rows.findIndex((x) => x.score === r.score);
    return { ...r, tier: (r.score === 0 ? 2 : i < 2 ? 0 : i < 4 ? 1 : 2) as 0 | 1 | 2 };
  });
}
const TIER_NAME = ["太い道", "ふつうの道", "細い道"] as const;
function SkillRoads({ c, s, gained, lv, title }: { c: Ctx; s: LifeState; gained: { k: Know; from: number; to: number }[]; lv: Record<string, number>; title: string }) {
  const gid = new Set(gained.map((g) => g.k.id));
  const lvNow = { ...lv, ...Object.fromEntries(gained.map((g) => [g.k.id, Math.max(lv[g.k.id] ?? 0, g.to)])) };
  const rows = roadRank(s, lvNow, gid);
  const [pick, setPick] = useState<string | null>(null);
  return (
    <div className="lf-card pk-skroads p-4 sm:p-5" data-h="skillroads">
      <p className="pk-eyebrow text-[12px]">{title}</p>
      <p className="lf-h text-[18px] sm:text-[20px]">手に入れたスキルで、進める道</p>
      <ul className="pk-skr-chips" aria-label="この場面で上がったスキル（押すと、活きる道が光ります）">
        {gained.map((g) => (
          <li key={g.k.id}>
            <button type="button" aria-pressed={pick === g.k.id} onClick={() => setPick(pick === g.k.id ? null : g.k.id)}>
              {g.k.name} <b>Lv.{g.to}</b> ↑{g.k.assumed ? <small>仮定</small> : null}
            </button>
          </li>
        ))}
      </ul>
      <ul className="pk-skr-cards">
        {rows.map((r, i) => {
          const lit = pick ? r.b && knowOf(s.job).find((k) => k.id === pick)?.fits[r.b.id].fit === "活きる" : false;
          return (
            <li key={r.b.id} className={`pk-skr-card tier-${r.tier} ${i === 0 ? "is-top" : ""} ${pick ? (lit ? "is-lit" : "is-dim") : ""}`}>
              <img src={art(c.style, destArt(s.job, r.b.id, s.profile.age))} alt="" />
              <div className="pk-skr-body">
                <p className="pk-skr-name">
                  <b>{r.b.label}</b>
                  <span>{TIER_NAME[r.tier]}</span>
                </p>
                <span className="pk-skr-band" aria-hidden />
                <p className="pk-skr-lbl">この道で活きるスキル</p>
                <ul className="pk-skr-tags">
                  {r.skills.length ? (
                    r.skills.map((x) => (
                      <li key={x.k.id} className={`${x.f === "活きる" ? "" : "is-some"} ${gid.has(x.k.id) ? "is-new" : ""}`}>
                        {x.k.name}
                      </li>
                    ))
                  ) : (
                    <li className="is-none">まだつながるスキルがない</li>
                  )}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** 入社1年を見終わったら「先を見る」。どこまで見るかを選ぶ */
function FutureCard({ s, done, onFuture }: { s: LifeState; done: boolean; onFuture: (y: number) => void }) {
  const eps = episodesOf(s.job);
  return (
    <div className={`pk-future ${done ? "is-open" : ""}`} data-h="future">
      {done ? (
        <>
          <p className="pk-eyebrow text-[12px]">最初の1年の場面を見終わりました</p>
          <p className="lf-h text-[20px] sm:text-[23px]">{s.years}年後の分かれ道へ</p>
        </>
      ) : (
        <p className="text-[13px] text-[var(--lf-sub)]">
          <b className="text-[var(--lf-ink)]">先を見る</b>：場面（{eps.length}つ）を見終わると、{s.years}年後の分かれ道へ進みます。
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={done ? "lf-btn px-5 py-3 text-[15px]" : "pk-futbtn px-4 py-2.5 text-[13.5px]"} onClick={() => onFuture(s.years)}>
          {s.years}年後の分かれ道を見る ▶
        </button>
        {HORIZONS.filter((h) => h.y === 10 || h.y === 99).map((h) => (
          <button key={h.y} type="button" className="pk-futbtn px-4 py-2.5 text-[13.5px]" onClick={() => onFuture(h.y)}>
            {h.label}見る ▶
          </button>
        ))}
      </div>
    </div>
  );
}

/* 分かれ道が来る時点（1年／3年／5年）。年数だけで一律に上げず、会社・職務ごとの育ち方で差が出る */
const YEARS_NOTE: Record<Years, string> = { 1: "知った・できる まで。移る道はまだ狭い", 3: "任される。6本の道がはっきり見える（初期）", 5: "教えられる。独立・海外など活きる道が増える" };
function YearsSwitch({ s, compact, thin }: { s: LifeState; compact?: boolean; thin?: boolean }) {
  const ks = knowOf(s.job);
  const top = (y: Years) => {
    const idx = y === 1 ? 2 : y === 3 ? 3 : 4;
    return ks.filter((k) => (k.grow[Math.min(idx, k.grow.length - 1)] ?? -1) >= (y === 5 ? 3 : y === 3 ? 2 : 1)).length;
  };
  if (thin)
    return (
      <div className="pk-years-thin" data-h="years" role="group" aria-label="分かれ道が来る時点">
        <span className="pk-years-thin-head">分かれ道</span>
        {([1, 3, 5] as Years[]).map((y) => (
          <button key={y} type="button" aria-pressed={s.years === y} onClick={() => s.setYears(y)} title={YEARS_NOTE[y]}>
            {y}年後
          </button>
        ))}
        <span className="pk-years-thin-diff">
          {s.years}年後に「{s.years === 5 ? "教えられる" : s.years === 3 ? "任される" : "できる"}」まで育つ専門知識：<b>{top(s.years)}つ</b>
        </span>
      </div>
    );
  return (
    <div className={`pk-years ${compact ? "is-compact" : ""}`} data-h="years">
      <p className="pk-years-head">分かれ道が来る時点（初期は3年）</p>
      <div className="pk-years-row" role="group" aria-label="分かれ道が来る時点">
        {([1, 3, 5] as Years[]).map((y) => (
          <button key={y} type="button" aria-pressed={s.years === y} onClick={() => s.setYears(y)}>
            <b>{y}年後</b>
            <small>{YEARS_NOTE[y]}</small>
          </button>
        ))}
      </div>
      {!compact && (
        <p className="pk-years-diff">
          {s.years}年後に「{s.years === 5 ? "教えられる" : s.years === 3 ? "任される" : "できる"}」まで育つ専門知識：<b>{top(s.years)}つ</b>
        </p>
      )}
    </div>
  );
}

/** 成長のまとめ：入社した時と、いま見ている時点を並べる（ビフォー・アフター／スキル／役割の階段／給料の筋書き／次の道） */
function GrowthCard({ c, s, mode, onReplay, onFuture }: { c: Ctx; s: LifeState; mode: { kind: "ep"; e: number; beat: number } | { kind: "ch" }; onReplay: (e: number) => void; onFuture?: (y: number) => void }) {
  const eps = episodesOf(s.job);
  const ks = knowOf(s.job);
  const start = s.profile.age;
  const epMode = mode.kind === "ep";
  const lv: Record<string, number> = epMode ? levelsAt(s.job, mode.e, mode.beat) : Object.fromEntries(ks.map((k) => [k.id, stageAt(k, s.idx, s.forkIdx, s.branch) + 1]));
  const nowAge = epMode ? start + 1 : ageAt(s.chapter, start);
  const nowLabel = epMode ? eps[mode.e].when : chapterLabel(s.chapter, start);
  /* 役割の階段 */
  const stairs: { when: string; role: string }[] = [{ when: "入社", role: eps[0]?.role ?? "見習い" }];
  eps.slice(1, epMode ? mode.e + 1 : eps.length).forEach((e) => stairs.push({ when: e.when, role: e.role }));
  if (!epMode) {
    stairs.push({ when: "3年後", role: ROLE_AT_FORK[s.job.id] ?? "役割がふえる" });
    if (s.branch && s.detail)
      s.detail.chapters.forEach((ch, j) => {
        const i = s.forkIdx + 1 + j;
        const r = roleOfChapter(s.job, s.branch, j);
        if (i <= s.idx && r) stairs.push({ when: `${ageAt(ch, start)}歳`, role: r });
      });
  }
  const nowRole = stairs[stairs.length - 1].role;
  /* 給料の筋書き */
  const pay = payOfJob(s.job);
  const payRows: { when: string; trend: PayTrend | null; text: string }[] = [{ when: "入社", trend: null, text: `${pay.pay}（出典：${pay.src}）` }];
  payRows.push({ when: "1年目", trend: "横ばい", text: pay.raise ? `求人原稿に「${pay.raise}」` : "求人どおり。昇給の決まりは求人原稿に書いていない（不明）" });
  if (!epMode) {
    const fork = s.chapters[s.forkIdx];
    const t = payTrendOf(s.chapters[s.forkIdx - 1], fork);
    payRows.push({ when: "3年後", trend: t.trend, text: t.why });
    if (s.branch) {
      const bp = BRANCH_PAY[s.branch];
      if (s.detail)
        s.detail.chapters.forEach((ch, j) => {
          const i = s.forkIdx + 1 + j;
          if (i > s.idx) return;
          const p = payTrendOf(s.chapters[i - 1], ch);
          payRows.push({ when: `${ageAt(ch, start)}歳`, trend: p.trend, text: p.why });
        });
      else payRows.push({ when: BRANCHES.find((b) => b.id === s.branch)!.short, trend: bp.trend, text: bp.why });
    }
  }
  /* スキルがどこで身についたか */
  const whereOf = (id: string) => {
    const out: { label: string; go: () => void }[] = [];
    eps.forEach((e, i) => {
      if (e.up.know !== id) return;
      if (epMode && (i > mode.e || (i === mode.e && mode.beat < 3))) return;
      out.push({ label: `${e.when}「${e.title}」`, go: () => onReplay(i) });
    });
    if (!epMode)
      for (let i = s.forkIdx; i <= s.idx; i++)
        if (gainsAt(s.job, i, s.forkIdx, s.branch).some((g) => g.k.id === id)) out.push({ label: `${chapterLabel(s.chapters[i], start)}の場面`, go: () => s.jump(i) });
    return out;
  };
  const got = ks.filter((k) => (lv[k.id] ?? 0) > 0);
  return (
    <div className="lf-card pk-growth p-4 sm:p-6" data-h="growth">
      <p className="pk-eyebrow text-[12px]">成長のまとめ　入社 → {nowLabel}</p>
      <PromiseNote />
      <p className="lf-h mt-2 text-[21px] sm:text-[26px]">結局、どう成長した？</p>
      <div className="pk-ba">
        <figure>
          <span className="pk-ba-pic">
            <img src={art(c.style, PLACE_ART[s.job.place])} alt="" className="pk-ba-bg" />
            <img src={art(c.style, meArt(c.look, "普通"))} alt="入社した時のあなた" className="pk-ba-me" />
          </span>
          <figcaption>
            <small>BEFORE　入社　{start}歳</small>
            <b>{stairs[0].role}</b>
          </figcaption>
        </figure>
        <span className="pk-ba-arrow" aria-hidden>
          ▶
        </span>
        <figure className="is-after">
          <span className="pk-ba-pic">
            <img src={art(c.style, PLACE_ART[s.job.place])} alt="" className="pk-ba-bg" />
            <img src={art(c.style, meArt(c.look, "元気"))} alt="いまのあなた" className="pk-ba-me" />
          </span>
          <figcaption>
            <small>AFTER　{nowLabel}　{nowAge}歳</small>
            <b>{nowRole}</b>
          </figcaption>
        </figure>
      </div>

      <p className="lf-h mt-5 text-[16px]">専門スキル　Lv.いくつ → いくつ</p>
      <ul className="pk-gskills">
        {ks.map((k) => {
          const n = lv[k.id] ?? 0;
          const w = whereOf(k.id);
          return (
            <li key={k.id} className={n === 0 ? "is-zero" : ""}>
              <span className="pk-gs-name">{k.name}</span>
              <span className="pk-gs-lv">
                Lv.0 → <b>Lv.{n}</b>
                <small>{LV_NAME[n]}</small>
              </span>
              <span className="pk-gs-where">
                {w.length ? (
                  w.map((x) => (
                    <button key={x.label} type="button" onClick={x.go} className="pk-gs-link">
                      ▶ {x.label}
                    </button>
                  ))
                ) : (
                  <span className="text-[var(--lf-sub)]">まだ。{k.where}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-1 text-[11.5px] text-[var(--lf-sub)]">場面の名前を押すと、その場面を見返せます。</p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <p className="lf-h text-[16px]">任される仕事・役割の階段</p>
          <ol className="pk-stairs">
            {stairs.map((st, i) => (
              <li key={`${st.when}-${i}`} style={{ ["--i" as string]: i }} className={i === stairs.length - 1 ? "is-now" : ""}>
                <small>{st.when}</small>
                <b>{st.role}</b>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="lf-h text-[16px]">給料の筋書き（金額は断定しません）</p>
          <ul className="pk-payrows">
            {payRows.map((r) => (
              <li key={r.when}>
                <small>{r.when}</small>
                {r.trend ? (
                  <b className={`pay-${r.trend}`}>
                    {PAY_MARK[r.trend]} {r.trend}
                  </b>
                ) : (
                  <b>求人原稿</b>
                )}
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="lf-h mt-5 text-[16px]">このスキルは、この先こんな道で活きる</p>
      <div className="pk-nextroads">
        {BRANCHES.map((b) => {
          const good = got.filter((k) => k.fits[b.id].fit === "活きる");
          return (
            <div key={b.id} className={good.length ? "is-good" : ""}>
              <b>{b.short}</b>
              <span>{good.length ? good.map((k) => k.name).join("・") : "活きるスキルはまだ少ない"}</span>
              <small>
                給料：{PAY_MARK[BRANCH_PAY[b.id].trend]} {BRANCH_PAY[b.id].trend}
              </small>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {onFuture ? (
          <button type="button" className="lf-btn px-5 py-3 text-[15px]" onClick={() => onFuture(s.years)}>
            分かれ道（{s.years}年後）で、道を選んでみる ▶
          </button>
        ) : s.atFork ? (
          <a href="#fork" className="lf-btn px-5 py-3 text-[15px]" onClick={(e) => (e.preventDefault(), document.querySelector('[data-h="branches"]')?.scrollIntoView({ behavior: "smooth" }))}>
            分かれ道で、道を選ぶ ▶
          </a>
        ) : (
          s.branch && (
            <button type="button" className="pk-futbtn px-4 py-2.5 text-[13.5px]" onClick={s.rewind}>
              ↺ 分かれ道に戻って、別の道を試す
            </button>
          )
        )}
      </div>
      <NextChecks s={s} />
    </div>
  );
}

/** 締め：未来を当てるのではなく、次に確かめることを見つける */
function NextChecks({ s }: { s: LifeState }) {
  const list = CHECKS[s.job.id] ?? [];
  if (!list.length) return null;
  return (
    <div className="pk-checks" data-h="checks">
      <p className="lf-h text-[17px]">未来を当てるのではなく、次に確かめることを見つける</p>
      <p className="mt-1 text-[12.5px] text-[var(--lf-sub)]">この筋書きを見て、面接や職場見学で確かめるとよいこと{AI_META[s.job.id] ? "（Claude が求人の本文から挙げました）" : ""}</p>
      <ol className="mt-2 grid gap-1.5">
        {list.map((x, i) => (
          <li key={x}>
            <b>{i + 1}</b>
            {x}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** 入社1年の年表（場面ごと）。その先は「先を見る」で開く */
function YearOneLine({ c, s, pos, onPick }: { c: Ctx; s: LifeState; pos: { e: number; beat: Beat }; onPick: (e: number) => void }) {
  const eps = episodesOf(s.job);
  return (
    <div className={`pk-life pk-yr is-thin ${c.fam === "h" ? "is-road" : ""}`} data-h="yearone">
      <ol className="pk-nodes" aria-label="入社からの場面">
        {eps.map((ep, i) => {
          const k = knowOf(s.job).find((x) => x.id === ep.up.know)!;
          const seen = i < pos.e || (i === pos.e && pos.beat >= 3);
          return (
            <li key={ep.id}>
              <button type="button" aria-current={i === pos.e} onClick={() => onPick(i)} className="pk-node">
                <span className="pk-node-pic">
                  <img src={art(c.style, PLACE_ART[ep.place])} alt="" loading="lazy" />
                  {s.vibes.some((v) => episodeOfVibe(s.job, v) === i) && <span className="pk-node-rev">口</span>}
                </span>
                <span className="pk-node-age">{ep.when}</span>
                <span className="pk-node-sub">
                  {k.name} {seen ? `Lv.${ep.up.to}` : `Lv.${ep.up.from}→?`}
                </span>
              </button>
            </li>
          );
        })}
        <li>
          <span className="pk-node is-ghost is-forknode">
            <span className="pk-node-pic">◆</span>
            <span className="pk-node-age">{s.years}年後</span>
            <span className="pk-node-sub">分かれ道（道を選ぶ）</span>
          </span>
        </li>
        {["10年後", `${END_AGE}歳`].map((g) => (
          <li key={g}>
            <span className="pk-node is-ghost">
              <span className="pk-node-pic">?</span>
              <span className="pk-node-age">{g}</span>
              <span className="pk-node-sub">道を選んだ後で開く</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** G案だけの1ページとして公開する時（案の一覧へのリンクを出さない） */
const SINGLE = typeof window !== "undefined" && !!(window as unknown as { __MIRAI_SINGLE?: boolean }).__MIRAI_SINGLE;

/* ---------- 注意書き（最初と結果の画面に必ず出す） ---------- */
function PromiseNote() {
  return (
    <p className="pk-promise" role="note">
      これは試走したシナリオの一つで、未来を約束するものではありません。
    </p>
  );
}

/* ---------- 感情ゲージ（11/6 決定）。点数・％にせず、表情＋一言＋ゲージの絵。仮想の人物だけ ---------- */
type FeelWho = Exclude<Who, "me"> | "partner";
type Feel = { who: FeelWho; lv: 0 | 1 | 2; line: string };
const FEEL_WORD = ["心配している", "見守っている", "頼りにしている"];
/** 顔の絵がない人（現地の仲間・教え子）は、名前の1文字を丸で出す */
function feelArt(c: Ctx, who: FeelWho, partner: "m" | "f"): string | null {
  if (who === "partner" || who === "family") return art(c.style, partner === "m" ? "partner-m" : "partner-f");
  const k = whoArt(who, c.look, "普通");
  return k ? art(c.style, k) : null;
}
function feelName(s: LifeState, w: FeelWho) {
  if (w === "partner") return "パートナー";
  if (w === "boss" || w === "senpai" || w === "peer") return `${nm(s.job, w)}（${s.job.people[w].role}）`;
  return nm(s.job, w);
}
/** 顔の絵がない人（現地の仲間・教え子・家族）は、表情だけの顔を描く（気持ちに合わせて口と眉が変わる） */
function DrawnFace({ lv, who }: { lv: 0 | 1 | 2; who: FeelWho }) {
  const skin = who === "student" ? "#f6d7b8" : who === "local" ? "#d9a77c" : "#efc9a4";
  const hair = who === "student" ? "#3b2a20" : who === "local" ? "#1f1a17" : "#5a3b28";
  const mouth = lv === 2 ? "M15 27 Q20 32 25 27" : lv === 1 ? "M15.5 28 Q20 30 24.5 28" : "M15 30 Q20 26.5 25 30";
  const brow = lv === 0 ? ["M12 15.5 L17 14", "M23 14 L28 15.5"] : ["M12 14.5 Q14.5 13 17 14.5", "M23 14.5 Q25.5 13 28 14.5"];
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#fff6ea" />
      <circle cx="20" cy="22" r="13" fill={skin} />
      <path d={who === "student" ? "M7 20 Q8 6 20 6 Q32 6 33 20 Q29 12 20 12 Q11 12 7 20Z" : "M8 19 Q9 7 20 7 Q31 7 32 19 Q26 13 20 13 Q13 13 8 19Z"} fill={hair} />
      {brow.map((d) => (
        <path key={d} d={d} stroke={hair} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      ))}
      <circle cx="15" cy="20" r="1.6" fill="#2b2420" />
      <circle cx="25" cy="20" r="1.6" fill="#2b2420" />
      {lv === 2 && <circle cx="12.5" cy="25" r="2" fill="#f2a08d" opacity=".6" />}
      {lv === 2 && <circle cx="27.5" cy="25" r="2" fill="#f2a08d" opacity=".6" />}
      <path d={mouth} stroke="#7a3b2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function FeelBox({ c, s, feels, partner, title = "この場面の人たちの気持ち" }: { c: Ctx; s: LifeState; feels: Feel[]; partner?: "m" | "f"; title?: string }) {
  const pt = partner ?? (c.look === "m" ? "f" : "m");
  return (
    <div className="lf-card p-4" data-h="feel">
      <p className="lf-h text-[15px]">{title}</p>
      {feels.length === 0 && <p className="mt-2 text-[12.5px] leading-6 text-[var(--lf-sub)]">この場面は、あなた1人で考える場面です。</p>}
      <ul className="mt-2 grid gap-2.5">
        {feels.map((f) => {
          const pic = feelArt(c, f.who, pt);
          return (
            <li key={f.who} className="pk-feel">
              <span className={`pk-feel-face ${pic ? "" : "is-drawn"}`}>{pic ? <img src={pic} alt="" /> : <DrawnFace lv={f.lv} who={f.who} />}</span>
              <span className="grid gap-0.5">
                <b className="text-[13px]">{feelName(s, f.who)}</b>
                <span className={`pk-gauge lv-${f.lv}`} role="img" aria-label={FEEL_WORD[f.lv]}>
                  <i />
                  <i />
                  <i />
                  <em>{FEEL_WORD[f.lv]}</em>
                </span>
                <span className="text-[12.5px] leading-5">「{f.line}」</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] leading-5 text-[var(--lf-sub)]">仮想の人物の気持ちの筋書きです。</p>
    </div>
  );
}
/* 役ごとの、段階ごとの一言（壁＝心配、学び＝見守る、乗り越えた後＝頼りにする） */
const FEEL_LINES: Record<Exclude<FeelWho, "partner">, [string, string, string, string]> = {
  /* 仕事 / 壁 / 学び / 乗り越えた後 */
  boss: ["ゆっくり覚えていこう", "あせらなくていいよ。ちゃんと見ているからね", "分からない所は、何度でも聞いてね", "これなら安心して任せられるね"],
  senpai: ["分からないことは、いつでも聞いてね", "最初はみんな同じだよ", "一緒にやれば、すぐ覚えられるよ", "もう1人でできるね。頼りにしてるよ"],
  peer: ["一緒にがんばろう", "大丈夫？ 手伝おうか", "そのやり方、いいね", "すごいね。今度やり方を教えて"],
  local: ["一緒にやってみよう", "ゆっくりでいいよ", "見せてくれると分かりやすい", "あなたのやり方を覚えたい"],
  family: ["今日もおつかれさま", "無理しないでね", "話を聞かせて", "がんばっているね。応援しているよ"],
  student: ["よろしくお願いします", "むずかしいです…", "そういうことだったんですね", "教えてくれて、ありがとうございます"],
};
function feelOf(who: Exclude<FeelWho, "partner">, phase: 0 | 1 | 2 | 3): Feel {
  return { who, lv: (phase === 1 ? 0 : phase === 3 ? 2 : 1) as Feel["lv"], line: FEEL_LINES[who][phase] };
}
/** 入社1年の場面：その場面に出てきた人全員の気持ち */
function feelsOfEpisode(ep: Episode, beat: number): Feel[] {
  const cast = Array.from(new Set([ep.work.talk.who, ep.learn.who, ep.work.talk.to].filter((w): w is Exclude<Who, "me"> => !!w && w !== "me")));
  const phase = (beat >= 3 ? 3 : beat) as 0 | 1 | 2 | 3;
  return cast.map((w) => feelOf(w, phase));
}
/** 3年後から先の場面：その場面に出てきた人全員の気持ち */
function feelsOfChapter(s: LifeState, ch: Chapter): Feel[] {
  const g = gainsAt(s.job, s.idx, s.forkIdx, s.branch).length > 0;
  const cast = Array.from(new Set([...ch.talks.map((t) => t.who), ch.cutin?.who].filter((w): w is Exclude<Who, "me"> => !!w && w !== "me")));
  const phase: 0 | 1 | 2 | 3 = ch.down ? 1 : g ? 3 : 0;
  return cast.map((w) => feelOf(w, phase));
}

/* ---------- 人生の出来事のマス（11/6 決定）。突然出さず、順に選ぶ。結婚する・しないは決めつけない ---------- */
type LifeChoice = { meet?: string; date?: string; marry?: string; family?: string };
const LIFE_STEPS: { key: keyof LifeChoice; label: string; when: number; options: string[]; needs?: (c: LifeChoice) => boolean }[] = [
  { key: "meet", label: "出会い", when: 3, options: ["趣味の集まりで出会う", "友人の紹介で出会う", "いまは仕事に集中する"] },
  { key: "date", label: "交際", when: 4, options: ["付き合う", "友人のまま"], needs: (c) => !!c.meet && c.meet !== "いまは仕事に集中する" },
  { key: "marry", label: "結婚", when: 6, options: ["結婚する", "結婚しない", "まだ決めない"] },
  { key: "family", label: "家族", when: 8, options: ["子どもを迎える", "ふたりで暮らす", "ひとりで暮らす"], needs: (c) => !!c.marry },
];
function lifeImpact(job: Job, key: keyof LifeChoice, v: string): string {
  const shift = ["交替", "夜勤", "シフト"].some((w) => job.hours.includes(w));
  switch (`${key}:${v}`) {
    case "meet:趣味の集まりで出会う":
    case "meet:友人の紹介で出会う":
      return shift ? `休みの日の予定がふえる。勤務が「${job.hours}」なので、予定合わせに工夫がいる` : "休みの日の予定がふえる。仕事への影響は小さい";
    case "meet:いまは仕事に集中する":
      return "資格の勉強や、任される仕事に時間を使える";
    case "date:付き合う":
      return "働き方の希望（勤務地・休み）を、相手と話すようになる";
    case "date:友人のまま":
      return "働き方は、これまでどおり自分で決められる";
    case "marry:結婚する":
      return `住む場所と働き方を2人で決める。${shift ? "夜勤のある働き方は話し合いが要る。" : ""}転勤や海外の道は相談しながら選ぶ。給料は2人の家計で考える（金額は断定しない）`;
    case "marry:結婚しない":
      return "働き方を1人で決められる。独立・海外の道も選びやすい";
    case "marry:まだ決めない":
      return "決めなくてよい。いまの仕事の選び方には影響しない";
    case "family:子どもを迎える":
      return `日中の勤務や時短を考える時期が来る。育児の支えが求人に書いていない時は「不明」なので、面接で確かめる`;
    case "family:ふたりで暮らす":
      return "休みを合わせる工夫をしながら、仕事の幅を広げられる";
    case "family:ひとりで暮らす":
      return "自分のペースで、学び直しや資格に時間を使える";
  }
  return "";
}
/** いま選ぶ人生の出来事（その歳に来ていて、まだ選んでいないもの）。分かれ道の後だけ */
function lifePending(s: LifeState, life: LifeChoice): (typeof LIFE_STEPS)[number] | null {
  if (!s.branch) return null;
  /* 作り込みのない道は場面が分かれ道で止まるので、出来事を順に選ぶ */
  const age = s.detail ? ageAt(s.chapter, s.profile.age) : END_AGE;
  const open = LIFE_STEPS.filter((st, i) => (i === 0 || life[LIFE_STEPS[i - 1].key] || (st.key === "marry" && life.meet)) && (!st.needs || st.needs(life)));
  return open.find((st) => !life[st.key] && s.profile.age + st.when <= age) ?? null;
}
/** 人生の出来事：分かれ道と同じく、場面の絵の上に選ぶカードを重ねる（自動で進めていても止まって待つ） */
function LifePick({ c, st, age, partner, job, onPick }: { c: Ctx; st: (typeof LIFE_STEPS)[number]; age: number; partner: "m" | "f"; job: Job; onPick: (o: string) => void }) {
  const solo = (o: string) => ["いまは仕事に集中する", "友人のまま", "結婚しない", "ひとりで暮らす"].includes(o);
  const pic = (o: string) => (solo(o) || o === "まだ決めない" ? art(c.style, meArt(c.look, "元気")) : art(c.style, partner === "m" ? "partner-m" : "partner-f"));
  return (
    <div className="pk-forkpick is-life" data-h="lifepick" role="dialog" aria-label={`人生の出来事：${st.label}。1つ選んでください`}>
      <p className="pk-forkpick-head">
        <b>■ 人生の出来事</b>　{st.label}（{age}歳ごろ）　どれを選んでもかまいません
      </p>
      <ul className={`pk-forkpick-list n-${st.options.length}`}>
        {st.options.map((o, i) => (
          <li key={o} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <button type="button" onClick={() => onPick(o)}>
              <img src={pic(o)} alt="" className="is-person" />
              <span className="pk-forkpick-txt">
                <b>{o}</b>
                <small>{lifeImpact(job, st.key, o)}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
/* ---------- 人生の出来事のあとの場面（11/8 依頼）：選んだあと1〜2場面で、仕事・働き方・給料への影響を見せてから元の流れに戻る ---------- */
type LifeScene = { title: string; with: "partner" | "me" | "family"; mood: Mood; line: string; work: string; style: string; pay: string };
function lifeAfter(job: Job, key: keyof LifeChoice, v: string, raise: string | null): LifeScene[] {
  const shift = ["交替", "夜勤", "シフト"].some((w) => job.hours.includes(w));
  const payUp = raise ? `求人原稿に「${raise.length > 28 ? raise.slice(0, 28) + "…" : raise}」。上がり方は面接で確かめる` : "昇給は求人原稿に書いていない（不明）。面接で確かめる";
  switch (`${key}:${v}`) {
    case "meet:趣味の集まりで出会う":
    case "meet:友人の紹介で出会う":
      return [
        { title: "休みの日に、会う約束がふえる", with: "partner", mood: "元気", line: "次の休み、いつ？", work: "仕事の中身は変わらない", style: shift ? `勤務が「${job.hours}」なので、休みの日を早めに伝えて予定を合わせる` : "休みの日が決まっているので、予定は合わせやすい", pay: "変わらない" },
      ];
    case "meet:いまは仕事に集中する":
      return [
        { title: "休みの日に、資格の勉強を進める", with: "me", mood: "普通", line: "いまは、これを取りたい", work: "資格の勉強が、任される仕事の幅を広げる", style: "時間の使い方を、自分ひとりで決められる", pay: `資格の手当があるかは求人で確かめる。${raise ? "" : "書いていなければ不明"}` },
      ];
    case "marry:結婚する":
      return [
        { title: "2人で、転勤のない働き方を話し合う", with: "partner", mood: "普通", line: "住む場所は、2人で決めようね", work: "いまの職場で、任される仕事を続ける", style: `転勤・海外の道は相談しながら選ぶ。${shift ? "夜勤の回数も2人で決める" : "休みを合わせる"}`, pay: "家計は2人で考える（金額は断定しない）" },
        { title: "家族のために、昇給をめざす", with: "partner", mood: "元気", line: "応援してるよ", work: "責任のある仕事に、自分から手を挙げる", style: "残業や資格の勉強の時間を、2人で決める", pay: payUp },
      ];
    case "marry:結婚しない":
      return [
        { title: "働き方を、自分ひとりで決める", with: "me", mood: "元気", line: "次の道は、自分で選べる", work: "やりたい仕事に、身軽に手を挙げられる", style: "独立・海外・学び直しの道も選びやすい", pay: payUp },
      ];
    case "marry:まだ決めない":
      return [
        { title: "いまは、仕事の選び方を変えない", with: "me", mood: "普通", line: "急がなくていい", work: "いまの仕事を続ける", style: "働き方は、これまでどおり", pay: "変わらない" },
      ];
  }
  return [];
}
function LifeAfterView({ c, sc, i, n, age, partner, onNext }: { c: Ctx; sc: LifeScene; i: number; n: number; age: number; partner: "m" | "f"; onNext: () => void }) {
  const pic = sc.with === "me" ? [art(c.style, meArt(c.look, sc.mood))] : [art(c.style, meArt(c.look, sc.mood)), art(c.style, partner === "m" ? "partner-m" : "partner-f")];
  return (
    <div className="pk-forkpick is-life pk-lifeafter" data-h="lifeafter" role="dialog" aria-label={`人生の出来事のその後：${sc.title}`}>
      <p className="pk-forkpick-head">
        <b>■ その後</b>　{age}歳ごろ　{n > 1 ? `（${i + 1}/${n}）` : ""}
      </p>
      <div className="pk-lifeafter-card">
        <div className="pk-lifeafter-pic">
          {pic.map((p, j) => (
            <img key={p} src={p} alt="" className={j === 1 ? "is-flip" : undefined} />
          ))}
          <span className="pk-lifeafter-say">{sc.line}</span>
        </div>
        <div className="pk-lifeafter-txt">
          <b>{sc.title}</b>
          <dl>
            <dt>仕事</dt>
            <dd>{sc.work}</dd>
            <dt>働き方</dt>
            <dd>{sc.style}</dd>
            <dt>給料</dt>
            <dd>{sc.pay}</dd>
          </dl>
          <button type="button" className="pk-lifeafter-next" onClick={onNext}>
            {i + 1 < n ? "次の場面へ ▶" : "元の流れに戻る ▶"}
          </button>
        </div>
      </div>
    </div>
  );
}
function LifeEvents({ c, s, life, setLife, partner, setPartner }: { c: Ctx; s: LifeState; life: LifeChoice; setLife: (l: LifeChoice) => void; partner: "m" | "f"; setPartner: (p: "m" | "f") => void }) {
  const open = LIFE_STEPS.filter((st, i) => (i === 0 || life[LIFE_STEPS[i - 1].key] || (st.key === "marry" && life.meet)) && (!st.needs || st.needs(life)));
  const hasPartner = life.date === "付き合う";
  const partnerFeel: Feel[] = hasPartner ? [{ who: "partner", lv: (life.marry === "結婚する" ? 2 : 1) as Feel["lv"], line: life.marry === "結婚する" ? "2人で決めていこうね" : life.marry === "まだ決めない" ? "急がなくていいよ" : "仕事、応援してる" }] : [];
  return (
    <div className="lf-card p-5" data-h="lifeev" id="lifeev">
      <p className="lf-h text-[17px]">人生の出来事のマス</p>
      <p className="mt-1 text-[12.5px] leading-6 text-[var(--lf-sub)]">出来事を1つずつ選ぶと、仕事・働き方への影響をひとことで出します。</p>
      <ol className="mt-3 grid gap-3">
        {open.map((st) => (
          <li key={st.key} className="pk-lifestep">
            <p className="text-[13px] font-bold">
              <span className="pk-lifesq" aria-hidden>
                ■
              </span>
              {st.label}（入社{st.when}年後ごろ・{s.profile.age + st.when}歳）
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {st.options.map((o) => (
                <button key={o} type="button" aria-pressed={life[st.key] === o} className="lf-chip px-3 py-1.5 text-[13px]" onClick={() => setLife({ ...life, [st.key]: o })}>
                  {o}
                </button>
              ))}
            </div>
            {life[st.key] && <p className="pk-lifeimpact">影響：{lifeImpact(s.job, st.key, life[st.key]!)}</p>}
          </li>
        ))}
      </ol>
      {hasPartner && (
        <div className="mt-3">
          <div className="mb-1 flex items-center gap-2 text-[12px]">
            相手の絵：
            {(["f", "m"] as const).map((p) => (
              <button key={p} type="button" aria-pressed={partner === p} className="lf-chip px-2 py-0.5 text-[12px]" onClick={() => setPartner(p)}>
                {p === "f" ? "A" : "B"}
              </button>
            ))}
          </div>
          <FeelBox c={c} s={s} feels={partnerFeel} partner={partner} title="パートナーの気持ち" />
        </div>
      )}
    </div>
  );
}

/* ---------- 分かれ道に入ったことを、はっきり見せる ---------- */
/** 分かれ道：場面の絵の上に6本の道を重ねて出す。押すとその道の場面へ進む（自動で進めていても、ここで止まって待つ） */
function ForkPick({ c, s, lines, lv, onChoose }: { c: Ctx; s: LifeState; lines: Record<BranchId, string>; lv: Record<string, number>; onChoose: (b: BranchId) => void }) {
  const start = s.profile.age;
  const rr = roadRank(s, lv, new Set());
  return (
    <div className="pk-forkpick" data-h="forkpick" role="dialog" aria-label="分かれ道。道を1つ選んでください">
      <p className="pk-forkpick-head">
        <b>◆ 分かれ道　{s.years}年後</b>　ここで、道を1つ選んでください
      </p>
      <ul className="pk-forkpick-list">
        {rr.map(({ b, tier }, i) => (
          <li key={b.id} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <button type="button" className={`tier-${tier}`} onClick={() => onChoose(b.id)}>
              <img src={art(c.style, destArt(s.job, b.id, start))} alt="" />
              <span className="pk-forkpick-txt">
                <b>
                  {b.label}
                  <i>{TIER_NAME[tier]}</i>
                </b>
                <span className="pk-skr-band" aria-hidden />
                <small>{lines[b.id]}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ForkCall({ s, auto }: { s: LifeState; auto: boolean }) {
  return (
    <div className="pk-forkcall" data-h="forkcall" role="alert">
      <p className="pk-forkcall-eyebrow">◆ 分かれ道　入社{s.years}年後</p>
      <p className="lf-h pk-forkcall-title">ここで、道を選んでください</p>
      <p className="pk-forkcall-sub">
        {auto ? "自動で進めていても、ここで止まって待っています。" : ""}場面の絵の上のカードから選べます。道ごとの詳しい判定は下にあります。
      </p>
      <button type="button" className="pk-futbtn pk-forkcall-btn px-4 py-2 text-[13.5px]" onClick={() => document.querySelector('[data-h="branches"]')?.scrollIntoView({ behavior: "smooth", block: "start" })}>
        道ごとの詳しい判定を見る ▼
      </button>
    </div>
  );
}

/** 選んだ道と「残る」を並べる（90秒デモの締め） */
function StayCompare({ s }: { s: LifeState }) {
  const b = BRANCHES.find((x) => x.id === s.branch)!;
  const start = s.profile.age;
  const pre = journeyPre(s.job, s.years, s.forkIdx);
  const linesOf = (id: BranchId) => journeyRoad(s.job, id, s.years, start, (b) => destArt(s.job, b, start), pre).map((e) => `${start + e.yr}歳：${e.title}`);
  return (
    <div className="lf-card pk-staycmp p-5" data-h="staycmp">
      <p className="lf-h text-[17px]">{s.branch === "stay" ? "「移る」と並べてみる" : "「残る」と並べてみる"}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {([s.branch!, s.branch === "stay" ? "same" : "stay"] as BranchId[]).map((id, i) => (
          <div key={id} className={`pk-staycol ${i === 1 ? "is-stay" : "is-pick"}`}>
            <p className="text-[12px] font-bold">{i === 1 ? (id === "stay" ? "もし残っていたら" : "もし移っていたら") : "選んだ道"}</p>
            <p className="lf-h text-[16px]">{BRANCHES.find((x) => x.id === id)!.label}</p>
            <ul className="mt-1 grid gap-1 text-[13px] leading-6">
              {linesOf(id).map((l) => (
                <li key={l}>・{l}</li>
              ))}
            </ul>
            <p className="mt-1 text-[12px]">
              給料の筋書き：{PAY_MARK[BRANCH_PAY[id].trend]} {BRANCH_PAY[id].trend}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[14px] font-bold">未来を当てるのではなく、次に確かめることを見つける。</p>
      <button type="button" className="lf-btn mt-3 px-5 py-2.5 text-[14.5px]" onClick={() => s.go("take")}>
        持ち帰り画面へ（応募するかを決める材料）▶
      </button>
    </div>
  );
}

/** 見本の求人の「応募する」：押すと、応募先が無いことを出す */
function ApplyDemo() {
  const [msg, setMsg] = useState(false);
  return (
    <span className="grid gap-1.5 justify-items-start">
      <button type="button" className="lf-btn px-4 py-2 text-[13.5px]" onClick={() => setMsg(true)}>
        応募する ▶
      </button>
      {msg && <span className="pk-applymsg" role="status">見本の求人のため、応募先はありません。</span>}
    </span>
  );
}

/** 「不明」だった項目を、面接で聞く自然な質問にする */
function askOf(label: string): string {
  const m: [string[], string][] = [
    [["創業", "設立", "会社ができ"], "会社ができて、どれくらいになりますか？"],
    [["人数", "社員数", "従業員"], "同じ職場には、何人くらいいますか？"],
    [["年齢", "年代"], "職場には、どんな年代の人が多いですか？"],
    [["研修", "資格"], "入ってから受けられる研修や、資格の支えはありますか？"],
    [["海外"], "海外で働く道はありますか？"],
    [["残業"], "ふだんの残業は、月にどれくらいありますか？"],
    [["3年後", "続けて", "定着", "離職"], "同じ時期に入った人は、いまも続けていますか？"],
    [["休み", "休日"], "休みは、どのように決まりますか？"],
    [["給与", "給料", "昇給", "賞与"], "給料は、どんな時に上がりますか？"],
  ];
  return m.find(([ks]) => ks.some((k) => label.includes(k)))?.[1] ?? `${label}について、教えていただけますか？`;
}

/* ---------- 持ち帰り画面（システムのゴール）：応募するかを、自分で決められる材料 ---------- */
const ROAD_WORD = ["細い道", "ふつうの道", "太い道"];
function Takeaway({ c, s }: { c: Ctx; s: LifeState }) {
  const ai = AI_META[s.job.id];
  const ks = knowOf(s.job);
  const lvAt = (k: Know) => stageAt(k, s.forkIdx, s.forkIdx, null) + 1;
  /* 道の太さ：場面の「スキル → 進める道」と同じ決め方（分かれ道の時点のスキルで比べる。数字は出さない） */
  const rr = roadRank(s, Object.fromEntries(ks.map((k) => [k.id, Math.max(0, lvAt(k))])), new Set());
  const tierOf = (b: BranchId) => 2 - (rr.find((x) => x.b.id === b)?.tier ?? 2);
  const pts = ai?.points.good.length ? ai.points : POINTS[s.job.id] ?? { good: [], care: [] };
  const unknown = karteOf(s.job).items.filter((i) => !i.value);
  const base = CHECKS[s.job.id] ?? [];
  const extra = unknown
    .map((i) => askOf(i.label))
    .filter((q) => !base.some((b) => b === q || ["資格", "残業", "夜勤", "海外"].some((k) => q.includes(k) && b.includes(k))));
  const qs = [...base, ...extra].slice(0, 5);
  const [saved, setSaved] = useState<string | null>(null);
  const preT = journeyPre(s.job, s.years, s.forkIdx);
  const lvNow = Object.fromEntries(ks.map((k) => [k.id, Math.max(0, lvAt(k))]));
  const byLv = ks.slice().sort((a, z) => (lvNow[z.id] ?? 0) - (lvNow[a.id] ?? 0));
  const canTop = (byLv.filter((k) => (lvNow[k.id] ?? 0) >= 2).length ? byLv.filter((k) => (lvNow[k.id] ?? 0) >= 2) : byLv.filter((k) => (lvNow[k.id] ?? 0) >= 1)).slice(0, 3);
  const sceneOf = (id: string) => [...preT].reverse().find((x) => x.up.know === id);
  const textOf = () =>
    [
      `未来デバッグ　持ち帰りメモ`,
      `${s.job.company}「${s.job.title}」　${ai ? "（Claude が求人の本文から読み取ったシナリオ）" : "（見本の求人・架空）"}`,
      `これは試走したシナリオの一つで、未来を約束するものではありません。`,
      ``,
      `この会社で${s.years}年働くと、${canTop.slice(0, 2).map((k) => `「${nounOf(k.name)}」`).join("と")}ができるようになる（筋書き）`,
      ...canTop.map((k) => `・${canSay(k.name, lvNow[k.id] ?? 0)}`),
      ``,
      `■ この会社で身につく専門スキル（入社${s.years}年後）`,
      ...ks.map((k) => `・${k.name}　Lv.${lvAt(k)} ${LV_NAME[lvAt(k)]}${k.assumed ? "（仮定）" : ""}`),
      ``,
      `■ そのスキルで開ける道`,
      ...rr.map(({ b }) => `・${b.label}：${ROAD_WORD[tierOf(b.id)]}`),
      ``,
      `■ 合いそうな所`,
      ...pts.good.map((x) => `・${x}`),
      `■ 気をつけたい所`,
      ...pts.care.map((x) => `・${x}`),
      ``,
      `■ 面接で確かめる質問`,
      ...qs.map((x, i) => `${i + 1}. ${x}`),
    ].join("\n");
  const save = async () => {
    const t = textOf();
    try {
      const dl = await (window as unknown as { claude?: { use?: (n: string) => Promise<{ save: (r: { filename: string; data: string }) => Promise<unknown> } | null> } }).claude?.use?.("downloads");
      if (dl) {
        await dl.save({ filename: "mirai-debug-memo.txt", data: t });
        setSaved("保存しました。");
        return;
      }
    } catch (e) {
      if ((e as { code?: string })?.code === "declined") return setSaved("保存をやめました。");
    }
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([t], { type: "text/plain" }));
      a.download = "mirai-debug-memo.txt";
      a.click();
      setSaved("保存しました。");
    } catch {
      setSaved("この画面では保存できませんでした。印刷から保存してください。");
    }
  };
  return (
    <section className="grid gap-5" data-h="take">
      <PromiseNote />
      <div className="lf-card pk-take-head p-5 sm:p-6">
        <p className="pk-eyebrow text-[12px]">STEP 6　持ち帰る</p>
        <h1 className="lf-h mt-1 text-[24px] leading-tight sm:text-[30px]">応募するかを、自分で決めるための材料</h1>
        <p className="mt-2 text-[14px] leading-7">
          {s.job.company}「{s.job.title}」　{ai && <span className="pk-aibadge is-ai">Claude が求人の本文から書きました</span>}
        </p>
      </div>

      <div className="lf-card pk-can p-5 sm:p-6" data-h="take-can">
        <p className="pk-can-head">
          この会社で{s.years}年働くと、あなたは<b>{canTop.slice(0, 2).map((k) => `「${nounOf(k.name)}」`).join("と")}</b>ができるようになる
        </p>
        <ul className="pk-can-cards">
          {canTop.map((k) => {
            const sc = sceneOf(k.id);
            return (
              <li key={k.id} className="pk-can-card">
                <span className="pk-can-pic" style={{ backgroundImage: sc ? `url(${art(c.style, (sc.bg ?? PLACE_ART[sc.place]) as PackKey)})` : undefined }}>
                  <img src={art(c.style, meArt(c.look, "元気"))} alt="" />
                </span>
                <b>{canSay(k.name, lvNow[k.id] ?? 0)}</b>
                <small>{k.what}</small>
                {sc && <em>身についた場面：{sc.when}「{sc.title}」</em>}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lf-card p-5 sm:p-6" data-h="take-years">
        <p className="lf-h text-[17px]">1年・3年・5年で比べると</p>
        <ul className="pk-yrs">
          {([1, 3, 5] as Years[]).map((y) => {
            const lvY = lvByYears(s.job, y);
            const mx = Math.max(0, ...Object.values(lvY));
            const pos = y === 1 || mx <= 2 ? "見習い" : mx === 3 ? "任される" : "教えられる";
            const topK = ks.slice().sort((a, z) => (lvY[z.id] ?? 0) - (lvY[a.id] ?? 0))[0];
            const pics = pos === "見習い" ? [meArt(c.look, "普通"), "senpai"] : pos === "任される" ? [meArt(c.look, "元気")] : [meArt(c.look, "元気"), "peer"];
            const cur = y === s.years;
            return (
              <li key={y} className={`pk-yr-card${cur ? " is-cur" : ""}`}>
                <p className="pk-yr-top">
                  <b>{y}年</b>
                  {cur && <em>いま見た年数</em>}
                </p>
                <span className="pk-yr-pic">
                  {pics.map((k, j) => (
                    <img key={k} src={art(c.style, k as PackKey)} alt="" className={j === 1 ? "is-flip" : undefined} />
                  ))}
                </span>
                <p className="pk-yr-pos">{pos}</p>
                <p className="pk-yr-line">{topK ? canSay(topK.name, lvY[topK.id] ?? 0) : ""}</p>
                {!cur && (
                  <button
                    type="button"
                    className="pk-futbtn px-3 py-1.5 text-[12.5px]"
                    onClick={() => {
                      s.setYears(y);
                      s.go("life");
                    }}
                  >
                    {y}年で見る ▶
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="lf-card p-5" data-h="take-skills">
          <details className="pk-take-lvwrap">
          <summary className="lf-h text-[17px]">① 専門スキルの Lv をくわしく見る<small className="pk-open-hint">開く</small></summary>
          <p className="mt-0.5 text-[12px] text-[var(--lf-sub)]">入社{s.years}年後の筋書き。Lv.1 知った → 2 できる → 3 任される → 4 教えられる</p>
          <ul className="mt-3 grid gap-2.5">
            {ks.map((k) => {
              const n = lvAt(k);
              return (
                <li key={k.id} className="pk-take-skill">
                  <span className="pk-take-lv">
                    {[1, 2, 3, 4].map((i) => (
                      <i key={i} className={i <= n ? "is-on" : ""} />
                    ))}
                  </span>
                  <span className="grid gap-0.5">
                    <b className="text-[14px]">
                      {k.name}　<small>Lv.{n} {LV_NAME[n]}</small>
                      {k.id === "ai" && <em className="pk-take-tag">AIスキル</em>}
                      {k.assumed && <em className="pk-take-tag is-assumed">仮定</em>}
                    </b>
                    <span className="text-[12.5px] leading-5 text-[var(--lf-sub)]">{k.src?.quote ? `求人の本文：「${k.src.quote}」` : k.what || k.where}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          </details>
        </div>

        <div className="lf-card p-5" data-h="take-roads">
          <p className="lf-h text-[17px]">② そのスキルで開ける道</p>
          <p className="mt-0.5 text-[12px] text-[var(--lf-sub)]">活きるスキルが多い道ほど太く描いています</p>
          <ul className="mt-3 grid gap-2">
            {rr.map(({ b }) => {
              const k = tierOf(b.id);
              const good = ks.filter((x) => x.fits[b.id].fit === "活きる").map((x) => x.name);
              return (
                <li key={b.id} className={`pk-take-road rw-${k}`}>
                  <span className="pk-take-roadline" aria-hidden />
                  <span className="grid">
                    <b className="text-[14px]">
                      {b.label}　<small>{ROAD_WORD[k]}</small>
                    </b>
                    <span className="text-[12px] text-[var(--lf-sub)]">{good.length ? `活きる：${good.join("・")}` : "活きるスキルはまだ少ない"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lf-card p-5" data-h="take-points">
          <p className="lf-h text-[17px]">③ 自分に合いそうな所・気をつけたい所</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="pk-take-pt is-good">
              <p className="font-bold">合いそうな所</p>
              <ul>
                {pts.good.map((x) => (
                  <li key={x}>・{x}</li>
                ))}
              </ul>
            </div>
            <div className="pk-take-pt is-care">
              <p className="font-bold">気をつけたい所</p>
              <ul>
                {pts.care.map((x) => (
                  <li key={x}>・{x}</li>
                ))}
              </ul>
            </div>
          </div>
          {s.profile.prefs.length > 0 && (
            <div className="mt-3 text-[13px] leading-6">
              <p className="font-bold">あなたが入れた条件と比べると</p>
              <ul>
                {s.profile.prefs.map((p) => {
                  const hit = [...s.job.tags, ...s.job.body, ai?.text ?? ""].some((t) => t.includes(p.endsWith("あり") ? p.slice(0, -2) : p.endsWith("の支援") ? p.slice(0, -3) : p));
                  return (
                    <li key={p}>
                      {hit ? "○" : "？"} {p}：{hit ? "求人の本文に書いてある" : "求人の本文からは分からない（面接で確かめる）"}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="lf-card p-5" data-h="take-questions">
          <p className="lf-h text-[17px]">④ 面接で確かめるといい質問</p>
          <p className="mt-0.5 text-[12px] text-[var(--lf-sub)]">筋書きで気になった所と、求人に書いていない（不明の）所を、質問の形にしました</p>
          <ol className="pk-take-qs mt-3 grid gap-2">
            {qs.map((x, i) => (
              <li key={x}>
                <b>Q{i + 1}</b>
                {x}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="lf-card pk-take-next p-5" data-h="take-next">
        <p className="lf-h text-[17px]">⑤ 次の一歩</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="pk-take-step">
            <b>応募する</b>
            <span>質問を持って、応募や職場見学に進む。</span>
            {jobByUrl(s.job.url) ? (
              <ApplyDemo />
            ) : (
              <a className="lf-btn px-4 py-2 text-[13.5px]" href={s.job.url} target="_blank" rel="noreferrer">
                求人ページを開く ↗
              </a>
            )}
          </div>
          <div className="pk-take-step">
            <b>他の求人と比べる</b>
            <span>別の求人でも試走して、育つスキルと道の太さを比べる。</span>
            <button type="button" className="pk-futbtn px-4 py-2 text-[13.5px]" onClick={() => s.go("jobs")}>
              別の求人を読む ▶
            </button>
          </div>
          <div className="pk-take-step">
            <b>1年・5年でも見てみる</b>
            <span>分かれ道の時点を変えると、開ける道が変わる。</span>
            <span className="flex flex-wrap gap-2">
              {([1, 3, 5] as Years[])
                .filter((y) => y !== s.years)
                .map((y) => (
                  <button
                    key={y}
                    type="button"
                    className="pk-futbtn px-4 py-2 text-[13.5px]"
                    onClick={() => {
                      s.setYears(y);
                      s.go("life");
                    }}
                  >
                    {y}年で見る ▶
                  </button>
                ))}
            </span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[color-mix(in_srgb,var(--lf-ink)_12%,transparent)] pt-4">
          <button type="button" className="lf-btn px-5 py-2.5 text-[14px]" onClick={save}>
            面接に持っていくメモとして保存（質問・スキル・道）
          </button>
          <button type="button" className="pk-futbtn px-4 py-2.5 text-[13.5px]" onClick={() => window.print()}>
            印刷する
          </button>
          {saved && <span className="text-[13px] font-bold">{saved}</span>}
        </div>
      </div>
      <p className="text-[13px] leading-6 text-[var(--lf-sub)]">未来を当てるのではなく、次に確かめることを見つける。決めるのは、あなたです。</p>
    </section>
  );
}

/* ---------- Claude が作った、選んだ道の場面 ---------- */
function AiRoad({ s }: { s: LifeState }) {
  const m = AI_META[s.job.id];
  if (!m || !s.branch || !m.roads[s.branch]) return null;
  return (
    <div className="lf-card pk-airoad p-5" data-h="airoad">
      <p className="pk-aibadge is-ai">Claude がこの道の場面を作りました</p>
      <p className="lf-h mt-2 text-[17px]">「{BRANCHES.find((b) => b.id === s.branch)!.label}」の道で</p>
      <p className="mt-1 text-[15px] leading-8">{m.roads[s.branch]}</p>
    </div>
  );
}

/* 3年後から先：利用者が選んだところまで */
function LaterLife({ c, s, horizon, setHorizon, onYearOne, speed, setSpeed }: { c: Ctx; s: LifeState; horizon: number; setHorizon: (y: number) => void; onYearOne: (e?: number) => void; speed: Speed; setSpeed: (v: Speed) => void }) {
  const ch = s.chapter;
  const simple = !!s.branch && !s.detail;
  const age = ageAt(ch, s.profile.age);
  const nextCh = s.chapters[s.idx + 1];
  const nextHidden = !!nextCh && s.idx >= s.forkIdx && yearsOf(nextCh) > horizon;
  const more = HORIZONS.filter((h) => h.y > horizon);
  const eps = episodesOf(s.job);
  const [showGrowth, setShowGrowth] = useState(false);
  const [life, setLife] = useState<LifeChoice>({});
  const [partner, setPartner] = useState<"m" | "f">(c.look === "m" ? "f" : "m");
  const lifeNow = lifePending(s, life);
  const pt = payTrendOf(s.prev, ch);
  const payNow = s.idx > s.forkIdx || s.atFork ? (s.branch && !s.detail ? BRANCH_PAY[s.branch] : pt) : null;
  const gains = gainsAt(s.job, s.idx, s.forkIdx, s.branch);
  const lvNow = Object.fromEntries(knowOf(s.job).map((k) => [k.id, stageAt(k, s.idx, s.forkIdx, s.branch) + 1]));
  const choosing = s.atFork && !s.branch;
  const canAuto = speed !== "manual" && !s.atFork && !s.atEnd && !nextHidden && !!nextCh && !lifeNow;
  /* 分かれ道に着いたら、道を選ぶ所までスクロールする（自動で進めていても、ここで止まって待つ） */
  useEffect(() => {
    if (!choosing) return;
    const t = window.setTimeout(() => document.querySelector('[data-h="scene"]')?.scrollIntoView({ behavior: "smooth", block: "center" }), 600);
    return () => clearTimeout(t);
  }, [choosing, s.idx]);
  return (
    <section className="grid gap-3">
      <div className="pk-topbar" data-h="topbar">
        <h1 className="pk-topbar-title">
          <small>STEP 4</small>
          {s.job.company}で働く、{horizon >= 99 ? `${END_AGE}歳まで` : `${horizon}年後まで`}
          {eps.length > 0 && (
            <button type="button" className="pk-link ml-2 text-[12.5px]" onClick={() => onYearOne(eps.length - 1)}>
              最初の1年に戻る
            </button>
          )}
        </h1>
        <YearsSwitch s={s} thin />
      </div>
      {c.fam === "g" ? <LifeLine c={c} s={s} horizon={horizon} onYearOne={onYearOne} life={life} /> : <RoadMap c={c} s={s} horizon={horizon} onYearOne={onYearOne} />}
      <div className={`pk-stagebox ${choosing ? "is-fork" : ""}`}>
        <Stage key={`${s.idx}-${s.branch ?? ""}-${c.look}`} c={c} s={s} ch={ch} prev={s.prev} />
        {choosing && (
          <span className="pk-forkflag" aria-hidden>
            ◆ 分かれ道　ここで道を選んでください
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
        <PromiseNote />
        <SpeedSwitch speed={speed} setSpeed={setSpeed} />
      </div>
      {canAuto && <AutoNext key={`auto-${s.idx}-${s.branch ?? ""}`} label={`次の場面へ：${chapterLabel(nextCh!, s.profile.age)}`} ms={CH_MS[speed as Exclude<Speed, "manual">]} onGo={s.next} onStop={() => setSpeed("manual")} />}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-4">
          {choosing && <ForkCall s={s} auto={speed !== "manual"} />}
          {s.atFork && <ForkDeal c={c} s={s} />}
          {gains.length > 0 && <SkillRoads c={c} s={s} gained={gains.map((g) => ({ k: g.k, from: g.from + 1, to: g.to + 1 }))} lv={lvNow} title={`この場面で手に入れたスキル（${chapterLabel(ch, s.profile.age)}）`} />}
          <ChapterStory s={s} ch={ch} />
          <AiRoad s={s} />
          {s.branch && s.branch !== "stay" && <StayCompare s={s} />}
          <div className="lf-card pk-log p-5">
            <p className="pk-eyebrow text-[12px]">
              {age}歳　{ch.label ? `${ch.label}　` : ""}
              {PLACE_LABEL[ch.place]}
            </p>
            <ul className="mt-2 grid gap-1.5">
              {ch.events.map((e) => (
                <li key={e} className="lf-h text-[17px] leading-8">
                  {e}
                </li>
              ))}
            </ul>
            {ch.lifeEvent && <p className="pk-lifeev mt-2 text-[14px]">人生のできごと：{ch.lifeEvent}</p>}
            {payNow && (
              <p className="pk-payline mt-2" data-h="pay">
                給料の筋書き：
                <b className={`pay-${payNow.trend}`}>
                  {PAY_MARK[payNow.trend]} {payNow.trend}
                </b>
                （{payNow.why}）<small>金額は断定しません。入社時は {s.job.pay}（求人原稿）</small>
              </p>
            )}
            <details className="mt-3 text-[13px] leading-6">
              <summary className="cursor-pointer text-[var(--lf-sub)]">この場面の会話を読む（{ch.talks.length}）</summary>
              <ul className="mt-1 grid gap-0.5">
                {ch.talks.map((t, i) => (
                  <li key={i}>
                    <b>{nm(s.job, t.who)}</b>：{t.text}
                  </li>
                ))}
              </ul>
            </details>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!s.atFork && !s.atEnd && !nextHidden && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={s.next}>
                  次の場面へ ▶
                </button>
              )}
              {s.atEnd && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={() => s.go("take")}>
                  持ち帰る（応募するかを決める材料）▶
                </button>
              )}
              {s.branch && !s.atEnd && (
                <button type="button" className="pk-futbtn px-4 py-2.5 text-[13.5px]" onClick={() => s.go("take")}>
                  ここで持ち帰る ▶
                </button>
              )}
              {s.branch && (
                <button type="button" className="lf-rewind px-4 py-2 text-[13px]" onClick={s.rewind}>
                  ↺ 分かれ道に戻って選び直す
                </button>
              )}
              <button type="button" className="pk-futbtn px-4 py-2.5 text-[13.5px]" onClick={() => setShowGrowth((v) => !v)} aria-expanded={showGrowth !== (s.atEnd || nextHidden)}>
                {showGrowth !== (s.atEnd || nextHidden) ? "成長のまとめを閉じる" : "ここまでの成長を見る"}
              </button>
            </div>
            {nextHidden && (
              <div className="pk-future is-open mt-4" data-h="future">
                <p className="text-[14px] font-bold">ここまでが、選んだ範囲（{horizon}年後まで）です。この先も見ますか？</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {more.map((h, i) => (
                    <button key={h.y} type="button" className={i === 0 ? "lf-btn px-5 py-2.5 text-[14px]" : "pk-futbtn px-4 py-2.5 text-[13.5px]"} onClick={() => setHorizon(h.y)}>
                      {h.label}見る ▶
                    </button>
                  ))}
                  <button type="button" className="pk-futbtn px-4 py-2.5 text-[13.5px]" onClick={() => s.go("take")}>
                    ここで持ち帰る ▶
                  </button>
                </div>
              </div>
            )}
          </div>
          {simple && (
            <>
              <SimpleBranchView s={s} />
              <CarryList s={s} b={s.branch!} />
            </>
          )}
          {s.idx >= s.forkIdx && <LifeEvents c={c} s={s} life={life} setLife={setLife} partner={partner} setPartner={setPartner} />}
          {(showGrowth !== (s.atEnd || nextHidden)) && <GrowthCard c={c} s={s} mode={{ kind: "ch" }} onReplay={(e) => onYearOne(e)} />}
        </div>
        <aside className="grid content-start gap-4">
          <FeelBox c={c} s={s} feels={feelsOfChapter(s, ch)} />
          <details className="pk-bookwrap">
            <summary className="lf-h text-[15px]">専門知識の手帳を開く</summary>
            <KnowBook c={c} s={s} />
          </details>
        </aside>
      </div>
    </section>
  );
}

/** 3年後から先でも、スキルが上がった場面は「仕事 → 壁 → 学び → スキルアップ → その後」の順で理由を並べる */
function ChapterStory({ s, ch }: { s: LifeState; ch: Chapter }) {
  const gains = gainsAt(s.job, s.idx, s.forkIdx, s.branch);
  if (!gains.length) return null;
  const teacher = ch.talks.find((t) => ["boss", "senpai", "peer", "local", "student"].includes(t.who) && !(ch.vibes ?? []).some((v) => v.talk.text === t.text));
  const selfLearn = ch.events.find((e) => ["資格", "勉強", "手順書", "学び", "覚え"].some((w) => e.includes(w)));
  const wall = ch.cutin?.kind === "ピンチ" ? ch.cutin.line : ch.events.find((e) => ["迷う", "ずれ", "ない", "痛め", "まちが"].some((w) => e.includes(w)));
  const rows = [
    ch.events[0],
    wall ?? "大きな壁はない。いつもの仕事を続ける中で、少しずつ任される",
    selfLearn && !teacher ? `自分で：${selfLearn}` : teacher ? `${nm(s.job, teacher.who)}さんから：「${teacher.text}」` : ch.cutin ? `「${ch.cutin.line}」` : "自分で工夫して身につける",
    gains.map((g) => `${g.k.name}　Lv.${g.from + 1} → Lv.${g.to + 1}（${LV_NAME[g.to + 1]}）`).join("／"),
    s.branch ? gains.map((g) => `${g.k.name}は、この道で${g.k.fits[s.branch!].fit}（${g.k.fits[s.branch!].why}）`).join("／") : "分かれ道で、この知識がどの道で活きるかが分かれる",
  ];
  return (
    <div className="lf-card pk-story p-4 sm:p-5" data-h="episode">
      <p className="lf-h text-[15px]">この場面でスキルが上がった理由</p>
      <ol className="mt-2 grid gap-1.5">
        {rows.map((r, i) => (
          <li key={i} className={`pk-storyrow ${i === 3 ? "is-up" : ""}`}>
            <span className="pk-storyno">{"①②③④⑤"[i]}</span>
            <span>
              <b>{BEATS[i]}</b>
              <span className="pk-storytxt">{r}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* 専門知識の手帳（G）／持っていく知識（H） */
function KnowBook({ c, s, lv, justUp, upTo = 0, upBeat = 0, eps: epsIn }: { c: Ctx; s: LifeState; lv?: Record<string, number>; justUp?: string | null; upTo?: number; upBeat?: number; eps?: Episode[] }) {
  const ep = !!lv;
  const gains = ep ? [] : gainsAt(s.job, s.idx, s.forkIdx, s.branch);
  const shines = ep ? [] : shinesAt(s.job, s.idx, s.forkIdx, s.branch);
  const eps = epsIn ?? episodesOf(s.job);
  return (
    <div className="lf-card pk-book p-4" data-h="book">
      <p className="lf-h text-[15px]">{COPY[c.fam].book}</p>
      <ul className="mt-3 grid gap-3">
        {knowOf(s.job).map((k) => {
          const st = lv ? (lv[k.id] ?? 0) - 1 : stageAt(k, s.idx, s.forkIdx, s.branch);
          const g = lv ? (justUp === k.id ? { from: (lv[k.id] ?? 1) - 2 } : undefined) : gains.find((x) => x.k.id === k.id);
          const hist = lv ? eps.filter((e, i) => e.up.know === k.id && (i < upTo || (i === upTo && upBeat >= 3))) : [];
          const sh = shines.some((x) => x.id === k.id);
          const fit = s.branch ? k.fits[s.branch] : null;
          return (
            <li key={k.id} className={`pk-kcard ${st < 0 ? "is-not" : ""} ${g ? "is-new" : ""} ${sh ? "is-shine" : ""}`}>
              <p className="flex items-center justify-between gap-2">
                <b className="text-[14px]">{k.name}</b>
                {g && <span className="pk-badge">{g.from < 0 ? "NEW" : "UP"}</span>}
                {sh && <span className="pk-badge is-shine">活きた</span>}
              </p>
              <ol className="pk-ladder" aria-label={`${k.name}：Lv.${st + 1}（${LV_NAME[st + 1]}）`}>
                {STAGES.map((n, i) => (
                  <li key={n} className={i <= st ? "on" : ""}>
                    <small>Lv.{i + 1}</small>
                    {n}
                  </li>
                ))}
              </ol>
              {lv ? (
                hist.length ? (
                  <ul className="pk-khist">
                    {hist.map((e) => (
                      <li key={e.id}>
                        {e.when}「{e.title}」で Lv.{e.up.from}→{e.up.to}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11.5px] text-[var(--lf-sub)]">まだ。{k.where}</p>
                )
              ) : st < 0 ? (
                <p className="text-[11.5px] text-[var(--lf-sub)]">まだ。{k.where}</p>
              ) : (
                <p className="text-[11.5px] text-[var(--lf-sub)]">{k.where}</p>
              )}
              {fit && <p className={`pk-fitline fit-${fit.fit}`}>この道では：{fit.fit}（{fit.why}）</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] leading-5 text-[var(--lf-sub)]">Lv は段の名前です（点数ではありません）。</p>
    </div>
  );
}

/* 見せ場：分かれ道で、身につけた知識を6本の道に配る */
function ForkDeal({ c, s }: { c: Ctx; s: LifeState }) {
  const ks = knowOf(s.job).filter((k) => stageAt(k, s.forkIdx, s.forkIdx, null) >= 0);
  return (
    <div className={`pk-deal ${s.branch ? "" : "is-choose"}`} data-h="branches">
      <div className="pk-deal-head">
        <img src={art(c.style, "cut-fork")} alt="" />
        <div>
          <p className="pk-eyebrow text-[12px]">分かれ道　{ageAt(s.chapter, s.profile.age)}歳</p>
          <p className="lf-h text-[20px] sm:text-[24px]">いま持っている専門知識は、どの道で活きる？</p>
          <p className="mt-1 text-[12.5px]">◎活きる　△少し活きる　−活きない</p>
        </div>
      </div>
      <div className="pk-roads">
        {BRANCHES.map((b, i) => {
          const d = s.job.detailed?.[b.id];
          const seen = s.saves.includes(b.id);
          return (
            <button key={b.id} type="button" className="pk-road" style={{ animationDelay: `${0.15 + i * 0.12}s` }} onClick={() => s.choose(b.id)}>
              <span className="pk-road-pic">
                <img src={art(c.style, destArt(s.job, b.id, s.profile.age))} alt="" />
                <span className="pk-road-name lf-h">{b.label}</span>
              </span>
              <ul className="pk-road-ks">
                {ks.map((k, j) => {
                  const f = k.fits[b.id];
                  return (
                    <li key={k.id} className={`fit-${f.fit}`} style={{ animationDelay: `${0.6 + i * 0.12 + j * 0.1}s` }}>
                      <span className="pk-mark">{FIT_MARK[f.fit]}</span>
                      <span>
                        <b>{k.name}</b>
                        <small>{f.why}</small>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <span className={`pk-road-pay pay-${BRANCH_PAY[b.id].trend}`}>
                給料：{PAY_MARK[BRANCH_PAY[b.id].trend]} {BRANCH_PAY[b.id].trend}
                <small>{BRANCH_PAY[b.id].why}</small>
              </span>
              <span className="pk-road-foot">
                {d ? "場面つき（作り込み）" : "簡易表示"}
                {seen && "・見た道"}
                <b>{s.branch === b.id ? "いま見ている道" : "この道を選ぶ ▶"}</b>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 簡易表示の道で、持っていった知識 */
function CarryList({ s, b }: { s: LifeState; b: BranchId }) {
  const ks = knowOf(s.job).filter((k) => stageAt(k, s.forkIdx, s.forkIdx, null) >= 0);
  return (
    <div className="lf-card p-5">
      <p className="lf-h text-[16px]">この道に持っていった専門知識</p>
      <ul className="mt-2 grid gap-1.5 text-[13.5px]">
        {ks.map((k) => (
          <li key={k.id} className={`pk-fitline fit-${k.fits[b].fit}`}>
            {FIT_MARK[k.fits[b].fit]} {k.name}：{k.fits[b].fit}（{k.fits[b].why}）
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 人生を並べる：知識 × 道 の表 */
function FitTable({ s }: { s: LifeState }) {
  const ks = knowOf(s.job);
  return (
    <div className="lf-card overflow-x-auto p-5" data-h="saves">
      <p className="lf-h text-[17px]">専門知識は、どの道で活きたか</p>
      <table className="pk-fittable mt-3 text-[13px]">
        <thead>
          <tr>
            <th />
            {BRANCHES.map((b) => (
              <th key={b.id} className={s.saves.includes(b.id) ? "is-seen" : ""}>
                {b.short}
                {s.saves.includes(b.id) && <small>見た道</small>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ks.map((k) => (
            <tr key={k.id}>
              <th>{k.name}</th>
              {BRANCHES.map((b) => {
                const f = k.fits[b.id];
                return (
                  <td key={b.id} className={`fit-${f.fit}`} title={f.why}>
                    <span className="pk-mark">{FIT_MARK[f.fit]}</span>
                    <small>{f.why}</small>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- G：上の年表（今の年齢 → 75歳） ---------- */
function LifeLine({ c, s, horizon = 99, onYearOne, life }: { c: Ctx; s: LifeState; horizon?: number; onYearOne?: (e?: number) => void; life?: LifeChoice }) {
  const start = s.profile.age;
  const simple = !!s.branch && !s.detail;
  const endAge = horizon >= 99 || simple ? END_AGE : Math.min(END_AGE, start + horizon);
  const span = Math.max(1, endAge - start);
  const cur = ageAt(s.chapter, start);
  const pct = Math.min(100, Math.max(0, ((cur - start) / span) * 100));
  const step = span <= 4 ? 1 : span <= 12 ? 2 : 10;
  const ticks: number[] = [];
  for (let a = step === 10 ? Math.ceil((start + 1) / 10) * 10 : start + step; a < endAge; a += step) ticks.push(a);
  const ghost: { label: string; sub: string }[] = [];
  const eps = episodesOf(s.job);
  const shown = s.chapters.map((ch, i) => ({ ch, i })).filter(({ ch, i }) => (!onYearOne || i >= s.forkIdx) && (i <= s.forkIdx || yearsOf(ch) <= horizon));
  const hidden = s.chapters.find((ch, i) => i > s.forkIdx && yearsOf(ch) > horizon);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const ol = list.current;
    const el = ol?.querySelector<HTMLElement>('[aria-current="true"]');
    if (ol && el) ol.scrollTo({ left: el.offsetLeft - ol.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [s.idx, s.branch]);
  /* 人生の出来事のマス（すごろくのマス）：年表の年齢の順に、仕事の場面の間へ入れる */
  const squares = life ? LIFE_STEPS.filter((st) => horizon >= 99 || st.when <= Math.max(horizon, s.years) + 3) : [];
  const lifeSq = (st: (typeof LIFE_STEPS)[number]) => (
    <li key={`sq-${st.key}`}>
      <a href="#lifeev" className={`pk-node is-life ${life?.[st.key] ? "is-set" : ""}`} onClick={(e) => (e.preventDefault(), document.getElementById("lifeev")?.scrollIntoView({ behavior: "smooth", block: "center" }))}>
        <span className="pk-node-pic">
          <img src={art(c.style, st.key === "family" ? "ev-family" : st.key === "marry" ? "ev-home" : "ev-family")} alt="" loading="lazy" />
          <span className="pk-node-sq" aria-hidden>
            ■
          </span>
        </span>
        <span className="pk-node-age">
          {st.label}・{start + st.when}歳
        </span>
        <span className="pk-node-sub">{life?.[st.key] ?? "出来事のマス（選べる）"}</span>
      </a>
    </li>
  );
  if (!s.branch) ghost.push({ label: "分かれ道の先", sub: "6つの道" }, { label: `${END_AGE}歳`, sub: "ゴール" });
  else if (!s.detail) ghost.push({ label: BRANCHES.find((b) => b.id === s.branch)!.short, sub: "簡易表示" }, { label: `${END_AGE}歳`, sub: "ゴール" });
  else if (hidden) ghost.push({ label: hidden.at === "end" ? `${END_AGE}歳` : `${hidden.at}年後〜`, sub: "「先を見る」で開く" });
  return (
    <div className="pk-life" data-h="lifeline">
      <div className="pk-ruler" aria-hidden>
        <span className="pk-ruler-fill" style={{ width: `${pct}%` }} />
        {ticks.map((a) => (
          <span key={a} className="pk-tick" style={{ left: `${((a - start) / span) * 100}%` }}>
            {a}
          </span>
        ))}
        {squares.map((st) => (
          <span key={st.key} className={`pk-ruler-sq ${life?.[st.key] ? "is-set" : ""}`} style={{ left: `${Math.min(100, (st.when / span) * 100)}%` }} title={st.label}>
            ■
          </span>
        ))}
        <span className="pk-ruler-end is-start">{start}歳</span>
        <span className="pk-ruler-end is-end">{endAge}歳</span>
        <span className="pk-ruler-me" style={{ left: `${pct}%` }}>
          <img src={art(c.style, meArt(c.look, s.chapter.mood))} alt="" />
          <b>{cur}歳</b>
        </span>
      </div>
      <ol ref={list} className="pk-nodes" data-h="debug" aria-label="場面の年表。過去の場面を押すと戻れます">
        {onYearOne && eps.length > 0 && (
          <li>
            <button type="button" onClick={() => onYearOne(eps.length - 1)} className="pk-node is-yearone">
              <span className="pk-node-pic">
                <img src={art(c.style, PLACE_ART[s.job.place])} alt="" loading="lazy" />
              </span>
              <span className="pk-node-age">最初の1年</span>
              <span className="pk-node-sub">場面{eps.length}つ（見た）</span>
            </button>
          </li>
        )}
        {shown.map(({ ch, i }, n) => {
          const key: PackKey = ch.lifeEvent ? eventArt(ch.lifeEvent) : PLACE_ART[ch.place];
          const g = gainsAt(s.job, i, s.forkIdx, s.branch);
          const py = n === 0 ? -1 : yearsOf(shown[n - 1].ch);
          const sq = squares.filter((st) => st.when >= py && st.when < yearsOf(ch));
          return [
            ...sq.map(lifeSq),
            <li key={i}>
              <button type="button" disabled={i > s.idx} aria-current={i === s.idx} onClick={() => s.jump(i)} className={`pk-node ${ch.fork ? "is-fork" : ""} ${ch.down ? "is-down" : ""}`}>
                <span className="pk-node-pic">
                  <img src={art(c.style, key)} alt="" loading="lazy" />
                  {(ch.vibes?.length ?? 0) > 0 && <span className="pk-node-rev" title="口コミ・会社情報が入った場面">口</span>}
                </span>
                <span className="pk-node-age">{chapterLabel(ch, start)}</span>
                <span className="pk-node-sub">{ch.fork ? "◆分かれ道" : g.length ? `＋${g[0].k.name}` : ch.lifeEvent ? ch.lifeEvent.split("（")[0] : PLACE_LABEL[ch.place]}</span>
              </button>
            </li>,
          ];
        })}
        {squares.filter((st) => !shown.length || st.when >= yearsOf(shown[shown.length - 1].ch)).map(lifeSq)}
        {ghost.map((g) => (
          <li key={g.label}>
            <span className="pk-node is-ghost">
              <span className="pk-node-pic">?</span>
              <span className="pk-node-age">{g.label}</span>
              <span className="pk-node-sub">{g.sub}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- H：道の地図（年表を兼ねる） ---------- */
const TRUNK_X = [7, 16, 25, 34];
const FORK = { x: 40, y: 50 };
const ROAD_Y = [10, 26, 42, 58, 74, 90];
const DEST_X = 84;

function RoadMap({ c, s, compare, horizon = 99, onYearOne }: { c: Ctx; s: LifeState; compare?: boolean; horizon?: number; onYearOne?: (e?: number) => void }) {
  const eps = episodesOf(s.job);
  const ks = knowOf(s.job).filter((k) => stageAt(k, s.forkIdx, s.forkIdx, null) >= 0);
  const start = s.profile.age;
  const roadPath = (y: number) => `M${FORK.x} ${FORK.y} C ${FORK.x + 9} ${FORK.y}, ${FORK.x + 6} ${y}, ${FORK.x + 15} ${y} L ${DEST_X} ${y}`;
  const chosen = s.branch;
  const detailN = s.detail?.chapters.length ?? 0;
  const stopX = (j: number) => FORK.x + 18 + (j * (DEST_X - FORK.x - 22)) / Math.max(1, detailN - 1);
  const pos = (i: number) => {
    if (i <= s.forkIdx) return { x: TRUNK_X[i] ?? FORK.x, y: FORK.y };
    const bi = BRANCHES.findIndex((b) => b.id === chosen);
    return { x: stopX(i - s.forkIdx - 1), y: ROAD_Y[bi] };
  };
  const me = compare ? null : pos(s.idx);
  const wrap = useRef<HTMLDivElement>(null);
  const meX = me?.x ?? 0;
  useEffect(() => {
    const w = wrap.current;
    if (!w || w.scrollWidth <= w.clientWidth) return;
    w.scrollTo({ left: s.atFork ? w.scrollWidth : Math.max(0, (meX / 100) * w.scrollWidth - w.clientWidth * 0.5), behavior: "smooth" });
  }, [meX, s.atFork]);
  return (
    <div ref={wrap} className="pk-mapwrap" data-h="lifeline">
      <div className={`pk-map ${s.atFork && !compare ? "is-fork" : ""}`}>
        {PACKS[c.style].town && <img src={art(c.style, "town")} alt="" className="pk-map-bg" />}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pk-map-svg" aria-hidden>
          <path d={`M${TRUNK_X[0]} ${FORK.y} L ${FORK.x} ${FORK.y}`} className="pk-r is-trunk" />
          {BRANCHES.map((b, i) => (
            <path key={b.id} d={roadPath(ROAD_Y[i])} className={`pk-r ${chosen === b.id ? "is-chosen" : chosen && !compare ? "is-dim" : ""} ${s.saves.includes(b.id) ? "is-seen" : ""}`} style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </svg>
        <p className="pk-map-legend">
          {start}歳 → {END_AGE}歳　持っていく知識：
          {ks.map((k, i) => (
            <span key={k.id}>
              {"①②③④⑤"[i]}
              {k.name}
            </span>
          ))}
        </p>
        <span className="pk-map-age" style={{ left: `${TRUNK_X[0]}%`, top: `${FORK.y + 12}%` }}>
          {start}歳
        </span>
        {s.job.trunk.map((ch, i) => (
          <button
            key={i}
            type="button"
            disabled={compare || (i > s.idx && !(onYearOne && i < s.forkIdx))}
            aria-current={!compare && i === s.idx}
            onClick={() => (onYearOne && i < s.forkIdx ? onYearOne(i === 0 ? 0 : i === 1 ? 1 : eps.length - 1) : s.jump(i))}
            title={onYearOne && i < s.forkIdx ? "最初の1年の場面に戻る" : undefined}
            className={`pk-stop ${ch.fork ? "is-fork" : ""}`}
            style={{ left: `${TRUNK_X[i]}%`, top: `${FORK.y}%` }}
          >
            <span className="pk-stop-pic">
              <img src={art(c.style, PLACE_ART[ch.place])} alt="" />
            </span>
            {(s.chapters[i]?.vibes?.length ?? 0) > 0 && <span className="pk-node-rev">口</span>}
            <span className="pk-stop-label">{chapterLabel(ch, start)}</span>
          </button>
        ))}
        {s.detail &&
          !compare &&
          s.detail.chapters.map((ch, j) => {
            const i = s.forkIdx + 1 + j;
            const p = pos(i);
            if (yearsOf(ch) > horizon) return null;
            return (
              <button key={j} type="button" disabled={i > s.idx} aria-current={i === s.idx} onClick={() => s.jump(i)} className="pk-stop is-small" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <span className="pk-stop-pic">
                  <img src={art(c.style, ch.lifeEvent ? eventArt(ch.lifeEvent) : PLACE_ART[ch.place])} alt="" />
                </span>
                <span className="pk-stop-label">{ageAt(ch, start)}歳</span>
              </button>
            );
          })}
        {BRANCHES.map((b, i) => {
          const pick = s.atFork && !compare;
          const Tag = pick ? "button" : "div";
          return (
            <Tag
              key={b.id}
              {...(pick ? { type: "button" as const, onClick: () => s.choose(b.id) } : {})}
              className={`pk-dest ${chosen === b.id ? "is-chosen" : chosen && !compare ? "is-dim" : ""} ${s.saves.includes(b.id) ? "is-seen" : ""} ${pick ? "is-pick" : ""}`}
              style={{ left: `${DEST_X}%`, top: `${ROAD_Y[i]}%`, animationDelay: `${0.4 + i * 0.12}s` }}
            >
              <span className="pk-dest-pic">
                <img src={art(c.style, destArt(s.job, b.id, start))} alt="" />
              </span>
              <span className="pk-dest-txt">
                <b>{b.short}</b>
                <span className="pk-dest-ks">
                  {ks.map((k, j) => (
                    <i key={k.id} className={`fit-${k.fits[b.id].fit}`} title={`${k.name}：${k.fits[b.id].fit}（${k.fits[b.id].why}）`}>
                      {"①②③④⑤"[j]}
                      {FIT_MARK[k.fits[b.id].fit]}
                    </i>
                  ))}
                </span>
              </span>
            </Tag>
          );
        })}
        {me && (
          <span className="pk-walker" style={{ left: `${me.x}%`, top: `${me.y}%` }}>
            <img src={art(c.style, meArt(c.look, s.chapter.mood))} alt="いまのあなた" />
          </span>
        )}
        {s.atFork && !compare && <p className="pk-map-call lf-h">道を押すと、その道に進みます</p>}
      </div>
    </div>
  );
}

/* ---------- 場面（働く姿・吹き出し・演出） ---------- */
const SLOTS: Record<Fam, { me: number; others: number[]; side: number }> = {
  g: { me: 30, others: [63, 81], side: 82 },
  h: { me: 42, others: [58, 69], side: 76 },
};

function cutArt(kind: CutKind, ch: Chapter, line: string): PackKey | "place" {
  if (kind === "ピンチ" || kind === "立ち上がる") return "cut-rise";
  if (kind === "人生のできごと") return eventArt(ch.lifeEvent ?? line);
  return "place";
}
const CUT_EN: Record<CutKind, string> = { ほめられた: "GOOD JOB", ピンチ: "PINCH", 立ち上がる: "RISE AGAIN", 人生のできごと: "LIFE EVENT" };

function Stage({ c, s, ch, prev, overlay }: { c: Ctx; s: LifeState; ch: Chapter; prev?: Chapter; overlay?: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const ups = changesOf(prev, ch, s.job).filter((u) => u.up);
  const shines: Know[] = shinesAt(s.job, s.idx, s.forkIdx, s.branch);
  const gains = gainsAt(s.job, s.idx, s.forkIdx, s.branch).filter((g) => !shines.some((x) => x.id === g.k.id));
  /* 前の場面から時間が進んだことを、最初に見せる */
  const hasIntro = !!prev && !reduced;
  const [intro, setIntro] = useState(hasIntro);
  useEffect(() => {
    if (!intro) return;
    const t = window.setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(t);
  }, [intro]);
  const fx = useFx(!!ch.cutin, gains.length + shines.length + ups.length > 0, reduced, (hasIntro ? INTRO_MS : 0) + 5200, 4200, 5200);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (reduced || intro) return;
    const t = window.setInterval(() => setK((x) => (x < ch.talks.length - 1 ? x + 1 : x)), 3600);
    return () => clearInterval(t);
  }, [ch.talks.length, reduced, intro]);
  const years = prev ? ageAt(ch, s.profile.age) - ageAt(prev, s.profile.age) : 0;

  const slot = SLOTS[c.fam];
  const others = Array.from(new Set(ch.talks.map((t) => t.who).filter((w) => w !== "me" && whoArt(w, c.look, ch.mood)))).slice(0, 2) as Who[];
  const base = (w: Who) => (w === "me" ? slot.me : others.includes(w) ? slot.others[others.indexOf(w)] : slot.side);
  const ki = reduced ? ch.talks.length - 1 : Math.min(k, ch.talks.length - 1);
  const talk = intro ? null : (ch.talks[ki] ?? null);
  /* 話しかける人は、あなたのそばまで歩いてくる */
  const layoutOf = (i: number): Pos => {
    const p: Pos = { me: slot.me };
    others.forEach((w) => (p[w] = base(w)));
    const t = ch.talks[i];
    if (t && t.who !== "me" && others.includes(t.who)) p[t.who] = slot.me + (c.fam === "g" ? 17 : 11);
    return p;
  };
  const enter: Pos = { me: slot.me - 12 };
  others.forEach((w) => (enter[w] = 108));
  const tints = (ch.vibes ?? []).map((v) => v.tint).filter(Boolean);
  const moodMe: Mood = ch.down ? "しんどい" : ch.mood;
  const act = ch.down ? "down" : ch.act;
  const cut = ch.cutin;
  const cutKey = cut ? cutArt(cut.kind, ch, cut.line) : "place";
  const cutWho = cut ? (whoArt(cut.who, c.look, cut.kind === "ピンチ" ? "しんどい" : "元気") ?? meArt(c.look, "元気")) : null;
  const vibeTalk = new Set((ch.vibes ?? []).map((v) => v.talk.text));

  return (
    <div className="pk-stagewrap" data-h="scene">
      <div className={`pk-stage ${ch.down ? "is-down" : ""} ${tints.map((t) => `tint-${t}`).join(" ")} ${fx.phase === "cut" || fx.phase === "rank" ? "is-fx" : ""}`}>
        <img src={art(c.style, PLACE_ART[ch.place])} alt={`${PLACE_LABEL[ch.place]}の場面`} className="pk-bg" />
        <span className="pk-tint" aria-hidden />
        {!intro && <Actors key={ki} partner={ch.talks.find((t) => t.who !== "me")?.who} c={c} s={s} cast={others} prev={ki === 0 ? enter : layoutOf(ki - 1)} cur={layoutOf(ki)} talk={talk} meMood={moodMe} meAct={act} review={vibeTalk} reduced={reduced} />}
        {intro && prev && (
          <button type="button" className="pk-timeskip" onClick={() => setIntro(false)} aria-label="時間が進む演出を飛ばす">
            <span className="pk-ts-label">次の場面へ　{years > 0 ? `${years}年がたちます` : "時間が進みます"}</span>
            <span className="pk-ts-when">
              <s>{withAge(prev, s.profile.age)}</s>
              <i aria-hidden>▶</i>
              <b>
                {withAge(ch, s.profile.age)}
              </b>
            </span>
            <span className="pk-ts-mean">{s.idx === s.forkIdx && !s.branch && BRIDGE[s.job.id] ? `この2年のあいだに：${BRIDGE[s.job.id]}` : ch.events[0]}</span>
            <span className="pk-ts-bar" aria-hidden />
          </button>
        )}
        <div className="pk-plate">
          <span className="lf-num pk-plate-age">{ageAt(ch, s.profile.age)}歳</span>
          <span className="text-[12px]">
            {chapterLabel(ch, s.profile.age)}・{PLACE_LABEL[ch.place]}
          </span>
        </div>
        {overlay && !intro && fx.phase === "done" && overlay}
        {ch.lifeEvent && (
          <div className="pk-event">
            <img src={art(c.style, eventArt(ch.lifeEvent))} alt="" />
            <span>
              <small>人生のできごと</small>
              {ch.lifeEvent}
            </span>
          </div>
        )}

        {fx.phase === "cut" && cut && (
          <button type="button" className={`pk-cut kind-${cut.kind}`} onClick={fx.skip} aria-label="演出を飛ばす">
            <img src={cutKey === "place" ? art(c.style, PLACE_ART[ch.place]) : art(c.style, cutKey)} alt="" className={`pk-cut-bg ${cutKey === "place" ? "is-place" : ""}`} />
            <span className="pk-cut-flash" aria-hidden />
            {cutWho && <img src={art(c.style, cutWho)} alt="" className="pk-cut-who" />}
            <span className="pk-cut-band">
              <span className="pk-cut-kind">
                {CUT_EN[cut.kind]}　{cut.kind}
              </span>
              <span className="lf-h pk-cut-line">「{cut.line}」</span>
              <span className="pk-cut-name">{nm(s.job, cut.who)}</span>
            </span>
          </button>
        )}
        {fx.phase === "rank" && (
          <button type="button" className={`pk-rank ${gains.length + shines.length ? "is-gain" : ""}`} onClick={fx.skip} aria-label="演出を飛ばす">
            <img src={art(c.style, "cut-rankup")} alt="" className="pk-cut-bg" />
            <img src={art(c.style, meArt(c.look, "元気"))} alt="" className="pk-rank-me" />
            <span className="pk-rank-box">
              <span className="lf-h pk-rank-title">{shines.length ? "知識が活きた!" : gains.length ? COPY[c.fam].gain : "RANK UP!"}</span>
              {(shines.length > 0 || gains.length > 0) && (
                <span className="pk-kgain">
                  {shines.map((x) => (
                    <span key={x.id} className="pk-kcardbig is-shine">
                      <b>{x.name}</b>
                      <small>{x.fits[s.branch!].why}</small>
                    </span>
                  ))}
                  {gains.slice(0, shines.length ? 1 : 2).map((g, i) => (
                    <span key={g.k.id} className="pk-kcardbig" style={{ animationDelay: `${0.3 + i * 0.2}s` }}>
                      <b>{g.k.name}</b>
                      <span className="pk-kstep">{g.from < 0 ? "知った" : `${STAGES[g.from]} → ${STAGES[g.to]}`}</span>
                      <small>{g.k.where}</small>
                    </span>
                  ))}
                </span>
              )}
            </span>
          </button>
        )}
      </div>
      {fx.phase === "rank" && (gains.length > 0 || shines.length > 0) && <p className="pk-whybelow">理由：{ch.events[0]}</p>}
      {fx.phase === "done" && (gains.length > 0 || (ch.vibes?.length ?? 0) > 0) && (
        <ul className="pk-stagestrip" aria-label="この場面で手に入れたスキル">
          {gains.map((g) => (
            <li key={g.k.id} className="is-gain">
              ＋{g.k.name}　{g.from < 0 ? "知った" : `${STAGES[g.from]}→${STAGES[g.to]}`}
            </li>
          ))}
          {(ch.vibes ?? []).map((v) => (
            <li key={v.id} className={`lf-vibe is-${v.tone}`}>
              {v.from}「{v.quote.length > 16 ? `${v.quote.slice(0, 16)}…` : v.quote}」
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={`pk-skip text-[12px] ${fx.phase !== "done" && !reduced ? "" : "is-off"}`} onClick={fx.skip} tabIndex={fx.phase !== "done" ? 0 : -1}>
        演出を飛ばす ▶▶
      </button>
    </div>
  );
}


