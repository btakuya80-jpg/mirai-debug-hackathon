"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { FEATURES, HELP, SCREEN_NOTE } from "@/lib/help";
import { data, gradeIndex, getCompany, STEPS, STEP_LABEL, useMirai, useRunClock } from "@/lib/mirai";

/* D案「未来の履歴書」：紙の書式に、10年先までの職歴が手書きで書き込まれていく */

const RISK_MARK: Record<string, { label: string; tone: string }> = {
  高: { label: "要注意", tone: "var(--seal)" },
  中: { label: "様子見", tone: "#b07a00" },
  低: { label: "順調", tone: "#2f6b4f" },
};

function Circle({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span className="vd-circle inline-block">
      {children}
      {on && (
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
          <path d="M8,22 C6,6 40,2 66,4 C92,6 98,20 90,30 C80,40 30,40 14,32 C6,28 4,18 18,10" />
        </svg>
      )}
    </span>
  );
}

export default function ResumeApp() {
  const m = useMirai();
  return (
    <div className="vd">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 pt-5 sm:px-6">
        <Link href="/" className="text-[13px] text-[var(--ink2)] hover:text-[var(--ink)]">
          ← 案の一覧へ
        </Link>
        <span className="text-[16px] font-bold tracking-[0.2em]">未来の履歴書</span>
        <nav className="ml-auto flex flex-wrap gap-x-3 gap-y-1 text-[12.5px]" aria-label="進み具合">
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => m.go(s)}
              aria-current={s === m.step}
              className={s === m.step ? "border-b-2 border-[var(--seal)] font-bold" : "text-[var(--ink2)] hover:text-[var(--ink)]"}
            >
              {STEP_LABEL[s]}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        {m.step === "job" && <Job onRun={() => m.go("input")} />}
        {m.step === "input" && <Input m={m} />}
        {m.step === "company" && <Company m={m} />}
        {m.step === "run" && <Run key={m.companyId} companyId={m.companyId} onDone={() => m.go("result")} />}
        {m.step === "result" && <Result companyId={m.companyId} onCompare={() => m.go("compare")} />}
        {m.step === "compare" && <Compare onBack={() => m.go("result")} />}
      </main>
      <p className="pb-6 text-center text-[12px] text-[var(--ink2)]">{data.meta.sampleNote}</p>
      <InfoWindow
        screen={`D案／${STEP_LABEL[m.step]}`}
        screenNote={SCREEN_NOTE[m.step]}
        items={HELP}
        features={FEATURES}
        accent="#c8382f"
        onBeforeFlash={(it) => {
          const h = HELP.find((x) => x.id === it.id);
          if (h && h.step !== m.step) m.go(h.step);
        }}
      />
    </div>
  );
}

