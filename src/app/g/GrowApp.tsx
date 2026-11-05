"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InfoWindow from "@/components/InfoWindow";
import { FEATURES, HELP, SCREEN_NOTE } from "@/lib/help";
import { data, gradeIndex, getCompany, STEPS, STEP_LABEL, useMirai, usePrefersReducedMotion } from "@/lib/mirai";
import { Backdrop, Chibi, Desk, FACE_OF, MOOD_OF, MoodIcon, type Bg, type Face, type Look, type Mood, type Pose } from "./Chibi";

/* G案「働く姿が見える育成シミュレーション風」
   分身（ちびキャラ）が職場で働く様子を見せ、時点ごとの出来事で力ときもちが変わっていく。 */

type Who = "me" | 0 | 1 | 2 | "kouhai" | "client" | "newbie";
type Actor = { who: Who; x: number; from?: number; pose: Pose; face?: Face; flip?: boolean; small?: boolean };
type Kind = "仕事を渡す" | "ほめる" | "注意する" | "話しかける" | "ひとりごと";
type Talk = { who: Who; kind: Kind; text: string };
type Scene = { bg: Bg; night?: boolean; desk?: number; actors: Actor[]; talks: Talk[] };
type BranchType = "stay" | "move" | "jump";

const ME: Look = { hair: "#3a2a20", shirt: "#20a39e", style: "short" };
const LOOKS: Record<string, Record<string, Look>> = {
  aoba: {
    "0": { hair: "#23262d", shirt: "#3b4a6b", style: "spiky", glasses: true },
    "1": { hair: "#7a4a2a", shirt: "#f0a33c", style: "bob" },
    "2": { hair: "#151515", shirt: "#d9534f", style: "spiky" },
  },
  midori: {
    "0": { hair: "#9aa0a8", shirt: "#2f5d50", style: "short", glasses: true },
    "1": { hair: "#2b2b2b", shirt: "#e6b33c", style: "long" },
    "2": { hair: "#6b4a35", shirt: "#7aa6d6", style: "bob" },
  },
};
const EXTRA: Record<string, { look: Look; name: string }> = {
  kouhai: { look: { hair: "#5a3d2b", shirt: "#8fbf5a", style: "bun" }, name: "後輩" },
  newbie: { look: { hair: "#4a3a2e", shirt: "#f28c6b", style: "short" }, name: "新人" },
  client: { look: { hair: "#444", shirt: "#8b6bd6", style: "long" }, name: "新しい職場の人" },
};

