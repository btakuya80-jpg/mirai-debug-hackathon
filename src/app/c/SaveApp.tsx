"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { FEATURES, HELP, SCREEN_NOTE } from "@/lib/help";
import { data, gradeIndex, getCompany, STEPS, STEP_LABEL, useMirai, useRunClock, usePrefersReducedMotion, type Risk } from "@/lib/mirai";
import Sprite from "./Sprite";

const RISK_C: Record<string, string> = { 低: "#3dd6c0", 中: "#ffcc33", 高: "#ff6fa5" };
const PLAY = ["0日", "1か月", "3か月", "1年", "3年", "10年"];

/** 文字が1つずつ出る（メッセージ窓） */
function useTypewriter(text: string, speed = 28) {
  const reduced = usePrefersReducedMotion();
  const [s, setS] = useState({ text, n: 0 });
  if (s.text !== text) setS({ text, n: 0 }); // 文が変わったら最初から
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setS((x) => (x.n >= x.text.length ? x : { ...x, n: x.n + 1 }));
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduced]);
  return reduced ? text : text.slice(0, s.n);
}

export default function SaveApp() {
  const m = useMirai();
  return (
    <div className="vc">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 pt-4 sm:px-6">
        <Link href="/" className="dot text-[14px] text-[var(--ink2)] hover:text-[var(--ink)]">
          ◀ 3案に戻る
        </Link>
        <span className="dot text-[18px]">未来デバッグ</span>
        <nav className="ml-auto flex flex-wrap gap-1.5" aria-label="進み具合">
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => m.go(s)}
              aria-current={s === m.step}
              className={`dot rounded-sm border-2 border-[var(--ink)] px-2 py-0.5 text-[12px] ${s === m.step ? "bg-[var(--ink)] text-white" : "bg-white/70"}`}
            >
              {STEP_LABEL[s]}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        {m.step === "job" && <Job onRun={() => m.go("input")} />}
        {m.step === "input" && <Input m={m} />}
        {m.step === "company" && <Company m={m} />}
        {m.step === "run" && <Run key={m.companyId} companyId={m.companyId} onDone={() => m.go("result")} />}
        {m.step === "result" && <Result companyId={m.companyId} onCompare={() => m.go("compare")} />}
        {m.step === "compare" && <Compare onBack={() => m.go("result")} />}
      </main>
      <p className="dot pb-6 text-center text-[12px] text-[var(--ink2)]">{data.meta.sampleNote}</p>

      <InfoWindow
        screen={`C案／${STEP_LABEL[m.step]}`}
        screenNote={SCREEN_NOTE[m.step]}
        items={HELP}
        features={FEATURES}
        accent="#ff6fa5"
        onBeforeFlash={(it) => {
          const h = HELP.find((x) => x.id === it.id);
          if (h && h.step !== m.step) m.go(h.step);
        }}
      />
    </div>
  );
}

function Btn({ children, onClick, tone = "gold", disabled }: { children: React.ReactNode; onClick: () => void; tone?: "gold" | "pink" | "white"; disabled?: boolean }) {
  const bg = tone === "gold" ? "bg-[var(--gold)]" : tone === "pink" ? "bg-[var(--pink)] text-white" : "bg-white";
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`vc-btn dot inline-flex items-center gap-2 px-5 py-3 text-[16px] ${bg} disabled:opacity-50`}>
      {children}
    </button>
  );
}

