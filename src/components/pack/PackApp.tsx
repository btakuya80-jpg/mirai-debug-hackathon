"use client";

/* G案・H案（Higgsfield の絵で作り直した4ページ）の本体。
   流れ・データは H・I・J 案と共通（src/lib/life.ts）。絵は src/lib/packs.ts の案ごとのセットから出す。
   g1・g2 は「育成シミュレーション」（職場の絵を画面いっぱいに、キャラが立って働く）、
   h1・h2 は「ジオラマ」（模型の部屋を机の上に置き、人形が動く）。 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import InfoWindow, { type HelpItem } from "@/components/InfoWindow";
import { BranchPick, JobBoard, MakeForm, SaveCompare, SimpleBranchView, StatsPanel } from "@/components/life/parts";
import { LFEATURES, LHELP, LNOTE } from "@/lib/life-help";
import {
  BRANCHES,
  END_AGE,
  LSTEPS,
  LSTEP_LABEL,
  PLACE_LABEL,
  ageAt,
  chapterLabel,
  changesOf,
  nameOf,
  simpleBranch,
  useFx,
  useLife,
  type Chapter,
  type CutKind,
  type Job,
  type LifeState,
  type Mood,
  type Who,
} from "@/lib/life";
import { usePrefersReducedMotion } from "@/lib/mirai";
import { PACKS, PLACE_ART, art, eventArt, meArt, whoArt, type Look, type PackKey, type StyleId } from "@/lib/packs";

type Fam = "g" | "h";
type Ctx = { style: StyleId; fam: Fam; look: Look };

const EYEBROW: Record<Fam, string[]> = {
  g: ["STAGE 1", "STAGE 2", "STAGE 3", "STAGE 4"],
  h: ["① 町", "② 人形", "③ 生涯", "④ 棚"],
};
const TITLES: Record<Fam, { t: string; sub: string }[]> = {
  g: [
    { t: "どの職場で、分身を育てる？", sub: "架空の求人5件から選ぶか、見本の求人URLを貼ってください。会社情報や、自分で読んだ口コミも足せます。" },
    { t: "分身をつくる", sub: "年齢と4つの条件を選ぶだけ。見た目は2種類から選べます。" },
    { t: "", sub: "" },
    { t: "セーブデータを並べる", sub: "選んだ人生はセーブデータとして残ります。まだ見ていない道は簡易表示です。" },
  ],
  h: [
    { t: "この町の、どの職場の模型をのぞく？", sub: "架空の求人5件から選ぶか、見本の求人URLを貼ってください。会社情報や、自分で読んだ口コミも足せます。" },
    { t: "あなたの人形をつくる", sub: "年齢と4つの条件を選ぶだけ。人形は2種類から選べます。" },
    { t: "", sub: "" },
    { t: "できあがった模型を、棚に並べる", sub: "選んだ人生は模型として棚に残ります。まだ見ていない道は簡易表示です。" },
  ],
};

export default function PackApp({ style }: { style: StyleId }) {
  const s = useLife();
  const [look, setLook] = useState<Look>("m");
  const fam: Fam = style.startsWith("g") ? "g" : "h";
  const c: Ctx = { style, fam, look };
  const stepNo = LSTEPS.indexOf(s.step);
  const head = TITLES[fam][stepNo];
  const help: (HelpItem & { step: (typeof LSTEPS)[number] })[] = [
    ...LHELP,
    { id: "look", step: "make", sel: '[data-h="look"]', name: "見た目と表情", what: "分身は2種類から選べる。場面のきもちに合わせて、元気・普通・しんどいの3つの表情に変わる。", why: "同じ人物がどの場面でも同じ見た目で出ることで、自分の分身として追いかけやすくする。", src: "依頼（2026-11-06・Higgsfieldで洗練）" },
    { id: "lifeline", step: "life", sel: '[data-h="lifeline"]', name: "上の年表（今の年齢から75歳まで）", what: "いまの年齢の位置と、場面・人生のできごと・分かれ道を1本の線で見せる。過去の場面は押すと戻れる。", why: "いま生涯のどのあたりにいるかを、いつでも分かるようにするため。", src: "依頼（2026-11-06・Higgsfieldで洗練）" },
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
            <span className="text-[12px] text-[var(--lf-sub)]">{PACKS[style].name}</span>
          </p>
          <nav className="pk-steps ml-auto flex flex-wrap gap-1.5" aria-label="進み具合">
            {LSTEPS.map((x, i) => (
              <button key={x} type="button" aria-current={x === s.step} onClick={() => s.go(x)} className="px-3 py-1.5 text-[12.5px]">
                <span className="pk-stepno">{i + 1}</span>
                {LSTEP_LABEL[x]}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-7 pb-20 sm:px-6">
        {s.step !== "life" && <Title eyebrow={EYEBROW[fam][stepNo]} t={head.t} sub={head.sub} />}
        {s.step === "jobs" && (
          <section className="grid gap-6">
            {PACKS[style].town && (
              <figure className="pk-town">
                <img src={art(style, "town")} alt="架空の町の模型。オフィス・工場・建設現場・物流倉庫・飲食店・家・学校が並ぶ" />
                <figcaption className="text-[13px]">架空の町。5つの職場と、家・学校・空港があります。</figcaption>
              </figure>
            )}
            <JobBoard s={s} thumb={(j) => <JobThumb c={c} job={j} />} cta={fam === "g" ? "この職場で、分身をつくる" : "この職場で、人形をつくる"} />
          </section>
        )}
        {s.step === "make" && <MakeForm s={s} avatar={<AvatarCard c={c} s={s} setLook={setLook} />} cta={fam === "g" ? "ゲームを始める" : "模型の生涯を動かす"} />}
        {s.step === "life" && <LifeView c={c} s={s} />}
        {s.step === "saves" && (
          <SaveCompare
            s={s}
            thumb={(b) => {
              const d = s.job.detailed?.[b];
              const last = d?.chapters[d.chapters.length - 1];
              const place = last ? last.place : simpleBranch(s.job, b, s.profile.age).place;
              return (
                <div className="pk-thumb">
                  <img src={art(style, PLACE_ART[place])} alt="" className="pk-thumb-bg" />
                  <img src={art(style, meArt(look, last?.mood ?? "普通"))} alt="" className="pk-thumb-me" />
                  {last?.lifeEvent && <img src={art(style, eventArt(last.lifeEvent))} alt="" className="pk-thumb-ev" />}
                </div>
              );
            }}
          />
        )}
      </main>
      <p className="pb-6 text-center text-[12px] text-[var(--lf-sub)]">この画面はすべて見本（ダミーデータ）です。登場する会社・人物・口コミはすべて架空です。絵は Higgsfield で生成したオリジナルです。</p>
      <InfoWindow
        screen={`${PACKS[style].name.split("　")[0]}／${LSTEP_LABEL[s.step]}`}
        screenNote={LNOTE[s.step]}
        items={help}
        features={[...LFEATURES, `絵：${PACKS[style].touch}（Higgsfield で生成。public/packs/${style}/ にまとめて置き、src/lib/packs.ts で1枚ずつ差し替えられる）`]}
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

/* ---------- 求人の小さな絵 ---------- */
function JobThumb({ c, job }: { c: Ctx; job: Job }) {
  return (
    <span className="pk-thumb block">
      <img src={art(c.style, PLACE_ART[job.place])} alt="" className="pk-thumb-bg" loading="lazy" />
      <img src={art(c.style, "boss")} alt="" className="pk-thumb-boss" loading="lazy" />
      <span className="pk-thumb-tag">{PLACE_LABEL[job.place]}</span>
    </span>
  );
}

