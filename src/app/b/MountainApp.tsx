"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { FEATURES, HELP, SCREEN_NOTE } from "@/lib/help";
import { data, gradeIndex, getCompany, STEPS, STEP_LABEL, useMirai, useRunClock, usePrefersReducedMotion } from "@/lib/mirai";
import Range from "./Range";

const WEATHER: Record<string, { icon: string; word: string; c: string; bg: string }> = {
  低: { icon: "☀", word: "晴れ", c: "#b56a00", bg: "#fff1c9" },
  中: { icon: "☁", word: "くもり", c: "#4a5d73", bg: "#e5ecf3" },
  高: { icon: "☂", word: "雨", c: "#2f4b8f", bg: "#dbe4fb" },
};

const levelsOf = (grades: string[]) => grades.map(gradeIndex);

export default function MountainApp() {
  const m = useMirai();
  const idx = STEPS.indexOf(m.step);

  return (
    <div className="vb">
      <header className="mx-auto flex max-w-6xl items-center gap-4 px-4 pt-4 sm:px-6">
        <Link href="/" className="text-[14px] font-bold text-[var(--ink2)] hover:text-[var(--ink)]">
          ← 案の一覧へ
        </Link>
        <span className="text-[15px] font-black">未来デバッグ</span>
        <ol className="ml-auto hidden items-center gap-1 md:flex" aria-label="進み具合">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => m.go(s)}
                aria-current={s === m.step}
                className={`vb-pill px-3 py-1 text-[12.5px] font-bold ${
                  s === m.step ? "bg-[var(--ink)] text-white" : i < idx ? "text-[var(--deep)]" : "text-[var(--ink2)]/70"
                }`}
              >
                {STEP_LABEL[s]}
              </button>
            </li>
          ))}
        </ol>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {m.step === "job" && <Job onRun={() => m.go("input")} />}
        {m.step === "input" && <Input m={m} />}
        {m.step === "company" && <Company m={m} />}
        {m.step === "run" && <Run key={m.companyId} companyId={m.companyId} onDone={() => m.go("result")} />}
        {m.step === "result" && <Result companyId={m.companyId} onCompare={() => m.go("compare")} />}
        {m.step === "compare" && <Compare onBack={() => m.go("result")} />}
      </main>

      <p className="pb-6 text-center text-[12px] text-[var(--ink2)]">{data.meta.sampleNote}</p>

      <InfoWindow
        screen={`B案／${STEP_LABEL[m.step]}`}
        screenNote={SCREEN_NOTE[m.step]}
        items={HELP}
        features={FEATURES}
        accent="#ff7a45"
        onBeforeFlash={(it) => {
          const h = HELP.find((x) => x.id === it.id);
          if (h && h.step !== m.step) m.go(h.step);
        }}
      />
    </div>
  );
}