/* ---------- 1. 求人票 ---------- */
function Job({ onRun }: { onRun: () => void }) {
  const j = data.job;
  return (
    <section className="grid items-start gap-8 md:grid-cols-[1fr_260px]">
      <article className="vd-sheet">
        <p className="vd-label border-b-[1.5px] border-[var(--ink)] px-5 py-2">求 人 票</p>
        <div className="grid grid-cols-[6.5rem_1fr] text-[15px]">
          {[
            ["事業所名", j.company],
            ["職種", j.title],
            ["就業場所", j.area],
            ["賃金", j.salary],
            ["就業時間", j.hours],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <p className="vd-label border-r-[1.5px] border-b border-[var(--ink)] border-b-[var(--rule)] px-4 py-3">{k}</p>
              <p className="border-b border-[var(--rule)] px-4 py-3">{v}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4">
          <p className="vd-label">仕事の内容</p>
          <div className="mt-2 grid gap-2 text-[15px] leading-8">
            {j.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {j.tags.map((t) => (
              <span key={t} className="border border-[var(--rule)] px-2 text-[12.5px] text-[var(--ink2)]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </article>
      <aside className="flex flex-col items-center gap-5 pt-4 text-center" data-h="cta">
        <p className="hand text-[18px] leading-8">
          応募する前に、
          <br />
          この会社での10年を
          <br />
          先に書いてみる。
        </p>
        <button type="button" onClick={onRun} className="vd-btn-seal px-7 py-4 text-[16px] font-bold">
          入社後を試運転する
        </button>
        <p className="text-[12px] text-[var(--ink2)]">下書きを5枚つくり、よく出た筋を清書します</p>
      </aside>
    </section>
  );
}

/* ---------- 2. 本人記入欄 ---------- */
function Input({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <h2 className="text-[26px] font-bold tracking-[0.12em] sm:text-[32px]">本人記入欄</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">あてはまるものを○で囲んでください（選ぶだけ・5分）。いまは見本の回答が入っています。</p>
      <div className="vd-sheet mt-6" data-h="questions">
        {data.questions.map((q, i) => (
          <div key={q.id} className="grid border-b border-[var(--rule)] last:border-b-0 sm:grid-cols-[12rem_1fr]">
            <p className="px-4 pt-3 text-[14px] sm:border-r-[1.5px] sm:border-[var(--ink)] sm:py-4">
              <span className="num mr-2 text-[var(--ink2)]">{i + 1}.</span>
              {q.text}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 px-5 py-4">
              {q.options.map((o) => {
                const on = m.isOn(q.id, o);
                return (
                  <button key={o} type="button" aria-pressed={on} onClick={() => m.toggle(q.id, o)} className="hand text-[16px]">
                    <Circle on={on}>{o}</Circle>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <label className="grid border-t-[1.5px] border-[var(--ink)] sm:grid-cols-[12rem_1fr]" data-h="area">
          <span className="px-4 pt-3 text-[14px] sm:border-r-[1.5px] sm:border-[var(--ink)] sm:py-4">住所（都道府県）</span>
          <span className="px-5 py-3">
            <select value={m.area} onChange={(e) => m.setArea(e.target.value)} className="hand border-b border-[var(--ink)] bg-transparent px-1 py-1 text-[17px]">
              {data.areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <span className="ml-3 text-[12px] text-[var(--ink2)]">通える範囲の求人を出すために使います</span>
          </span>
        </label>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={() => m.go("company")} className="vd-btn-line px-6 py-3 text-[15px] font-bold">
          記入して、会社を選ぶ
        </button>
        <span className="num text-[13px] text-[var(--ink2)]">記入 {m.answered}／10</span>
      </div>
    </section>
  );
}

/* ---------- 3. 応募先を選ぶ ---------- */
function Company({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <h2 className="text-[26px] font-bold tracking-[0.12em] sm:text-[32px]">応募先</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">試しに書いてみる会社を選んでください。会社も人物も架空です。</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2" data-h="companies">
        {data.companies.map((c) => {
          const on = m.companyId === c.id;
          return (
            <button key={c.id} type="button" aria-pressed={on} onClick={() => m.setCompanyId(c.id)} className="vd-sheet relative p-6 text-left">
              {on && <span className="vd-seal absolute top-4 right-4 h-16 w-16 text-[15px]">応募</span>}
              <p className="vd-label">事業所</p>
              <h3 className="mt-1 text-[22px] font-bold">{c.name}</h3>
              <p className="text-[13px] text-[var(--ink2)]">
                {c.kind}／{c.size}
              </p>
              <p className="mt-3 text-[15px] leading-7">{c.style}</p>
              <p className="mt-3 text-[14px]">
                伸びやすい：<span className="vd-marker">{c.grows.join("・")}</span>
              </p>
              <p className="text-[14px] text-[var(--ink2)]">伸びにくい：{c.hard.join("・")}</p>
              <ul className="hand mt-4 grid gap-1 border-t border-[var(--rule)] pt-3 text-[14px] leading-7">
                {c.people.map((p) => (
                  <li key={p.name}>
                    {p.role} {p.name}：{p.trait}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => m.go("run")} className="vd-btn-seal mt-8 px-7 py-4 text-[16px] font-bold">
        {m.company.name}で書いてみる
      </button>
    </section>
  );
}

/* ---------- 4. 下書き5枚 ---------- */
function Run({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const c = getCompany(companyId);
  const { t, done } = useRunClock(true, 9500);
  const tps = data.timepoints.slice(1);
  const rows = Math.min(5, Math.floor(t * 5.6));
  return (
    <section>
      <h2 className="text-[26px] font-bold tracking-[0.12em] sm:text-[32px]">{done ? "下書きが5枚できました" : "下書きを5枚、同時に書いています"}</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">同じあなたを、同じ会社で5回書いてみて、よく出る筋を探します。</p>
      <div className="relative mt-8 overflow-hidden px-3 pt-1 pb-10" data-h="runs">
        {c.runs.map((r, i) => {
          const p = Math.max(0, Math.min(1, t * 1.15 - i * 0.04));
          const n = Math.min(5, Math.floor(p * 5.6));
          return (
            <div
              key={r.id}
              className="vd-sheet vd-ruled absolute inset-x-0 mx-auto max-w-2xl px-6 pt-4 pb-6"
              style={{ top: i * 14, transform: `translateX(${(i - 2) * 10}px) rotate(${(i - 2) * 0.8}deg)`, zIndex: 5 - i, position: i === 0 ? "relative" : "absolute" }}
              aria-hidden={i !== 0}
            >
              <p className="vd-label flex justify-between">
                <span>職 歴（下書き {r.id}）</span>
                <span className="num">{Math.round(p * 100)}%</span>
              </p>
              <ol className="mt-2 grid">
                {tps.map((tp, k) => (
                  <li key={tp.id} className="grid h-9 grid-cols-[5.5rem_1fr_4rem] items-center gap-3 text-[15px]">
                    <span className="num text-[13px] text-[var(--ink2)]">{tp.label}</span>
                    <span className={`hand truncate ${k < n ? "vd-write" : ""} ${k === n && !done ? "vd-pen" : ""}`}>
                      {k < n ? c.timeline[k + 1].events[0] : ""}
                    </span>
                    <span className="text-right text-[12px] font-bold" style={{ color: k < n ? RISK_MARK[r.risk[k]].tone : "transparent" }}>
                      {r.risk[k]}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
      <p className="mt-16 text-center text-[13px] text-[var(--ink2)]">右の文字は辞めたくなる度合い（高・中・低）。いま {tps[Math.min(4, rows)].label} まで書けています。</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={onDone} disabled={!done} className={`px-7 py-4 text-[16px] font-bold ${done ? "vd-btn-seal" : "vd-btn-line text-[var(--pencil)]"}`}>
          {done ? "清書を見る" : "書いています…"}
        </button>
        {!done && (
          <button type="button" onClick={onDone} className="text-[13px] text-[var(--ink2)] underline underline-offset-4">
            待たずに清書へ
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------- 5. 清書（結果） ---------- */
function Result({ companyId, onCompare }: { companyId: string; onCompare: () => void }) {
  const c = getCompany(companyId);
  const [sel, setSel] = useState(4);
  const [open, setOpen] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= 5) return;
    const id = window.setTimeout(() => setShown((x) => x + 1), 260);
    return () => clearTimeout(id);
  }, [shown]);
  const tl = c.timeline[sel];
  const last = c.timeline[c.timeline.length - 1];
  const mark = RISK_MARK[tl.risk];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[26px] font-bold tracking-[0.12em] sm:text-[32px]">未来の履歴書（清書）</h2>
        <p className="text-[13px] text-[var(--ink2)]">{c.name}・5枚の下書きからよく出た筋。予測ではなく筋書きです。</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* 職歴欄 */}
        <div className="vd-sheet" data-h="timeline">
          <div className="grid grid-cols-[6rem_1fr_4.5rem] border-b-[1.5px] border-[var(--ink)] text-center">
            <p className="vd-label border-r border-[var(--ink)] py-2">時 点</p>
            <p className="vd-label py-2">職 歴（よく起きた出来事）</p>
            <p className="vd-label border-l border-[var(--ink)] py-2">度合い</p>
          </div>
          {c.timeline.slice(1).map((x, k) => {
            const i = k + 1;
            return (
              <button
                key={x.tp}
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={sel === i}
                className={`grid w-full grid-cols-[6rem_1fr_4.5rem] items-center border-b border-[var(--rule)] text-left last:border-b-0 ${sel === i ? "bg-[#fff7d6]" : "hover:bg-[#f4f6f8]"}`}
              >
                <span className="num border-r border-[var(--ink)] px-3 py-3 text-[13px]">{data.timepoints[i].label}</span>
                <span className={`hand px-3 py-3 text-[15px] leading-7 ${k < shown ? "" : "opacity-0"}`}>{x.events[0]}</span>
                <span className="flex justify-center border-l border-[var(--ink)] py-3">
                  {x.risk === "高" ? (
                    <span className="vd-seal h-11 w-11 text-[11px]">要注意</span>
                  ) : (
                    <span className="text-[13px] font-bold" style={{ color: RISK_MARK[x.risk].tone }}>
                      {x.risk}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* 選んだ時点の詳しいこと */}
        <div key={sel} className="vd-sheet p-5">
          <p className="vd-label">備 考 ／ {data.timepoints[sel].label}</p>
          <ul className="hand mt-2 grid gap-1 text-[16px] leading-9">
            {tl.events.map((e) => (
              <li key={e}>・{e}</li>
            ))}
          </ul>
          <p className="hand mt-2 text-[16px] leading-9">
            <span className="vd-marker">分身は</span> {tl.action}
          </p>
          <div className="mt-4 border-t-[1.5px] border-[var(--ink)] pt-3" data-h="risk">
            <p className="vd-label">辞めたくなる度合い</p>
            <p className="mt-1 text-[20px] font-bold" style={{ color: mark.tone }}>
              {tl.risk}（{mark.label}）
            </p>
            <p className="hand mt-1 text-[15px] leading-8">{tl.riskReason}</p>
          </div>
        </div>
      </div>

      {/* 資格・特技欄＝能力 */}
      <div className="vd-sheet mt-6" data-h="abilities">
        <p className="vd-label border-b-[1.5px] border-[var(--ink)] px-5 py-2">資格・特技（10年後の、選んだ目標への近さ。S〜G・人の格付けではありません）</p>
        <div className="grid sm:grid-cols-2">
          {data.abilities.map((a, k) => {
            const g = last.grades[k];
            const strong = gradeIndex(g) >= 6;
            return (
              <div key={a} className="border-b border-[var(--rule)] sm:odd:border-r sm:odd:border-r-[var(--rule)]">
                <button type="button" onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="grid w-full grid-cols-[1fr_auto] items-center px-5 py-3 text-left">
                  <span className="text-[15px]">{a}</span>
                  <span className="hand text-[20px]">
                    <Circle on={strong}>{g}</Circle>
                  </span>
                </button>
                {open === k && <p className="hand px-5 pb-3 text-[14px] leading-7 text-[var(--ink2)]">なぜ：{c.finalReasons[k]}</p>}
              </div>
            );
          })}
        </div>
        <p className="px-5 py-2 text-[12px] text-[var(--ink2)]">A以上を赤丸で囲んでいます。項目を押すと理由が出ます。</p>
      </div>

      {/* 分かれ道＝付箋 */}
      <div className="mt-10" data-h="branches">
        <h3 className="text-[22px] font-bold tracking-[0.1em]">3年後の分かれ道（付箋）</h3>
        <p className="mt-1 text-[13.5px] text-[var(--ink2)]">残る筋・理由を持って移る筋・まったく違う業界へ移る筋。</p>
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {c.branches.map((b, i) => (
            <article key={b.title} className="vd-sticky p-5" style={{ background: ["#fff3a8", "#d9ecff", "#ffd9cc"][i], ["--r" as string]: `${(i - 1) * 1.6}deg` }}>
              <p className="flex justify-between text-[12px] text-[var(--ink2)]">
                <span>{b.type === "stay" ? "残る" : b.type === "move" ? "移る" : "違う業界へ"}</span>
                <span className="num">5枚中{b.count}枚</span>
              </p>
              <h4 className="hand mt-1 text-[18px] leading-8 font-semibold">{b.title.replace(/^理由を持って移る：|^違う業界へ：/, "")}</h4>
              <ol className="hand mt-2 grid gap-1 text-[14px] leading-7">
                {b.path.map((p) => (
                  <li key={p}>→ {p}</li>
                ))}
              </ol>
              <p className="mt-2 text-[13px] leading-6 text-[var(--ink2)]">{b.why}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="vd-sheet" data-h="boss">
          <p className="vd-label border-b-[1.5px] border-[var(--ink)] px-5 py-2">上司・同僚の欄　記入なし ／ 記入あり</p>
          <div className="grid sm:grid-cols-2">
            {[c.bossCompare.without, c.bossCompare.with].map((x, i) => (
              <div key={x.label} className={`p-5 ${i === 0 ? "sm:border-r sm:border-[var(--rule)]" : ""}`}>
                <p className="text-[14px] font-bold">{x.label}</p>
                <ul className="hand mt-2 grid gap-1 text-[14.5px] leading-7">
                  {x.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[12.5px] text-[var(--ink2)]">見落とし：{x.missing}</p>
              </div>
            ))}
          </div>
          <p className="border-t border-[var(--rule)] px-5 py-3 text-[13px] leading-6 text-[var(--ink2)]">{c.bossCompare.note}</p>
        </div>
        <div className="vd-sheet p-5" data-h="ask">
          <p className="vd-label">本人希望記入欄 ／ 面接で確かめること</p>
          <ul className="hand mt-2 grid gap-0 text-[16px] leading-9">
            {c.questionsToAsk.map((q) => (
              <li key={q}>□ {q}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onCompare} className="vd-btn-seal px-7 py-4 text-[16px] font-bold">
          2社の履歴書を並べる
        </button>
        <p className="max-w-[46ch] text-[13px] leading-6 text-[var(--ink2)]">{data.meta.notice}</p>
      </div>
    </section>
  );
}

/* ---------- 6. 2社を並べる ---------- */
function Compare({ onBack }: { onBack: () => void }) {
  return (
    <section data-h="compare">
      <h2 className="text-[26px] font-bold tracking-[0.12em] sm:text-[32px]">{data.compare.headline}</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {data.companies.map((c, ci) => {
          const last = c.timeline[c.timeline.length - 1];
          return (
            <article key={c.id} className="vd-sheet">
              <p className="vd-label border-b-[1.5px] border-[var(--ink)] px-5 py-2">履歴書 {ci + 1}／{c.name}</p>
              <ol>
                {c.timeline.slice(1).map((x, k) => (
                  <li key={x.tp} className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-2 border-b border-[var(--rule)] px-4 py-2 text-[14px]">
                    <span className="num text-[12.5px] text-[var(--ink2)]">{data.timepoints[k + 1].label}</span>
                    <span className="hand truncate">{x.events[0]}</span>
                    <span className="text-center text-[13px] font-bold" style={{ color: RISK_MARK[x.risk].tone }}>
                      {x.risk}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-3 text-[13.5px]">
                {data.abilities.map((a, k) => (
                  <span key={a} className="whitespace-nowrap">
                    {a} <b className="hand text-[16px]">{last.grades[k]}</b>
                  </span>
                ))}
              </p>
            </article>
          );
        })}
      </div>
      <div className="vd-sheet mt-6">
        {data.compare.rows.map((r) => (
          <div key={r.label} className="grid gap-1 border-b border-[var(--rule)] px-5 py-3 last:border-b-0 md:grid-cols-[10rem_1fr_1fr] md:gap-4">
            <p className="vd-label pt-1">{r.label}</p>
            <p className="hand text-[15px] leading-7">① {r.aoba}</p>
            <p className="hand text-[15px] leading-7">② {r.midori}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-[var(--ink2)]">{data.compare.note}</p>
      <button type="button" onClick={onBack} className="vd-btn-line mt-6 px-6 py-3 text-[15px] font-bold">
        ← 清書に戻る
      </button>
    </section>
  );
}