/* ---------- 分身づくりの見本 ---------- */
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

/* ---------- 生涯の画面 ---------- */
function LifeView({ c, s }: { c: Ctx; s: LifeState }) {
  const ch = s.chapter;
  const simple = !!s.branch && !s.detail;
  const age = ageAt(ch, s.profile.age);
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="pk-eyebrow text-[12px]">{EYEBROW[c.fam][2]}</p>
          <h1 className="lf-h mt-1 text-[24px] leading-tight sm:text-[32px]">
            {s.job.company}で働く、{s.profile.age}歳からの生涯
          </h1>
        </div>
        <p className="text-[12.5px] text-[var(--lf-sub)]">予測ではなく、シナリオ（筋書き）です。合否・点数・％は出しません。</p>
      </div>
      <LifeLine c={c} s={s} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid min-w-0 content-start gap-4">
          <Stage key={`${s.idx}-${s.branch ?? ""}-${c.look}`} c={c} s={s} ch={ch} prev={s.prev} />
          <div className="lf-card pk-log p-5">
            <p className="pk-eyebrow text-[12px]">
              {age}歳　{ch.label ? `${ch.label}　` : ""}{PLACE_LABEL[ch.place]}
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
              {!s.atFork && !s.atEnd && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={s.next}>
                  次の場面へ ▶
                </button>
              )}
              {s.atEnd && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={() => s.go("saves")}>
                  {c.fam === "g" ? "セーブデータを並べる" : "模型を棚に並べる"}
                </button>
              )}
              {s.branch && (
                <button type="button" className="lf-rewind px-4 py-2 text-[13px]" onClick={s.rewind}>
                  ↺ 分かれ道に戻って選び直す
                </button>
              )}
            </div>
          </div>
          {s.atFork && (
            <div className="grid gap-0">
              <div className="pk-forkban">
                <img src={art(c.style, "cut-fork")} alt="" />
                <p className="lf-h">分かれ道</p>
              </div>
              <BranchPick s={s} title="ここから、どの道を見る？" />
            </div>
          )}
          {simple && <SimpleBranchView s={s} />}
        </div>
        <aside>
          <StatsPanel job={s.job} ch={ch} prev={s.prev} />
        </aside>
      </div>
    </section>
  );
}