/** 見せ方の台本（出来事の文は data/mirai.json。ここはキャラの動きとセリフだけ） */
const SCENES: Record<string, Record<string, Scene>> = {
  aoba: {
    t0: {
      bg: "office",
      desk: 260,
      actors: [
        { who: "me", x: 260, pose: "study" },
        { who: 0, x: 470, from: 560, pose: "teach", flip: true },
        { who: 1, x: 130, pose: "stand" },
      ],
      talks: [
        { who: 0, kind: "仕事を渡す", text: "打ち合わせ2つ、出てみて" },
        { who: "me", kind: "ひとりごと", text: "知らない言葉はメモ…" },
      ],
    },
    t1: {
      bg: "office",
      actors: [
        { who: "me", x: 150, from: 260, pose: "carry" },
        { who: 0, x: 480, pose: "teach", flip: true },
        { who: 2, x: 330, pose: "phone" },
      ],
      talks: [
        { who: 0, kind: "仕事を渡す", text: "発送もこれ、今日中に！" },
        { who: 2, kind: "話しかける", text: "こっちはもう終わったよ" },
        { who: "me", kind: "ひとりごと", text: "どれから手をつけよう…" },
      ],
    },
    t2: {
      bg: "office",
      desk: 280,
      actors: [
        { who: "me", x: 280, pose: "type" },
        { who: 1, x: 150, from: 60, pose: "teach" },
        { who: 0, x: 500, pose: "stand", flip: true },
      ],
      talks: [
        { who: 1, kind: "話しかける", text: "朝10分、順番をそろえよう" },
        { who: 0, kind: "ほめる", text: "その発送表の工夫、いいね" },
      ],
    },
    t3: {
      bg: "office",
      actors: [
        { who: "me", x: 450, from: 280, pose: "present" },
        { who: 0, x: 570, pose: "stand", flip: true },
        { who: "kouhai", x: 320, pose: "stand" },
        { who: 1, x: 150, pose: "stand" },
      ],
      talks: [
        { who: 0, kind: "仕事を渡す", text: "この企画、丸ごと任せる" },
        { who: "kouhai", kind: "話しかける", text: "これ、どうやるんですか？" },
        { who: 1, kind: "注意する", text: "見て覚えて、だけだと続かないよ" },
      ],
    },
    t4: {
      bg: "office",
      night: true,
      desk: 260,
      actors: [
        { who: "me", x: 260, pose: "study" },
        { who: 0, x: 620, from: 470, pose: "walk", flip: true },
      ],
      talks: [
        { who: 0, kind: "話しかける", text: "新事業に行ってくる。頼んだ" },
        { who: "me", kind: "ひとりごと", text: "広く浅く、このままでいいのかな" },
      ],
    },
    stay: {
      bg: "office",
      actors: [
        { who: "me", x: 320, pose: "cheer" },
        { who: "kouhai", x: 200, pose: "stand" },
        { who: 2, x: 450, pose: "stand", flip: true },
        { who: 1, x: 90, pose: "stand" },
      ],
      talks: [
        { who: 2, kind: "ほめる", text: "まとめ役、頼りにしてる" },
        { who: "me", kind: "話しかける", text: "次の企画、みんなで決めよう" },
      ],
    },
    move: {
      bg: "office2",
      desk: 260,
      actors: [
        { who: "me", x: 260, pose: "type" },
        { who: "client", x: 460, from: 600, pose: "stand", flip: true },
      ],
      talks: [{ who: "client", kind: "ほめる", text: "企画も分かる専門の人で助かる" }],
    },
    jump: {
      bg: "warehouse",
      actors: [
        { who: "me", x: 300, pose: "teach" },
        { who: "newbie", x: 450, pose: "carry", flip: true },
      ],
      talks: [
        { who: "me", kind: "話しかける", text: "AIで並べ替えてみよう" },
        { who: "newbie", kind: "ほめる", text: "発送がすごく楽になりました" },
      ],
    },
  },
  midori: {
    t0: {
      bg: "warehouse",
      actors: [
        { who: "me", x: 280, pose: "study" },
        { who: 1, x: 400, from: 520, pose: "teach", flip: true },
      ],
      talks: [
        { who: 1, kind: "仕事を渡す", text: "1週間の流れ、紙1枚にしたよ" },
        { who: "me", kind: "ひとりごと", text: "これなら分かりそう" },
      ],
    },
    t1: {
      bg: "warehouse",
      actors: [
        { who: "me", x: 160, from: 280, pose: "carry" },
        { who: 2, x: 270, from: 360, pose: "carry" },
        { who: 1, x: 450, pose: "stand", flip: true },
      ],
      talks: [
        { who: 1, kind: "ほめる", text: "検品の順番、合ってる" },
        { who: 2, kind: "話しかける", text: "同じ班だね、よろしく" },
      ],
    },
    t2: {
      bg: "warehouse",
      actors: [
        { who: "me", x: 300, from: 160, pose: "present" },
        { who: 0, x: 440, pose: "stand", flip: true },
      ],
      talks: [
        { who: 0, kind: "注意する", text: "手順はまず守ってね" },
        { who: 0, kind: "話しかける", text: "改善案は来年度に検討しよう" },
        { who: "me", kind: "ひとりごと", text: "毎日同じだなあ…" },
      ],
    },
    t3: {
      bg: "warehouse",
      actors: [
        { who: "me", x: 300, pose: "teach" },
        { who: "newbie", x: 420, pose: "stand", flip: true },
        { who: "kouhai", x: 480, pose: "stand", flip: true },
        { who: 0, x: 140, pose: "stand" },
      ],
      talks: [
        { who: "me", kind: "話しかける", text: "ここは2回確かめよう" },
        { who: 0, kind: "ほめる", text: "年末の出荷、よく乗り切った" },
      ],
    },
    t4: {
      bg: "warehouse",
      actors: [
        { who: "me", x: 300, pose: "stand" },
        { who: 0, x: 440, from: 560, pose: "teach", flip: true },
        { who: 1, x: 150, pose: "stand" },
      ],
      talks: [
        { who: 0, kind: "話しかける", text: "別のセンター、行ってみないか" },
        { who: 1, kind: "話しかける", text: "班長の候補に名前が出てるよ" },
      ],
    },
    stay: {
      bg: "warehouse",
      actors: [
        { who: "me", x: 320, pose: "cheer" },
        { who: "newbie", x: 170, pose: "stand", small: true },
        { who: "kouhai", x: 230, pose: "stand", small: true },
        { who: 2, x: 420, pose: "stand", flip: true, small: true },
        { who: "newbie", x: 480, pose: "stand", flip: true, small: true },
      ],
      talks: [
        { who: "me", kind: "話しかける", text: "今日は2班に分けて回そう" },
        { who: 2, kind: "ほめる", text: "班長の段取り、分かりやすい" },
      ],
    },
    move: {
      bg: "office2",
      desk: 260,
      actors: [
        { who: "me", x: 260, pose: "type" },
        { who: "client", x: 460, from: 600, pose: "stand", flip: true },
      ],
      talks: [{ who: "client", kind: "ほめる", text: "段取りが早くて助かる" }],
    },
    jump: {
      bg: "shop",
      actors: [
        { who: "me", x: 260, pose: "teach" },
        { who: "newbie", x: 420, pose: "stand", flip: true },
      ],
      talks: [
        { who: "me", kind: "話しかける", text: "仕込みは表にして回そう" },
        { who: "newbie", kind: "ほめる", text: "店長、分かりやすいです" },
      ],
    },
  },
};

