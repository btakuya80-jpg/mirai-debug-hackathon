"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { FEATURES, HELP, SCREEN_NOTE } from "@/lib/help";
import { data, gradeIndex, getCompany, STEPS, STEP_LABEL, useMirai, useRunClock } from "@/lib/mirai";
import RouteMap, { LINE_COLOR, LINE_NAME, routeType, trainPath } from "./RouteMap";

/* E案「キャリア路線図」：時点は駅、分かれ道は乗り換え。5本の列車が同時に走る */

const RISK_INFO: Record<string, { word: string; c: string }> = {
  高: { word: "高", c: "var(--alert)" },
  中: { word: "中", c: "#b07d00" },
  低: { word: "低", c: "var(--stay)" },
};

export default function RouteApp() {
  const m = useMirai();
  const idx = STEPS.indexOf(m.step);
  return (
    <div className="ve">
      <header className="border-b border-[var(--rail)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="text-[13px] font-bold text-[var(--ink2)] hover:text-[var(--ink)]">
            ← 案の一覧へ
          </Link>
          <span className="flex items-center gap-2 text-[16px] font-black">
            <span className="ve-badge text-[12px]" style={{ ["--c" as string]: "var(--main)" }}>
              MD
            </span>
            キャリア路線図
          </span>
          <ol className="ml-auto flex items-center gap-0" aria-label="進み具合">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center">
                {i > 0 && <span className="h-1 w-3 sm:w-5" style={{ background: i <= idx ? "var(--main)" : "var(--rail)" }} />}
                <button
                  type="button"
                  onClick={() => m.go(s)}
                  aria-current={s === m.step}
                  title={STEP_LABEL[s]}
                  className="flex flex-col items-center"
                >
                  <span className="block h-3.5 w-3.5 rounded-full border-[3px]" style={{ borderColor: "var(--main)", background: s === m.step ? "var(--main)" : "#fff" }} />
                  <span className={`mt-0.5 hidden text-[11px] lg:block ${s === m.step ? "font-black" : "text-[var(--ink2)]"}`}>{STEP_LABEL[s]}</span>
                </button>
              </li>
            ))}
          </ol>
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
        screen={`E案／${STEP_LABEL[m.step]}`}
        screenNote={SCREEN_NOTE[m.step]}
        items={HELP}
        features={FEATURES}
        accent="#1f6fd1"
        onBeforeFlash={(it) => {
          const h = HELP.find((x) => x.id === it.id);
          if (h && h.step !== m.step) m.go(h.step);
        }}
      />
    </div>
  );
}

function Go({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="ve-go px-7 py-3.5 text-[15px] font-black disabled:opacity-40">
      {children}
    </button>
  );
}

/* ---------- 1. 求人（駅のポスター） ---------- */
function Job({ onRun }: { onRun: () => void }) {
  const j = data.job;
  const c = getCompany("aoba");
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <article className="ve-card overflow-hidden">
        <div className="ve-band rounded-none" style={{ ["--c" as string]: "var(--main)" }} />
        <div className="p-6 sm:p-8">
          <p className="text-[13px] font-bold text-[var(--ink2)]">
            {j.company} ／ {j.area}
          </p>
          <h1 className="mt-2 text-[28px] leading-snug font-black sm:text-[38px]">{j.title}</h1>
          <dl className="cond mt-4 flex flex-wrap gap-x-8 gap-y-1 text-[17px] font-medium">
            <div>
              <dt className="inline text-[13px] text-[var(--ink2)]">給与 </dt>
              <dd className="inline">{j.salary}</dd>
            </div>
            <div>
              <dt className="inline text-[13px] text-[var(--ink2)]">時間 </dt>
              <dd className="inline">{j.hours}</dd>
            </div>
          </dl>
          <div className="mt-5 grid gap-3 text-[15.5px] leading-8">
            {j.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {j.tags.map((t) => (
              <span key={t} className="rounded-full bg-[var(--bg)] px-3 py-1 text-[12.5px] font-bold">
                {t}
              </span>
            ))}
          </div>
        </div>
      </article>
      <aside className="ve-card flex flex-col gap-4 p-6" data-h="cta">
        <p className="text-[13px] font-bold text-[var(--ink2)]">この会社の路線図（見本）</p>
        <div className="-mx-2">
          <RouteMap c={c} showCounts={false} />
        </div>
        <p className="text-[17px] leading-8 font-black">応募の前に、ここから10年先までの路線を走らせてみる。</p>
        <Go onClick={onRun}>入社後を試運転する</Go>
      </aside>
    </section>
  );
}

