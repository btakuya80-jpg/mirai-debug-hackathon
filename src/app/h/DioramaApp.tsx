"use client";

import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { BranchPick, DebugBar, JobBoard, MakeForm, Notice, SaveCompare, SimpleBranchView, StatsPanel } from "@/components/life/parts";
import { LFEATURES, LHELP, LNOTE } from "@/lib/life-help";
import { LSTEPS, LSTEP_LABEL, PLACE_LABEL, changesOf, chapterLabel, nameOf, simpleBranch, useFx, useLife, type Chapter, type LifeState, type Who } from "@/lib/life";
import { usePrefersReducedMotion } from "@/lib/mirai";
import { Pawn, Room, SPOTS, Thumb, Town, iso, townSpot } from "./Iso";

/* H案「ジオラマ」：町と職場を小さな模型のように見下ろす。分身が町の中を移動しながら生涯が進む。 */

export default function DioramaApp() {
  const s = useLife();
  return (
    <div className="lf h">
      <header className="h-top">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="text-[13px] text-[var(--lf-sub)]">
            ← 案の一覧へ
          </Link>
          <span className="lf-h text-[17px]">未来デバッグ　ジオラマ</span>
          <nav className="lf-stepnav ml-auto flex flex-wrap gap-1" aria-label="進み具合">
            {LSTEPS.map((x, i) => (
              <button key={x} type="button" aria-current={x === s.step} onClick={() => s.go(x)} className="px-3 py-1 text-[12.5px] font-bold">
                {i + 1}. {LSTEP_LABEL[x]}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6">
        {s.step === "jobs" && (
          <section>
            <Title k="1" t="どの職場の町で、生きてみる？" sub="架空の求人5件から選ぶか、見本の求人URLを貼ってください。" />
            <JobBoard s={s} thumb={(j) => <span className="h-thumb block">{<Thumb place={j.place} />}</span>} cta="この町で分身をつくる" />
          </section>
        )}
        {s.step === "make" && (
          <section>
            <Title k="2" t="分身をつくる" sub="年齢と4つの条件を選ぶだけ。文字は打ちません。" />
            <MakeForm
              s={s}
              avatar={
                <svg viewBox="-34 -72 68 82" className="h-44 w-auto" aria-hidden>
                  <Pawn who="me" act="cheer" x={0} y={0} mood="元気" />
                </svg>
              }
              cta="町に分身を置いて、生涯を始める"
            />
          </section>
        )}
        {s.step === "life" && <LifeH s={s} />}
        {s.step === "saves" && (
          <section>
            <Title k="4" t="人生の模型を並べる" sub="選んだ道はセーブされます。まだ見ていない道は簡易表示です。" />
            <SaveCompare
              s={s}
              thumb={(b) => {
                const d = s.job.detailed?.[b];
                const last = d?.chapters[d.chapters.length - 1];
                const place = last ? last.place : simpleBranch(s.job, b, s.profile.age).place;
                return (
                  <div className="h-thumb">
                    <Room place={place}>
                      <Pawn who="me" act={last?.act ?? "talk"} x={3.4} y={2.8} mood={last?.mood ?? "普通"} />
                    </Room>
                  </div>
                );
              }}
            />
          </section>
        )}
      </main>
      <Notice />
      <InfoWindow
        screen={`H案／${LSTEP_LABEL[s.step]}`}
        screenNote={LNOTE[s.step]}
        items={LHELP}
        features={LFEATURES}
        accent="#ff7a45"
        onBeforeFlash={(it) => {
          const h = LHELP.find((x) => x.id === it.id);
          if (h && h.step !== s.step) s.go(h.step);
        }}
      />
    </div>
  );
}

function Title({ k, t, sub }: { k: string; t: string; sub: string }) {
  return (
    <div className="mb-5 flex items-end gap-3">
      <span className="h-step lf-num">{k}</span>
      <div>
        <h1 className="lf-h text-[24px] leading-tight sm:text-[30px]">{t}</h1>
        <p className="mt-1 text-[13.5px] text-[var(--lf-sub)]">{sub}</p>
      </div>
    </div>
  );
}

const PCT = (gx: number, gy: number, lift = 50) => {
  const [x, y] = iso(gx, gy);
  return { left: `${((x + 90) / 212) * 100}%`, top: `${((y - lift + 72) / 180) * 100}%` };
};

function Scene({ s, ch, prev }: { s: LifeState; ch: Chapter; prev?: Chapter }) {
  const reduced = usePrefersReducedMotion();
  const ups = changesOf(prev, ch, s.job);
  const fx = useFx(!!ch.cutin, ups.some((u) => u.up), reduced);
  const others = Array.from(new Set([...ch.talks.map((t) => t.who), ...(ch.cutin ? [ch.cutin.who] : [])].filter((w) => w !== "me"))) as Who[];
  const spots = SPOTS[ch.place];
  const pos = (w: Who) => (w === "me" ? spots[0] : spots[1 + Math.max(0, others.indexOf(w))] ?? spots[3]);
  const night = ch.down && ch.place !== "overseas";
  return (
    <div className="lf-card relative overflow-hidden p-0" data-h="scene">
      <div className={`h-room ${ch.down ? "is-down" : ""}`}>
        <Room place={ch.place} night={night}>
          {others.map((w) => {
            const [x, y] = pos(w);
            return <Pawn key={w} who={w} act={w === "student" || w === "local" ? "talk" : "talk"} x={x} y={y} />;
          })}
          <Pawn who="me" act={ch.act} x={spots[0][0]} y={spots[0][1]} mood={ch.mood} />
        </Room>
        {ch.talks.map((t, i) => {
          const [x, y] = pos(t.who);
          return (
            <p key={i} className={`h-bubble ${t.who === "me" ? "is-me" : ""}`} style={{ ...PCT(x, y, 62 + (i % 2) * 18), animationDelay: `${0.3 + i * 0.9}s` }}>
              <b>{nameOf(s.job, t.who)}</b>
              {t.text}
            </p>
          );
        })}
        {ch.down && <span className="h-rain" aria-hidden />}
      </div>
      <div className="h-plate">
        <span className="lf-num text-[22px]">{chapterLabel(ch, s.profile.age)}</span>
        <span className="text-[12px]">{PLACE_LABEL[ch.place]}</span>
      </div>
      {ch.lifeEvent && (
        <p className="h-ribbon" style={{ animationDelay: "0.6s" }}>
          人生のできごと：{ch.lifeEvent}
        </p>
      )}
      {fx.phase === "cut" && ch.cutin && (
        <button type="button" className={`h-cut kind-${ch.cutin.kind}`} onClick={fx.skip} aria-label="演出を飛ばす">
          <span className="h-rays" aria-hidden />
          <span className="h-cutcard">
            <span className="h-cutkind lf-h">{ch.cutin.kind}</span>
            <svg viewBox="-30 -60 60 66" className="h-24 w-auto" aria-hidden>
              <Pawn who={ch.cutin.who} act={ch.cutin.kind === "ピンチ" ? "down" : ch.cutin.kind === "立ち上がる" ? "cheer" : "talk"} x={0} y={0} />
            </svg>
            <span className="lf-h text-[18px] leading-snug sm:text-[22px]">「{ch.cutin.line}」</span>
            <span className="text-[12px] opacity-70">{nameOf(s.job, ch.cutin.who)}</span>
          </span>
        </button>
      )}
      {fx.phase === "rank" && (
        <button type="button" className="h-rank" onClick={fx.skip} aria-label="演出を飛ばす">
          <span className="h-ranksign lf-h">ランクアップ！</span>
          <span className="flex flex-wrap justify-center gap-1.5">
            {ups
              .filter((u) => u.up)
              .map((u, i) => (
                <span key={u.name} className="h-chipup" style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
                  {u.name} {u.from}→<b>{u.to}</b>
                </span>
              ))}
          </span>
        </button>
      )}
    </div>
  );
}

function LifeH({ s }: { s: LifeState }) {
  const ch = s.chapter;
  const key = `${s.idx}-${s.branch ?? ""}`;
  const simple = !!s.branch && !s.detail;
  return (
    <section>
      <Title k="3" t={`${s.job.company}の町で生きる`} sub="予測ではなくシナリオ（筋書き）です。場面ごとに、働く姿と力の変化を見せます。" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-4">
          <Scene key={key} s={s} ch={ch} prev={s.prev} />
          <div className="lf-card p-5">
            <ul className="grid gap-1">
              {ch.events.map((e) => (
                <li key={e} className="lf-h text-[17px] leading-8">
                  {e}
                </li>
              ))}
            </ul>
            <ul className="mt-2 grid gap-1 border-t border-dashed border-[var(--lf-line)] pt-2 text-[13.5px] leading-6">
              {ch.talks.map((t, i) => (
                <li key={i}>
                  <b>{nameOf(s.job, t.who)}</b>「{t.text}」
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!s.atFork && !s.atEnd && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={s.next}>
                  次の場面へ ▶
                </button>
              )}
              {s.atEnd && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={() => s.go("saves")}>
                  人生の模型を並べる
                </button>
              )}
              {s.atEnd && !simple && <span className="text-[13px] text-[var(--lf-sub)]">75歳。この道の筋書きはここまで。</span>}
            </div>
          </div>
          {s.atFork && <BranchPick s={s} title="3年目の分かれ道。どの道を見る？" />}
          {simple && <SimpleBranchView s={s} />}
          <div className="lf-card p-4">
            <p className="mb-2 text-[12.5px] font-bold text-[var(--lf-sub)]">年表（押すと過去の場面へ戻れます）</p>
            <DebugBar s={s} />
          </div>
        </div>
        <aside className="grid content-start gap-4">
          <div className="lf-card overflow-hidden p-0">
            <p className="px-4 pt-3 text-[12.5px] font-bold text-[var(--lf-sub)]">町の模型　いまいる場所：{PLACE_LABEL[ch.place]}</p>
            <div className="h-town">
              <Town workPlace={s.job.place} here={townSpot(ch.place, s.job.place)} mood={ch.mood} />
            </div>
          </div>
          <StatsPanel job={s.job} ch={ch} prev={s.prev} compact />
        </aside>
      </div>
    </section>
  );
}