const KIND_C: Record<Kind, string> = {
  仕事を渡す: "#2f6fd6",
  ほめる: "#2f9e5b",
  注意する: "#e0573f",
  話しかける: "#6b7280",
  ひとりごと: "#20a39e",
};
const RISK_C: Record<string, string> = { 低: "#2f9e5b", 中: "#d69a12", 高: "#e0573f" };
const BRANCH_LABEL: Record<BranchType, string> = { stay: "残る", move: "理由を持って移る", jump: "違う業界へ" };

function lookOf(companyId: string, who: Who): Look {
  if (who === "me") return ME;
  if (typeof who === "number") return LOOKS[companyId][String(who)];
  return EXTRA[who].look;
}
function nameOf(companyId: string, who: Who) {
  if (who === "me") return "分身";
  if (typeof who === "number") return getCompany(companyId).people[who].name.split("（")[0];
  return EXTRA[who].name;
}
function sceneOf(companyId: string, idx: number, pick: BranchType | null): Scene {
  const s = SCENES[companyId];
  if (idx >= 5) return s[pick ?? "stay"];
  return s[`t${idx}`];
}
/** 前の時点から上がった・下がった力 */
function changes(companyId: string, idx: number) {
  if (idx === 0) return [];
  const tl = getCompany(companyId).timeline;
  const out: { name: string; up: boolean; from: string; to: string }[] = [];
  data.abilities.forEach((a, k) => {
    const d = gradeIndex(tl[idx].grades[k]) - gradeIndex(tl[idx - 1].grades[k]);
    if (d !== 0) out.push({ name: a, up: d > 0, from: tl[idx - 1].grades[k], to: tl[idx].grades[k] });
  });
  return out;
}

export default function GrowApp() {
  const m = useMirai();
  const [pick, setPick] = useState<BranchType | null>(null);
  return (
    <div className="vg">
      <header className="vg-top">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="text-[13px] text-[var(--ink2)] hover:text-[var(--ink)]">
            ← 案の一覧へ
          </Link>
          <span className="flex items-center gap-2 text-[16px] font-bold">
            <svg viewBox="-24 -92 48 96" className="h-8 w-5" aria-hidden>
              <Chibi look={ME} face="good" />
            </svg>
            未来デバッグ　職場のようす
          </span>
          <nav className="ml-auto flex flex-wrap gap-1" aria-label="進み具合">
            {STEPS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => m.go(s)}
                aria-current={s === m.step}
                className={`rounded-full px-3 py-1 text-[12px] ${s === m.step ? "bg-[var(--teal)] font-bold text-white" : "text-[var(--ink2)] hover:bg-white"}`}
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
        {m.step === "run" && (
          <Run
            key={m.companyId}
            companyId={m.companyId}
            pick={pick}
            onPick={setPick}
            onDone={() => m.go("result")}
          />
        )}
        {m.step === "result" && <Result companyId={m.companyId} pick={pick} onCompare={() => m.go("compare")} />}
        {m.step === "compare" && <Compare onBack={() => m.go("result")} />}
      </main>
      <p className="pb-6 text-center text-[12px] text-[var(--ink2)]">{data.meta.sampleNote}</p>
      <InfoWindow
        screen={`G案／${STEP_LABEL[m.step]}`}
        screenNote={SCREEN_NOTE[m.step]}
        items={HELP}
        features={FEATURES}
        accent="#20a39e"
        onBeforeFlash={(it) => {
          const h = HELP.find((x) => x.id === it.id);
          if (h && h.step !== m.step) m.go(h.step);
        }}
      />
    </div>
  );
}