/* ---------- 2. 入力（券売機） ---------- */
function Input({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <h2 className="text-[26px] font-black sm:text-[34px]">あなたの切符をつくる</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">選ぶだけで5分。いまは見本の回答が入っています。</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2" data-h="questions">
        {data.questions.map((q, i) => (
          <fieldset key={q.id} className="ve-card p-5">
            <legend className="sr-only">{q.text}</legend>
            <p className="flex items-center gap-3">
              <span className="ve-badge text-[13px]" style={{ ["--c" as string]: "var(--move)" }}>
                Q{i + 1}
              </span>
              <span className="text-[15px] font-black">{q.text}</span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {q.options.map((o) => (
                <button key={o} type="button" aria-pressed={m.isOn(q.id, o)} onClick={() => m.toggle(q.id, o)} className="ve-key px-2 py-2.5 text-[13.5px] font-bold">
                  {o}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <label className="ve-card p-5" data-h="area">
          <span className="flex items-center gap-3">
            <span className="ve-badge text-[13px]" style={{ ["--c" as string]: "var(--stay)" }}>
              駅
            </span>
            <span className="text-[15px] font-black">住むエリア</span>
          </span>
          <span className="mt-1 block text-[12.5px] text-[var(--ink2)]">通える範囲の求人を出すために使います。</span>
          <select value={m.area} onChange={(e) => m.setArea(e.target.value)} className="mt-3 block rounded-lg border-2 border-[var(--rail)] bg-white px-3 py-2 text-[15px] font-bold">
            {data.areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Go onClick={() => m.go("company")}>切符を買って、路線を選ぶ</Go>
        <span className="cond text-[16px] font-bold">{m.answered}/10</span>
      </div>
    </section>
  );
}

/* ---------- 3. 路線（会社）を選ぶ ---------- */
function Company({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <h2 className="text-[26px] font-black sm:text-[34px]">どの会社の路線に乗りますか</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">会社によって、分かれ道の先が変わります。2社とも架空です。</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2" data-h="companies">
        {data.companies.map((c, ci) => {
          const on = m.companyId === c.id;
          return (
            <button key={c.id} type="button" aria-pressed={on} onClick={() => m.setCompanyId(c.id)} className={`ve-card overflow-hidden text-left ${on ? "ring-4 ring-[var(--move)]" : ""}`}>
              <div className="flex items-center gap-3 border-b border-[var(--rail)] px-5 py-3">
                <span className="ve-badge text-[13px]" style={{ ["--c" as string]: ci ? "var(--stay)" : "var(--move)" }}>
                  {ci ? "MD" : "AO"}
                </span>
                <h3 className="text-[20px] font-black">{c.name}</h3>
              </div>
              <div className="px-3 pt-2">
                <RouteMap c={c} draw={false} />
              </div>
              <div className="p-5 pt-2">
                <p className="text-[14px] leading-7">{c.style}</p>
                <p className="mt-2 text-[13.5px]">
                  <b>伸びやすい</b> {c.grows.join("・")}　<b className="text-[var(--ink2)]">伸びにくい</b> {c.hard.join("・")}
                </p>
                <ul className="mt-3 grid gap-1 border-t border-[var(--rail)] pt-3 text-[13px] leading-6">
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
        <Go onClick={() => m.go("run")}>{m.company.name}の路線で走らせる</Go>
      </div>
    </section>
  );
}

/* ---------- 4. 5本の列車が走る ---------- */
function Run({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const c = getCompany(companyId);
  const { t, done } = useRunClock(true, 10000);
  const types = useMemo(() => c.runs.map((r) => routeType(c, r.route)), [c]);
  const refs = useRef<(SVGPathElement | null)[]>([]);
  const [pos, setPos] = useState<{ x: number; y: number; a: number }[]>([]);
  useEffect(() => {
    setPos(
      refs.current.map((p, i) => {
        if (!p) return { x: 0, y: 0, a: 0 };
        const L = p.getTotalLength();
        const prog = Math.max(0, Math.min(1, t * 1.15 - i * 0.05));
        const a = p.getPointAtLength(L * prog);
        const b = p.getPointAtLength(Math.min(L, L * prog + 1));
        return { x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
      }),
    );
  }, [t]);
  const tps = data.timepoints;
  const stage = Math.min(5, Math.floor(t * 6));
  const tl = c.timeline[stage];

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[26px] font-black sm:text-[34px]">{done ? "5本とも終点に着きました" : "5本の列車が走っています"}</h2>
        <p className="cond text-[18px] font-bold text-[var(--ink2)]">{Math.round(t * 100)}%</p>
      </div>
      <div className="ve-card mt-5 overflow-x-auto p-3" data-h="runs">
        <div className="min-w-[640px]">
          <RouteMap c={c} showCounts={done}>
            {types.map((ty, i) => (
              <path key={i} ref={(el) => { refs.current[i] = el; }} d={trainPath(ty)} fill="none" stroke="none" />
            ))}
            {pos.map((p, i) => (
              <g key={i} transform={`translate(${p.x},${p.y + (i - 2) * 3}) rotate(${p.a})`}>
                <rect x="-15" y="-8" width="30" height="16" rx="5" fill={LINE_COLOR[types[i]]} stroke="#fff" strokeWidth="2.5" />
                <text y="4.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="var(--font-barlow)">
                  {i + 1}
                </text>
              </g>
            ))}
          </RouteMap>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
        <div key={stage} className="ve-card ve-fade flex items-start gap-4 p-5" aria-live="polite">
          <span className="ve-badge text-[13px]">{`M${String(Math.min(stage, 4) + 1).padStart(2, "0")}`}</span>
          <div>
            <p className="text-[13px] font-bold text-[var(--ink2)]">{tps[stage].label}に到着</p>
            <p className="text-[16.5px] leading-8 font-bold">{tl.events[0]}</p>
            <p className="text-[13.5px]" style={{ color: RISK_INFO[tl.risk].c }}>
              辞めたくなる度合い：{tl.risk}
            </p>
          </div>
        </div>
        <div className="flex items-end gap-3">
          <Go onClick={onDone} disabled={!done}>
            {done ? "路線図で結果を見る" : "走行中…"}
          </Go>
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

/* ---------- 5. 結果（路線図） ---------- */
function Result({ companyId, onCompare }: { companyId: string; onCompare: () => void }) {
  const c = getCompany(companyId);
  const [sel, setSel] = useState(4);
  const [open, setOpen] = useState<number | null>(null);
  const tl = c.timeline[sel];
  const last = c.timeline[c.timeline.length - 1];
  const r = RISK_INFO[tl.risk];

  return (
    <section>
      <h2 className="text-[26px] font-black sm:text-[34px]">{c.name}　10年の路線図</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">5本の試走からよく通った駅と線。予測ではなく筋書きです。駅を押すと、その時点のようすが出ます。</p>

      <div className="ve-card mt-5 overflow-x-auto p-3">
        <div className="min-w-[640px]">
          <RouteMap c={c} selected={sel} onPick={setSel} />
        </div>
        <p className="flex flex-wrap gap-x-5 gap-y-1 px-3 pb-2 text-[12px] text-[var(--ink2)]">
          <span>駅のまわりの輪＝辞めたくなる度合い</span>
          <span style={{ color: "var(--alert)" }}>● 赤＝高</span>
          <span style={{ color: "#b07d00" }}>● 黄＝中</span>
          <span>輪なし＝低</span>
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div key={sel} className="ve-card ve-fade p-6" data-h="timeline">
          <p className="flex items-center gap-3">
            <span className="ve-badge text-[13px]">{`M${String(Math.min(sel, 4) + 1).padStart(2, "0")}`}</span>
            <span className="text-[19px] font-black">{data.timepoints[sel].label}</span>
            {"freq" in tl && <span className="cond text-[14px] font-bold text-[var(--ink2)]">5本中{tl.freq}本が通過</span>}
          </p>
          <ul className="mt-3 grid gap-2">
            {tl.events.map((e) => (
              <li key={e} className="border-l-4 border-[var(--main)] pl-3 text-[16px] leading-8 font-bold">
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-[var(--bg)] px-4 py-3 text-[15px] leading-7">
            <b>分身は</b>　{tl.action}
          </p>
        </div>
        <div className="ve-card p-6" data-h="risk" style={{ boxShadow: `inset 0 6px 0 ${r.c}` }}>
          <p className="text-[13px] font-bold text-[var(--ink2)]">辞めたくなる度合い</p>
          <p className="mt-1 text-[40px] leading-none font-black" style={{ color: r.c }}>
            {r.word}
          </p>
          <p className="mt-3 text-[15px] leading-7">{tl.riskReason}</p>
        </div>
      </div>

      {/* 能力 */}
      <div className="ve-card mt-5 p-6" data-h="abilities">
        <h3 className="text-[19px] font-black">10年後に身についている力</h3>
        <p className="mt-1 text-[12.5px] text-[var(--ink2)]">S〜G。選んだ目標にどこまで近づいたか（人の格付けではありません）。押すと理由が出ます。</p>
        <ul className="mt-4 grid gap-x-8 gap-y-1 md:grid-cols-2">
          {data.abilities.map((a, k) => {
            const g = gradeIndex(last.grades[k]);
            return (
              <li key={a}>
                <button type="button" onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="grid w-full grid-cols-[7.5rem_1fr_2rem] items-center gap-3 py-2 text-left">
                  <span className="text-[14px] font-bold">{a}</span>
                  <span className="relative h-2.5 rounded-full bg-[var(--rail)]">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--main)] transition-[width] duration-700" style={{ width: `${((g + 1) / 8) * 100}%` }} />
                  </span>
                  <span className="cond text-right text-[20px] font-bold">{last.grades[k]}</span>
                </button>
                {open === k && <p className="pb-2 text-[13px] leading-6 text-[var(--ink2)]">なぜ：{c.finalReasons[k]}</p>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* 乗り換え */}
      <div className="mt-8" data-h="branches">
        <h3 className="text-[22px] font-black">3年後の乗り換え</h3>
        <p className="mt-1 text-[13.5px] text-[var(--ink2)]">残る線・理由を持って移る線・まったく違う業界へ行く線。</p>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {c.branches.map((b) => (
            <article key={b.title} className="ve-card overflow-hidden">
              <div className="ve-band rounded-none" style={{ ["--c" as string]: LINE_COLOR[b.type] }} />
              <div className="p-5">
                <p className="flex items-center justify-between text-[13px] font-black" style={{ color: LINE_COLOR[b.type] }}>
                  <span>{LINE_NAME[b.type]}</span>
                  <span className="cond text-[15px]">5本中{b.count}本</span>
                </p>
                <h4 className="mt-1 text-[16.5px] leading-7 font-black">{b.title.replace(/^理由を持って移る：|^違う業界へ：/, "")}</h4>
                <ol className="mt-3 grid gap-2">
                  {b.path.map((p) => (
                    <li key={p} className="grid grid-cols-[14px_1fr] gap-2 text-[13.5px] leading-6">
                      <span className="mt-1.5 block h-3 w-3 rounded-full border-[3px] bg-white" style={{ borderColor: LINE_COLOR[b.type] }} />
                      {p}
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-[13px] leading-6 text-[var(--ink2)]">{b.why}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="ve-card p-6" data-h="boss">
          <h3 className="text-[18px] font-black">上司・同僚の情報で、見える線が変わる</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[c.bossCompare.without, c.bossCompare.with].map((x, i) => (
              <div key={x.label} className="rounded-lg border-2 p-4" style={{ borderColor: i ? "var(--move)" : "var(--rail)" }}>
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
        <div className="ve-card p-6" data-h="ask">
          <h3 className="text-[18px] font-black">面接で確かめる質問</h3>
          <ol className="mt-3 grid gap-2.5">
            {c.questionsToAsk.map((q, i) => (
              <li key={q} className="grid grid-cols-[2rem_1fr] gap-2 text-[14.5px] leading-7">
                <span className="ve-badge h-7 min-w-7 text-[12px]" style={{ ["--c" as string]: "var(--move)" }}>
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Go onClick={onCompare}>2社の路線図を並べる</Go>
        <p className="max-w-[46ch] text-[13px] leading-6 text-[var(--ink2)]">{data.meta.notice}</p>
      </div>
    </section>
  );
}

/* ---------- 6. 2社の路線図 ---------- */
function Compare({ onBack }: { onBack: () => void }) {
  return (
    <section data-h="compare">
      <h2 className="text-[26px] font-black sm:text-[34px]">{data.compare.headline}</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {data.companies.map((c, ci) => (
          <article key={c.id} className="ve-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-[var(--rail)] px-5 py-3">
              <span className="ve-badge text-[13px]" style={{ ["--c" as string]: ci ? "var(--stay)" : "var(--move)" }}>
                {ci ? "MD" : "AO"}
              </span>
              <h3 className="text-[19px] font-black">{c.name}</h3>
            </div>
            <div className="overflow-x-auto px-2">
              <div className="min-w-[520px]">
                <RouteMap c={c} />
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="ve-card mt-5 overflow-hidden">
        {data.compare.rows.map((r) => (
          <div key={r.label} className="grid gap-1 border-b border-[var(--rail)] px-5 py-3 last:border-b-0 md:grid-cols-[11rem_1fr_1fr] md:gap-4">
            <p className="text-[13px] font-bold text-[var(--ink2)]">{r.label}</p>
            <p className="text-[14.5px] leading-7">
              <span className="cond mr-2 font-bold text-[var(--move)]">AO</span>
              {r.aoba}
            </p>
            <p className="text-[14.5px] leading-7">
              <span className="cond mr-2 font-bold text-[var(--stay)]">MD</span>
              {r.midori}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-[var(--ink2)]">{data.compare.note}</p>
      <button type="button" onClick={onBack} className="mt-6 rounded-full border-2 border-[var(--ink)] px-6 py-3 text-[15px] font-black">
        ← 結果に戻る
      </button>
    </section>
  );
}
