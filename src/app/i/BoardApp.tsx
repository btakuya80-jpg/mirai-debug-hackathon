"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { BranchPick, DebugBar, JobBoard, MakeForm, Notice, SaveCompare, SimpleBranchView, StatsPanel } from "@/components/life/parts";
import { LFEATURES, LHELP, LNOTE } from "@/lib/life-help";
import { BRANCHES, LSTEPS, LSTEP_LABEL, PLACE_LABEL, ageAt, changesOf, chapterLabel, nameOf, simpleBranch, useFx, useLife, type BranchId, type Chapter, type LifeState, type Who } from "@/lib/life";
import { usePrefersReducedMotion } from "@/lib/mirai";
import { BRANCH_COLOR, BoardBase, Doll, INK, Piece, Stage, TRUNK, Thumb, laneTile } from "./Board";

/* I案「人生のすごろく盤」：生涯をひとつの盤にし、マスに止まるたびに職場の場面のカードが開く。分かれ道は盤の分岐。 */

export default function BoardApp() {
  const s = useLife();
  return (
    <div className="lf i">
      <header className="i-top">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="text-[13px] text-[var(--lf-sub)]">
            ← 案の一覧へ
          </Link>
          <span className="i-logo lf-h text-[19px]">未来デバッグ　人生すごろく</span>
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
            <Title t="どの盤で遊ぶ？　求人を選ぶ" sub="求人ごとに、盤のマスに出てくる職場が変わります。見本の求人URLを貼っても始められます。" />
            <JobBoard s={s} thumb={(j) => <Thumb place={j.place} />} cta="この求人の盤で、分身のコマをつくる" />
          </section>
        )}
        {s.step === "make" && (
          <section>
            <Title t="分身のコマをつくる" sub="年齢と4つの条件を選ぶだけ。スタートのマスは、いまの年齢です。" />
            <MakeForm
              s={s}
              avatar={
                <svg viewBox="-60 -110 120 118" className="h-44 w-auto" aria-hidden>
                  <Doll who="me" act="cheer" x={0} y={0} mood="元気" />
                </svg>
              }
              cta="スタートのマスに置く"
            />
          </section>
        )}
        {s.step === "life" && <LifeI s={s} />}
        {s.step === "saves" && (
          <section>
            <Title t="遊んだ人生を並べる" sub="選んだ道はセーブされます。まだ通っていない道は簡易表示です。" />
            <SaveCompare
              s={s}
              thumb={(b) => {
                const d = s.job.detailed?.[b];
                const last = d?.chapters[d.chapters.length - 1];
                return (
                  <div className="i-thumb" style={{ borderTop: `10px solid ${BRANCH_COLOR[b]}` }}>
                    <Stage place={last ? last.place : simpleBranch(s.job, b, s.profile.age).place}>
                      <Doll who="me" act={last?.act ?? "talk"} x={200} mood={last?.mood ?? "普通"} />
                    </Stage>
                  </div>
                );
              }}
            />
          </section>
        )}
      </main>
      <Notice />
      <InfoWindow
        screen={`I案／${LSTEP_LABEL[s.step]}`}
        screenNote={LNOTE[s.step]}
        items={LHELP}
        features={LFEATURES}
        accent="#e23d28"
        onBeforeFlash={(it) => {
          const h = LHELP.find((x) => x.id === it.id);
          if (h && h.step !== s.step) s.go(h.step);
        }}
      />
    </div>
  );
}

function Title({ t, sub }: { t: string; sub: string }) {
  return (
    <div className="mb-5">
      <h1 className="lf-h text-[26px] leading-tight sm:text-[34px]">{t}</h1>
      <p className="mt-1 text-[13.5px] text-[var(--lf-sub)]">{sub}</p>
    </div>
  );
}