/* ---------- 1. 求人 ---------- */
function Job({ onRun }: { onRun: () => void }) {
  const j = data.job;
  const aoba = getCompany("aoba");
  return (
    <section className="pt-8 sm:pt-12">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#bfe0fb] to-[#fff1df] px-5 pt-8 pb-0 sm:px-10 sm:pt-12">
        <svg className="vb-sun absolute top-8 right-[10%] h-24 w-24 sm:h-32 sm:w-32" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="34" fill="#ffc94a" />
          <circle cx="50" cy="50" r="46" fill="#ffc94a" opacity=".25" />
        </svg>
        <p className="relative text-[14px] font-bold text-[var(--ink2)]">
          {j.company} ／ {j.area}
        </p>
        <h1 className="relative mt-2 max-w-[18ch] text-[30px] sm:text-[46px]">
          <span className="w">企画・運用スタッフ</span>
          <span className="w text-[0.6em] font-bold">（未経験歓迎）</span>
        </h1>
        <div className="relative mt-3 flex flex-wrap gap-2">
          {j.tags.map((t) => (
            <span key={t} className="vb-pill bg-white/70 px-3 py-1 text-[12.5px] font-bold">
              {t}
            </span>
          ))}
        </div>
        <div className="relative -mx-5 mt-6 sm:-mx-10">
          <Range id="job" levels={levelsOf(aoba.timeline[0].grades).map((x) => x * 0.8)} grades={aoba.timeline[0].grades} labels={false} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="vb-card p-6 sm:p-8">
          <dl className="grid grid-cols-[4.5rem_1fr] gap-y-2 text-[15px]">
            <dt className="font-bold text-[var(--ink2)]">給与</dt>
            <dd>{j.salary}</dd>
            <dt className="font-bold text-[var(--ink2)]">時間</dt>
            <dd>{j.hours}</dd>
          </dl>
          <div className="mt-5 grid gap-3 text-[16px] leading-8">
            {j.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
        </div>
        <aside className="vb-card flex flex-col gap-4 p-6" data-h="cta">
          <p className="text-[18px] leading-8 font-black">
            <span className="w">応募の前に、</span>
            <span className="w">ここでの10年を</span>
            <span className="w">先に歩いてみる。</span>
          </p>
          <p className="text-[14px] leading-7 text-[var(--ink2)]">あなたの分身が、この会社の上司・同僚と働く筋書きを5本試走します。</p>
          <button type="button" onClick={onRun} className="vb-cta vb-pill bg-[var(--dawn)] px-6 py-4 text-[17px] font-black text-white">
            入社後を試運転する
          </button>
        </aside>
      </div>
    </section>
  );
}

/* ---------- 2. 入力 ---------- */
function Input({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section className="pt-8 sm:pt-12">
      <h2 className="text-[28px] sm:text-[38px]">
        <span className="w">登る前に、</span>
        <span className="w">あなたのことを10問だけ。</span>
      </h2>
      <p className="mt-2 text-[15px] text-[var(--ink2)]">選ぶだけ、5分で終わります。いまは見本の回答が入っています。</p>

      {/* 登山道の進み具合 */}
      <div className="mt-6 flex items-center gap-1" aria-label={`回答 ${m.answered}/10`}>
        {data.questions.map((q, i) => (
          <span key={q.id} className="h-2 flex-1 rounded-full transition-colors duration-500" style={{ background: i < m.answered ? "var(--deep)" : "#d5e3ee" }} />
        ))}
        <span className="num ml-2 text-[15px] font-bold">{m.answered}/10</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2" data-h="questions">
        {data.questions.map((q, i) => (
          <fieldset key={q.id} className="vb-card p-5">
            <legend className="sr-only">{q.text}</legend>
            <p className="flex items-baseline gap-3">
              <span className="num text-[22px] font-extrabold text-[var(--mid)]">{i + 1}</span>
              <span className="text-[16px] font-bold">{q.text}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => {
                const on = m.isOn(q.id, o);
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => m.toggle(q.id, o)}
                    className={`vb-pill border px-3.5 py-1.5 text-[14px] font-bold transition-all ${
                      on ? "border-[var(--deep)] bg-[var(--deep)] text-white" : "border-[#c9d8e2] bg-white text-[var(--ink2)] hover:border-[var(--mid)]"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        <label className="vb-card p-5" data-h="area">
          <span className="text-[16px] font-bold">住むエリア</span>
          <span className="mt-1 block text-[13px] text-[var(--ink2)]">結果のあとで、通える範囲の求人を出すために使います。</span>
          <select value={m.area} onChange={(e) => m.setArea(e.target.value)} className="vb-pill mt-3 block border border-[#c9d8e2] bg-white px-4 py-2 text-[15px] font-bold">
            {data.areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <button type="button" onClick={() => m.go("company")} className="vb-cta vb-pill mt-8 bg-[var(--dawn)] px-8 py-4 text-[16px] font-black text-white">
        登る山（会社）を選ぶ
      </button>
    </section>
  );
}

/* ---------- 3. 会社 ---------- */
function Company({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section className="pt-8 sm:pt-12">
      <h2 className="text-[28px] sm:text-[38px]">どの山に登りますか。</h2>
      <p className="mt-2 text-[15px] text-[var(--ink2)]">会社ごとに、高くなりやすい山・なりにくい山が違います。2社とも架空です。</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2" data-h="companies">
        {data.companies.map((c) => {
          const on = m.companyId === c.id;
          const shape = data.abilities.map((a) => (c.grows.includes(a) ? 6.2 : c.hard.includes(a) ? 1.5 : 3.6));
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => m.setCompanyId(c.id)}
              className={`vb-card overflow-hidden text-left transition-all ${on ? "ring-4 ring-[var(--dawn)]" : "hover:-translate-y-0.5"}`}
            >
              <div className="bg-gradient-to-b from-[#d9ecfb] to-[#fff5e8] pt-6">
                <Range id={`co-${c.id}`} levels={shape} grades={shape.map((s) => (s > 5 ? "↑" : s < 2 ? "↓" : "・"))} />
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-[22px] font-black">{c.name}</h3>
                <p className="text-[13.5px] font-bold text-[var(--ink2)]">
                  {c.kind}／{c.size}
                </p>
                <p className="mt-3 text-[15px] leading-7">{c.style}</p>
                <p className="mt-3 text-[14px]">
                  <b className="text-[var(--deep)]">高くなりやすい</b>　{c.grows.join("・")}
                </p>
                <p className="text-[14px]">
                  <b className="text-[#b5532c]">なりにくい</b>　{c.hard.join("・")}
                </p>
                <ul className="mt-4 grid gap-1 border-t border-[#e3ebf1] pt-3 text-[13.5px] leading-6">
                  {c.people.map((p) => (
                    <li key={p.name}>
                      <b>
                        {p.role} {p.name}
                      </b>
                      ：{p.trait}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => m.go("run")} className="vb-cta vb-pill mt-8 bg-[var(--dawn)] px-8 py-4 text-[16px] font-black text-white">
        {m.company.name}で、10年を試走する
      </button>
    </section>
  );
}

/* ---------- 4. 試走 ---------- */
function Run({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const c = getCompany(companyId);
  const { t, done } = useRunClock(true, 10000);
  const tps = data.timepoints.slice(1);
  const W = 960;
  const H = 400;
  // 5本の登山道（同じ麓から、少しずつ違う道で山頂へ）
  const trails = c.runs.map((r, i) => {
    const sx = 80 + i * 18;
    const ex = 540 + (i - 2) * 120;
    const ey = 70 + Math.abs(i - 2) * 26;
    return `M${sx},${H - 40} C ${sx + 160},${H - 90 - i * 10} ${ex - 220 + i * 30},${ey + 160} ${ex},${ey}`;
  });
  const refs = useRef<(SVGPathElement | null)[]>([]);
  const [pos, setPos] = useState<{ x: number; y: number }[]>([]);
  useEffect(() => {
    setPos(
      refs.current.map((p, i) => {
        if (!p) return { x: 0, y: 0 };
        const prog = Math.max(0, Math.min(1, t * 1.12 - i * 0.03));
        const pt = p.getPointAtLength(p.getTotalLength() * prog);
        return { x: pt.x, y: pt.y };
      }),
    );
  }, [t]);
  const stage = Math.min(4, Math.floor(t * 5));
  const tl = c.timeline[stage + 1];
  const sky = `linear-gradient(180deg, color-mix(in srgb, #ffb38a ${Math.round((1 - t) * 70)}%, #9fd0f6) 0%, #fff4e6 100%)`;

  return (
    <section className="pt-8 sm:pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[26px] sm:text-[36px]">
          {done ? (
            <>
              <span className="w">5本とも、</span>
              <span className="w">10年後に着きました。</span>
            </>
          ) : (
            <>
              <span className="w">5本の道を、</span>
              <span className="w">同時に登っています。</span>
            </>
          )}
        </h2>
        <p className="num text-[15px] font-bold text-[var(--ink2)]">
          {c.name}　{Math.round(t * 100)}%
        </p>
      </div>
      <div className="relative mt-5 overflow-hidden rounded-[28px]" style={{ background: sky }} data-h="runs">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[620px]" role="img" aria-label="5本の試走が山を登る様子">
            <g className="vb-cloud" opacity=".7">
              <ellipse cx="120" cy="70" rx="60" ry="16" fill="#fff" />
              <ellipse cx="160" cy="60" rx="40" ry="14" fill="#fff" />
            </g>
            <path d="M0,400 L0,250 C120,210 220,140 330,150 C430,160 470,40 560,50 C660,60 700,170 800,150 C880,135 920,190 960,210 L960,400 Z" fill="#7fb3a6" />
            <path d="M0,400 L0,320 C160,280 300,300 420,270 C560,235 700,290 960,260 L960,400 Z" fill="#2f6b5f" />
            {/* 時点の標高（キャンプ） */}
            {tps.map((tp, k) => {
              const y = H - 70 - k * 66;
              return (
                <g key={tp.id} opacity={stage >= k || done ? 1 : 0.35}>
                  <line x1="0" x2={W} y1={y} y2={y} stroke="#17302b" strokeOpacity=".12" strokeDasharray="2 6" />
                  <text x={W - 12} y={y - 6} textAnchor="end" fontSize="14" fontWeight="900" fill="#17302b" fontFamily="var(--font-zen)">
                    {tp.label}
                  </text>
                </g>
              );
            })}
            {trails.map((d, i) => (
              <path key={i} ref={(el) => { refs.current[i] = el; }} d={d} fill="none" stroke="#fffdf9" strokeWidth="2.5" className="vb-trail" opacity=".9" />
            ))}
            {pos.map((p, i) => {
              const k = Math.min(4, Math.floor(Math.max(0, t * 1.12 - i * 0.03) * 5));
              const rk = c.runs[i].risk[k];
              return (
                <g key={i} transform={`translate(${p.x},${p.y})`}>
                  {rk === "高" && t > 0.05 && (
                    <g transform="translate(-16,-44)">
                      <ellipse cx="16" cy="10" rx="20" ry="9" fill="#8193b5" />
                      <line x1="8" y1="20" x2="5" y2="28" stroke="#5b73a8" strokeWidth="2" />
                      <line x1="18" y1="20" x2="15" y2="28" stroke="#5b73a8" strokeWidth="2" />
                    </g>
                  )}
                  <circle r="11" fill="#ff7a45" stroke="#fff" strokeWidth="3" />
                  <text y="4.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="var(--font-brico)">
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
        <div key={stage} className="vb-card vb-pop p-5" aria-live="polite">
          <p className="text-[13px] font-bold text-[var(--ink2)]">いま通過中：{tps[stage].label}</p>
          <p className="mt-1 text-[17px] leading-8 font-bold">{tl.events[0]}</p>
          <p className="mt-1 text-[14px] text-[var(--ink2)]">
            {WEATHER[tl.risk].icon} 辞めたくなる度合い：{tl.risk}（5本中{"freq" in tl ? tl.freq : 5}本）
          </p>
        </div>
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={onDone}
            disabled={!done}
            className={`vb-pill px-8 py-4 text-[16px] font-black ${done ? "vb-cta bg-[var(--dawn)] text-white" : "bg-white/70 text-[var(--ink2)]"}`}
          >
            {done ? "山頂からの景色を見る" : "登っています…"}
          </button>
          {!done && (
            <button type="button" onClick={onDone} className="text-[13px] font-bold text-[var(--ink2)] underline underline-offset-4">
              結果へ
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. 結果 ---------- */
function Result({ companyId, onCompare }: { companyId: string; onCompare: () => void }) {
  const c = getCompany(companyId);
  const reduced = usePrefersReducedMotion();
  const [tp, setTp] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);

  // 入社から順に山が育つ（見せ場）。3年後（分かれ道）で止まる
  useEffect(() => {
    if (!playing) return;
    const wait = reduced || tp >= 4 ? 0 : tp === 0 ? 700 : 1300;
    const id = window.setTimeout(() => {
      if (reduced) {
        setTp(4);
        setPlaying(false);
      } else if (tp >= 4) setPlaying(false);
      else setTp((x) => x + 1);
    }, wait);
    return () => clearTimeout(id);
  }, [tp, playing, reduced]);

  const tl = c.timeline[tp];
  const prev = c.timeline[Math.max(0, tp - 1)];
  const w = WEATHER[tl.risk];

  return (
    <section className="pt-8 sm:pt-12">
      <h2 className="text-[28px] sm:text-[40px]">
        <span className="w">毎日の小さな差が、</span>
        <span className="w">10年で山になる。</span>
      </h2>
      <p className="mt-2 text-[14.5px] text-[var(--ink2)]">
        {c.name}での5本の試走から、よく起きた筋書き。予測ではなくシナリオです。山を押すと、高さの理由が出ます。
      </p>

      <div className="vb-card mt-6 overflow-hidden p-0" data-h="abilities">
        <div className="flex flex-wrap items-center gap-2 px-5 pt-5">
          {data.timepoints.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => {
                setPlaying(false);
                setTp(i);
              }}
              aria-pressed={tp === i}
              className={`vb-pill px-3.5 py-1.5 text-[14px] font-bold transition-colors ${tp === i ? "bg-[var(--ink)] text-white" : "bg-[#edf3f7] text-[var(--ink2)]"}`}
            >
              {x.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setTp(0);
              setPlaying(true);
            }}
            className="ml-auto text-[13px] font-bold text-[var(--dawn)] underline underline-offset-4"
          >
            ▶ 入社からもう一度
          </button>
        </div>
        <div className="mt-2 overflow-x-auto bg-gradient-to-b from-[#d6ebfb] to-[#fff4e6]">
          <div className="min-w-[640px]">
            <Range id="res" levels={levelsOf(tl.grades)} ghost={tp > 0 ? levelsOf(prev.grades) : undefined} grades={tl.grades} selected={pick} onPick={setPick} />
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-2 px-5 py-4 text-[14px] sm:grid-cols-2">
          {pick === null ? (
            <p className="text-[var(--ink2)] sm:col-span-2">
              うすい青は一つ前の時点の山。旗の文字（S〜G）は、あなたが選んだ目標にどこまで近づいたかです。山頂が白いのはA以上。
            </p>
          ) : (
            <p className="sm:col-span-2">
              <b className="text-[16px]">
                {data.abilities[pick]}　<span className="num">{tl.grades[pick]}</span>
              </b>
              　{c.finalReasons[pick]}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="vb-card p-6" data-h="timeline">
          <p className="text-[13px] font-bold text-[var(--ink2)]">
            {data.timepoints[tp].label}に起きたこと{"freq" in tl ? `（5本中${tl.freq}本）` : ""}
          </p>
          <ul className="mt-2 grid gap-2">
            {tl.events.map((e) => (
              <li key={e} className="vb-pop text-[17px] leading-8 font-bold">
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-2xl bg-[#eef6f3] px-4 py-3 text-[15px] leading-7">
            <b className="text-[var(--deep)]">分身は</b>　{tl.action}
          </p>
        </div>
        <div className="vb-card flex flex-col p-6" data-h="risk" style={{ background: w.bg }}>
          <p className="text-[13px] font-bold" style={{ color: w.c }}>
            辞めたくなる度合い
          </p>
          <p className="mt-1 flex items-baseline gap-3">
            <span className="text-[44px] leading-none" aria-hidden>
              {w.icon}
            </span>
            <span className="text-[34px] font-black" style={{ color: w.c }}>
              {tl.risk}
            </span>
            <span className="text-[14px] font-bold" style={{ color: w.c }}>
              （{w.word}）
            </span>
          </p>
          <p className="mt-3 text-[15px] leading-7">{tl.riskReason}</p>
          <div className="mt-auto flex gap-1 pt-4" aria-label="時点ごとの空模様">
            {c.timeline.slice(1).map((x, k) => (
              <span key={x.tp} className="flex flex-1 flex-col items-center rounded-xl bg-white/60 py-1.5 text-[11px] font-bold">
                <span className="text-[16px]">{WEATHER[x.risk].icon}</span>
                {data.timepoints[k + 1].short}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 分かれ道 */}
      <div className="vb-card mt-5 p-6" data-h="branches">
        <h3 className="text-[22px] font-black">3年後の分かれ道</h3>
        <p className="mt-1 text-[14px] text-[var(--ink2)]">残る道も、理由を持って移る道もある。1本は、まったく違う業界へ続く道です。</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {c.branches.map((b) => {
            const col = b.type === "stay" ? "#2e6a5e" : b.type === "move" ? "#2f6fb5" : "#c0562c";
            return (
              <article key={b.title} className="rounded-2xl border-2 bg-white/80 p-5" style={{ borderColor: col }}>
                <p className="flex items-center justify-between text-[12.5px] font-bold" style={{ color: col }}>
                  <span>{b.type === "stay" ? "残る" : b.type === "move" ? "移る" : "違う業界へ"}</span>
                  <span className="num">5本中{b.count}本</span>
                </p>
                <h4 className="mt-1 text-[17px] leading-7 font-black">{b.title.replace(/^理由を持って移る：|^違う業界へ：/, "")}</h4>
                <ol className="mt-3 grid gap-1.5 border-l-2 border-dashed pl-3 text-[13.5px] leading-6" style={{ borderColor: col }}>
                  {b.path.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
                <p className="mt-3 text-[13.5px] leading-6 text-[var(--ink2)]">{b.why}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="vb-card p-6" data-h="boss">
          <h3 className="text-[19px] font-black">上司・同僚の情報を入れると、見える道が変わる</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[c.bossCompare.without, c.bossCompare.with].map((x, i) => (
              <div key={x.label} className={`rounded-2xl p-4 ${i === 1 ? "bg-[#e7f3ef]" : "bg-[#f1f4f7]"}`}>
                <p className="text-[14px] font-black">{x.label}</p>
                <ul className="mt-2 grid gap-1.5 text-[13.5px] leading-6">
                  {x.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[12.5px] text-[var(--ink2)]">見落とし：{x.missing}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-6 text-[var(--ink2)]">{c.bossCompare.note}</p>
        </div>
        <div className="vb-card p-6" data-h="ask">
          <h3 className="text-[19px] font-black">面接で確かめたいこと</h3>
          <ul className="mt-3 grid gap-2.5">
            {c.questionsToAsk.map((q) => (
              <li key={q} className="flex gap-3 text-[15px] leading-7">
                <span className="mt-2.5 block h-2 w-2 shrink-0 rounded-full bg-[var(--dawn)]" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onCompare} className="vb-cta vb-pill bg-[var(--dawn)] px-8 py-4 text-[16px] font-black text-white">
          もう1つの山と重ねて比べる
        </button>
        <p className="max-w-[46ch] text-[13px] leading-6 text-[var(--ink2)]">{data.meta.notice}</p>
      </div>
    </section>
  );
}

/* ---------- 6. 比べる ---------- */
function Compare({ onBack }: { onBack: () => void }) {
  const [a, b] = data.companies;
  const [tp, setTp] = useState(5);
  const la = useMemo(() => levelsOf(a.timeline[tp].grades), [a, tp]);
  const lb = useMemo(() => levelsOf(b.timeline[tp].grades), [b, tp]);
  return (
    <section className="pt-8 sm:pt-12" data-h="compare">
      <h2 className="text-[28px] sm:text-[40px]">{data.compare.headline}</h2>
      <p className="mt-2 text-[14.5px] text-[var(--ink2)]">緑が{a.name}、オレンジが{b.name}。同じあなたでも、育つ山が違います。</p>
      <div className="vb-card vb-range mt-6 overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-4 px-5 pt-5">
          <label className="flex flex-1 items-center gap-3 text-[14px] font-bold">
            時点
            <input type="range" min={0} max={5} value={tp} onChange={(e) => setTp(Number(e.target.value))} className="flex-1" aria-valuetext={data.timepoints[tp].label} />
            <span className="w-16">{data.timepoints[tp].label}</span>
          </label>
          <span className="flex items-center gap-2 text-[13px] font-bold">
            <i className="block h-3 w-3 rounded-full bg-[#2e6a5e]" />
            {a.name}
            <i className="ml-2 block h-3 w-3 rounded-full bg-[#ef8a5e]" />
            {b.name}
          </span>
        </div>
        <div className="mt-2 overflow-x-auto bg-gradient-to-b from-[#d6ebfb] to-[#fff4e6]">
          <div className="min-w-[640px]">
            <Range id="cmp" levels={la} other={lb} grades={a.timeline[tp].grades} />
          </div>
        </div>
      </div>
      <div className="vb-card mt-5 overflow-hidden">
        <div className="hidden grid-cols-[11rem_1fr_1fr] bg-[#eef4f8] px-5 py-3 text-[13px] font-black md:grid">
          <span />
          <span className="text-[#2e6a5e]">{a.name}</span>
          <span className="text-[#c0562c]">{b.name}</span>
        </div>
        {data.compare.rows.map((r) => (
          <div key={r.label} className="grid gap-1 border-t border-[#e6edf2] px-5 py-3 md:grid-cols-[11rem_1fr_1fr] md:gap-4">
            <p className="text-[13px] font-bold text-[var(--ink2)]">{r.label}</p>
            <p className="text-[15px] leading-7">
              <span className="mr-2 text-[12px] font-black text-[#2e6a5e] md:hidden">あおば</span>
              {r.aoba}
            </p>
            <p className="text-[15px] leading-7">
              <span className="mr-2 text-[12px] font-black text-[#c0562c] md:hidden">みどり</span>
              {r.midori}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-[var(--ink2)]">{data.compare.note}</p>
      <button type="button" onClick={onBack} className="vb-pill mt-6 border-2 border-[var(--ink)] px-6 py-3 text-[15px] font-black">
        ← 結果に戻る
      </button>
    </section>
  );
}
