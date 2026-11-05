"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { FEATURES, HELP, SCREEN_NOTE } from "@/lib/help";
import { data, gradeIndex, getCompany, STEPS, STEP_LABEL, useMirai, useRunClock, usePrefersReducedMotion } from "@/lib/mirai";

/* F案「出発案内板」：未来の時点が、パタパタ（反転フラップ）で表示される */

const RISK_C: Record<string, string> = { 低: "var(--ok)", 中: "var(--warn)", 高: "var(--stop)" };
const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789";
const SPACE = /[\s　]/;

/** 1文字ずつパタパタとめくれて、目的の文字に止まる */
function Flap({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [s, setS] = useState({ text, step: 0 });
  if (s.text !== text) setS({ text, step: 0 });
  useEffect(() => {
    if (reduced) return;
    const total = text.length + 8;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => setS((x) => (x.step >= total ? x : { ...x, step: x.step + 1 })), 45);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [text, delay, reduced]);
  return (
    <span className={`vf-flap ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => {
        if (SPACE.test(ch)) return <span key={i} className="vf-ch sp" aria-hidden />;
        const done = reduced || s.step >= i + 8;
        const shown = done ? ch : CHARS[(i * 7 + s.step * 13) % CHARS.length];
        return (
          <span key={`${i}-${done ? "d" : s.step}`} className={`vf-ch ${done ? "" : "turn"}`} aria-hidden>
            {shown}
          </span>
        );
      })}
    </span>
  );
}

export default function BoardApp() {
  const m = useMirai();
  return (
    <div className="vf">
      <header className="bg-[var(--board)] text-[var(--text)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="text-[13px] text-[var(--dimt)] hover:text-[var(--text)]">
            ← 案の一覧へ
          </Link>
          <span className="flex items-center gap-3 text-[16px] font-bold">
            <span className="osw rounded bg-[var(--amber)] px-2 text-[14px] text-[var(--board)]">MD</span>
            未来デバッグ 出発案内
          </span>
          <nav className="ml-auto flex flex-wrap gap-1" aria-label="進み具合">
            {STEPS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => m.go(s)}
                aria-current={s === m.step}
                className={`rounded px-2 py-1 text-[12px] ${s === m.step ? "bg-[var(--amber)] font-bold text-[var(--board)]" : "text-[var(--dimt)] hover:text-[var(--text)]"}`}
              >
                {STEP_LABEL[s]}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        {m.step === "job" && <Job onRun={() => m.go("input")} />}
        {m.step === "input" && <Input m={m} />}
        {m.step === "company" && <Company m={m} />}
        {m.step === "run" && <Run key={m.companyId} companyId={m.companyId} onDone={() => m.go("result")} />}
        {m.step === "result" && <Result companyId={m.companyId} onCompare={() => m.go("compare")} />}
        {m.step === "compare" && <Compare onBack={() => m.go("result")} />}
      </main>
      <p className="pb-6 text-center text-[12px] text-[var(--ink2)]">{data.meta.sampleNote}</p>
      <InfoWindow
        screen={`F案／${STEP_LABEL[m.step]}`}
        screenNote={SCREEN_NOTE[m.step]}
        items={HELP}
        features={FEATURES}
        accent="#ffb000"
        onBeforeFlash={(it) => {
          const h = HELP.find((x) => x.id === it.id);
          if (h && h.step !== m.step) m.go(h.step);
        }}
      />
    </div>
  );
}

function Btn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="vf-btn px-6 py-3.5 text-[15px] font-bold">
      {children}
    </button>
  );
}

/* ---------- 1. 求人（出発案内） ---------- */
function Job({ onRun }: { onRun: () => void }) {
  const j = data.job;
  return (
    <section className="grid gap-6">
      <div className="vf-board overflow-x-auto p-4 sm:p-6">
        <div className="min-w-[620px]">
          <div className="vf-head grid grid-cols-[6rem_1fr_1fr_8rem] gap-4 border-b border-[#333] pb-2">
            <span>時刻</span>
            <span>行先</span>
            <span>職種</span>
            <span>案内</span>
          </div>
          <div className="grid grid-cols-[6rem_1fr_1fr_8rem] items-center gap-4 py-3 text-[18px]">
            <span className="osw text-[22px] text-[var(--amber)]">10:00</span>
            <Flap text={j.company} />
            <Flap text="企画・運用" delay={150} />
            <span className="vf-blink text-[15px] text-[var(--ok)]">受付中</span>
          </div>
          <div className="grid grid-cols-[6rem_1fr_1fr_8rem] items-center gap-4 border-t border-[#2c2f36] py-3 text-[18px] opacity-50">
            <span className="osw text-[22px] text-[var(--amber)]">10:30</span>
            <Flap text="仮想 みどり物流" delay={300} />
            <Flap text="センター作業" delay={450} />
            <span className="text-[15px] text-[var(--dimt)]">比べる用</span>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <article className="vf-ticket p-6 sm:p-8">
          <p className="text-[13px] text-[var(--ink2)]">
            {j.company} ／ {j.area}
          </p>
          <h1 className="mt-1 text-[26px] leading-snug font-bold sm:text-[32px]">{j.title}</h1>
          <p className="osw mt-3 text-[17px]">
            {j.salary}　{j.hours}
          </p>
          <div className="mt-4 grid gap-2 text-[15.5px] leading-8">
            {j.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
        </article>
        <aside className="vf-board flex flex-col gap-4 p-6" data-h="cta">
          <p className="text-[17px] leading-8 font-bold">
            出発の前に、
            <br />
            この会社での10年先まで
            <br />
            案内板に出してみる。
          </p>
          <Btn onClick={onRun}>入社後を試運転する</Btn>
          <p className="text-[12px] text-[var(--dimt)]">5便を同時に走らせ、よく着く行先を表示します</p>
        </aside>
      </div>
    </section>
  );
}

/* ---------- 2. 搭乗手続き（入力） ---------- */
function Input({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <h2 className="text-[26px] font-bold sm:text-[32px]">搭乗手続き</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">選ぶだけで5分。いまは見本の回答が入っています。</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2" data-h="questions">
        {data.questions.map((q, i) => (
          <fieldset key={q.id} className="vf-ticket p-5">
            <legend className="sr-only">{q.text}</legend>
            <p className="flex items-baseline gap-3">
              <span className="osw text-[20px] text-[#b97f00]">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15px] font-bold">{q.text}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <button key={o} type="button" aria-pressed={m.isOn(q.id, o)} onClick={() => m.toggle(q.id, o)} className="vf-tile px-3 py-1.5 text-[14px] font-bold">
                  {o}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <label className="vf-ticket p-5" data-h="area">
          <span className="text-[15px] font-bold">住むエリア</span>
          <span className="mt-1 block text-[12.5px] text-[var(--ink2)]">通える範囲の求人を出すために使います。</span>
          <select value={m.area} onChange={(e) => m.setArea(e.target.value)} className="mt-3 block rounded-lg border-2 border-[#c9cdd2] bg-white px-3 py-2 text-[15px] font-bold">
            {data.areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Btn onClick={() => m.go("company")}>手続きを終えて、行先を選ぶ</Btn>
        <span className="osw text-[18px]">{m.answered}/10</span>
      </div>
    </section>
  );
}

/* ---------- 3. 行先（会社）を選ぶ ---------- */
function Company({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <h2 className="text-[26px] font-bold sm:text-[32px]">行先を選ぶ</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">会社も人物もすべて架空です。</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2" data-h="companies">
        {data.companies.map((c, ci) => {
          const on = m.companyId === c.id;
          return (
            <button key={c.id} type="button" aria-pressed={on} onClick={() => m.setCompanyId(c.id)} className={`vf-ticket overflow-hidden text-left ${on ? "ring-4 ring-[var(--amber)]" : ""}`}>
              <div className="vf-board flex items-center justify-between rounded-none px-5 py-4">
                <Flap text={c.name} className="text-[18px]" delay={ci * 200} />
                <span className="osw text-[22px] text-[var(--amber)]">GATE {ci + 1}</span>
              </div>
              <div className="p-5">
                <p className="text-[13px] text-[var(--ink2)]">
                  {c.kind}／{c.size}
                </p>
                <p className="mt-2 text-[14.5px] leading-7">{c.style}</p>
                <p className="mt-2 text-[13.5px]">
                  <b>伸びやすい</b> {c.grows.join("・")}
                </p>
                <p className="text-[13.5px] text-[var(--ink2)]">
                  <b>伸びにくい</b> {c.hard.join("・")}
                </p>
                <ul className="mt-3 grid gap-1 border-t border-dashed border-[#c9cdd2] pt-3 text-[13px] leading-6">
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
      <div className="mt-8">
        <Btn onClick={() => m.go("run")}>{m.company.name}へ出発する</Btn>
      </div>
    </section>
  );
}

/* ---------- 4. 5便が同時に出発 ---------- */
function Run({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const c = getCompany(companyId);
  const { t, done } = useRunClock(true, 9500);
  const tps = data.timepoints.slice(1);
  const stage = Math.min(4, Math.floor(t * 5));
  return (
    <section>
      <h2 className="text-[26px] font-bold sm:text-[32px]">{done ? "5便とも到着しました" : "5便が同時に出発しています"}</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">各時点で表示されるのは、辞めたくなる度合い（低・中・高）です。</p>
      <div className="vf-board mt-5 overflow-x-auto p-4 sm:p-6" data-h="runs">
        <div className="min-w-[620px]">
          <div className="vf-head grid grid-cols-[5rem_repeat(5,1fr)] gap-3 border-b border-[#333] pb-2">
            <span>便</span>
            {tps.map((tp) => (
              <span key={tp.id} className="text-center">
                {tp.label}
              </span>
            ))}
          </div>
          {c.runs.map((r, i) => {
            const p = Math.max(0, Math.min(1, t * 1.15 - i * 0.04));
            return (
              <div key={r.id} className="grid grid-cols-[5rem_repeat(5,1fr)] items-center gap-3 border-b border-[#2c2f36] py-3 last:border-b-0">
                <span className="osw text-[20px] text-[var(--amber)]">MD{String(r.id).padStart(2, "0")}</span>
                {r.risk.map((rk, k) => {
                  const reached = p >= (k + 0.5) / 5;
                  return (
                    <span key={k} className="flex justify-center text-[20px]" style={{ color: reached ? RISK_C[rk] : "var(--dimt)" }}>
                      {reached ? <Flap text={rk} /> : <span className="vf-ch">・</span>}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="vf-board mt-3 overflow-hidden px-4 py-2 text-[14px] text-[var(--amber)]" aria-live="polite">
        <p className="vf-ticker">
          ただいま {tps[stage].label} を通過中　／　{c.timeline[stage + 1].events[0]}　／　辞めたくなる度合い {c.timeline[stage + 1].risk}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Btn onClick={onDone} disabled={!done}>
          {done ? "到着案内を見る" : "運行中…"}
        </Btn>
        {!done && (
          <button type="button" onClick={onDone} className="text-[13px] text-[var(--ink2)] underline underline-offset-4">
            待たずに結果へ
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------- 5. 到着案内（結果） ---------- */
function Result({ companyId, onCompare }: { companyId: string; onCompare: () => void }) {
  const c = getCompany(companyId);
  const [sel, setSel] = useState(4);
  const [open, setOpen] = useState<number | null>(null);
  const tl = c.timeline[sel];
  const last = c.timeline[c.timeline.length - 1];

  return (
    <section>
      <h2 className="text-[26px] font-bold sm:text-[32px]">到着案内　{c.name}</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">5便のうち、よく通った筋書きを表示しています。予測ではなくシナリオです。行を押すと詳しく出ます。</p>

      <div className="vf-board mt-5 overflow-x-auto p-4 sm:p-6" data-h="timeline">
        <div className="min-w-[620px]">
          <div className="vf-head grid grid-cols-[6.5rem_1fr_9.5rem] gap-4 border-b border-[#333] pb-2">
            <span>時点</span>
            <span>出来事</span>
            <span className="text-center">辞めたくなる度合い</span>
          </div>
          {c.timeline.slice(1).map((x, k) => {
            const i = k + 1;
            return (
              <button
                key={x.tp}
                type="button"
                aria-pressed={sel === i}
                onClick={() => setSel(i)}
                className="vf-row grid w-full grid-cols-[6.5rem_1fr_9.5rem] items-center gap-4 border-b border-[#2c2f36] px-1 py-3 text-left last:border-b-0"
              >
                <span className="osw text-[19px] text-[var(--amber)]">{data.timepoints[i].label}</span>
                <Flap text={x.events[0]} delay={k * 180} className="text-[15px]" />
                <span className="flex justify-center text-[20px]" style={{ color: RISK_C[x.risk] }}>
                  <Flap text={x.risk} delay={k * 180 + 300} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div key={sel} className="vf-ticket p-6">
          <p className="osw text-[14px] text-[#b97f00]">{data.timepoints[sel].label}</p>
          <ul className="mt-1 grid gap-1.5">
            {tl.events.map((e) => (
              <li key={e} className="text-[16px] leading-8 font-bold">
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-dashed border-[#c9cdd2] pt-3 text-[15px] leading-7">
            <b>分身は</b>　{tl.action}
          </p>
        </div>
        <div className="vf-board p-6" data-h="risk">
          <p className="vf-head">辞めたくなる度合い</p>
          <p className="mt-2 text-[44px] leading-none font-bold" style={{ color: RISK_C[tl.risk] }}>
            <Flap key={sel} text={tl.risk} />
          </p>
          <p className="mt-3 text-[15px] leading-7">{tl.riskReason}</p>
        </div>
      </div>

      {/* 能力の案内板 */}
      <div className="vf-board mt-5 p-4 sm:p-6" data-h="abilities">
        <p className="vf-head">10年後の力（S〜G。選んだ目標への近さで、人の格付けではありません。押すと理由）</p>
        <ul className="mt-2 grid gap-x-8 md:grid-cols-2">
          {data.abilities.map((a, k) => {
            const g = last.grades[k];
            return (
              <li key={a} className="border-b border-[#2c2f36]">
                <button type="button" onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="grid w-full grid-cols-[1fr_auto] items-center py-2.5 text-left">
                  <span className="text-[15px]">{a}</span>
                  <span className="text-[22px]" style={{ color: gradeIndex(g) >= 6 ? "var(--amber)" : "var(--text)" }}>
                    <Flap text={g} delay={k * 90} />
                  </span>
                </button>
                {open === k && <p className="pb-3 text-[13px] leading-6 text-[var(--dimt)]">なぜ：{c.finalReasons[k]}</p>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* 乗り継ぎ（分かれ道） */}
      <div className="mt-8" data-h="branches">
        <h3 className="text-[22px] font-bold">3年後の乗り継ぎ便</h3>
        <p className="mt-1 text-[13.5px] text-[var(--ink2)]">残る便・理由を持って移る便・まったく違う業界へ行く便。</p>
        <div className="vf-board mt-4 overflow-x-auto p-4 sm:p-6">
          <div className="min-w-[620px]">
            <div className="vf-head grid grid-cols-[6rem_1fr_7rem] gap-4 border-b border-[#333] pb-2">
              <span>種別</span>
              <span>行先と経由</span>
              <span className="text-center">5便のうち</span>
            </div>
            {c.branches.map((b, i) => (
              <div key={b.title} className="grid grid-cols-[6rem_1fr_7rem] items-start gap-4 border-b border-[#2c2f36] py-4 last:border-b-0">
                <span className="text-[14px] font-bold" style={{ color: ["var(--ok)", "var(--amber)", "#7ab8ff"][i] }}>
                  {b.type === "stay" ? "残る" : b.type === "move" ? "移る" : "違う業界へ"}
                </span>
                <div>
                  <Flap text={b.title.replace(/^理由を持って移る：|^違う業界へ：/, "")} delay={i * 250} className="text-[16px]" />
                  <p className="mt-2 text-[13px] leading-6 text-[var(--dimt)]">経由：{b.path.join(" → ")}</p>
                  <p className="mt-1 text-[13px] leading-6">{b.why}</p>
                </div>
                <span className="osw text-center text-[24px] text-[var(--amber)]">{b.count}便</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="vf-ticket p-6" data-h="boss">
          <h3 className="text-[18px] font-bold">上司・同僚の情報で、表示される便が変わる</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[c.bossCompare.without, c.bossCompare.with].map((x, i) => (
              <div key={x.label} className={`rounded-lg p-4 ${i ? "bg-[#fff3d1]" : "bg-[#eef0f2]"}`}>
                <p className="text-[14px] font-bold">{x.label}</p>
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
        <div className="vf-board p-6" data-h="ask">
          <p className="vf-head">ご案内　面接で確かめる質問</p>
          <ul className="mt-3 grid gap-2.5">
            {c.questionsToAsk.map((q) => (
              <li key={q} className="grid grid-cols-[1.2rem_1fr] gap-2 text-[14.5px] leading-7">
                <span className="text-[var(--amber)]">▶</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Btn onClick={onCompare}>2社の案内板を並べる</Btn>
        <p className="max-w-[46ch] text-[13px] leading-6 text-[var(--ink2)]">{data.meta.notice}</p>
      </div>
    </section>
  );
}

/* ---------- 6. 2社の案内板 ---------- */
function Compare({ onBack }: { onBack: () => void }) {
  return (
    <section data-h="compare">
      <h2 className="text-[26px] font-bold sm:text-[32px]">{data.compare.headline}</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {data.companies.map((c, ci) => {
          const last = c.timeline[c.timeline.length - 1];
          return (
            <article key={c.id} className="vf-board p-5">
              <p className="flex items-center justify-between">
                <Flap text={c.name} className="text-[18px]" delay={ci * 200} />
                <span className="osw text-[18px] text-[var(--amber)]">GATE {ci + 1}</span>
              </p>
              <ul className="mt-3">
                {c.timeline.slice(1).map((x, k) => (
                  <li key={x.tp} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3 border-b border-[#2c2f36] py-2 text-[13.5px]">
                    <span className="osw text-[15px] text-[var(--amber)]">{data.timepoints[k + 1].label}</span>
                    <span className="truncate">{x.events[0]}</span>
                    <span className="text-center font-bold" style={{ color: RISK_C[x.risk] }}>
                      {x.risk}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--dimt)]">
                {data.abilities.map((a, k) => (
                  <span key={a} className="whitespace-nowrap">
                    {a} <b className="osw text-[16px] text-[var(--text)]">{last.grades[k]}</b>
                  </span>
                ))}
              </p>
            </article>
          );
        })}
      </div>
      <div className="vf-ticket mt-5 overflow-hidden">
        {data.compare.rows.map((r) => (
          <div key={r.label} className="grid gap-1 border-b border-dashed border-[#c9cdd2] px-5 py-3 last:border-b-0 md:grid-cols-[11rem_1fr_1fr] md:gap-4">
            <p className="text-[13px] font-bold text-[var(--ink2)]">{r.label}</p>
            <p className="text-[14.5px] leading-7">
              <span className="osw mr-2 text-[#b97f00]">1</span>
              {r.aoba}
            </p>
            <p className="text-[14.5px] leading-7">
              <span className="osw mr-2 text-[#b97f00]">2</span>
              {r.midori}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-[var(--ink2)]">{data.compare.note}</p>
      <button type="button" onClick={onBack} className="mt-6 rounded-lg border-2 border-[var(--ink)] px-6 py-3 text-[15px] font-bold">
        ← 到着案内に戻る
      </button>
    </section>
  );
}