/* ---------- 上の年表（今の年齢 → 75歳） ---------- */
function LifeLine({ c, s }: { c: Ctx; s: LifeState }) {
  const start = s.profile.age;
  const span = Math.max(1, END_AGE - start);
  const cur = ageAt(s.chapter, start);
  const pct = Math.min(100, Math.max(0, ((cur - start) / span) * 100));
  const ticks: number[] = [];
  for (let a = Math.ceil((start + 1) / 10) * 10; a < END_AGE; a += 10) ticks.push(a);
  const ghost: { label: string; sub: string }[] = [];
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const ol = list.current;
    const el = ol?.querySelector<HTMLElement>('[aria-current="true"]');
    if (ol && el) ol.scrollTo({ left: el.offsetLeft - ol.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [s.idx, s.branch]);
  if (!s.branch) ghost.push({ label: "分かれ道の先", sub: "6つの道" }, { label: `${END_AGE}歳`, sub: "ゴール" });
  else if (!s.detail) ghost.push({ label: BRANCHES.find((b) => b.id === s.branch)!.short, sub: "簡易表示" }, { label: `${END_AGE}歳`, sub: "ゴール" });
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
        <span className="pk-ruler-end is-end">{END_AGE}歳</span>
        <span className="pk-ruler-me" style={{ left: `${pct}%` }}>
          <img src={art(c.style, meArt(c.look, s.chapter.mood))} alt="" />
          <b>{cur}歳</b>
        </span>
      </div>
      <ol ref={list} className="pk-nodes" data-h="debug" aria-label="場面の年表。過去の場面を押すと戻れます">
        {s.chapters.map((ch, i) => {
          const key: PackKey = ch.lifeEvent ? eventArt(ch.lifeEvent) : PLACE_ART[ch.place];
          return (
            <li key={i}>
              <button type="button" disabled={i > s.idx} aria-current={i === s.idx} onClick={() => s.jump(i)} className={`pk-node ${ch.fork ? "is-fork" : ""} ${ch.down ? "is-down" : ""}`}>
                <span className="pk-node-pic">
                  <img src={art(c.style, key)} alt="" loading="lazy" />
                </span>
                <span className="pk-node-age">{chapterLabel(ch, start)}</span>
                <span className="pk-node-sub">{ch.fork ? "◆分かれ道" : ch.lifeEvent ? ch.lifeEvent.replace(/（.*?）/g, "") : PLACE_LABEL[ch.place]}</span>
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
  const ups = changesOf(prev, ch, s.job);
  const upList = ups.filter((u) => u.up);
  const fx = useFx(!!ch.cutin, upList.length > 0, reduced, 2600, 2800, 2600);
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
  const cutWho = cut ? whoArt(cut.who, c.look, cut.kind === "ピンチ" ? "しんどい" : "元気") ?? meArt(c.look, "元気") : null;

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
          <p key={k} className={`pk-bubble ${talk.who === "me" ? "is-me" : ""} ${talk.text.startsWith("（") ? "is-think" : ""}`} style={{ left: `${Math.min(80, Math.max(20, xOf(talk.who)))}%` }}>
            <b>{nameOf(s.job, talk.who)}</b>
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
                {v.from}：{v.label}
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
          <button type="button" className="pk-rank" onClick={fx.skip} aria-label="演出を飛ばす">
            <img src={art(c.style, "cut-rankup")} alt="" className="pk-cut-bg" />
            <img src={art(c.style, meArt(c.look, "元気"))} alt="" className="pk-rank-me" />
            <span className="pk-rank-box">
              <span className="lf-h pk-rank-title">RANK UP!</span>
              <span className="flex flex-wrap justify-center gap-1.5">
                {upList.slice(0, 6).map((u, i) => (
                  <span key={u.name} className="pk-up" style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
                    {u.name} {u.from}→<b>{u.to}</b>
                  </span>
                ))}
              </span>
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