/* ---------- 盤 ---------- */
function BoardView({ s }: { s: LifeState }) {
  const start = s.profile.age;
  const nOf = (b: BranchId) => s.job.detailed?.[b]?.chapters.length ?? 3;
  let piece = TRUNK[Math.min(s.idx, 3)];
  if (s.branch && s.idx > s.forkIdx && s.detail) piece = laneTile(s.branch, s.idx - s.forkIdx - 1, nOf(s.branch));
  else if (s.branch && !s.detail) piece = laneTile(s.branch, 2, 3);
  const box = useRef<HTMLDivElement>(null);
  const px = piece.x;
  useEffect(() => {
    const el = box.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: (px / 900) * el.scrollWidth - el.clientWidth / 2, behavior: "smooth" });
  }, [px]);
  return (
    <div ref={box} className="lf-card i-board overflow-x-auto p-2" data-h="debug">
      <svg viewBox="0 0 900 430" className="block h-auto w-full min-w-[720px]" role="img" aria-label="人生のすごろく盤">
        <BoardBase />
        {BRANCHES.map((b) => {
          const n = nOf(b.id);
          const chosen = s.branch === b.id;
          const d = s.job.detailed?.[b.id];
          const sb = simpleBranch(s.job, b.id, start);
          return (
            <g key={b.id} opacity={s.branch && !chosen ? 0.45 : 1}>
              {Array.from({ length: n }, (_, k) => {
                const p = laneTile(b.id, k, n);
                const label = d ? `${ageAt(d.chapters[k], start)}` : sb.lines[k].split("歳")[0];
                const visited = chosen && s.detail && s.forkIdx + 1 + k <= s.idx;
                const here = chosen && s.detail && s.forkIdx + 1 + k === s.idx;
                const can = (s.atFork && k === 0) || visited;
                const go = () => (s.atFork && k === 0 ? s.choose(b.id) : visited ? s.jump(s.forkIdx + 1 + k) : undefined);
                return (
                  <g key={k} className={`i-tile ${can ? "is-can" : ""} ${s.atFork && k === 0 ? "is-pulse" : ""}`} onClick={can ? go : undefined} role={can ? "button" : undefined} aria-label={can ? `${b.label}・${label}歳` : undefined}>
                    <circle cx={p.x} cy={p.y} r={here ? 19 : 15} fill={visited ? BRANCH_COLOR[b.id] : "#fffaf0"} stroke={INK} strokeWidth="2.6" />
                    <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill={visited ? "#fff" : INK}>
                      {label}
                    </text>
                  </g>
                );
              })}
              {(() => {
                const e = laneTile(b.id, n - 1, n);
                return (
                  <g>
                    <text x={e.x - 24} y={e.y - 22} textAnchor="end" fontSize="14" fill={BRANCH_COLOR[b.id]} className="i-boardtxt" stroke="#fbf4e6" strokeWidth="4" paintOrder="stroke">
                      {b.label}
                      {d ? " ★" : ""}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
        {TRUNK.map((p, i) => {
          const c = s.job.trunk[i];
          const visited = i <= s.idx;
          const fork = i === 3;
          return (
            <g key={i} className={`i-tile ${visited ? "is-can" : ""}`} onClick={visited ? () => s.jump(i) : undefined} role={visited ? "button" : undefined} aria-label={visited ? chapterLabel(c, start) : undefined}>
              {fork ? (
                <path d={`M${p.x},${p.y - 28} L${p.x + 28},${p.y} L${p.x},${p.y + 28} L${p.x - 28},${p.y}Z`} fill={visited ? "#f2b824" : "#fffaf0"} stroke={INK} strokeWidth="2.8" />
              ) : (
                <rect x={p.x - 24} y={p.y - 24} width="48" height="48" rx="12" fill={visited ? (c.down ? "#8fb2e8" : "#f2b824") : "#fffaf0"} stroke={INK} strokeWidth="2.8" />
              )}
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={INK}>
                {chapterLabel(c, start)}
              </text>
            </g>
          );
        })}
        <Piece x={piece.x} y={piece.y - 18} />
      </svg>
    </div>
  );
}

/* ---------- 場面のカード ---------- */
function Card({ s, ch, prev }: { s: LifeState; ch: Chapter; prev?: Chapter }) {
  const reduced = usePrefersReducedMotion();
  const ups = changesOf(prev, ch, s.job);
  const fx = useFx(!!ch.cutin, ups.some((u) => u.up), reduced, 1300);
  const others = Array.from(new Set([...ch.talks.map((t) => t.who), ...(ch.cutin ? [ch.cutin.who] : [])].filter((w) => w !== "me"))) as Who[];
  const meX = ch.place === "logistics" ? 200 : ch.place === "food" ? 120 : ch.place === "school" ? 120 : 210;
  const xs = [300, 70, 360];
  const xOf = (w: Who) => (w === "me" ? meX : xs[Math.max(0, others.indexOf(w))]);
  return (
    <div className="i-card" data-h="scene">
      <div className="i-cardhead">
        <span className="lf-h text-[20px]">{chapterLabel(ch, s.profile.age)}</span>
        <span className="text-[12.5px]">{PLACE_LABEL[ch.place]}</span>
        {ch.down && <span className="i-badge is-blue">ひと休みのマス</span>}
        {ch.fork && <span className="i-badge">分かれ道のマス</span>}
      </div>
      <div className="relative">
        <Stage place={ch.place} dark={ch.down && ch.place === "home"}>
          {others.map((w) => (
            <Doll key={w} who={w} act="talk" x={xOf(w)} flip={xOf(w) > meX} s={0.92} />
          ))}
          <Doll who="me" act={ch.act} x={meX} mood={ch.mood} />
        </Stage>
        {ch.talks.map((t, i) => (
          <p key={i} className={`i-balloon ${t.who === "me" ? "is-me" : ""}`} style={{ left: `${(Math.min(330, Math.max(70, xOf(t.who))) / 400) * 100}%`, top: `${6 + i * 17}%`, animationDelay: `${0.25 + i * 0.8}s` }}>
            <b>{nameOf(s.job, t.who)}</b>
            {t.text}
          </p>
        ))}
        {ch.lifeEvent && <p className="i-life">人生のできごと：{ch.lifeEvent}</p>}
        {fx.phase === "cut" && ch.cutin && (
          <button type="button" className={`i-cut kind-${ch.cutin.kind}`} onClick={fx.skip} aria-label="演出を飛ばす">
            <span className="i-cutcard">
              <span className="i-cutkind lf-h">できごとカード　{ch.cutin.kind}</span>
              <svg viewBox="-60 -110 120 118" className="h-28 w-auto" aria-hidden>
                <Doll who={ch.cutin.who} act={ch.cutin.kind === "ピンチ" ? "down" : ch.cutin.kind === "立ち上がる" ? "cheer" : "talk"} x={0} y={0} mood={ch.cutin.kind === "ピンチ" ? "しんどい" : "元気"} />
              </svg>
              <span className="lf-h text-[19px] leading-snug sm:text-[23px]">「{ch.cutin.line}」</span>
              <span className="text-[12px]">{nameOf(s.job, ch.cutin.who)}</span>
            </span>
          </button>
        )}
        {fx.phase === "rank" && (
          <button type="button" className="i-rank" onClick={fx.skip} aria-label="演出を飛ばす">
            <span className="i-stamp lf-h">ランク
              <br />
              アップ
            </span>
            <span className="flex flex-wrap justify-center gap-1.5">
              {ups
                .filter((u) => u.up)
                .map((u, i) => (
                  <span key={u.name} className="i-chip" style={{ animationDelay: `${0.35 + i * 0.1}s` }}>
                    {u.name} {u.from}→<b>{u.to}</b>
                  </span>
                ))}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function Dice({ rolling }: { rolling: boolean }) {
  return (
    <span className={`i-dice ${rolling ? "is-rolling" : ""}`} aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

function LifeI({ s }: { s: LifeState }) {
  const ch = s.chapter;
  const [rolling, setRolling] = useState(false);
  const reduced = usePrefersReducedMotion();
  const roll = () => {
    if (reduced) return s.next();
    setRolling(true);
    window.setTimeout(() => {
      setRolling(false);
      s.next();
    }, 850);
  };
  const simple = !!s.branch && !s.detail;
  return (
    <section>
      <Title t={`${s.job.company}の人生すごろく`} sub="マスに止まるたびに、職場の場面のカードが開きます。予測ではなくシナリオ（筋書き）です。止まったマスは押すと戻れます。" />
      <BoardView s={s} />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="grid min-w-0 content-start gap-4">
          <Card key={`${s.idx}-${s.branch ?? ""}`} s={s} ch={ch} prev={s.prev} />
          <div className="lf-card p-5">
            <ul className="grid gap-1">
              {ch.events.map((e) => (
                <li key={e} className="text-[16.5px] leading-8 font-bold">
                  {e}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!s.atFork && !s.atEnd && (
                <button type="button" className="lf-btn flex items-center gap-3 px-6 py-3 text-[15px]" onClick={roll} disabled={rolling}>
                  <Dice rolling={rolling} />
                  サイコロを振って進む
                </button>
              )}
              {s.atFork && <span className="text-[14px] font-bold">分かれ道のマス。盤の光るマスか、下の一覧から道を選んでください。</span>}
              {s.atEnd && (
                <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={() => s.go("saves")}>
                  遊んだ人生を並べる
                </button>
              )}
            </div>
          </div>
          {s.atFork && <BranchPick s={s} title="分かれ道のマス。どの道へ進む？" />}
          {simple && <SimpleBranchView s={s} />}
          <div className="lf-card p-4">
            <DebugBar s={s} />
          </div>
        </div>
        <aside>
          <StatsPanel job={s.job} ch={ch} prev={s.prev} />
        </aside>
      </div>
    </section>
  );
}
