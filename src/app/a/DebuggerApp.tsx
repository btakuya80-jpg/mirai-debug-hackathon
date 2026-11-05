"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { FEATURES, HELP, SCREEN_NOTE } from "@/lib/help";
import { data, gradeIndex, getCompany, STEPS, STEP_LABEL, useMirai, useRunClock, type Step } from "@/lib/mirai";

const FILES: Record<Step, string> = {
  job: "job.md",
  input: "input.ts",
  company: "launch.json",
  run: "run.log",
  result: "result.ts",
  compare: "compare.diff",
};

const RISK_TONE: Record<string, { c: string; tag: string; word: string }> = {
  高: { c: "var(--red)", tag: "error", word: "高" },
  中: { c: "var(--amber)", tag: "warn", word: "中" },
  低: { c: "var(--green)", tag: "info", word: "低" },
};

export default function DebuggerApp() {
  const m = useMirai();
  const idx = STEPS.indexOf(m.step);

  return (
    <div className="va flex min-h-dvh flex-col">
      {/* タイトル帯 */}
      <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px]">
        <Link href="/" className="mono text-[var(--dim)] hover:text-[var(--text)]">
          ←
        </Link>
        <span className="mono truncate">
          <span className="text-[var(--dim)]">mirai-debug /</span> career.run(
          <span className="str">&quot;あなた&quot;</span>, <span className="str">&quot;{m.company.name}&quot;</span>)
        </span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => m.go("run")}
            className="mono rounded px-2 py-1 text-[var(--green)] hover:bg-[var(--panel2)]"
            title="試走する"
          >
            ▶ 実行
          </button>
          <button
            type="button"
            onClick={() => idx < STEPS.length - 1 && m.go(STEPS[idx + 1])}
            className="mono rounded px-2 py-1 text-[var(--blue)] hover:bg-[var(--panel2)]"
            title="次の段階へ"
          >
            ⤼ 次へ
          </button>
        </span>
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)] md:grid-cols-[208px_minmax(0,1fr)]">
        {/* エクスプローラー */}
        <aside className="min-w-0 border-b border-[var(--line)] bg-[var(--panel)] md:border-r md:border-b-0">
          <p className="hidden px-4 pt-4 pb-2 text-[11px] text-[var(--dim)] md:block">エクスプローラー ／ career</p>
          <nav className="va-scroll flex gap-1 overflow-x-auto px-2 py-2 md:flex-col md:overflow-visible md:py-0">
            {STEPS.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => m.go(s)}
                aria-current={s === m.step}
                className={`mono flex shrink-0 items-center gap-2 rounded px-2 py-1.5 text-left text-[12.5px] ${
                  s === m.step ? "bg-[var(--panel2)] text-[var(--text)]" : "text-[var(--dim)] hover:text-[var(--text)]"
                }`}
              >
                <span
                  className={`bp ${i === idx ? "hit" : i < idx ? "" : "off"}`}
                  style={{ width: 8, height: 8, ...(i < idx ? { background: "var(--blue)", boxShadow: "none" } : {}) }}
                />
                {FILES[s]}
                <span className="hidden text-[11px] whitespace-nowrap text-[#4b586b] xl:inline">{STEP_LABEL[s]}</span>
              </button>
            ))}
          </nav>
          <div className="hidden px-4 pt-6 text-[11px] leading-5 text-[var(--dim)] md:block">
            <p>ウォッチ</p>
            <p className="mono">
              会社 = <span className="str">{m.company.name}</span>
            </p>
            <p className="mono">
              回答 = <span className="num">{m.answered}</span>/10
            </p>
            <p className="mono">
              エリア = <span className="str">{m.area}</span>
            </p>
          </div>
        </aside>

        {/* 本体 */}
        <main className="flex min-w-0 flex-col">
          <div className="flex border-b border-[var(--line)] bg-[var(--panel)] text-[12.5px]">
            <span className="va-tab mono px-4 py-2" aria-current="true">
              {FILES[m.step]}
            </span>
            <span className="mono hidden px-4 py-2 text-[var(--dim)] sm:inline">{STEP_LABEL[m.step]}</span>
          </div>
          <div className="va-scan flex-1">
            {m.step === "job" && <Job onRun={() => m.go("input")} />}
            {m.step === "input" && <Input m={m} />}
            {m.step === "company" && <Company m={m} />}
            {m.step === "run" && <Run key={m.companyId} companyId={m.companyId} onDone={() => m.go("result")} />}
            {m.step === "result" && <Result companyId={m.companyId} onCompare={() => m.go("compare")} />}
            {m.step === "compare" && <Compare onBack={() => m.go("result")} />}
          </div>
        </main>
      </div>

      {/* ステータスバー */}
      <footer className="mono flex flex-wrap items-center gap-x-4 gap-y-1 bg-[#1f6feb] px-3 py-1 text-[11.5px] text-white">
        <span>⎇ main</span>
        <span>
          段階 {idx + 1}/{STEPS.length}
        </span>
        <span>シナリオ（予測ではない）</span>
        <span className="ml-auto opacity-80">見本データ・登場する会社と人物はすべて架空</span>
      </footer>

      <InfoWindow
        screen={`A案／${STEP_LABEL[m.step]}`}
        screenNote={SCREEN_NOTE[m.step]}
        items={HELP}
        features={FEATURES}
        accent="#6cb6ff"
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
  const lines: React.ReactNode[] = [
    <span key="h" className="text-[22px] font-bold text-white sm:text-[26px]"># {j.title}</span>,
    <span key="c" className="cm">&gt; {j.company} ／ {j.area}</span>,
    "",
    <span key="s">
      <span className="kw">給与</span>　{j.salary}
    </span>,
    <span key="t">
      <span className="kw">時間</span>　{j.hours}
    </span>,
    <span key="tg" className="flex flex-wrap gap-2">
      {j.tags.map((t) => (
        <span key={t} className="rounded border border-[var(--line)] px-2 text-[12px] text-[var(--dim)]">
          {t}
        </span>
      ))}
    </span>,
    "",
    ...j.body.map((b, i) => <span key={`b${i}`}>{b}</span>),
    "",
  ];
  return (
    <div className="mx-auto max-w-3xl px-2 py-6 sm:px-6 sm:py-10">
      <ol className="grid gap-1.5 text-[15px] leading-7">
        {lines.map((l, i) => (
          <li key={i} className="grid grid-cols-[2.2rem_1fr] gap-3">
            <span className="gut text-[12px] leading-7">{i + 1}</span>
            <span className="min-w-0">{l}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 ml-0 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 sm:ml-[3.2rem]" data-h="cta">
        <p className="mono text-[12px] text-[var(--dim)]">{"// "}応募の前に、この会社での将来を先に動かしてみる</p>
        <button
          type="button"
          onClick={onRun}
          className="va-run-btn mono mt-3 inline-flex items-center gap-3 rounded-md bg-[var(--blue)] px-5 py-3 text-[16px] font-bold text-[#0b1220]"
        >
          <span className="text-[13px]">▶</span>入社後を試運転する
        </button>
        <p className="mono mt-3 text-[12px] text-[var(--dim)]">
          debug: あなた × {j.company} を <span className="num">5</span>本、<span className="num">10</span>年分 試走します
        </p>
      </div>
    </div>
  );
}

/* ---------- 2. 入力 ---------- */
function Input({ m }: { m: ReturnType<typeof useMirai> }) {
  let n = 1;
  return (
    <div className="mx-auto max-w-4xl px-2 py-6 sm:px-6 sm:py-8">
      <p className="mono mb-4 text-[12px] text-[var(--dim)] sm:ml-[3.2rem]">
        {"// "}選ぶだけ。5分で終わります（いまは見本の回答が入っています）
      </p>
      <div className="mono grid grid-cols-[2.2rem_1fr] gap-3 text-[14px]">
        <span className="gut">{n++}</span>
        <span>
          <span className="kw">const</span> あなた = {"{"}
        </span>
      </div>
      <div data-h="questions" className="grid gap-3 py-2">
        {data.questions.map((q) => (
          <div key={q.id} className="grid grid-cols-[2.2rem_1fr] gap-3">
            <span className="gut pt-1 text-[12px]">{n++}</span>
            <div className="min-w-0 border-l border-[var(--line)] pl-4">
              <p className="mono text-[13px]">
                <span className="text-[#9cdcfe]">{q.id}</span>
                <span className="cm"> {"// "}{q.text}</span>
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {q.options.map((o) => {
                  const on = m.isOn(q.id, o);
                  return (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={on}
                      onClick={() => m.toggle(q.id, o)}
                      className={`rounded px-2.5 py-1 text-[13px] transition-colors ${
                        on
                          ? "bg-[#21364a] text-[#a5d6ff] ring-1 ring-[var(--blue)]"
                          : "bg-[var(--panel2)] text-[var(--dim)] hover:text-[var(--text)]"
                      }`}
                    >
                      {on ? `"${o}"` : o}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[2.2rem_1fr] gap-3" data-h="area">
          <span className="gut pt-1 text-[12px]">{n++}</span>
          <label className="min-w-0 border-l border-[var(--line)] pl-4">
            <span className="mono text-[13px]">
              <span className="text-[#9cdcfe]">area</span>
              <span className="cm"> {"// "}住むエリア（通える範囲の求人を出すために使う）</span>
            </span>
            <select
              value={m.area}
              onChange={(e) => m.setArea(e.target.value)}
              className="mono mt-1.5 block rounded bg-[var(--panel2)] px-2 py-1 text-[13px] text-[#a5d6ff]"
            >
              {data.areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mono grid grid-cols-[2.2rem_1fr] gap-3 text-[14px]">
        <span className="gut">{n++}</span>
        <span>{"}"}</span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4 sm:ml-[3.2rem]">
        <button
          type="button"
          onClick={() => m.go("company")}
          className="mono rounded-md bg-[var(--blue)] px-4 py-2 text-[14px] font-bold text-[#0b1220]"
        >
          保存して、会社を選ぶ
        </button>
        <span className="mono text-[12px] text-[var(--dim)]">
          回答 <span className="num">{m.answered}</span>/10 ・ エラー <span className="text-[var(--green)]">0</span>
        </span>
      </div>
    </div>
  );
}

/* ---------- 3. 会社を選ぶ ---------- */
function Company({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
      <p className="mono mb-5 text-[12px] text-[var(--dim)]">{"// "}起動設定を選ぶ。会社と登場人物はすべて架空です</p>
      <div className="grid gap-4 md:grid-cols-2" data-h="companies">
        {data.companies.map((c) => {
          const on = m.companyId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => m.setCompanyId(c.id)}
              className={`rounded-lg border p-5 text-left transition-colors ${
                on ? "border-[var(--blue)] bg-[#172233]" : "border-[var(--line)] bg-[var(--panel)] hover:border-[#3a475c]"
              }`}
            >
              <p className="mono text-[12px] text-[var(--dim)]">
                {"{"} &quot;name&quot;: <span className="str">&quot;{c.id}&quot;</span> {"}"}
              </p>
              <h3 className="mt-2 text-[20px] font-bold text-white">{c.name}</h3>
              <p className="text-[13px] text-[var(--dim)]">
                {c.kind}／{c.size}
              </p>
              <p className="mt-3 text-[14px] leading-6">{c.style}</p>
              <dl className="mono mt-4 grid grid-cols-[6.5rem_1fr] gap-y-1 text-[12.5px]">
                <dt className="text-[var(--green)]">+ 伸びやすい</dt>
                <dd>{c.grows.join("・")}</dd>
                <dt className="text-[var(--red)]">− 伸びにくい</dt>
                <dd>{c.hard.join("・")}</dd>
                <dt className="text-[var(--amber)]">! 忙しい時期</dt>
                <dd>{c.busy}</dd>
              </dl>
              <ul className="mt-4 grid gap-1 border-t border-[var(--line)] pt-3 text-[12.5px]">
                {c.people.map((p) => (
                  <li key={p.name}>
                    <span className="text-[#9cdcfe]">{p.role}</span> {p.name}
                    <span className="text-[var(--dim)]">：{p.trait}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => m.go("run")}
        className="va-run-btn mono mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--green)] px-5 py-3 text-[15px] font-bold text-[#0b1220]"
      >
        ▶ {m.company.name} で試走する
      </button>
    </div>
  );
}

/* ---------- 4. 試走中 ---------- */
function Run({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const c = getCompany(companyId);
  const { t, done } = useRunClock(true, 9500);
  const tps = data.timepoints.slice(1);
  const prog = (i: number) => Math.max(0, Math.min(1, t * 1.18 - i * 0.045));

  const logs = useMemo(() => {
    const out: { at: number; tone: string; text: string }[] = [];
    c.timeline.slice(1).forEach((tl, k) => {
      const at = (k + 0.6) / 5;
      const tp = tps[k];
      out.push({ at: at - 0.06, tone: "dim", text: `[${tp.label}] ブレークポイントに到達（5本）` });
      out.push({ at: at - 0.03, tone: "text", text: `  出来事: ${tl.events[0]}` });
      out.push({
        at,
        tone: tl.risk,
        text: `  ${RISK_TONE[tl.risk].tag}: 辞めたくなる度合い=${tl.risk}（5本中${"freq" in tl ? tl.freq : 5}本）`,
      });
      if ("fork" in tl && tl.fork) out.push({ at: at + 0.02, tone: "fork", text: "  ⎇ 分かれ道を検出：残る／理由を持って移る／違う業界へ" });
    });
    out.push({ at: 0.995, tone: "ok", text: "✓ 試走 5本 完了。結果を一時停止中で表示できます" });
    return out;
  }, [c, tps]);

  const shown = logs.filter((l) => l.at <= t);

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-baseline gap-x-4">
        <h2 className="mono text-[15px]">
          {done ? <span className="text-[var(--green)]">● 一時停止中</span> : <span className="text-[var(--amber)]">● 実行中</span>}
        </h2>
        <p className="mono text-[12px] text-[var(--dim)]">
          あなた × {c.name} ／ 同じ条件で5本 ／ {Math.round(t * 100)}%
        </p>
      </div>

      {/* 5本のスレッド */}
      <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" data-h="runs">
        <div className="min-w-[560px]">
          <div className="mono ml-[96px] grid grid-cols-5 text-[11px] text-[var(--dim)]">
            {tps.map((tp) => (
              <span key={tp.id} className="text-center">
                {tp.label}
              </span>
            ))}
          </div>
          {c.runs.map((r, i) => {
            const p = prog(i);
            return (
              <div key={r.id} className="mt-3 grid grid-cols-[96px_1fr] items-center">
                <span className="mono text-[12px] text-[var(--dim)]">スレッド #{r.id}</span>
                <div className="relative h-6">
                  <div className="absolute top-1/2 right-0 left-0 h-px bg-[var(--line)]" />
                  <div
                    className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-[var(--blue)]"
                    style={{ width: `${p * 100}%`, boxShadow: "0 0 8px var(--blue)" }}
                  />
                  <div className="absolute inset-0 grid grid-cols-5">
                    {r.risk.map((rk, k) => {
                      const reached = p >= (k + 0.5) / 5;
                      return (
                        <span key={k} className="flex items-center justify-center">
                          <span
                            className={`block h-3 w-3 rounded-full transition-all duration-300 ${reached && rk === "高" ? "va-warn-pulse" : ""}`}
                            style={{
                              background: reached ? RISK_TONE[rk].c : "transparent",
                              border: reached ? "none" : "1.5px solid #4a5568",
                              transform: reached ? "scale(1.15)" : "scale(1)",
                            }}
                            title={reached ? `${tps[k].label}：辞めたくなる度合い ${rk}` : undefined}
                          />
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* コンソール */}
      <div className="mono mt-4 h-[260px] overflow-hidden rounded-lg border border-[var(--line)] bg-[#0d1117] p-4 text-[12.5px] leading-6">
        <p className="text-[var(--dim)]">$ mirai-debug run --runs 5 --until 10年後</p>
        <div className="flex h-[218px] flex-col justify-end overflow-hidden">
          {shown.slice(-9).map((l) => (
            <p
              key={l.text + l.at}
              className="va-line-in truncate"
              style={{
                color:
                  l.tone === "高" ? "var(--red)" : l.tone === "中" ? "var(--amber)" : l.tone === "低" ? "var(--green)" : l.tone === "fork" ? "var(--violet)" : l.tone === "ok" ? "var(--green)" : l.tone === "dim" ? "var(--dim)" : "var(--text)",
              }}
            >
              {l.text}
            </p>
          ))}
          {!done && <p className="va-caret text-[var(--dim)]" />}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onDone}
          disabled={!done}
          className={`mono rounded-md px-5 py-2.5 text-[14px] font-bold transition-opacity ${
            done ? "va-run-btn bg-[var(--blue)] text-[#0b1220]" : "bg-[var(--panel2)] text-[var(--dim)]"
          }`}
        >
          {done ? "結果を見る" : "試走中…"}
        </button>
        {!done && (
          <button type="button" onClick={onDone} className="mono text-[12px] text-[var(--dim)] underline underline-offset-4">
            待たずに結果へ
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- 5. 結果 ---------- */
function Result({ companyId, onCompare }: { companyId: string; onCompare: () => void }) {
  const c = getCompany(companyId);
  const [sel, setSel] = useState(4); // 3年後（分かれ道）で一時停止
  const [open, setOpen] = useState<number | null>(null);
  const tl = c.timeline[sel];
  const prev = c.timeline[sel - 1];
  const tone = RISK_TONE[tl.risk];

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8">
      <p className="mono text-[12px] text-[var(--dim)]">
        {"// "}{c.name} での5本の試走から、よく起きた筋書き。合否・点数・％は企業に渡しません
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr_300px]">
        {/* ブレークポイント */}
        <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3">
          <h3 className="px-1 pb-2 text-[12px] text-[var(--dim)]">ブレークポイント</h3>
          <ol className="flex gap-1 overflow-x-auto lg:flex-col">
            {c.timeline.slice(1).map((x, k) => {
              const i = k + 1;
              return (
                <li key={x.tp} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setSel(i)}
                    aria-pressed={sel === i}
                    className={`mono flex w-full items-center gap-2 rounded px-2 py-1.5 text-[13px] ${
                      sel === i ? "bg-[var(--panel2)] text-white" : "text-[var(--dim)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span className="block h-2.5 w-2.5 rounded-full" style={{ background: RISK_TONE[x.risk].c }} />
                    {data.timepoints[i].label}
                    {"fork" in x && x.fork && <span className="text-[var(--violet)]">⎇</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {/* コールスタック */}
        <section className="min-w-0 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" data-h="timeline">
          <h3 className="mono text-[13px]">
            <span className="text-[var(--amber)]">⏸</span> {data.timepoints[sel].label} で一時停止
            <span className="text-[var(--dim)]">（5本中{"freq" in tl ? tl.freq : 5}本で起きた筋）</span>
          </h3>
          <ul className="mt-3 grid gap-2">
            {tl.events.map((e, k) => (
              <li key={e} className="va-line-in grid grid-cols-[1.6rem_1fr] gap-2 text-[15px] leading-7" style={{ animationDelay: `${k * 80}ms` }}>
                <span className="mono text-[12px] leading-7 text-[var(--dim)]">#{k}</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded border-l-2 border-[var(--blue)] bg-[#151f2c] px-3 py-2">
            <p className="mono text-[11.5px] text-[var(--blue)]">分身の動き</p>
            <p className="text-[15px] leading-7">{tl.action}</p>
          </div>
          <div
            data-h="risk"
            className={`mt-4 rounded border px-3 py-2 ${tl.risk === "高" ? "va-warn-pulse" : ""}`}
            style={{ borderColor: tone.c, background: `color-mix(in srgb, ${tone.c} 10%, transparent)` }}
          >
            <p className="mono text-[13px]" style={{ color: tone.c }}>
              {tl.risk === "高" ? "⚠ 警告" : tl.risk === "中" ? "! 注意" : "i 情報"}：辞めたくなる度合い　{tone.word}
            </p>
            <p className="text-[14px] leading-6">{tl.riskReason}</p>
          </div>
        </section>

        {/* 変数（能力表） */}
        <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3" data-h="abilities">
          <h3 className="px-1 pb-2 text-[12px] text-[var(--dim)]">変数 ／ 能力（目標への近さ）</h3>
          <ul className="mono grid gap-0.5 text-[13px]">
            {data.abilities.map((a, k) => {
              const g = tl.grades[k];
              const d = gradeIndex(g) - gradeIndex(prev.grades[k]);
              return (
                <li key={a}>
                  <button
                    type="button"
                    onClick={() => setOpen(open === k ? null : k)}
                    aria-expanded={open === k}
                    className="grid w-full grid-cols-[1rem_1fr_auto_1.6rem] items-center gap-1 rounded px-1 py-1 text-left hover:bg-[var(--panel2)]"
                  >
                    <span className="text-[var(--dim)]">{open === k ? "▾" : "▸"}</span>
                    <span className="truncate text-[#9cdcfe]">{a}</span>
                    <span className="text-[11px]" style={{ color: d > 0 ? "var(--green)" : d < 0 ? "var(--red)" : "var(--dim)" }}>
                      {d > 0 ? `+${d}` : d < 0 ? d : "±0"}
                    </span>
                    <span className="text-right text-[15px] font-bold" style={{ color: gradeIndex(g) >= 5 ? "var(--green)" : gradeIndex(g) >= 3 ? "var(--text)" : "var(--amber)" }}>
                      {g}
                    </span>
                  </button>
                  {open === k && <p className="px-6 pb-2 font-[family-name:var(--font-plex)] text-[12.5px] leading-5 text-[var(--dim)]">なぜ：{c.finalReasons[k]}</p>}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 px-1 text-[11px] leading-5 text-[var(--dim)]">S〜G。人の格付けではなく、選んだ目標にどこまで近づいたか。▸で理由。</p>
        </section>
      </div>

      {/* 分かれ道 */}
      <section className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" data-h="branches">
        <h3 className="mono text-[13px]">
          <span className="text-[var(--violet)]">⎇</span> git log --graph <span className="text-[var(--dim)]">{"// "}3年後で分かれる筋書き</span>
        </h3>
        <BranchGraph c={c} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* 上司あり・なし */}
        <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" data-h="boss">
          <h3 className="mono text-[13px]">
            diff <span className="text-[var(--red)]">上司の情報なし</span> <span className="text-[var(--green)]">上司の情報あり</span>
          </h3>
          <div className="mono mt-3 grid gap-0.5 text-[13px] leading-6">
            {c.bossCompare.without.lines.map((l) => (
              <p key={l} className="rounded-sm bg-[rgba(255,107,107,.08)] px-2 text-[#ffb3b3]">
                − {l}
              </p>
            ))}
            {c.bossCompare.with.lines.map((l) => (
              <p key={l} className="rounded-sm bg-[rgba(123,216,143,.08)] px-2 text-[#b8f0c4]">
                + {l}
              </p>
            ))}
            <p className="px-2 pt-2 text-[var(--dim)]">
              # なしで見落とす：{c.bossCompare.without.missing}
            </p>
            <p className="px-2 text-[var(--dim)]"># ありで消える：{c.bossCompare.with.missing}</p>
          </div>
          <p className="mt-3 text-[13px] leading-6 text-[var(--dim)]">{c.bossCompare.note}</p>
        </section>

        {/* 持ち帰り */}
        <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" data-h="ask">
          <h3 className="mono text-[13px] text-[var(--amber)]">TODO：面接で確かめる</h3>
          <ul className="mt-3 grid gap-2">
            {c.questionsToAsk.map((q) => (
              <li key={q} className="grid grid-cols-[1.2rem_1fr] gap-2 text-[14px] leading-6">
                <span className="mono text-[var(--dim)]">☐</span>
                {q}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={onCompare} className="mono rounded-md bg-[var(--blue)] px-5 py-2.5 text-[14px] font-bold text-[#0b1220]">
          もう1社と比べる（diff）
        </button>
        <p className="text-[12px] text-[var(--dim)]">{data.meta.notice}</p>
      </div>
    </div>
  );
}

function BranchGraph({ c }: { c: ReturnType<typeof getCompany> }) {
  const color = { stay: "var(--green)", move: "var(--blue)", jump: "var(--violet)" } as const;
  const ys = [40, 110, 180];
  return (
    <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,340px)_1fr]">
      <svg viewBox="0 0 340 220" className="w-full max-w-[340px]" role="img" aria-label="3年後に3本へ分かれる図">
        <line x1="20" y1="110" x2="140" y2="110" stroke="var(--dim)" strokeWidth="2.5" />
        {[20, 60, 100, 140].map((x) => (
          <circle key={x} cx={x} cy="110" r="5" fill="var(--panel)" stroke="var(--dim)" strokeWidth="2" />
        ))}
        {c.branches.map((b, i) => {
          const y = ys[i];
          const col = color[b.type as keyof typeof color];
          return (
            <g key={b.title}>
              <path
                className="va-branch-path"
                style={{ animationDelay: `${i * 220}ms` }}
                d={`M140 110 C 175 110, 175 ${y}, 210 ${y} L 320 ${y}`}
                fill="none"
                stroke={col}
                strokeWidth="2.5"
              />
              <circle cx="320" cy={y} r="6" fill={col} />
              <text x="214" y={y - 9} fill={col} fontSize="11" fontFamily="var(--font-mono)">
                5本中{b.count}本
              </text>
            </g>
          );
        })}
        <circle cx="140" cy="110" r="7" fill="var(--amber)" />
        <text x="122" y="138" fill="var(--amber)" fontSize="11" fontFamily="var(--font-mono)">
          3年後
        </text>
      </svg>
      <ol className="grid gap-3">
        {c.branches.map((b) => {
          const col = color[b.type as keyof typeof color];
          return (
            <li key={b.title} className="border-l-2 pl-3" style={{ borderColor: col }}>
              <p className="text-[15px] font-bold" style={{ color: col }}>
                {b.title}
                {b.type === "jump" && <span className="mono ml-2 text-[11px] font-normal text-[var(--dim)]">違う業界の筋</span>}
              </p>
              <p className="mono mt-0.5 text-[12px] leading-5 text-[var(--dim)]">{b.path.join(" → ")}</p>
              <p className="mt-1 text-[13.5px] leading-6">{b.why}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- 6. 2社を比べる ---------- */
function Compare({ onBack }: { onBack: () => void }) {
  const [a, b] = data.companies;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const last = (x: typeof a) => x.timeline[x.timeline.length - 1];
  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8" data-h="compare">
      <h2 className="text-[22px] font-bold text-white sm:text-[26px]">{data.compare.headline}</h2>
      <p className="mono mt-1 text-[12px] text-[var(--dim)]">$ mirai-debug diff {a.id} {b.id}</p>

      {/* 辞めたくなる山の推移 */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[a, b].map((x, xi) => (
          <div key={x.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
            <p className="mono text-[12px]" style={{ color: xi === 0 ? "var(--blue)" : "var(--violet)" }}>
              {xi === 0 ? "a/" : "b/"}
              {x.id}
            </p>
            <h3 className="mt-1 text-[18px] font-bold text-white">{x.name}</h3>
            <div className="mt-3 grid grid-cols-5 items-end gap-2" style={{ height: 70 }}>
              {x.timeline.slice(1).map((t, k) => {
                const h = { 低: 22, 中: 46, 高: 70 }[t.risk as "低"];
                return (
                  <div key={t.tp} className="flex h-full flex-col items-center justify-end">
                    <span
                      className="block w-full rounded-t-sm transition-[height] duration-700"
                      style={{ height: ready ? h : 0, background: RISK_TONE[t.risk].c, transitionDelay: `${k * 90}ms` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mono mt-1 grid grid-cols-5 gap-2 text-center text-[10.5px] text-[var(--dim)]">
              {data.timepoints.slice(1).map((t) => (
                <span key={t.id}>{t.short}</span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[var(--dim)]">辞めたくなる度合い（低・中・高）の推移</p>
            <ul className="mono mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[12.5px]">
              {data.abilities.map((ab, k) => (
                <li key={ab} className="flex justify-between gap-2">
                  <span className="truncate text-[#9cdcfe]">{ab}</span>
                  <b className="text-white">{last(x).grades[k]}</b>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-[var(--dim)]">10年後の能力（目標への近さ）</p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-[var(--line)]">
        {data.compare.rows.map((r) => (
          <div key={r.label} className="grid border-b border-[var(--line)] last:border-b-0 md:grid-cols-[11rem_1fr_1fr]">
            <p className="mono bg-[var(--panel)] px-4 py-2.5 text-[12.5px] text-[var(--dim)]">{r.label}</p>
            <p className="bg-[rgba(108,182,255,.05)] px-4 py-2.5 text-[14px] leading-6">
              <span className="mono mr-2 text-[var(--blue)]">a</span>
              {r.aoba}
            </p>
            <p className="bg-[rgba(196,155,255,.05)] px-4 py-2.5 text-[14px] leading-6">
              <span className="mono mr-2 text-[var(--violet)]">b</span>
              {r.midori}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-[var(--dim)]">{data.compare.note}</p>
      <button type="button" onClick={onBack} className="mono mt-5 rounded-md border border-[var(--line)] px-4 py-2 text-[13px] hover:bg-[var(--panel)]">
        ← 結果に戻る
      </button>
    </div>
  );
}
