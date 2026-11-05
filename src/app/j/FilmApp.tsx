"use client";

import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { BranchPick, JobBoard, MakeForm, SaveCompare, SimpleBranchView, StatsPanel } from "@/components/life/parts";
import { LFEATURES, LHELP, LNOTE } from "@/lib/life-help";
import { LSTEPS, LSTEP_LABEL, PLACE_LABEL, changesOf, chapterLabel, nameOf, simpleBranch, useFx, useLife, type Chapter, type LifeState, type Who } from "@/lib/life";
import { usePrefersReducedMotion } from "@/lib/mirai";
import { Figure, Screen } from "./Film";

/* J案「映画のフィルム」：人生を1本の映画として、時点ごとのシーンがフィルムのコマで流れる。 */

const ROMAN = (n: number) => String(n).padStart(2, "0");

export default function FilmApp() {
  const s = useLife();
  return (
    <div className="lf j">
      <header className="j-top">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4 sm:px-6">
          <Link href="/" className="text-[13px] text-[var(--lf-sub)]">
            ← 案の一覧へ
          </Link>
          <span className="lf-h text-[18px] tracking-[0.12em]">未来デバッグ　<span className="j-en">A LIFE ON FILM</span></span>
          <nav className="lf-stepnav ml-auto flex flex-wrap gap-1" aria-label="進み具合">
            {LSTEPS.map((x, i) => (
              <button key={x} type="button" aria-current={x === s.step} onClick={() => s.go(x)} className="px-3 py-1 text-[12.5px]">
                <span className="j-en mr-1">{ROMAN(i + 1)}</span>
                {LSTEP_LABEL[x]}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6">
        {s.step === "jobs" && (
          <section>
            <Title en="CASTING" t="どの職場の映画にする？" sub="架空の求人5件から選ぶか、見本の求人URLを貼ってください。" />
            <JobBoard
              s={s}
              thumb={(j) => (
                <span className="j-poster block">
                  <Screen place={j.place} mood="元気" id={`t-${j.id}`}>
                    <Figure who="me" act={j.place === "factory" ? "machine" : j.place === "office" ? "pc" : j.place === "construction" ? "build" : j.place === "logistics" ? "carry" : "cook"} x={j.place === "office" ? 330 : 250} />
                  </Screen>
                </span>
              )}
              cta="この職場で、主人公をつくる"
            />
          </section>
        )}
        {s.step === "make" && (
          <section>
            <Title en="LEAD ROLE" t="主人公（分身）をつくる" sub="年齢と4つの条件を選ぶだけ。映画は、その年齢から始まります。" />
            <MakeForm
              s={s}
              avatar={
                <div className="j-poster w-full overflow-hidden rounded-md">
                  <Screen place={s.job.place} mood="元気" id="make">
                    <Figure who="me" act="cheer" x={240} s={1.1} />
                  </Screen>
                </div>
              }
              cta="上映を始める"
            />
          </section>
        )}
        {s.step === "life" && <LifeJ s={s} />}
        {s.step === "saves" && (
          <section>
            <Title en="PROGRAM" t="上映した人生を並べる" sub="選んだ筋はフィルムとして残ります。まだ上映していない筋は簡易表示です。" />
            <SaveCompare
              s={s}
              thumb={(b) => {
                const d = s.job.detailed?.[b];
                const last = d?.chapters[d.chapters.length - 1];
                return (
                  <div className="j-poster">
                    <Screen place={last ? last.place : simpleBranch(s.job, b, s.profile.age).place} mood={last?.mood ?? "普通"} id={`s-${b}`}>
                      <Figure who="me" act={last?.act ?? "talk"} x={240} />
                    </Screen>
                  </div>
                );
              }}
            />
          </section>
        )}
      </main>
      <p className="pb-6 text-center text-[12px] text-[var(--lf-sub)]">この画面はすべて見本（ダミーデータ）です。登場する会社・人物はすべて架空です。</p>
      <InfoWindow
        screen={`J案／${LSTEP_LABEL[s.step]}`}
        screenNote={LNOTE[s.step]}
        items={LHELP}
        features={LFEATURES}
        accent="#d9a441"
        onBeforeFlash={(it) => {
          const h = LHELP.find((x) => x.id === it.id);
          if (h && h.step !== s.step) s.go(h.step);
        }}
      />
    </div>
  );
}

function Title({ en, t, sub }: { en: string; t: string; sub: string }) {
  return (
    <div className="mb-6">
      <p className="j-en text-[12px] tracking-[0.4em] text-[var(--lf-accent)]">{en}</p>
      <h1 className="lf-h mt-1 text-[28px] leading-tight sm:text-[38px]">{t}</h1>
      <p className="mt-2 text-[13.5px] text-[var(--lf-sub)]">{sub}</p>
    </div>
  );
}

/* ---------- スクリーン ---------- */
function Shot({ s, ch, prev, no }: { s: LifeState; ch: Chapter; prev?: Chapter; no: number }) {
  const reduced = usePrefersReducedMotion();
  const ups = changesOf(prev, ch, s.job);
  const fx = useFx(!!ch.cutin, ups.some((u) => u.up), reduced, 2200, 2800, 2600);
  const others = Array.from(new Set([...ch.talks.map((t) => t.who), ...(ch.cutin ? [ch.cutin.who] : [])].filter((w) => w !== "me"))) as Who[];
  const meX = ch.place === "logistics" ? 240 : ch.place === "food" ? 150 : ch.place === "school" ? 150 : 250;
  const xs = [350, 110, 420];
  return (
    <div className="j-screenwrap" data-h="scene">
      <div className={`j-screen ${fx.phase === "cut" ? "is-cut" : ""}`}>
        <div className="j-shot">
          <Screen place={ch.place} mood={ch.mood} id="main">
            {others.map((w, i) => (
              <Figure key={w} who={w} act="talk" x={xs[i] ?? 400} flip={(xs[i] ?? 400) > meX} s={0.95} />
            ))}
            <Figure who="me" act={ch.act} x={meX} />
          </Screen>
        </div>
        <p className="j-slate">
          <span className="j-en">SCENE {ROMAN(no)}</span>
          <span className="lf-h">{chapterLabel(ch, s.profile.age)}</span>
          <span>{PLACE_LABEL[ch.place]}</span>
        </p>
        <div className="j-subs" aria-live="polite">
          {ch.talks.map((t, i) => (
            <p key={i} style={{ animationDelay: `${0.4 + i * 1.5}s` }} className={i === ch.talks.length - 1 ? "is-last" : ""}>
              <span className="j-who">{nameOf(s.job, t.who)}</span>
              {t.text}
            </p>
          ))}
        </div>
        {ch.lifeEvent && <p className="j-life lf-h">{ch.lifeEvent}</p>}
        {fx.phase === "cut" && ch.cutin && (
          <button type="button" className={`j-cut kind-${ch.cutin.kind}`} onClick={fx.skip} aria-label="演出を飛ばす">
            <span className="j-en j-cutkind">{ch.cutin.kind === "ピンチ" ? "TROUBLE" : ch.cutin.kind === "立ち上がる" ? "RISE AGAIN" : ch.cutin.kind === "人生のできごと" ? "LIFE EVENT" : "SPOTLIGHT"}</span>
            <span className="lf-h j-cutline">「{ch.cutin.line}」</span>
            <span className="text-[13px] opacity-75">
              {ch.cutin.kind}　{nameOf(s.job, ch.cutin.who)}
            </span>
          </button>
        )}
        {fx.phase === "rank" && (
          <button type="button" className="j-rank" onClick={fx.skip} aria-label="演出を飛ばす">
            <span className="j-roll">
              <span className="j-en text-[13px] tracking-[0.4em] text-[var(--lf-accent)]">LEVEL UP</span>
              <span className="lf-h text-[22px]">ランクアップ</span>
              {ups
                .filter((u) => u.up)
                .map((u) => (
                  <span key={u.name} className="grid grid-cols-[1fr_auto] gap-6 text-[15px]">
                    <span>{u.name}</span>
                    <span className="j-en">
                      {u.from} → <b className="text-[var(--lf-accent)]">{u.to}</b>
                    </span>
                  </span>
                ))}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- フィルム（年表。過去のコマへ戻れる） ---------- */
function Strip({ s }: { s: LifeState }) {
  return (
    <div className="j-strip" data-h="debug">
      <ol className="flex gap-2 overflow-x-auto px-3 py-2">
        {s.chapters.map((c, i) => {
          const can = i <= s.idx;
          return (
            <li key={i} className="shrink-0">
              <button type="button" disabled={!can} onClick={() => s.jump(i)} aria-current={i === s.idx} className="j-frame">
                <span className="block w-[132px]">{can ? <Screen place={c.place} mood={c.mood} id={`f${i}`}><Figure who="me" act={c.act} x={240} s={1.2} /></Screen> : <span className="block aspect-[12/5] bg-[#1d1b19]" />}</span>
                <span className="j-en block px-1 pt-1 text-left text-[11px]">
                  {ROMAN(i + 1)}　<span className="font-sans">{chapterLabel(c, s.profile.age)}</span>
                  {c.fork ? "　◆" : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LifeJ({ s }: { s: LifeState }) {
  const ch = s.chapter;
  const simple = !!s.branch && !s.detail;
  return (
    <section>
      <Title en="NOW SHOWING" t={`${s.job.company}で生きる、ある${s.profile.age}歳の物語`} sub="予測ではなくシナリオ（筋書き）です。下のフィルムのコマを押すと、過去のシーンに戻れます。" />
      <Shot key={`${s.idx}-${s.branch ?? ""}`} s={s} ch={ch} prev={s.prev} no={s.idx + 1} />
      <Strip s={s} />
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="lf-card p-5">
            <p className="j-en text-[12px] tracking-[0.3em] text-[var(--lf-accent)]">SYNOPSIS</p>
            <ul className="mt-1 grid gap-1">
              {ch.events.map((e) => (
                <li key={e} className="lf-h text-[18px] leading-9">
                  {e}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!s.atFork && !s.atEnd && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={s.next}>
                  次のシーンへ ▶
                </button>
              )}
              {s.atEnd && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={() => s.go("saves")}>
                  上映した人生を並べる
                </button>
              )}
              {s.branch && (
                <button type="button" className="lf-rewind px-4 py-2 text-[13px]" onClick={s.rewind}>
                  ↺ 分かれ道のシーンに戻って撮り直す
                </button>
              )}
              {s.atEnd && !simple && <span className="j-en text-[13px] tracking-[0.3em] text-[var(--lf-sub)]">THE END　75歳</span>}
            </div>
          </div>
          {s.atFork && <BranchPick s={s} title="ここで物語が分かれる。どの筋を上映する？" />}
          {simple && <SimpleBranchView s={s} />}
        </div>
        <aside>
          <StatsPanel job={s.job} ch={ch} prev={s.prev} />
        </aside>
      </div>
    </section>
  );
}
