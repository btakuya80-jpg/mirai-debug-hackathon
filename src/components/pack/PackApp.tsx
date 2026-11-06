"use client";

/* G案・H案（Higgsfield の絵）。この作品の核＝「その会社で、どんな専門知識が身につき、その後の人生でどう活きるか」。
   G（/g・/g2）＝「育つ」が主役：場面ごとに専門知識が 知った→できる→任される→教えられる と育つ。手帳とカットインで刻む。
   H（/h・/h2）＝「分かれる」が主役：町の模型の上の「道の地図」が年表。持っていく知識が、どの道で活きる／活きないかを地図で見せる。
   共通：最初の画面（30秒で何の道具か）→ 会社のまとめ（出典・不明）→ 分身 → 生涯 → 人生を並べる。
   見せ場は「分かれ道で、身につけた知識が6本の道に配られる瞬間」。 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import InfoWindow, { type HelpItem } from "@/components/InfoWindow";
import { CompanyExtras, JobBoard, MakeForm, SaveCompare, SimpleBranchView, StatsPanel } from "@/components/life/parts";
import { karteOf } from "@/lib/karte";
import { BEATS, LV_NAME, episodeOfVibe, episodesOf, levelsAt, trunkIdxOf, type Beat, type Episode } from "@/lib/episodes";
import { FIT_MARK, STAGES, gainsAt, knowOf, shinesAt, stageAt, type Know } from "@/lib/know";
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
import { PACKS, PLACE_ART, art, eventArt, meArt, whoArt, type Look, type PackKey, type StyleId } from "@/lib/packs";

type Fam = "g" | "h";
type Ctx = { style: StyleId; fam: Fam; look: Look };

const COPY: Record<Fam, { tag: string; make: string; start: string; life: string; saves: string; savesSub: string; book: string; gain: string }> = {
  g: {
    tag: "専門知識が、育っていく",
    make: "分身をつくる",
    start: "働きはじめる",
    life: "専門知識の育ち方を見る",
    saves: "セーブデータを並べる",
    savesSub: "道ごとに、持っていった専門知識がどう使われたかを並べます。",
    book: "専門知識の手帳",
    gain: "専門知識 GET!",
  },
  h: {
    tag: "専門知識で、道が分かれる",
    make: "人形をつくる",
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
    { id: "look", step: "make", sel: '[data-h="look"]', name: "見た目と表情", what: "分身は2種類から選べる。場面のきもちに合わせて、元気・普通・しんどいの3つの表情に変わる。", why: "同じ人物がどの場面でも同じ見た目で出ることで、自分の分身として追いかけやすくする。", src: SRC },
    { id: "episode", step: "life", sel: '[data-h="scene"]', name: "1つの場面（仕事→壁→学び→スキルアップ→その後）", what: "スキルが上がる時は、毎回この5つの段で見せる。どんな仕事で、何につまずき、だれに何を教わったか（自分で何を工夫したか）、Lv がいくつ上がり、そのスキルが後でどう役に立ったか。", why: "「何をやっていて、どのスキルが上がったのか」を、理由の場面ごと分かるようにするため（使った人の感想「間の何かが足りない」への答え）。", src: "依頼（2026-11-06・スキルが上がる理由の場面）" },
    { id: "yearone", step: "life", sel: '[data-h="yearone"]', name: "入社1年の年表", what: "入社1週間・1か月後・3か月後・半年後・1年後の場面を並べる。3年後・10年後・75歳は「先を見る」を選ぶまで閉じておく。", why: "最初から70〜80歳まで一気に見せると早すぎるため。まず1年をじっくり見せる。", src: "依頼（2026-11-06・時間を飛ばしすぎない）" },
    { id: "future", step: "life", sel: '[data-h="future"]', name: "先を見る（どこまで見るかを選ぶ）", what: "入社1年を見終わると、3年後（分かれ道）まで・10年後まで・生涯まで、を選べる。選んだ範囲の先は、また選ぶまで出さない。", why: "その先を見るかどうか、どこまで見るかを、利用者が決められるようにするため。", src: "依頼（2026-11-06）" },
    fam === "g"
      ? { id: "book", step: "life", sel: '[data-h="book"]', name: "専門知識の手帳（G案の主役）", what: "知識ごとに Lv.1 知った → Lv.2 できる → Lv.3 任される → Lv.4 教えられる の4段で、どの場面で上がったかを刻む。", why: "「その会社でどんな専門知識が、どう育つか」を、時間の流れで見せるため。点数ではなく段の名前で見せる。", src: SRC }
      : { id: "map", step: "life", sel: '[data-h="lifeline"]', name: "道の地図（H案の主役・年表を兼ねる）", what: "入社から分かれ道までの道と、6本の分かれ道。道の端に、持っていく知識が活きる（◎）・少し（△）・活きない（−）を出す。", why: "専門知識で人生の道がどう分かれるかを、1枚の地図で見せるため。", src: SRC },
    { id: "deal", step: "life", sel: '[data-h="branches"]', name: "分かれ道で知識を配る（見せ場）", what: "身についた専門知識が6本の道に配られ、道ごとに活きる・活きないと理由が出る。ここから選び直せる。", why: "デモで一番伝えたい瞬間。知識が将来の選択肢をどう広げるかが、ひと目で分かる。", src: SRC },
  ];
  return (
    <div className={`lf pk pk-${fam} pk-${style}`}>
      <header className="pk-top">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="pk-back text-[13px]">
            ← 案の一覧へ
          </Link>
          <p className="flex items-baseline gap-2">
            <span className="lf-h pk-brand text-[19px]">未来デバッグ</span>
            <span className="text-[12px] text-[var(--lf-sub)]">{fam === "g" ? "G案" : "H案"}　{T.tag}</span>
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
            <Title eyebrow={`STEP 3　${T.make}`} t={T.make} sub="年齢と4つの条件を選ぶだけ。見た目は2種類から選べます。" />
            <MakeForm s={s} avatar={<AvatarCard c={c} s={s} setLook={setLook} />} cta={T.start} />
          </section>
        )}
        {s.step === "life" && <LifeView c={c} s={s} />}
        {s.step === "saves" && (
          <section className="grid gap-6">
            <Title eyebrow="STEP 5　人生を並べる" t={T.saves} sub={T.savesSub} />
            {fam === "h" && <RoadMap c={c} s={s} compare />}
            <FitTable s={s} />
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
      </main>
      <p className="pb-6 text-center text-[12px] text-[var(--lf-sub)]">この画面はすべて見本（ダミーデータ）です。登場する会社・人物・口コミはすべて架空です。絵は Higgsfield で生成したオリジナルです。</p>
      <InfoWindow
        screen={`${fam === "g" ? "G案（育つ）" : "H案（分かれる）"}／${LSTEP_LABEL[s.step]}`}
        screenNote={LNOTE[s.step]}
        items={help}
        features={[
          "最初の画面：一文と3つの段、見本の求人ボタン",
          "求人URL → 会社のまとめ（出典つき・読み取れない項目は「不明」）→ 分身づくり → 生涯 → 人生を並べる",
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

/* ---------- 1. 最初の画面（30秒で何の道具か分かる） ---------- */
function Entry({ c, s }: { c: Ctx; s: LifeState }) {
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const sample = JOBS[0];
  const open = (u: string) => {
    const j = jobByUrl(u);
    if (!j) {
      setMsg("見本では kyujin.example の5件だけ読み込めます。下の見本ボタンか、一覧から選んでください。");
      return;
    }
    s.pickJob(j.id);
    s.go("karte");
  };
  const ks = knowOf(sample);
  return (
    <section className="grid gap-10">
      <div className="pk-hero" data-h="hero">
        <div className="grid content-center gap-5">
          <p className="pk-eyebrow text-[12px]">求人1件から、入社1年とその先を試運転</p>
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
            <b>入社1年を、場面で見る</b>
            <span>仕事→壁→学び→スキルアップ。先は「先を見る」で</span>
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
        <h2 className="lf-h text-[20px]">または、架空の求人から選ぶ</h2>
        <JobBoard s={s} thumb={(j) => <JobThumb c={c} job={j} />} cta="この会社のまとめを見る" next="karte" showUrl={false} showExtras={false} />
      </div>
    </section>
  );
}

