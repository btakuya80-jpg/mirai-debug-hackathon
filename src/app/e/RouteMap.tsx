"use client";

import { data, type Company } from "@/lib/mirai";

/* 路線図の形（E案で共通）。入社〜3年後が本線、3年後の駅から3本に分かれる */
export const MAIN_X = [70, 200, 330, 460, 590];
export const MAIN_Y = 200;
export const END_X = 900;
export const MID_X = 780;
export const BRANCH_Y: Record<string, number> = { move: 78, stay: 200, jump: 322 };
export const LINE_COLOR: Record<string, string> = { stay: "var(--stay)", move: "var(--move)", jump: "var(--jump)" };
export const LINE_NAME: Record<string, string> = { stay: "残る線", move: "移る線", jump: "違う業界線" };
const RISK_RING: Record<string, string> = { 高: "var(--alert)", 中: "#d99a00", 低: "transparent" };

export function branchPath(type: string) {
  const y = BRANCH_Y[type];
  return y === MAIN_Y ? `L${END_X},${y}` : `C${680},${MAIN_Y} ${690},${y} ${MID_X},${y} L${END_X},${y}`;
}
export function trainPath(type: string) {
  return `M${MAIN_X[0]},${MAIN_Y} L${MAIN_X[4]},${MAIN_Y} ${branchPath(type)}`;
}

/** 試走の行き先（筋書き）が、どの線に当たるか */
export function routeType(c: Company, route: string) {
  if (route.includes("残る")) return "stay";
  const jump = c.branches.find((b) => b.type === "jump");
  const key = jump?.title.split("：")[1]?.slice(0, 2) ?? "";
  return key && route.includes(key) ? "jump" : "move";
}

type Props = {
  c: Company;
  selected?: number | null;
  onPick?: (i: number) => void;
  draw?: boolean;
  children?: React.ReactNode;
  showCounts?: boolean;
};

export default function RouteMap({ c, selected, onPick, draw = true, children, showCounts = true }: Props) {
  return (
    <svg viewBox="0 0 960 400" className="block h-auto w-full" role="img" aria-label="入社から10年後までの路線図">
      {/* 線路 */}
      <path d={`M${MAIN_X[0]},${MAIN_Y} L${MAIN_X[4]},${MAIN_Y}`} stroke="var(--main)" strokeWidth="12" strokeLinecap="round" fill="none" className={draw ? "ve-line-draw" : ""} />
      {c.branches.map((b, i) => (
        <path
          key={b.type}
          d={`M${MAIN_X[4]},${MAIN_Y} ${branchPath(b.type)}`}
          stroke={LINE_COLOR[b.type]}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          className={draw ? "ve-line-draw" : ""}
          style={draw ? { animationDelay: `${0.5 + i * 0.18}s` } : undefined}
        />
      ))}

      {/* 線の名前と本数 */}
      {c.branches.map((b) => {
        const y = BRANCH_Y[b.type];
        return (
          <g key={b.type}>
            <text x={END_X - 4} y={y - 22} textAnchor="end" fontSize="15" fontWeight="900" fill={LINE_COLOR[b.type]} fontFamily="var(--font-murecho)">
              {LINE_NAME[b.type]}
              {showCounts && <tspan fontWeight="700" fill="var(--ink2)">{`　5本中${b.count}本`}</tspan>}
            </text>
            {/* 5年後の小駅 */}
            <circle cx={MID_X} cy={y} r="7" fill="#fff" stroke={LINE_COLOR[b.type]} strokeWidth="4" />
            <text x={MID_X} y={y + 28} textAnchor="middle" fontSize="12" fill="var(--ink2)" fontFamily="var(--font-murecho)">
              5年後
            </text>
          </g>
        );
      })}

      {/* 駅：入社〜3年後 */}
      {MAIN_X.map((x, i) => {
        const tl = c.timeline[i];
        const on = selected === i;
        return (
          <g
            key={x}
            onClick={() => onPick?.(i)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick?.(i)}
            role={onPick ? "button" : undefined}
            tabIndex={onPick ? 0 : undefined}
            aria-label={`${data.timepoints[i].label}：辞めたくなる度合い ${tl.risk}`}
            style={{ cursor: onPick ? "pointer" : undefined }}
          >
            {tl.risk !== "低" && <circle cx={x} cy={MAIN_Y} r="22" fill="none" stroke={RISK_RING[tl.risk]} strokeWidth="3" className={tl.risk === "高" ? "ve-pulse" : ""} />}
            <circle cx={x} cy={MAIN_Y} r={on ? 16 : 13} fill={on ? "var(--ink)" : "#fff"} stroke="var(--main)" strokeWidth="5" />
            <text x={x} y={MAIN_Y + 50} textAnchor="middle" fontSize="15" fontWeight={on ? 900 : 700} fill="var(--ink)" fontFamily="var(--font-murecho)">
              {data.timepoints[i].label}
            </text>
            <text x={x} y={MAIN_Y - 32} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink2)" fontFamily="var(--font-barlow)">
              {`M${String(i + 1).padStart(2, "0")}`}
            </text>
          </g>
        );
      })}

      {/* 終点：10年後 */}
      {c.branches.map((b) => {
        const y = BRANCH_Y[b.type];
        const on = selected === 5 && b.type === "stay";
        return (
          <g
            key={b.type}
            onClick={() => onPick?.(5)}
            role={onPick ? "button" : undefined}
            tabIndex={onPick ? 0 : undefined}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick?.(5)}
            style={{ cursor: onPick ? "pointer" : undefined }}
            aria-label={`10年後（${LINE_NAME[b.type]}）`}
          >
            <rect x={END_X - 14} y={y - 14} width="28" height="28" rx="6" fill={on ? "var(--ink)" : "#fff"} stroke={LINE_COLOR[b.type]} strokeWidth="5" />
            <text x={END_X} y={y + 38} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-murecho)">
              10年後
            </text>
          </g>
        );
      })}
      {children}
    </svg>
  );
}
