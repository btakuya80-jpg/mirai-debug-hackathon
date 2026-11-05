"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import raw from "@/data/mirai.json";

export const data = raw;
export type Company = (typeof raw.companies)[number];
export type Timepoint = (typeof raw.timepoints)[number];
export type Risk = "高" | "中" | "低";

/** 画面の流れ（3案共通） */
export const STEPS = ["job", "input", "company", "run", "result", "compare"] as const;
export type Step = (typeof STEPS)[number];
export const STEP_LABEL: Record<Step, string> = {
  job: "求人",
  input: "入力",
  company: "会社を選ぶ",
  run: "試走",
  result: "結果",
  compare: "2社を比べる",
};

export type Answers = Record<string, string | string[]>;

function defaultAnswers(): Answers {
  const a: Answers = {};
  for (const q of raw.questions) a[q.id] = q.default as string | string[];
  return a;
}

/** 等級（G〜S）を 0〜7 の数に */
export function gradeIndex(g: string) {
  return raw.grades.indexOf(g);
}

export function getCompany(id: string): Company {
  return raw.companies.find((c) => c.id === id) ?? raw.companies[0];
}

export const RISK_LEVEL: Record<string, number> = { 低: 0, 中: 1, 高: 2 };

/**
 * 3案で共通に使う、画面の流れと入力の状態。
 * 今はAIにつながず、data/mirai.json の見本の結果を返す。
 * URL の #job / #input … と同期するので、デモ撮影で途中から開ける。
 */
export function useMirai() {
  const [step, setStep] = useState<Step>("job");
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [area, setArea] = useState<string>(raw.defaultArea);
  const [companyId, setCompanyId] = useState<string>("aoba");

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace("#", "") as Step;
      if ((STEPS as readonly string[]).includes(h)) setStep(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const go = useCallback((s: Step) => {
    setStep(s);
    if (window.location.hash !== `#${s}`) history.pushState(null, "", `#${s}`);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const toggle = useCallback((qid: string, opt: string) => {
    setAnswers((prev) => {
      const q = raw.questions.find((x) => x.id === qid)!;
      if (!q.multi) return { ...prev, [qid]: opt };
      const cur = (prev[qid] as string[]) ?? [];
      const max = (q as { max?: number }).max ?? 99;
      if (cur.includes(opt)) return { ...prev, [qid]: cur.filter((x) => x !== opt) };
      if (cur.length >= max) return { ...prev, [qid]: [...cur.slice(1), opt] };
      return { ...prev, [qid]: [...cur, opt] };
    });
  }, []);

  const isOn = useCallback(
    (qid: string, opt: string) => {
      const v = answers[qid];
      return Array.isArray(v) ? v.includes(opt) : v === opt;
    },
    [answers],
  );

  const answered = raw.questions.filter((q) => {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;

  return {
    step,
    go,
    answers,
    toggle,
    isOn,
    answered,
    area,
    setArea,
    companyId,
    setCompanyId,
    company: getCompany(companyId),
  };
}

/** 動きを減らす設定を尊重する */
const RM = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const m = window.matchMedia(RM);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => false);
}

/**
 * 試走の演出用タイマー。0→1 に進む値と、終わったかどうかを返す。
 * 5本の試走 × 5時点を、duration ミリ秒で見せる。呼ぶ側は key で作り直してやり直す。
 */
export function useRunClock(active: boolean, duration = 9000) {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active || reduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration, reduced]);
  const v = reduced ? 1 : t;
  return { t: v, done: v >= 1 };
}