function JobThumb({ c, job }: { c: Ctx; job: Job }) {
  return (
    <span className="pk-thumb block">
      <img src={art(c.style, PLACE_ART[job.place])} alt="" className="pk-thumb-bg" loading="lazy" />
      <img src={art(c.style, "boss")} alt="" className="pk-thumb-boss" loading="lazy" />
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
          <h1 className="lf-h text-[26px] leading-tight sm:text-[34px]">
            {s.job.company}は、
            <br className="sm:hidden" />
            こういう会社です
          </h1>
          <p className="text-[15px] leading-8">
            {s.job.industry}の会社。{s.job.body[0]}
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
            <p className="mt-1 text-[12.5px] text-[var(--lf-sub)]">どの仕事・場面で身につくかと、求人原稿のどこから読み取ったかを並べています。</p>
            <ul className="mt-3 grid gap-3">
              {ks.map((x) => (
                <li key={x.id} className="pk-learn">
                  <p className="lf-h text-[16px]">{x.name}</p>
                  <p className="text-[13.5px] leading-6">{x.what}</p>
                  <p className="text-[12.5px] text-[var(--lf-sub)]">身につく場面：{x.where}</p>
                  {x.src ? (
                    <p className="pk-src">
                      出典：求人原稿 {x.src.para}段落目「{x.src.quote}」
                    </p>
                  ) : (
                    <p className="pk-src is-guess">出典なし：求人原稿に書いていないため、シナリオ上の想定です</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="lf-card p-5">
            <p className="lf-h text-[18px]">読み取った項目</p>
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
          </div>
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

/* ---------- 3. 分身づくりの見本 ---------- */
function AvatarCard({ c, s, setLook }: { c: Ctx; s: LifeState; setLook: (l: Look) => void }) {
  return (
    <div className="grid w-full gap-3" data-h="look">
      <div className="pk-thumb pk-avatar">
        <img src={art(c.style, PLACE_ART[s.job.place])} alt="" className="pk-thumb-bg" />
        <img key={c.look} src={art(c.style, meArt(c.look, "元気"))} alt="分身" className="pk-avatar-me pk-pop" />
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
const yearsOf = (ch: Chapter) => (ch.at === "end" ? 999 : ch.at);

function LifeView({ c, s: s0 }: { c: Ctx; s: LifeState }) {
  const eps = episodesOf(s0.job);
  const [phase, setPhase] = useState<"ep" | "ch">(() => (eps.length && !s0.branch && s0.idx < s0.forkIdx ? "ep" : "ch"));
  const [horizon, setHorizon] = useState(s0.branch ? 99 : 3);
  const [pos, setPos] = useState<{ e: number; beat: Beat }>({ e: 0, beat: 0 });
  /* 道を選んだら、少なくとも10年後までは見せる（分かれ道の先が空にならないように） */
  const s: LifeState = {
    ...s0,
    choose: (b: BranchId) => {
      setHorizon((h) => Math.max(h, 10));
      s0.choose(b);
    },
  };
  const toFuture = (y: number) => {
    setHorizon(y);
    setPhase("ch");
    if (!s0.branch) s0.jump(s0.forkIdx);
  };
  const toYearOne = (e = eps.length - 1) => {
    setPhase("ep");
    setPos({ e: Math.max(0, e), beat: 0 });
    if (s0.branch) s0.rewind();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (phase === "ep" && eps.length) return <YearOne c={c} s={s} pos={pos} setPos={setPos} onFuture={toFuture} />;
  return <LaterLife c={c} s={s} horizon={horizon} setHorizon={setHorizon} onYearOne={toYearOne} />;
}

/* 入社1年：場面を重ねて、じっくり */
function YearOne({ c, s, pos, setPos, onFuture }: { c: Ctx; s: LifeState; pos: { e: number; beat: Beat }; setPos: (p: { e: number; beat: Beat }) => void; onFuture: (y: number) => void }) {
  const eps = episodesOf(s.job);
  const ep = eps[pos.e];
  const k = knowOf(s.job).find((x) => x.id === ep.up.know)!;
  const last = pos.e === eps.length - 1;
  const done = last && pos.beat === 4;
  const lv = levelsAt(s.job, pos.e, pos.beat);
  const vibes = s.vibes.filter((v) => episodeOfVibe(s.job, v) === pos.e);
  const ch = s.job.trunk[trunkIdxOf(ep)];
  const prevCh = trunkIdxOf(ep) > 0 ? s.job.trunk[trunkIdxOf(ep) - 1] : undefined;
  const goBeat = (b: number) => {
    if (b <= 4) return setPos({ e: pos.e, beat: b as Beat });
    if (!last) {
      setPos({ e: pos.e + 1, beat: 0 });
      document.querySelector('[data-h="scene"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else document.querySelector('[data-h="future"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="pk-eyebrow text-[12px]">STEP 4　入社1年を、場面で見る</p>
          <h1 className="lf-h mt-1 text-[24px] leading-tight sm:text-[30px]">
            {s.job.company}で働く、最初の1年
          </h1>
          <p className="mt-1 text-[13px] leading-6 text-[var(--lf-sub)]">スキルが上がる時は、毎回「仕事 → 壁 → 学び → スキルアップ → その後」の順で見せます。その先は、見終わってから「先を見る」で選べます。</p>
        </div>
        <p className="text-[12.5px] text-[var(--lf-sub)]">予測ではなく、シナリオ（筋書き）です。合否・点数・％は出しません。</p>
      </div>
      <YearOneLine c={c} s={s} pos={pos} onPick={(e) => setPos({ e, beat: 0 })} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-3">
          <div className="pk-ephead" data-h="ephead">
            <p className="pk-eyebrow text-[12px]">
              場面 {pos.e + 1} / {eps.length}　{ep.when}（{ageAt(ch, s.profile.age)}歳）
            </p>
            <p className="lf-h text-[19px] leading-snug sm:text-[22px]">「{ep.title}」</p>
            <p className="pk-ephead-what">
              <span>
                <small>{s.job.company}の仕事</small>
                {ep.work.text}
              </span>
              <span className="pk-ephead-arrow" aria-hidden>
                →
              </span>
              <span className="is-know">
                <small>身につく専門スキル</small>
                {k.name}
              </span>
            </p>
          </div>
          <EpisodeStage key={`${pos.e}-${c.look}`} c={c} s={s} ep={ep} beat={pos.beat} vibes={vibes} onBeat={goBeat} />
          <StoryCard s={s} ep={ep} k={k} beat={pos.beat} last={last} next={eps[pos.e + 1]} onBeat={goBeat} />
          <FutureCard s={s} done={done} onFuture={onFuture} />
        </div>
        <aside className="grid content-start gap-4">
          <KnowBook c={c} s={s} lv={lv} justUp={pos.beat >= 3 ? ep.up.know : null} upTo={pos.e} upBeat={pos.beat} />
          <details className="pk-more">
            <summary className="lf-h cursor-pointer text-[14px]">8つの力と暮らし（高・中・低）</summary>
            <div className="mt-3">
              <StatsPanel job={s.job} ch={ch} prev={prevCh} />
            </div>
          </details>
        </aside>
      </div>
    </section>
  );
}

const BEAT_MS = [3400, 3600, 4200, 3600];

/** 1つの場面を5つの段で見せる舞台 */
function EpisodeStage({ c, s, ep, beat, vibes, onBeat }: { c: Ctx; s: LifeState; ep: Episode; beat: Beat; vibes: Vibe[]; onBeat: (b: number) => void }) {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [k, setK] = useState(0);
  const cb = useRef(onBeat);
  useEffect(() => {
    cb.current = onBeat;
  });
  useEffect(() => {
    if (reduced || paused || beat >= 4) return;
    const t = window.setTimeout(() => cb.current(beat + 1), BEAT_MS[beat]);
    return () => clearTimeout(t);
  }, [beat, paused, reduced]);
  /* 仕事の段では、口コミから入った会話も順に出す */
  const workTalks: Talk[] = [ep.work.talk, ...vibes.map((v) => v.talk)];
  useEffect(() => {
    if (beat !== 0 || workTalks.length < 2 || reduced) return;
    const t = window.setInterval(() => setK((x) => Math.min(x + 1, workTalks.length - 1)), 1500);
    return () => clearInterval(t);
  }, [beat, workTalks.length, reduced]);
  const kw = knowOf(s.job).find((x) => x.id === ep.up.know)!;
  const slot = SLOTS[c.fam];
  const others = Array.from(new Set([ep.work.talk.who, ep.learn.who].filter((w) => w !== "me" && whoArt(w, c.look, "普通")))).slice(0, 2) as Who[];
  const xOf = (w: Who) => (w === "me" ? slot.me : others.includes(w) ? slot.others[others.indexOf(w)] : slot.side);
  const talk: Talk | null = beat === 0 ? workTalks[Math.min(k, workTalks.length - 1)] : beat === 1 ? { who: "me", text: ep.wall.think } : beat === 2 ? { who: ep.learn.who, text: ep.learn.line } : null;
  const vibeTalk = new Set(vibes.map((v) => v.talk.text));
  const tints = [...(beat <= 1 ? vibes.map((v) => v.tint) : []), beat === 1 ? ep.wall.tint : beat === 2 ? "warm" : undefined].filter(Boolean);
  const mood: Mood = beat === 1 ? "しんどい" : beat >= 3 ? "元気" : "普通";
  const act = beat === 1 ? "down" : ep.act;
  const cap = [ep.work.text, ep.wall.text, ep.learn.text, `${kw.name}　Lv.${ep.up.from} → Lv.${ep.up.to}`, ep.after.text];
  return (
    <div className="pk-stagewrap" data-h="scene">
      <div className={`pk-stage pk-epstage beat-${beat} ${beat === 1 ? "is-down" : ""} ${tints.map((t) => `tint-${t}`).join(" ")}`}>
        <img src={art(c.style, PLACE_ART[ep.place])} alt={`${PLACE_LABEL[ep.place]}の場面`} className="pk-bg" />
        <span className="pk-tint" aria-hidden />
        {others.map((w) => (
          <img key={w} src={art(c.style, whoArt(w, c.look, "普通")!)} alt={nameOf(s.job, w)} className={`pk-chara is-other ${talk?.who === w ? "is-talking" : ""}`} style={{ left: `${xOf(w)}%` }} />
        ))}
        <span className={`pk-me act-${act}`} style={{ left: `${slot.me}%` }}>
          <img key={mood} src={art(c.style, meArt(c.look, mood))} alt="分身" className="pk-chara" />
          {act === "down" && <span className="pk-sweat" aria-hidden />}
        </span>
        {talk && (
          <p key={`${beat}-${k}`} className={`pk-bubble ${talk.who === "me" ? "is-me" : ""} ${talk.text.startsWith("（") ? "is-think" : ""} ${vibeTalk.has(talk.text) ? "is-review" : ""}`} style={{ left: `${Math.min(80, Math.max(20, xOf(talk.who)))}%` }}>
            <b>
              {nameOf(s.job, talk.who)}
              {vibeTalk.has(talk.text) && <em>口コミから</em>}
            </b>
            {talk.text}
          </p>
        )}
        <span className="pk-beatno" aria-hidden>
          {"①②③④⑤"[beat]} {BEATS[beat]}
        </span>
        {beat === 2 && <span className={`pk-learnstamp ${ep.learn.how === "工夫" ? "is-self" : ""}`}>{ep.learn.how === "工夫" ? "自分で工夫した" : `${nameOf(s.job, ep.learn.who)}さんに教わった`}</span>}
        {beat <= 1 && vibes.length > 0 && (
          <ul className="pk-vibes">
            {vibes.map((v) => (
              <li key={v.id} className={`lf-vibe is-${v.tone} px-2 py-0.5 text-[11.5px]`}>
                {v.from}「{v.quote.length > 16 ? `${v.quote.slice(0, 16)}…` : v.quote}」
              </li>
            ))}
          </ul>
        )}
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
              <span className="pk-lvwhy">理由：{ep.learn.text}</span>
            </span>
          </button>
        )}
      </div>
      <div className={`pk-cap beat-${beat}`} aria-live="polite">
        <span className="pk-cap-tag">
          {"①②③④⑤"[beat]} {BEATS[beat]}
        </span>
        <span className="pk-cap-txt">{beat === 4 ? `${ep.after.when}、${cap[4]}` : cap[beat]}</span>
        {!reduced && beat < 4 && (
          <button type="button" className="pk-cap-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? "▶ 自動で進める" : "❚❚ 止める"}
          </button>
        )}
      </div>
    </div>
  );
}

/** 場面の5つの段を、文で並べる（押すとその段へ） */
function StoryCard({ s, ep, k, beat, last, next, onBeat }: { s: LifeState; ep: Episode; k: Know; beat: Beat; last: boolean; next?: Episode; onBeat: (b: number) => void }) {
  const rows = [
    ep.work.text,
    ep.wall.text,
    `${ep.learn.how === "工夫" ? "自分で工夫" : `${nameOf(s.job, ep.learn.who)}さんに教わる`}：${ep.learn.text}`,
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
        <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={() => onBeat(beat + 1)}>
          {beat < 4 ? `次へ（${BEATS[beat + 1]}）▶` : last ? "1年目をふり返る ▼" : `次の場面へ：${next!.when}「${next!.title}」 ▶`}
        </button>
        {beat > 0 && (
          <button type="button" className="lf-rewind px-4 py-2 text-[13px]" onClick={() => onBeat(0)}>
            ↺ この場面を最初から
          </button>
        )}
      </div>
    </div>
  );
}

/** 入社1年を見終わったら「先を見る」。どこまで見るかを選ぶ */
function FutureCard({ s, done, onFuture }: { s: LifeState; done: boolean; onFuture: (y: number) => void }) {
  const eps = episodesOf(s.job);
  const lv = levelsAt(s.job, eps.length - 1, 4);
  const ks = knowOf(s.job).filter((k) => (lv[k.id] ?? 0) > 0);
  return (
    <div className={`pk-future ${done ? "is-open" : ""}`} data-h="future">
      {done ? (
        <>
          <p className="pk-eyebrow text-[12px]">入社1年、おつかれさまでした</p>
          <p className="lf-h text-[20px] sm:text-[23px]">1年で身についた専門スキル</p>
          <ul className="pk-future-ks">
            {ks.map((k) => (
              <li key={k.id}>
                <b>{k.name}</b> Lv.{lv[k.id]}（{LV_NAME[lv[k.id]]}）
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[14px] font-bold">この先を見ますか？　どこまで見るかを選べます。</p>
        </>
      ) : (
        <p className="text-[13px] text-[var(--lf-sub)]">
          <b className="text-[var(--lf-ink)]">先を見る</b>：入社1年の場面（{eps.length}つ）を見終わると、3年後・10年後・生涯の筋書きへ進めます。
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {HORIZONS.filter((h) => h.y !== 20).map((h, i) => (
          <button key={h.y} type="button" className={done && i === 0 ? "lf-btn px-5 py-3 text-[15px]" : "pk-futbtn px-4 py-2.5 text-[13.5px]"} onClick={() => onFuture(h.y)}>
            {h.label}見る ▶
          </button>
        ))}
      </div>
      {!done && <p className="mt-1 text-[11.5px] text-[var(--lf-sub)]">1年目の途中でも進めますが、場面を順に見るのがおすすめです。</p>}
    </div>
  );
}

/** 入社1年の年表（場面ごと）。その先は「先を見る」で開く */
function YearOneLine({ c, s, pos, onPick }: { c: Ctx; s: LifeState; pos: { e: number; beat: Beat }; onPick: (e: number) => void }) {
  const eps = episodesOf(s.job);
  return (
    <div className={`pk-life pk-yr ${c.fam === "h" ? "is-road" : ""}`} data-h="yearone">
      <p className="pk-yr-head">
        <b>入社1年</b>　{s.profile.age}歳 → {s.profile.age + 1}歳　場面を押すと、その場面から見られます
      </p>
      <ol className="pk-nodes" aria-label="入社1年の場面">
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
        {["3年後", "10年後", `${END_AGE}歳`].map((g) => (
          <li key={g}>
            <span className="pk-node is-ghost">
              <span className="pk-node-pic">?</span>
              <span className="pk-node-age">{g}</span>
              <span className="pk-node-sub">「先を見る」で開く</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* 3年後から先：利用者が選んだところまで */
function LaterLife({ c, s, horizon, setHorizon, onYearOne }: { c: Ctx; s: LifeState; horizon: number; setHorizon: (y: number) => void; onYearOne: (e?: number) => void }) {
  const ch = s.chapter;
  const simple = !!s.branch && !s.detail;
  const age = ageAt(ch, s.profile.age);
  const nextCh = s.chapters[s.idx + 1];
  const nextHidden = !!nextCh && s.idx >= s.forkIdx && yearsOf(nextCh) > horizon;
  const more = HORIZONS.filter((h) => h.y > horizon);
  const eps = episodesOf(s.job);
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="pk-eyebrow text-[12px]">STEP 4　{COPY[c.fam].life}</p>
          <h1 className="lf-h mt-1 text-[24px] leading-tight sm:text-[30px]">
            {s.job.company}で働く、{horizon >= 99 ? `${END_AGE}歳まで` : `${horizon}年後まで`}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--lf-sub)]">
            いま見ている範囲：入社から{horizon >= 99 ? `生涯（${END_AGE}歳）` : `${horizon}年後`}まで。
            {eps.length > 0 && (
              <button type="button" className="pk-link" onClick={() => onYearOne(eps.length - 1)}>
                入社1年の場面に戻る
              </button>
            )}
          </p>
        </div>
        <p className="text-[12.5px] text-[var(--lf-sub)]">予測ではなく、シナリオ（筋書き）です。合否・点数・％は出しません。</p>
      </div>
      {c.fam === "g" ? <LifeLine c={c} s={s} horizon={horizon} onYearOne={onYearOne} /> : <RoadMap c={c} s={s} horizon={horizon} onYearOne={onYearOne} />}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-4">
          <Stage key={`${s.idx}-${s.branch ?? ""}-${c.look}`} c={c} s={s} ch={ch} prev={s.prev} />
          <ChapterStory s={s} ch={ch} />
          {s.atFork && <ForkDeal c={c} s={s} />}
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
            <details className="mt-3 text-[13px] leading-6">
              <summary className="cursor-pointer text-[var(--lf-sub)]">この場面の会話を読む（{ch.talks.length}）</summary>
              <ul className="mt-1 grid gap-0.5">
                {ch.talks.map((t, i) => (
                  <li key={i}>
                    <b>{nameOf(s.job, t.who)}</b>：{t.text}
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
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={() => s.go("saves")}>
                  {COPY[c.fam].saves} ▶
                </button>
              )}
              {s.branch && (
                <button type="button" className="lf-rewind px-4 py-2 text-[13px]" onClick={s.rewind}>
                  ↺ 分かれ道に戻って選び直す
                </button>
              )}
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
                  <button type="button" className="pk-futbtn px-4 py-2.5 text-[13.5px]" onClick={() => s.go("saves")}>
                    ここで{COPY[c.fam].saves}
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
        </div>
        <aside className="grid content-start gap-4">
          <KnowBook c={c} s={s} />
          <details className="pk-more">
            <summary className="lf-h cursor-pointer text-[14px]">8つの力と暮らし（高・中・低）</summary>
            <div className="mt-3">
              <StatsPanel job={s.job} ch={ch} prev={s.prev} />
            </div>
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
  const teacher = ch.talks.find((t) => t.who !== "me" && !(ch.vibes ?? []).some((v) => v.talk.text === t.text));
  const wall = ch.cutin?.kind === "ピンチ" ? ch.cutin.line : ch.events.find((e) => /迷う|ずれ|ない|痛め|まちが/.test(e));
  const rows = [
    ch.events[0],
    wall ?? "大きな壁はない。いつもの仕事を続ける中で、少しずつ任される",
    teacher ? `${nameOf(s.job, teacher.who)}：「${teacher.text}」` : ch.cutin ? `「${ch.cutin.line}」` : "自分で工夫して身につける",
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
function KnowBook({ c, s, lv, justUp, upTo = 0, upBeat = 0 }: { c: Ctx; s: LifeState; lv?: Record<string, number>; justUp?: string | null; upTo?: number; upBeat?: number }) {
  const ep = !!lv;
  const gains = ep ? [] : gainsAt(s.job, s.idx, s.forkIdx, s.branch);
  const shines = ep ? [] : shinesAt(s.job, s.idx, s.forkIdx, s.branch);
  const eps = episodesOf(s.job);
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
      <p className="mt-2 text-[11px] leading-5 text-[var(--lf-sub)]">Lv は段の名前（1 知った・2 できる・3 任される・4 教えられる）です。点数ではありません。</p>
    </div>
  );
}

/* 見せ場：分かれ道で、身につけた知識を6本の道に配る */
function ForkDeal({ c, s }: { c: Ctx; s: LifeState }) {
  const ks = knowOf(s.job).filter((k) => stageAt(k, s.forkIdx, s.forkIdx, null) >= 0);
  return (
    <div className="pk-deal" data-h="branches">
      <div className="pk-deal-head">
        <img src={art(c.style, "cut-fork")} alt="" />
        <div>
          <p className="pk-eyebrow text-[12px]">分かれ道　{ageAt(s.chapter, s.profile.age)}歳</p>
          <p className="lf-h text-[20px] sm:text-[24px]">いま持っている専門知識は、どの道で活きる？</p>
          <p className="mt-1 text-[12.5px]">◎活きる　△少し活きる　−活きない（筋書きの中での使われ方です。点数ではありません）</p>
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
              <span className="pk-road-foot">
                {d ? "場面つき（作り込み）" : "簡易表示"}
                {seen && "・見た道"}
                <b>この道を見る ▶</b>
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
function LifeLine({ c, s, horizon = 99, onYearOne }: { c: Ctx; s: LifeState; horizon?: number; onYearOne?: (e?: number) => void }) {
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
              <span className="pk-node-age">入社1年</span>
              <span className="pk-node-sub">場面{eps.length}つ（見た）</span>
            </button>
          </li>
        )}
        {shown.map(({ ch, i }) => {
          const key: PackKey = ch.lifeEvent ? eventArt(ch.lifeEvent) : PLACE_ART[ch.place];
          const g = gainsAt(s.job, i, s.forkIdx, s.branch);
          return (
            <li key={i}>
              <button type="button" disabled={i > s.idx} aria-current={i === s.idx} onClick={() => s.jump(i)} className={`pk-node ${ch.fork ? "is-fork" : ""} ${ch.down ? "is-down" : ""}`}>
                <span className="pk-node-pic">
                  <img src={art(c.style, key)} alt="" loading="lazy" />
                  {(ch.vibes?.length ?? 0) > 0 && <span className="pk-node-rev" title="口コミ・会社情報が入った場面">口</span>}
                </span>
                <span className="pk-node-age">{chapterLabel(ch, start)}</span>
                <span className="pk-node-sub">{ch.fork ? "◆分かれ道" : g.length ? `＋${g[0].k.name}` : ch.lifeEvent ? ch.lifeEvent.replace(/（.*?）/g, "") : PLACE_LABEL[ch.place]}</span>
              </button>
            </li>
          );
        })}
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
            title={onYearOne && i < s.forkIdx ? "入社1年の場面に戻る" : undefined}
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
            <img src={art(c.style, meArt(c.look, s.chapter.mood))} alt="いまの分身" />
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

function Stage({ c, s, ch, prev }: { c: Ctx; s: LifeState; ch: Chapter; prev?: Chapter }) {
  const reduced = usePrefersReducedMotion();
  const ups = changesOf(prev, ch, s.job).filter((u) => u.up);
  const shines: Know[] = shinesAt(s.job, s.idx, s.forkIdx, s.branch);
  const gains = gainsAt(s.job, s.idx, s.forkIdx, s.branch).filter((g) => !shines.some((x) => x.id === g.k.id));
  const fx = useFx(!!ch.cutin, gains.length + shines.length + ups.length > 0, reduced, 2600, 2800, 3200);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setK((x) => (x < ch.talks.length - 1 ? x + 1 : x)), 1900);
    return () => clearInterval(t);
  }, [ch.talks.length, reduced]);

  const slot = SLOTS[c.fam];
  const others = Array.from(new Set(ch.talks.map((t) => t.who).filter((w) => w !== "me" && whoArt(w, c.look, ch.mood)))).slice(0, 2) as Who[];
  const xOf = (w: Who) => (w === "me" ? slot.me : others.includes(w) ? slot.others[others.indexOf(w)] : slot.side);
  const talk = ch.talks[reduced ? ch.talks.length - 1 : Math.min(k, ch.talks.length - 1)];
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
        {others.map((w) => (
          <img key={w} src={art(c.style, whoArt(w, c.look, "普通")!)} alt={nameOf(s.job, w)} className={`pk-chara is-other ${talk?.who === w ? "is-talking" : ""}`} style={{ left: `${xOf(w)}%` }} />
        ))}
        <span className={`pk-me act-${act}`} style={{ left: `${slot.me}%` }}>
          <img src={art(c.style, meArt(c.look, moodMe))} alt="分身" className="pk-chara" />
          {act === "down" && <span className="pk-sweat" aria-hidden />}
        </span>
        {talk && (
          <p key={k} className={`pk-bubble ${talk.who === "me" ? "is-me" : ""} ${talk.text.startsWith("（") ? "is-think" : ""} ${vibeTalk.has(talk.text) ? "is-review" : ""}`} style={{ left: `${Math.min(80, Math.max(20, xOf(talk.who)))}%` }}>
            <b>
              {nameOf(s.job, talk.who)}
              {vibeTalk.has(talk.text) && <em>口コミから</em>}
            </b>
            {talk.text}
          </p>
        )}
        <div className="pk-plate">
          <span className="lf-num pk-plate-age">{ageAt(ch, s.profile.age)}歳</span>
          <span className="text-[12px]">
            {chapterLabel(ch, s.profile.age)}・{PLACE_LABEL[ch.place]}
          </span>
        </div>
        {(ch.vibes?.length ?? 0) > 0 && (
          <ul className="pk-vibes">
            {ch.vibes!.map((v) => (
              <li key={v.id} className={`lf-vibe is-${v.tone} px-2 py-0.5 text-[11.5px]`}>
                {v.from}「{v.quote.length > 16 ? `${v.quote.slice(0, 16)}…` : v.quote}」
              </li>
            ))}
          </ul>
        )}
        {gains.length > 0 && fx.phase === "done" && (
          <ul className="pk-gainchips">
            {gains.map((g) => (
              <li key={g.k.id}>
                ＋{g.k.name}　{g.from < 0 ? "知った" : `${STAGES[g.from]}→${STAGES[g.to]}`}
              </li>
            ))}
          </ul>
        )}
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
              <span className="pk-cut-name">{nameOf(s.job, cut.who)}</span>
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
              {(gains.length > 0 || shines.length > 0) && <span className="pk-lvwhy">理由：{ch.events[0]}</span>}
              {ups.length > 0 && (
                <span className="flex flex-wrap justify-center gap-1.5">
                  {ups.slice(0, 4).map((u, i) => (
                    <span key={u.name} className="pk-up" style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
                      {u.name} {u.from}→<b>{u.to}</b>
                    </span>
                  ))}
                </span>
              )}
            </span>
          </button>
        )}
      </div>
      <button type="button" className={`pk-skip text-[12px] ${fx.phase !== "done" && !reduced ? "" : "is-off"}`} onClick={fx.skip} tabIndex={fx.phase !== "done" ? 0 : -1}>
        演出を飛ばす ▶▶
      </button>
    </div>
  );
}