/* ---------- 1. 求人（クエスト掲示板） ---------- */
function Job({ onRun }: { onRun: () => void }) {
  const j = data.job;
  return (
    <section className="grid items-start gap-8 md:grid-cols-[1fr_300px]">
      <article className="vc-win p-6 sm:p-8">
        <p className="dot text-[13px] text-[var(--ink2)]">求人の掲示板 ／ {j.area}</p>
        <h1 className="dot mt-2 text-[26px] leading-snug sm:text-[34px]">{j.title}</h1>
        <dl className="dot mt-5 grid grid-cols-[5.5rem_1fr] gap-y-2 text-[15px]">
          <dt className="text-[var(--ink2)]">依頼主</dt>
          <dd>{j.company}</dd>
          <dt className="text-[var(--ink2)]">報酬</dt>
          <dd>{j.salary}</dd>
          <dt className="text-[var(--ink2)]">時間</dt>
          <dd>{j.hours}</dd>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          {j.tags.map((t) => (
            <span key={t} className="dot rounded-sm border-2 border-[var(--ink)] bg-[#f3efff] px-2 text-[12.5px]">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-5 grid gap-3 text-[15.5px] leading-8">
          {j.body.map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>
      </article>
      <aside className="vc-win-dark vc-stars flex flex-col items-center gap-4 p-6 text-center" data-h="cta">
        <Sprite size={92} className="vc-bob" />
        <p className="dot text-[16px] leading-7">
          この依頼を受ける前に、
          <br />
          あなたの分身で
          <br />
          10年ぶん遊んでみる。
        </p>
        <Btn onClick={onRun}>
          <span className="vc-cursor">▶</span>入社後を試運転する
        </Btn>
        <p className="dot text-[12px] text-[#c9c2ff]">セーブデータを5つ作ります</p>
      </aside>
    </section>
  );
}

/* ---------- 2. キャラクター作成 ---------- */
function Input({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="vc-win-dark vc-stars flex flex-col items-center gap-3 self-start p-5 md:sticky md:top-6">
        <p className="dot text-[14px]">あなたの分身</p>
        <Sprite size={120} className="vc-bob" />
        <p className="dot text-[13px] text-[#c9c2ff]">
          せってい {m.answered}/10　{m.area}
        </p>
        <div className="flex w-full gap-1">
          {data.questions.map((q, i) => (
            <span key={q.id} className="h-2 flex-1" style={{ background: i < m.answered ? "var(--gold)" : "#4b4380" }} />
          ))}
        </div>
      </aside>
      <div>
        <h2 className="dot text-[24px] sm:text-[30px]">キャラクターをつくる</h2>
        <p className="mt-1 text-[14px] text-[var(--ink2)]">選ぶだけで5分。いまは見本の回答が入っています。</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2" data-h="questions">
          {data.questions.map((q, i) => (
            <fieldset key={q.id} className="vc-win p-4">
              <legend className="sr-only">{q.text}</legend>
              <p className="dot text-[15px]">
                <span className="text-[var(--pink)]">Q{i + 1}</span> {q.text}
              </p>
              <ul className="mt-2 grid gap-0.5 sm:grid-cols-2">
                {q.options.map((o) => {
                  const on = m.isOn(q.id, o);
                  return (
                    <li key={o}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => m.toggle(q.id, o)}
                        className={`dot flex w-full items-center gap-1.5 px-1.5 py-1 text-left text-[14px] ${on ? "bg-[#fff1b8]" : "hover:bg-[#f3efff]"}`}
                      >
                        <span className={on ? "text-[var(--ink)]" : "text-transparent"}>▶</span>
                        {o}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
          <label className="vc-win p-4" data-h="area">
            <span className="dot text-[15px]">
              <span className="text-[var(--pink)]">★</span> すむ地域
            </span>
            <span className="mt-1 block text-[12.5px] text-[var(--ink2)]">あとで、通える範囲の求人を出すために使います。</span>
            <select value={m.area} onChange={(e) => m.setArea(e.target.value)} className="dot mt-2 block border-2 border-[var(--ink)] bg-white px-2 py-1 text-[14px]">
              {data.areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6">
          <Btn onClick={() => m.go("company")}>
            <span className="vc-cursor">▶</span>けってい（会社を選ぶ）
          </Btn>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. ステージ選択 ---------- */
function Company({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <h2 className="dot text-[24px] sm:text-[30px]">ステージをえらぶ</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">会社も登場人物も、すべて架空です。</p>
      <div className="mt-5 grid gap-6 md:grid-cols-2" data-h="companies">
        {data.companies.map((c, ci) => {
          const on = m.companyId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => m.setCompanyId(c.id)}
              className={`vc-win block overflow-hidden p-0 text-left ${on ? "outline-4 outline-offset-4 outline-[var(--pink)]" : ""}`}
            >
              <div className="vc-stars flex items-end justify-between px-5 pt-5 pb-3" style={{ background: ci === 0 ? "#6aa8ff" : "#3dd6c0" }}>
                <p className="dot text-[13px] text-white">ステージ {ci + 1}</p>
                <div className="flex gap-1">
                  {c.people.map((p) => (
                    <span key={p.name} className="dot rounded-sm bg-white/90 px-1.5 text-[11px]">
                      {p.role}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h3 className="dot text-[22px]">
                  {on && <span className="vc-cursor mr-1">▶</span>}
                  {c.name}
                </h3>
                <p className="text-[13px] text-[var(--ink2)]">
                  {c.kind}／{c.size}
                </p>
                <p className="mt-3 text-[14.5px] leading-7">{c.style}</p>
                <p className="dot mt-3 text-[13.5px]">
                  <span className="text-[#159c88]">▲ のびやすい</span> {c.grows.join("・")}
                </p>
                <p className="dot text-[13.5px]">
                  <span className="text-[#d23f74]">▼ のびにくい</span> {c.hard.join("・")}
                </p>
                <ul className="mt-3 grid gap-1 border-t-2 border-dashed border-[#cfc8f5] pt-3 text-[13px] leading-6">
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
      <div className="mt-6">
        <Btn onClick={() => m.go("run")} tone="pink">
          <span className="vc-cursor">▶</span>{m.company.name}ではじめる
        </Btn>
      </div>
    </section>
  );
}

/* ---------- 4. 試走（セーブデータを作っている） ---------- */
function Run({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const c = getCompany(companyId);
  const { t, done } = useRunClock(true, 9500);
  const stage = Math.min(4, Math.floor(t * 5));
  const tl = c.timeline[stage + 1];
  const msg = useTypewriter(`${data.timepoints[stage + 1].label}。${tl.events[0]}`, 26);

  return (
    <section>
      <h2 className="dot text-[24px] sm:text-[30px]">{done ? "セーブデータが5つできました" : <><span className="w">5つのセーブデータを</span><span className="w">同時に作っています</span></>}</h2>
      <div className="vc-win-dark vc-stars mt-5 overflow-hidden p-5">
        {/* 歩く分身 */}
        <div className="relative h-[110px] border-b-4 border-[#8a7fd6]">
          {data.timepoints.slice(1).map((tp, k) => (
            <div key={tp.id} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${10 + k * 19}%` }}>
              <span className="dot mb-1 text-[11px] text-[#c9c2ff]">{tp.short}</span>
              <span className="block h-7 w-1" style={{ background: stage >= k || done ? "var(--gold)" : "#4b4380" }} />
            </div>
          ))}
          <div className="absolute bottom-1 transition-[left] duration-200 ease-linear" style={{ left: `calc(${4 + t * 82}% - 20px)` }}>
            <Sprite level={stage + 1} mood={tl.risk as Risk} size={44} className="vc-bob" />
          </div>
        </div>
        <p className="dot mt-4 min-h-[3.2em] text-[15px] leading-7" aria-live="polite">
          {msg}
          {!done && <span className="vc-cursor"> ▼</span>}
        </p>
      </div>

      <div className="mt-5 grid gap-3" data-h="runs">
        {c.runs.map((r, i) => {
          const p = Math.max(0, Math.min(1, t * 1.12 - i * 0.03));
          const filled = Math.floor(p * 20);
          return (
            <div key={r.id} className="vc-win grid items-center gap-3 p-3 sm:grid-cols-[7rem_1fr_9rem]">
              <p className="dot text-[14px]">ファイル {r.id}</p>
              <div className="flex gap-[3px]" aria-label={`進み具合 ${Math.round(p * 100)}%`}>
                {Array.from({ length: 20 }).map((_, k) => {
                  const seg = Math.min(4, Math.floor(k / 4));
                  return <span key={k} className="h-4 flex-1" style={{ background: k < filled ? RISK_C[r.risk[seg]] : "#e6e1fb" }} />;
                })}
              </div>
              <p className="dot text-[12.5px] text-[var(--ink2)]">{p >= 1 ? "セーブ完了" : `プレイ時間 ${PLAY[Math.min(5, Math.floor(p * 5) + 1)]}`}</p>
            </div>
          );
        })}
        <p className="dot flex flex-wrap gap-4 text-[12px] text-[var(--ink2)]">
          ゲージの色＝辞めたくなる度合い
          <span style={{ color: "#159c88" }}>■ 低</span>
          <span style={{ color: "#b88a00" }}>■ 中</span>
          <span style={{ color: "#d23f74" }}>■ 高</span>
        </p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Btn onClick={onDone} disabled={!done}>
          <span className="vc-cursor">▶</span>
          {done ? "セーブデータを見る" : "よみこみ中…"}
        </Btn>
        {!done && (
          <button type="button" onClick={onDone} className="dot text-[13px] text-[var(--ink2)] underline underline-offset-4">
            スキップ
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------- 5. 結果（セーブデータを選ぶ） ---------- */
function Result({ companyId, onCompare }: { companyId: string; onCompare: () => void }) {
  const c = getCompany(companyId);
  const [slot, setSlot] = useState(4);
  const [open, setOpen] = useState<number | null>(null);
  const tl = c.timeline[slot];
  const prev = c.timeline[Math.max(0, slot - 1)];
  const msg = useTypewriter(tl.events.join("　"), 22);
  const top = Math.max(...tl.grades.map(gradeIndex));

  return (
    <section>
      <h2 className="dot text-[24px] sm:text-[30px]">セーブデータをえらんでください</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">{c.name}での5本の試走から、よく起きた筋書き。予測ではなくシナリオです。</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* セーブスロット */}
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {c.timeline.map((x, i) => (
            <li key={x.tp}>
              <button
                type="button"
                onClick={() => {
                  setSlot(i);
                  setOpen(null);
                }}
                aria-pressed={slot === i}
                className={`vc-win grid w-full grid-cols-[44px_1fr] items-center gap-3 p-2.5 text-left ${slot === i ? "bg-[#fff1b8]" : ""}`}
              >
                <span className="flex h-11 w-11 items-center justify-center bg-[#2a2350]">
                  <Sprite level={i} mood={x.risk as Risk} size={30} />
                </span>
                <span>
                  <span className="dot flex items-center justify-between text-[14.5px]">
                    {slot === i && <span className="vc-cursor">▶</span>}
                    <span className="flex-1 pl-1">{data.timepoints[i].label}</span>
                    {"fork" in x && x.fork && <span className="text-[11px] text-[var(--pink)]">分かれ道</span>}
                  </span>
                  <span className="dot block text-[11.5px] text-[var(--ink2)]">
                    プレイ時間 {PLAY[i]}　
                    <span style={{ color: x.risk === "高" ? "#d23f74" : x.risk === "中" ? "#9a7400" : "#159c88" }}>辞めたくなる {x.risk}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        {/* ステータス */}
        <div key={slot} className="vc-flash grid gap-5">
          <div className="vc-win grid gap-5 p-5 sm:grid-cols-[150px_1fr]" data-h="abilities">
            <div className="vc-win-dark vc-stars relative flex flex-col items-center justify-center p-3">
              <Sprite level={slot} mood={tl.risk as Risk} star={top >= 6} size={110} className="vc-bob" />
              {slot > 0 && (
                <span className="vc-levelup dot absolute top-2 text-[13px] text-[var(--gold)]" aria-hidden>
                  レベルアップ！
                </span>
              )}
              <p className="dot mt-2 text-[12px] text-[#c9c2ff]">{data.timepoints[slot].label}のあなた</p>
            </div>
            <div>
              <p className="dot text-[15px]">ステータス（目標への近さ）</p>
              <ul className="mt-2 grid gap-1">
                {data.abilities.map((a, k) => {
                  const g = gradeIndex(tl.grades[k]);
                  const d = g - gradeIndex(prev.grades[k]);
                  return (
                    <li key={a}>
                      <button
                        type="button"
                        onClick={() => setOpen(open === k ? null : k)}
                        aria-expanded={open === k}
                        className="dot grid w-full grid-cols-[6.5rem_1fr_1.4rem_2rem] items-center gap-2 text-left text-[13.5px] hover:bg-[#f3efff]"
                      >
                        <span className="truncate">{a}</span>
                        <span className="flex gap-[2px]">
                          {Array.from({ length: 8 }).map((_, s) => (
                            <span key={s} className="h-3 flex-1" style={{ background: s <= g ? (s >= 6 ? "var(--gold)" : "var(--sky)") : "#e6e1fb" }} />
                          ))}
                        </span>
                        <span className="text-[16px]">{tl.grades[k]}</span>
                        <span className="text-[11px]" style={{ color: d > 0 ? "#159c88" : d < 0 ? "#d23f74" : "#9a95bf" }}>
                          {d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : "－"}
                        </span>
                      </button>
                      {open === k && <p className="px-1 pb-1.5 text-[12.5px] leading-6 text-[var(--ink2)]">なぜ：{c.finalReasons[k]}</p>}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[11.5px] text-[var(--ink2)]">S〜G。人の格付けではありません。項目を押すと理由が出ます。</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
            <div className="vc-win-dark p-5" data-h="timeline">
              <p className="dot text-[13px] text-[#c9c2ff]">
                ぼうけんの記録 ／ {data.timepoints[slot].label}
                {"freq" in tl ? `（5本中${tl.freq}本）` : ""}
              </p>
              <p className="dot mt-2 min-h-[4.8em] text-[15.5px] leading-8">{msg}</p>
              <p className="mt-3 border-t-2 border-dashed border-[#5d5687] pt-3 text-[14px] leading-7">
                <span className="dot text-[var(--gold)]">分身の行動 ▶ </span>
                {tl.action}
              </p>
            </div>
            <div className="vc-win p-5" data-h="risk">
              <p className="dot text-[14px]">辞めたくなる度合い</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {(["低", "中", "高"] as const).map((r) => (
                  <span
                    key={r}
                    className="dot flex h-12 items-center justify-center border-2 border-[var(--ink)] text-[18px]"
                    style={{ background: tl.risk === r ? RISK_C[r] : "#f3efff", color: tl.risk === r ? "#2a2350" : "#b6b0dc" }}
                  >
                    {r}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[14px] leading-7">{tl.riskReason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ルート分岐 */}
      <div className="mt-8" data-h="branches">
        <h3 className="dot text-[22px]">3年後のルート分岐</h3>
        <p className="mt-1 text-[13.5px] text-[var(--ink2)]">残るルートも、理由を持って移るルートもあります。1つは違う業界へ進むルートです。</p>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {c.branches.map((b, i) => {
            const bg = ["#6aa8ff", "#3dd6c0", "#ff6fa5"][i];
            return (
              <article key={b.title} className="vc-win overflow-hidden p-0">
                <p className="dot flex justify-between px-4 py-2 text-[13px]" style={{ background: bg }}>
                  <span>ルート {String.fromCharCode(65 + i)}</span>
                  <span>5本中{b.count}本</span>
                </p>
                <div className="p-4">
                  <h4 className="dot text-[16px] leading-7">{b.title}</h4>
                  <ol className="mt-2 grid gap-1 text-[13px] leading-6">
                    {b.path.map((p) => (
                      <li key={p} className="flex gap-1.5">
                        <span className="dot text-[var(--pink)]">・</span>
                        {p}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 border-t-2 border-dashed border-[#cfc8f5] pt-2 text-[13px] leading-6 text-[var(--ink2)]">{b.why}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <div className="vc-win p-5" data-h="boss">
          <h3 className="dot text-[18px]">なかまの情報 あり／なし</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[c.bossCompare.without, c.bossCompare.with].map((x, i) => (
              <div key={x.label} className="border-2 border-[var(--ink)] p-3" style={{ background: i ? "#e3fbf6" : "#f3efff" }}>
                <p className="dot text-[14px]">{x.label}</p>
                <ul className="mt-1.5 grid gap-1 text-[13px] leading-6">
                  {x.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[12px] text-[var(--ink2)]">見落とし：{x.missing}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] leading-6 text-[var(--ink2)]">{c.bossCompare.note}</p>
        </div>
        <div className="vc-win-dark p-5" data-h="ask">
          <h3 className="dot text-[18px]">もちかえる質問</h3>
          <p className="text-[12.5px] text-[#c9c2ff]">面接で確かめるとよいこと</p>
          <ul className="mt-3 grid gap-2">
            {c.questionsToAsk.map((q) => (
              <li key={q} className="flex gap-2 text-[14px] leading-7">
                <span className="dot text-[var(--gold)]">◆</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Btn onClick={onCompare} tone="pink">
          <span className="vc-cursor">▶</span>2つのファイルをくらべる
        </Btn>
        <p className="max-w-[46ch] text-[12.5px] leading-6 text-[var(--ink2)]">{data.meta.notice}</p>
      </div>
    </section>
  );
}

/* ---------- 6. 比べる ---------- */
function Compare({ onBack }: { onBack: () => void }) {
  const files = data.companies;
  return (
    <section data-h="compare">
      <h2 className="dot text-[24px] sm:text-[30px]">{data.compare.headline}</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {files.map((c, ci) => {
          const last = c.timeline[c.timeline.length - 1];
          return (
            <div key={c.id} className="vc-win p-5">
              <div className="flex items-center gap-4">
                <span className="vc-stars flex h-20 w-20 items-center justify-center bg-[#2a2350]">
                  <Sprite level={5} mood="低" star size={56} className="vc-bob" />
                </span>
                <div>
                  <p className="dot text-[12.5px] text-[var(--ink2)]">ファイル {ci + 1}／プレイ時間 10年</p>
                  <h3 className="dot text-[20px]">{c.name}</h3>
                </div>
              </div>
              <ul className="mt-4 grid gap-1">
                {data.abilities.map((a, k) => {
                  const g = gradeIndex(last.grades[k]);
                  return (
                    <li key={a} className="dot grid grid-cols-[6.5rem_1fr_1.4rem] items-center gap-2 text-[13px]">
                      <span className="truncate">{a}</span>
                      <span className="flex gap-[2px]">
                        {Array.from({ length: 8 }).map((_, s) => (
                          <span key={s} className="h-3 flex-1" style={{ background: s <= g ? (ci ? "var(--mint)" : "var(--sky)") : "#e6e1fb" }} />
                        ))}
                      </span>
                      <span>{last.grades[k]}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex gap-1" aria-label="辞めたくなる度合いの推移">
                {c.timeline.slice(1).map((x, k) => (
                  <span key={x.tp} className="dot flex flex-1 flex-col items-center border-2 border-[var(--ink)] py-1 text-[11px]" style={{ background: RISK_C[x.risk] }}>
                    {x.risk}
                    <span className="text-[10px]">{data.timepoints[k + 1].short}</span>
                  </span>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-[var(--ink2)]">辞めたくなる度合いの推移</p>
            </div>
          );
        })}
      </div>
      <div className="vc-win mt-5 overflow-hidden p-0">
        {data.compare.rows.map((r) => (
          <div key={r.label} className="grid gap-1 border-b-2 border-dashed border-[#cfc8f5] px-4 py-3 last:border-b-0 md:grid-cols-[10rem_1fr_1fr] md:gap-4">
            <p className="dot text-[13px] text-[var(--ink2)]">{r.label}</p>
            <p className="text-[14px] leading-7">
              <span className="dot mr-2 text-[12px] text-[#3d6fd0]">1</span>
              {r.aoba}
            </p>
            <p className="text-[14px] leading-7">
              <span className="dot mr-2 text-[12px] text-[#159c88]">2</span>
              {r.midori}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13.5px] text-[var(--ink2)]">{data.compare.note}</p>
      <div className="mt-6">
        <Btn onClick={onBack} tone="white">
          ◀ セーブデータにもどる
        </Btn>
      </div>
    </section>
  );
}