function Btn({ children, onClick, disabled, ghost }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; ghost?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${ghost ? "vg-btn2" : "vg-btn"} px-6 py-3.5 text-[15px] font-bold`}>
      {children}
    </button>
  );
}

/* ---------- 職場の舞台（SVG＋吹き出し） ---------- */
function Stage({ companyId, scene, mood, face, play = true, pops = [], talkStart = 0.7 }: { companyId: string; scene: Scene; mood?: Mood; face?: Face; play?: boolean; pops?: ReturnType<typeof changes>; talkStart?: number }) {
  const meX = scene.actors.find((a) => a.who === "me")?.x ?? 320;
  return (
    <div className={`vg-stage ${play ? "" : "vg-still"}`}>
      <svg viewBox="0 0 640 300" className="block h-auto w-full" role="img" aria-label="職場で働く分身のようす">
        <Backdrop bg={scene.bg} night={scene.night} />
        {scene.actors.map((a, i) => {
          const isMe = a.who === "me";
          return (
            <g
              key={i}
              className="vg-mover"
              style={{ "--x0": `${a.from ?? a.x}px`, "--x1": `${a.x}px`, "--y": `${a.small ? 254 : 250}px` } as React.CSSProperties}
            >
              <g transform={a.small ? "scale(0.82)" : undefined}>
                <Chibi look={lookOf(companyId, a.who)} pose={a.pose} flip={a.flip} face={isMe ? (face ?? a.face ?? "good") : (a.face ?? "good")} mood={isMe ? mood : undefined} />
              </g>
            </g>
          );
        })}
        {scene.desk !== undefined && <Desk x={scene.desk} />}
      </svg>
      {/* 吹き出し */}
      {scene.talks.map((t, i) => {
        const a = scene.actors.find((x) => x.who === t.who);
        const x = Math.max(16, Math.min(84, ((a?.x ?? 320) / 640) * 100));
        return (
          <p
            key={i}
            className={`vg-bubble ${t.kind === "ひとりごと" ? "think" : ""}`}
            style={{ left: `${x}%`, top: `${4 + i * 15}%`, animationDelay: `${talkStart + i * 1.1}s`, borderColor: KIND_C[t.kind] }}
          >
            <span className="vg-kind" style={{ background: KIND_C[t.kind] }}>
              {nameOf(companyId, t.who)}
            </span>
            {t.text}
          </p>
        );
      })}
      {/* 力の＋− */}
      {pops.length > 0 && (
        <div className={`vg-pops ${meX > 400 ? "left" : ""}`} style={{ left: `${(meX / 640) * 100 + (meX > 400 ? -6 : 6)}%` }}>
          {pops.map((p, k) => (
            <span key={p.name} className={`vg-pop ${p.up ? "up" : "down"}`} style={{ animationDelay: `${talkStart + scene.talks.length * 1.1 + k * 0.3}s` }}>
              {p.name} {p.up ? "＋" : "−"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 1. 求人 ---------- */
function Job({ onRun }: { onRun: () => void }) {
  const j = data.job;
  return (
    <section className="grid gap-6 md:grid-cols-[1fr_360px]">
      <article className="vg-card p-6 sm:p-8">
        <p className="text-[13px] text-[var(--ink2)]">
          {j.company} ／ {j.area}
        </p>
        <h1 className="vg-title mt-1 text-[26px] leading-snug font-bold sm:text-[32px]">{j.title}</h1>
        <p className="mt-3 text-[15px] font-bold">
          {j.salary}　{j.hours}
        </p>
        <p className="mt-3 flex flex-wrap gap-2">
          {j.tags.map((t) => (
            <span key={t} className="rounded-full bg-[var(--mint)] px-3 py-1 text-[12.5px] font-bold text-[#11645f]">
              {t}
            </span>
          ))}
        </p>
        <div className="mt-4 grid gap-2 text-[15.5px] leading-8">
          {j.body.map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>
      </article>
      <aside className="vg-card flex flex-col gap-4 overflow-hidden p-0" data-h="cta">
        <Stage companyId="aoba" scene={SCENES.aoba.t2} mood="元気" talkStart={0.4} />
        <div className="grid gap-3 px-6 pb-6">
          <p className="vg-title text-[18px] leading-8 font-bold">この職場で働く自分を、入社する前に見てみる。</p>
          <Btn onClick={onRun}>入社後を試運転する</Btn>
          <p className="text-[12px] text-[var(--ink2)]">分身が5回試走し、よく出た筋書きを見せます</p>
        </div>
      </aside>
    </section>
  );
}

/* ---------- 2. 入力（分身をつくる） ---------- */
function Input({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <div className="flex flex-wrap items-end gap-5">
        <svg viewBox="-40 -130 80 136" className="h-28 w-auto" aria-hidden>
          <Chibi look={ME} pose={m.answered >= 10 ? "cheer" : "study"} face="good" mood="元気" />
        </svg>
        <div>
          <h2 className="vg-title text-[26px] font-bold sm:text-[32px]">分身をつくる</h2>
          <p className="mt-1 text-[14px] text-[var(--ink2)]">選ぶだけで5分。いまは見本の回答が入っています。</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2" data-h="questions">
        {data.questions.map((q, i) => (
          <fieldset key={q.id} className="vg-card p-5">
            <legend className="sr-only">{q.text}</legend>
            <p className="flex items-baseline gap-3">
              <span className="vg-num">{i + 1}</span>
              <span className="text-[15px] font-bold">{q.text}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <button key={o} type="button" aria-pressed={m.isOn(q.id, o)} onClick={() => m.toggle(q.id, o)} className="vg-chip px-3 py-1.5 text-[14px] font-bold">
                  {o}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <label className="vg-card p-5" data-h="area">
          <span className="text-[15px] font-bold">住むエリア</span>
          <span className="mt-1 block text-[12.5px] text-[var(--ink2)]">通える範囲の求人を出すために使います。</span>
          <select value={m.area} onChange={(e) => m.setArea(e.target.value)} className="mt-3 block rounded-xl border-2 border-[#e1d6c3] bg-white px-3 py-2 text-[15px] font-bold">
            {data.areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Btn onClick={() => m.go("company")}>分身ができた。職場を選ぶ</Btn>
        <span className="text-[16px] font-bold tabular-nums">{m.answered}/10</span>
      </div>
    </section>
  );
}

/* ---------- 3. 職場を選ぶ ---------- */
function Company({ m }: { m: ReturnType<typeof useMirai> }) {
  return (
    <section>
      <h2 className="vg-title text-[26px] font-bold sm:text-[32px]">どの職場で働いてみる？</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">会社も人物もすべて架空です。</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2" data-h="companies">
        {data.companies.map((c) => {
          const on = m.companyId === c.id;
          const preview: Scene = {
            bg: c.id === "aoba" ? "office" : "warehouse",
            actors: [
              { who: 0, x: 200, pose: "stand" },
              { who: 1, x: 320, pose: "stand" },
              { who: 2, x: 440, pose: "stand", flip: true },
            ],
            talks: [],
          };
          return (
            <button key={c.id} type="button" aria-pressed={on} onClick={() => m.setCompanyId(c.id)} className={`vg-card overflow-hidden p-0 text-left ${on ? "ring-4 ring-[var(--teal)]" : ""}`}>
              <Stage companyId={c.id} scene={preview} play={false} />
              <div className="p-5">
                <p className="vg-title text-[20px] font-bold">{c.name}</p>
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
                <ul className="mt-3 grid gap-1 border-t border-dashed border-[#e1d6c3] pt-3 text-[13px] leading-6">
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
        <Btn onClick={() => m.go("run")}>{m.company.name}で働いてみる</Btn>
      </div>
    </section>
  );
}

/* ---------- 4. 試走（働くようす） ---------- */
const SCENE_MS = 6200;

function Run({ companyId, pick, onPick, onDone }: { companyId: string; pick: BranchType | null; onPick: (b: BranchType) => void; onDone: () => void }) {
  const c = getCompany(companyId);
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const forkIdx = c.timeline.findIndex((x) => "fork" in x && x.fork);
  const waiting = idx === forkIdx && !pick;
  const last = idx >= c.timeline.length - 1;

  useEffect(() => {
    if (!auto || reduced || waiting || last) return;
    const id = window.setTimeout(() => setIdx((i) => i + 1), SCENE_MS);
    return () => clearTimeout(id);
  }, [idx, auto, reduced, waiting, last]);

  const next = () => {
    setIdx((i) => i + 1);
    document.getElementById("vg-run-top")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const tl = c.timeline[idx];
  const tp = data.timepoints[idx];
  const scene = sceneOf(companyId, idx, pick);
  const pops = changes(companyId, idx);
  const mood = MOOD_OF[tl.risk];
  const branch = pick ? c.branches.find((b) => b.type === pick) : null;
  const events = idx >= 5 && pick ? tl.events.filter((e) => (pick === "stay" ? e.startsWith("（残った筋）") : e.startsWith("（移った筋）"))).map((e) => e.replace(/^（.+?）/, "")) : tl.events;
  const shownEvents = idx >= 5 && pick === "jump" && branch ? [branch.path[branch.path.length - 1].replace(/^10年後：/, "")] : events;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="vg-title text-[26px] font-bold sm:text-[32px]">{c.name}で働く分身</h2>
          <p className="mt-1 text-[14px] text-[var(--ink2)]">時間を進めると出来事が起き、力ときもちが少しずつ変わります。予測ではなくシナリオです。</p>
        </div>
      </div>

      {/* 5人の分身（同じ条件で5回試走） */}
      <div className="vg-card mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3" data-h="runs">
        <p className="text-[13px] font-bold text-[var(--ink2)]">同じ条件で5回試走中</p>
        <ul className="flex flex-wrap gap-3">
          {c.runs.map((r, i) => {
            const rk = idx === 0 ? c.timeline[0].risk : r.risk[Math.min(idx, 5) - 1];
            return (
              <li key={r.id} className="flex items-center gap-1.5" title={r.route}>
                <svg viewBox="-24 -126 48 132" className="h-12 w-auto" aria-hidden>
                  <Chibi look={{ ...ME, shirt: i === 0 ? ME.shirt : "#9fb7b5" }} face={FACE_OF[rk]} mood={MOOD_OF[rk]} />
                </svg>
                <span className="text-[11.5px] leading-4 text-[var(--ink2)]">
                  {i + 1}回目
                  <br />
                  {MOOD_OF[rk]}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="ml-auto text-[12px] text-[var(--ink2)]">舞台はよく出た筋（1回目）</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid min-w-0 gap-4">
          <div className="relative scroll-mt-24" id="vg-run-top">
            <Stage key={`${idx}-${pick ?? ""}`} companyId={companyId} scene={scene} mood={mood} face={FACE_OF[tl.risk]} play={!reduced} pops={pops} />
            {/* カレンダー */}
            <div key={`cal-${idx}`} className="vg-cal" aria-live="polite">
              <span className="vg-cal-ring" />
              <span className="text-[10px] text-[var(--ink2)]">入社から</span>
              <span className="vg-title text-[18px] leading-tight font-bold">{tp.label}</span>
            </div>
            {/* 分かれ道 */}
            {waiting && (
              <div className="vg-fork">
                <div className="vg-card max-w-[520px] p-5 text-center sm:p-6">
                  <p className="text-[12px] font-bold text-[var(--coral)]">分かれ道</p>
                  <p className="vg-title mt-1 text-[18px] leading-8 font-bold sm:text-[20px]">ここで筋書きが分かれます。どちらの先を見ますか？</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {c.branches
                      .filter((b) => b.type !== "jump")
                      .map((b) => (
                        <button key={b.type} type="button" onClick={() => onPick(b.type as BranchType)} className="vg-choice p-3 text-left">
                          <span className="block text-[12px] font-bold text-[var(--teal)]">{BRANCH_LABEL[b.type as BranchType]}</span>
                          <span className="block text-[14px] leading-6 font-bold">{b.title.replace(/^理由を持って移る：/, "")}</span>
                          <span className="block text-[12px] text-[var(--ink2)]">5回中 {b.count}回</span>
                        </button>
                      ))}
                  </div>
                  <button type="button" onClick={() => onPick("jump")} className="mt-3 text-[13px] text-[var(--ink2)] underline underline-offset-4">
                    違う業界へ行く筋も見る
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!last ? (
              <>
                <Btn onClick={next} disabled={waiting}>
                  次の時点へ
                </Btn>
                {!reduced && (
                  <Btn ghost onClick={() => setAuto((a) => !a)}>
                    {auto ? "‖ 止める" : "▶ 自動で進める"}
                  </Btn>
                )}
              </>
            ) : (
              <Btn onClick={onDone}>まとめを見る</Btn>
            )}
            {!last && (
              <button type="button" onClick={onDone} className="text-[13px] text-[var(--ink2)] underline underline-offset-4">
                待たずに結果へ
              </button>
            )}
            <ol className="ml-auto flex gap-1.5" aria-label="時点">
              {data.timepoints.map((t, i) => (
                <li key={t.id} className={`h-2.5 w-6 rounded-full ${i <= idx ? "bg-[var(--teal)]" : "bg-[#e6dccb]"}`} title={t.label} />
              ))}
            </ol>
          </div>

          {/* 出来事のログ */}
          <div key={`log-${idx}-${pick ?? ""}`} className="vg-card vg-in p-5">
            <p className="text-[12.5px] font-bold text-[var(--teal)]">
              {tp.label}の出来事{idx >= 5 && pick ? `（${BRANCH_LABEL[pick]}筋）` : ""}
            </p>
            <ul className="mt-1 grid gap-1">
              {shownEvents.map((e) => (
                <li key={e} className="text-[16px] leading-8 font-bold">
                  {e}
                </li>
              ))}
            </ul>
            <ul className="mt-2 grid gap-1 border-t border-dashed border-[#e1d6c3] pt-2 text-[13.5px] leading-6">
              {scene.talks.map((t, i) => (
                <li key={i}>
                  <span className="mr-2 rounded px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ background: KIND_C[t.kind] }}>
                    {t.kind}
                  </span>
                  <b>{nameOf(companyId, t.who)}</b>「{t.text}」
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[14px] leading-7">
              <b>分身は</b>　{tl.action}
            </p>
          </div>
        </div>

        {/* 右：きもちと力 */}
        <aside className="grid content-start gap-4">
          <div className="vg-card flex items-center gap-4 p-5">
            <svg viewBox="-18 -18 36 36" className="h-14 w-14 shrink-0" aria-hidden>
              <MoodIcon mood={mood} />
            </svg>
            <div>
              <p className="text-[12px] text-[var(--ink2)]">きもち</p>
              <p className="text-[22px] font-bold" style={{ color: RISK_C[tl.risk] }}>
                {mood}
              </p>
              <p className="text-[12px] text-[var(--ink2)]">辞めたくなる度合い：{tl.risk}</p>
            </div>
          </div>
          <div className="vg-card p-5">
            <p className="text-[12px] text-[var(--ink2)]">8つの力（S〜G）</p>
            <ul className="mt-2 grid gap-1.5">
              {data.abilities.map((a, k) => {
                const g = tl.grades[k];
                const ch = pops.find((p) => p.name === a);
                return (
                  <li key={a} className={`grid grid-cols-[6.5rem_1fr_1.6rem] items-center gap-2 text-[13px] ${ch ? "vg-flash" : ""}`}>
                    <span className="truncate">{a}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-[#efe6d6]">
                      <span className="vg-bar block h-full rounded-full" style={{ width: `${((gradeIndex(g) + 1) / 8) * 100}%`, background: ch ? (ch.up ? "#2f9e5b" : "#e0573f") : "var(--teal)" }} />
                    </span>
                    <span className="text-center text-[15px] font-bold">{g}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11.5px] leading-5 text-[var(--ink2)]">選んだ目標への近さです。人の格付けではありません。</p>
          </div>
        </aside>
      </div>

      {/* その先の姿 */}
      {last && branch && (
        <div className="vg-card vg-in mt-4 p-5">
          <p className="text-[12.5px] font-bold text-[var(--teal)]">「{BRANCH_LABEL[branch.type as BranchType]}」筋の、その先</p>
          <ol className="mt-2 grid gap-3 sm:grid-cols-3">
            {branch.path.map((p, i) => (
              <li key={p} className="flex items-center gap-3 rounded-xl bg-[var(--paper)] p-3">
                <svg viewBox="-28 -126 56 132" className="h-14 w-auto shrink-0" aria-hidden>
                  <Chibi look={ME} pose={(["walk", "type", "cheer"] as Pose[])[i]} face="good" mood="元気" />
                </svg>
                <span className="text-[13.5px] leading-6">{p}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[13px] text-[var(--ink2)]">{branch.why}</p>
        </div>
      )}

    </section>
  );
}

/* ---------- 5. まとめ（結果） ---------- */
function Result({ companyId, pick, onCompare }: { companyId: string; pick: BranchType | null; onCompare: () => void }) {
  const c = getCompany(companyId);
  const [sel, setSel] = useState(4);
  const [open, setOpen] = useState<number | null>(null);
  const tl = c.timeline[sel];
  const last = c.timeline[c.timeline.length - 1];

  return (
    <section>
      <h2 className="vg-title text-[26px] font-bold sm:text-[32px]">まとめ　{c.name}での10年</h2>
      <p className="mt-1 text-[14px] text-[var(--ink2)]">5回の試走で、よく出た筋書きです。予測ではなくシナリオです。時点を押すと詳しく出ます。</p>

      <div className="vg-card mt-5 overflow-x-auto p-4 sm:p-5" data-h="timeline">
        <ol className="grid min-w-[620px] grid-cols-5 gap-3">
          {c.timeline.slice(1).map((x, k) => {
            const i = k + 1;
            return (
              <li key={x.tp}>
                <button type="button" aria-pressed={sel === i} onClick={() => setSel(i)} className="vg-day grid h-full w-full justify-items-center gap-1 p-3 text-center">
                  <span className="text-[13px] font-bold text-[var(--teal)]">{data.timepoints[i].label}</span>
                  <svg viewBox="-24 -126 48 132" className="h-16 w-auto" aria-hidden>
                    <Chibi look={ME} face={FACE_OF[x.risk]} mood={MOOD_OF[x.risk]} pose={i === 3 ? "present" : i === 5 ? "cheer" : "stand"} />
                  </svg>
                  <span className="text-[12.5px] leading-5">{x.events[0].replace(/^（.+?）/, "")}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div key={sel} className="vg-card vg-in p-6">
          <p className="text-[13px] font-bold text-[var(--teal)]">{data.timepoints[sel].label}</p>
          <ul className="mt-1 grid gap-1.5">
            {tl.events.map((e) => (
              <li key={e} className="text-[16px] leading-8 font-bold">
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-dashed border-[#e1d6c3] pt-3 text-[15px] leading-7">
            <b>分身は</b>　{tl.action}
          </p>
        </div>
        <div className="vg-card flex items-start gap-4 p-6" data-h="risk">
          <svg viewBox="-18 -18 36 36" className="h-16 w-16 shrink-0" aria-hidden>
            <MoodIcon mood={MOOD_OF[tl.risk]} />
          </svg>
          <div>
            <p className="text-[12px] text-[var(--ink2)]">辞めたくなる度合い</p>
            <p className="text-[34px] leading-tight font-bold" style={{ color: RISK_C[tl.risk] }}>
              {tl.risk}
              <span className="ml-2 text-[15px]">（{MOOD_OF[tl.risk]}）</span>
            </p>
            <p className="mt-2 text-[15px] leading-7">{tl.riskReason}</p>
          </div>
        </div>
      </div>

      <div className="vg-card mt-5 p-5 sm:p-6" data-h="abilities">
        <p className="text-[13px] text-[var(--ink2)]">10年後の力（S〜G。選んだ目標への近さで、人の格付けではありません。押すと理由）</p>
        <ul className="mt-3 grid gap-x-8 gap-y-1 md:grid-cols-2">
          {data.abilities.map((a, k) => {
            const g0 = c.timeline[0].grades[k];
            const g = last.grades[k];
            return (
              <li key={a} className="border-b border-dashed border-[#e1d6c3]">
                <button type="button" onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="grid w-full grid-cols-[7rem_1fr_auto] items-center gap-3 py-2.5 text-left">
                  <span className="text-[15px]">{a}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-[#efe6d6]">
                    <span className="block h-full rounded-full bg-[var(--teal)]" style={{ width: `${((gradeIndex(g) + 1) / 8) * 100}%` }} />
                  </span>
                  <span className="text-[14px] text-[var(--ink2)]">
                    {g0} → <b className="text-[20px] text-[var(--ink)]">{g}</b>
                  </span>
                </button>
                {open === k && <p className="pb-3 text-[13px] leading-6 text-[var(--ink2)]">なぜ：{c.finalReasons[k]}</p>}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8" data-h="branches">
        <h3 className="vg-title text-[22px] font-bold">3年後の分かれ道</h3>
        <p className="mt-1 text-[13.5px] text-[var(--ink2)]">残る筋・理由を持って移る筋・まったく違う業界へ行く筋。{pick ? `試走で見たのは「${BRANCH_LABEL[pick]}」筋です。` : ""}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {c.branches.map((b) => (
            <article key={b.title} className={`vg-card p-5 ${pick === b.type ? "ring-4 ring-[var(--teal)]" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-[12px] font-bold text-[#11645f]">{BRANCH_LABEL[b.type as BranchType]}</span>
                <span className="text-[13px] text-[var(--ink2)]">5回中 {b.count}回</span>
              </div>
              <p className="mt-3 text-[16px] leading-7 font-bold">{b.title.replace(/^理由を持って移る：|^違う業界へ：/, "")}</p>
              <ol className="mt-2 grid gap-1 text-[13px] leading-6">
                {b.path.map((p) => (
                  <li key={p}>・{p}</li>
                ))}
              </ol>
              <p className="mt-2 text-[13px] leading-6 text-[var(--ink2)]">{b.why}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="vg-card p-6" data-h="boss">
          <h3 className="text-[18px] font-bold">上司・同僚の情報で、見える筋が変わる</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[c.bossCompare.without, c.bossCompare.with].map((x, i) => (
              <div key={x.label} className={`rounded-xl p-4 ${i ? "bg-[var(--mint)]" : "bg-[var(--paper)]"}`}>
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
        <div className="vg-card p-6" data-h="ask">
          <p className="text-[13px] font-bold text-[var(--teal)]">面接で確かめる質問</p>
          <ul className="mt-3 grid gap-2.5">
            {c.questionsToAsk.map((q) => (
              <li key={q} className="grid grid-cols-[1.2rem_1fr] gap-2 text-[14.5px] leading-7">
                <span className="text-[var(--coral)]">●</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Btn onClick={onCompare}>2つの職場を並べる</Btn>
        <p className="max-w-[46ch] text-[13px] leading-6 text-[var(--ink2)]">{data.meta.notice}</p>
      </div>
    </section>
  );
}

/* ---------- 6. 2社を比べる ---------- */
function Compare({ onBack }: { onBack: () => void }) {
  return (
    <section data-h="compare">
      <h2 className="vg-title text-[26px] font-bold sm:text-[32px]">{data.compare.headline}</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {data.companies.map((c) => {
          const last = c.timeline[c.timeline.length - 1];
          return (
            <article key={c.id} className="vg-card overflow-hidden p-0">
              <Stage companyId={c.id} scene={SCENES[c.id].stay} mood="元気" play={false} />
              <div className="p-5">
                <p className="vg-title text-[19px] font-bold">{c.name}</p>
                <ul className="mt-2">
                  {c.timeline.slice(1).map((x, k) => (
                    <li key={x.tp} className="grid grid-cols-[4.5rem_1fr_3.6rem] items-center gap-2 border-b border-dashed border-[#e1d6c3] py-1.5 text-[13px]">
                      <span className="font-bold text-[var(--teal)]">{data.timepoints[k + 1].label}</span>
                      <span className="truncate">{x.events[0]}</span>
                      <span className="text-right font-bold" style={{ color: RISK_C[x.risk] }}>
                        {MOOD_OF[x.risk]}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--ink2)]">
                  {data.abilities.map((a, k) => (
                    <span key={a} className="whitespace-nowrap">
                      {a} <b className="text-[15px] text-[var(--ink)]">{last.grades[k]}</b>
                    </span>
                  ))}
                </p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="vg-card mt-5 overflow-hidden p-0">
        {data.compare.rows.map((r) => (
          <div key={r.label} className="grid gap-1 border-b border-dashed border-[#e1d6c3] px-5 py-3 last:border-b-0 md:grid-cols-[11rem_1fr_1fr] md:gap-4">
            <p className="text-[13px] font-bold text-[var(--ink2)]">{r.label}</p>
            <p className="text-[14.5px] leading-7">
              <span className="mr-2 text-[12px] font-bold text-[var(--teal)]">あおば社</span>
              {r.aoba}
            </p>
            <p className="text-[14.5px] leading-7">
              <span className="mr-2 text-[12px] font-bold text-[var(--teal)]">みどり物流</span>
              {r.midori}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-[var(--ink2)]">{data.compare.note}</p>
      <div className="mt-6">
        <Btn ghost onClick={onBack}>
          ← まとめに戻る
        </Btn>
      </div>
    </section>
  );
}
