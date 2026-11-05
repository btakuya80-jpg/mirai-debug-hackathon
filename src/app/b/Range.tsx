"use client";

import { useEffect, useRef, useState } from "react";
import { data, usePrefersReducedMotion } from "@/lib/mirai";

const W = 960;
const H = 360;
const BASE = H - 54;
const MAXH = 250;
const PAD = 70;
const STEP = (W - PAD * 2) / 7;

export const peakX = (i: number) => PAD + i * STEP;
const peakH = (g: number) => 26 + (g / 7) * MAXH;

/** 数の並びを、目標値へなめらかに近づける */
export function useTween(target: number[], ms = 1100) {
  const reduced = usePrefersReducedMotion();
  const [v, setV] = useState(target);
  const cur = useRef(target);
  const key = target.join(",");
  useEffect(() => {
    if (reduced) return;
    const goal = key.split(",").map(Number);
    const from = cur.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const next = goal.map((t, i) => (from[i] ?? 0) + (t - (from[i] ?? 0)) * e);
      cur.current = next;
      setV(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, ms, reduced]);
  return reduced ? target : v;
}

/** 山並みの線（Catmull-Rom を3次ベジェにして、なめらかに） */
export function ridgePath(levels: number[], squash = 1) {
  const pts: [number, number][] = [[0, BASE - 10]];
  levels.forEach((g, i) => {
    const h = peakH(g) * squash;
    if (i > 0) {
      const prevH = peakH(levels[i - 1]) * squash;
      pts.push([peakX(i) - STEP / 2, BASE - Math.min(h, prevH) * 0.52]);
    } else {
      pts.push([peakX(0) - STEP / 2, BASE - h * 0.4]);
    }
    pts.push([peakX(i), BASE - h]);
  });
  pts.push([peakX(7) + STEP / 2, BASE - peakH(levels[7]) * squash * 0.25]);
  pts.push([W, BASE - 10]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

type Props = {
  levels: number[];
  /** ひとつ前の時点（うすく後ろに重ねる） */
  ghost?: number[];
  /** もう1社（比べる画面で重ねる） */
  other?: number[];
  grades: string[];
  selected?: number | null;
  onPick?: (i: number) => void;
  id: string;
  labels?: boolean;
};

export default function Range({ levels, ghost, other, grades, selected, onPick, id, labels = true }: Props) {
  const v = useTween(levels);
  const g = useTween(ghost ?? levels.map(() => 0));
  const o = useTween(other ?? levels.map(() => 0));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="8つの力を山の高さで表した図">
      <defs>
        <linearGradient id={`${id}-main`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f8d7c" />
          <stop offset="1" stopColor="#1f4f45" />
        </linearGradient>
        <linearGradient id={`${id}-other`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6a07a" stopOpacity=".85" />
          <stop offset="1" stopColor="#e2714a" stopOpacity=".5" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={`${ridgePath(v)} L${W},${H} L0,${H} Z`} />
        </clipPath>
      </defs>

      {/* 遠い山（ずっと同じ。奥行きのため） */}
      <path d={`${ridgePath([3, 5, 2, 4, 6, 3, 5, 2], 0.62)} L${W},${H} L0,${H} Z`} fill="#c5dbee" />

      {ghost && <path d={`${ridgePath(g)} L${W},${H} L0,${H} Z`} fill="#a9c7e3" opacity=".75" />}

      {other && (
        <path d={`${ridgePath(o)} L${W},${H} L0,${H} Z`} fill={`url(#${id}-other)`} />
      )}

      <path d={`${ridgePath(v)} L${W},${H} L0,${H} Z`} fill={`url(#${id}-main)`} opacity={other ? 0.88 : 1} />

      {/* 雪：A・S の山頂だけ白くなる */}
      <g clipPath={`url(#${id}-clip)`}>
        {v.map((lv, i) =>
          lv >= 5.5 ? (
            <rect
              key={i}
              x={peakX(i) - 60}
              y={BASE - peakH(lv) - 2}
              width="120"
              height={Math.min(44, (lv - 5.5) * 34 + 14)}
              fill="#fffdf9"
              opacity=".95"
            />
          ) : null,
        )}
      </g>

      {/* 手前の丘 */}
      <path d={`M0,${H - 30} C200,${H - 60} 380,${H - 18} 560,${H - 40} S860,${H - 26} ${W},${H - 44} L${W},${H} L0,${H} Z`} fill="#24584d" />

      {labels &&
        v.map((lv, i) => {
          const y = BASE - peakH(lv);
          const on = selected === i;
          return (
            <g
              key={i}
              onClick={() => onPick?.(i)}
              style={{ cursor: onPick ? "pointer" : undefined }}
              role={onPick ? "button" : undefined}
              aria-label={`${data.abilities[i]}：${grades[i]}`}
              tabIndex={onPick ? 0 : undefined}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick?.(i)}
            >
              <line x1={peakX(i)} y1={y - 6} x2={peakX(i)} y2={y - 34} stroke="#17302b" strokeWidth="1.5" />
              <path d={`M${peakX(i)},${y - 34} l26,7 l-26,7 Z`} fill={on ? "#ff7a45" : "#17302b"} />
              <text x={peakX(i) + 6} y={y - 22.5} fontSize="11" fontWeight="800" fill="#fff" fontFamily="var(--font-brico)">
                {grades[i]}
              </text>
              <text
                x={peakX(i)}
                y={H - 12}
                fontSize="15"
                textAnchor="middle"
                fill={on ? "#ffc94a" : "#f2f7f2"}
                fontWeight={on ? 900 : 700}
                fontFamily="var(--font-zen)"
              >
                {data.abilities[i]}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
