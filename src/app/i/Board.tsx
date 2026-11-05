/* I案「人生のすごろく盤」の絵。太い墨の線で描いた、刷り物のような平らな絵。
   絵の差し替え口は ArtSlot（i:place:〇〇 / i:board / i:thumb:〇〇）。 */

import { ArtSlot } from "@/lib/art";
import { BRANCHES, type Act, type BranchId, type Mood, type Place, type Who } from "@/lib/life";

export const INK = "#1f1b16";
const SW = 2.6;
export const COLOR: Record<Who, string> = {
  me: "#e23d28",
  boss: "#26437a",
  senpai: "#f2b824",
  peer: "#2e9d5b",
  local: "#7d4fc4",
  family: "#ef7f9f",
  student: "#1c9ea0",
};

function Arm({ d, c }: { d: string; c: string }) {
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d={d} stroke={c} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  );
}

export function Doll({ who, act = "talk", x, y = 190, flip, s = 1, mood = "普通" }: { who: Who; act?: Act; x: number; y?: number; flip?: boolean; s?: number; mood?: Mood }) {
  const c = COLOR[who];
  const down = act === "down";
  const arms = (() => {
    switch (act) {
      case "pc":
        return (
          <g className="i-tap">
            <Arm d="M-10,-38 L10,-28" c={c} />
            <Arm d="M10,-38 L24,-28" c={c} />
          </g>
        );
      case "machine":
        return (
          <g>
            <Arm d="M-12,-38 L-16,-20" c={c} />
            <g className="i-swing">
              <Arm d="M11,-38 L22,-54" c={c} />
            </g>
          </g>
        );
      case "build":
        return (
          <g>
            <Arm d="M-12,-38 L-16,-20" c={c} />
            <g className="i-swing">
              <Arm d="M11,-38 L20,-52" c={c} />
              <rect x="16" y="-72" width="6" height="22" fill="#b0763f" stroke={INK} strokeWidth={SW} />
              <rect x="10" y="-76" width="18" height="8" fill="#9aa3ad" stroke={INK} strokeWidth={SW} />
            </g>
          </g>
        );
      case "carry":
        return (
          <g>
            <Arm d="M-11,-38 L-12,-70" c={c} />
            <Arm d="M11,-38 L12,-70" c={c} />
            <rect x="-18" y="-96" width="36" height="24" fill="#d9a465" stroke={INK} strokeWidth={SW} />
            <path d="M-18,-86 h36" stroke={INK} strokeWidth="1.6" />
          </g>
        );
      case "cook":
        return (
          <g>
            <Arm d="M-12,-38 L-16,-20" c={c} />
            <g className="i-swing">
              <Arm d="M11,-36 L24,-32" c={c} />
              <path d="M22,-36 h26 a6,6 0 0 1 -6,8 h-14 a6,6 0 0 1 -6,-8z" fill="#3a3a3a" stroke={INK} strokeWidth={SW} />
            </g>
          </g>
        );
      case "teach":
        return (
          <g>
            <Arm d="M-12,-38 L-16,-20" c={c} />
            <Arm d="M11,-38 L30,-60" c={c} />
            <path d="M30,-60 l14,-14" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case "cheer":
        return (
          <g className="i-cheer">
            <Arm d="M-10,-40 L-22,-66" c={c} />
            <Arm d="M10,-40 L22,-66" c={c} />
          </g>
        );
      case "rest":
        return (
          <g>
            <Arm d="M-12,-38 L-6,-26" c={c} />
            <Arm d="M11,-38 L12,-28" c={c} />
            <rect x="6" y="-36" width="11" height="12" rx="2" fill="#fff" stroke={INK} strokeWidth={SW} />
          </g>
        );
      case "down":
        return (
          <g>
            <Arm d="M-11,-36 L-8,-16" c={c} />
            <Arm d="M11,-36 L8,-16" c={c} />
          </g>
        );
      default:
        return (
          <g>
            <Arm d="M-12,-38 L-16,-20" c={c} />
            <g className="i-swing">
              <Arm d="M11,-38 L24,-44" c={c} />
            </g>
          </g>
        );
    }
  })();
  return (
    <g className="i-mover" style={{ transform: `translate(${x}px, ${y}px)` }}>
      <g transform={`scale(${flip ? -s : s},${s})`}>
        <ellipse cx="0" cy="0" rx="18" ry="4" fill="rgba(31,27,22,.18)" />
        <g className={down ? "i-down" : act === "cheer" ? "i-hopping" : "i-bob"}>
          <rect x="-10" y="-12" width="8" height="12" fill={INK} />
          <rect x="2" y="-12" width="8" height="12" fill={INK} />
          <path d="M-12,-10 L-14,-40 Q0,-48 14,-40 L12,-10 Z" fill={c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <g transform={down ? "translate(3,4) rotate(14)" : undefined}>
            <circle cy="-60" r="14" fill="#f9dcc4" stroke={INK} strokeWidth={SW} />
            <path d={who === "boss" ? "M-14,-62 Q-14,-76 0,-76 Q14,-76 14,-62 L14,-66 L-14,-66Z" : who === "family" || who === "local" ? "M-15,-56 Q-17,-78 0,-77 Q17,-78 15,-56 Q12,-68 0,-70 Q-12,-68 -15,-56Z" : "M-14,-62 Q-13,-77 1,-76 Q15,-75 14,-61 Q6,-68 -14,-62Z"} fill={INK} />
            {down ? (
              <path d="M-7,-58 h4 M3,-58 h4 M-4,-50 q4,-3 8,0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <path d="M-5,-61 v4 M5,-61 v4" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
                <path d={mood === "元気" ? "M-5,-52 q5,5 10,0" : mood === "しんどい" ? "M-5,-50 q5,-4 10,0" : "M-4,-51 h8"} stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
          {arms}
        </g>
      </g>
    </g>
  );
}

/* ---------- 場面（横から見た平らな絵） ---------- */
const BG: Record<Place, [string, string]> = {
  office: ["#fdf5e4", "#e9d5ac"],
  factory: ["#e9ecef", "#c4c9ce"],
  construction: ["#d6ecf7", "#d7b98b"],
  logistics: ["#e7ecef", "#c2c8cc"],
  food: ["#fde9d6", "#d9b48a"],
  home: ["#fbefe1", "#e3c9a3"],
  school: ["#f2ead8", "#d5bf96"],
  overseas: ["#ffe6b8", "#e8cf9f"],
};

const S = { stroke: INK, strokeWidth: SW, strokeLinejoin: "round" as const };

export function Stage({ place, dark, children }: { place: Place; dark?: boolean; children?: React.ReactNode }) {
  const [wall, floor] = BG[place];
  return (
    <svg viewBox="0 0 400 220" className="block h-auto w-full" role="img" aria-label="場面">
      <ArtSlot id={`i:place:${place}`} w={400} h={220}>
        <rect width="400" height="220" fill={wall} />
        <rect y="190" width="400" height="30" fill={floor} {...S} />
        {place === "office" && (
          <g>
            <rect x="24" y="30" width="92" height="70" fill="#bfe3f3" {...S} />
            <path d="M70,30 v70 M24,65 h92" {...S} />
            <rect x="250" y="40" width="120" height="70" fill="#fff" {...S} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={262 + k * 36} y="54" width="26" height="22" fill={["#f7c531", "#8fd3b8", "#f59e8b"][k]} {...S} />
            ))}
            <rect x="140" y="146" width="130" height="10" fill="#c9935b" {...S} />
            <path d="M150,156 v34 M260,156 v34" {...S} />
            <rect x="196" y="112" width="44" height="32" fill="#2f3542" {...S} />
            <rect x="200" y="116" width="36" height="22" fill="#8fd3ff" />
          </g>
        )}
        {place === "factory" && (
          <g>
            <rect x="24" y="60" width="96" height="130" fill="#9aa3ad" {...S} />
            <circle cx="72" cy="100" r="18" fill="#fff" {...S} />
            <path d="M72,100 l10,-8" {...S} />
            <rect x="40" y="140" width="64" height="12" fill="#f08c2e" {...S} />
            <rect x="140" y="150" width="240" height="22" fill="#5d6570" {...S} />
            {[160, 220, 280, 340].map((x) => (
              <rect key={x} x={x} y="128" width="26" height="22" fill="#d9a465" {...S} className="i-belt" />
            ))}
            <path d="M140,172 v18 M380,172 v18" {...S} />
            <rect x="300" y="20" width="12" height="40" fill="#f7c531" {...S} />
          </g>
        )}
        {place === "construction" && (
          <g>
            {[40, 120, 200].map((x) => (
              <rect key={x} x={x} y="40" width="10" height="150" fill="#f2a33a" {...S} />
            ))}
            {[40, 100].map((y) => (
              <rect key={y} x="40" y={y} width="170" height="10" fill="#f2a33a" {...S} />
            ))}
            <path d="M330,190 v-170 h-120" stroke={INK} strokeWidth="6" fill="none" />
            <path d="M330,20 v-0" />
            <path d="M260,20 v40" {...S} />
            <rect x="248" y="60" width="24" height="16" fill="#9aa3ad" {...S} />
            {[300, 340].map((x) => (
              <path key={x} d={`M${x},190 l10,-30 l10,30z`} fill="#ff7043" {...S} />
            ))}
          </g>
        )}
        {place === "logistics" && (
          <g>
            {[20, 260].map((x) => (
              <g key={x}>
                <rect x={x} y="30" width="120" height="160" fill="none" {...S} />
                {[70, 120, 170].map((y) => (
                  <rect key={y} x={x} y={y} width="120" height="8" fill="#e46a3b" {...S} />
                ))}
                {[40, 90, 140].map((y, k) => (
                  <rect key={y} x={x + 14 + k * 20} y={y} width="34" height="30" fill="#d9a465" {...S} />
                ))}
              </g>
            ))}
            <rect x="170" y="160" width="60" height="14" fill="#5a6270" {...S} />
            <circle cx="182" cy="182" r="7" fill={INK} />
            <circle cx="218" cy="182" r="7" fill={INK} />
          </g>
        )}
        {place === "food" && (
          <g>
            <rect x="250" y="24" width="120" height="80" rx="6" fill="#2f3a32" {...S} />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M266,${46 + k * 20} h${84 - k * 16}`} stroke="#f4efe0" strokeWidth="4" strokeLinecap="round" />
            ))}
            <rect x="20" y="130" width="200" height="60" fill="#b9bec4" {...S} />
            <rect x="40" y="112" width="44" height="20" fill="#3a3a3a" {...S} />
            <path className="i-steam" d="M52,104 q-6,-10 0,-20 q6,-10 0,-20 M72,104 q-6,-10 0,-20" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="250" y="150" width="130" height="40" fill="#c9935b" {...S} />
          </g>
        )}
        {place === "home" && (
          <g>
            <rect x="40" y="30" width="90" height="80" fill={dark ? "#2c3559" : "#bfe3f3"} {...S} />
            <path d="M85,30 v80" {...S} />
            <rect x="200" y="130" width="170" height="40" rx="10" fill="#7aa6d6" {...S} />
            <rect x="200" y="112" width="170" height="26" rx="10" fill="#8fb6e0" {...S} />
            <path d="M330,190 v-100" {...S} />
            <path d="M310,90 h40 l-8,-24 h-24z" fill="#f7c531" {...S} />
          </g>
        )}
        {place === "school" && (
          <g>
            <rect x="60" y="24" width="280" height="96" fill="#2f5d50" {...S} />
            <path d="M80,60 q30,-14 60,0 M80,84 h120" stroke="#f4efe0" strokeWidth="3" fill="none" />
            {[40, 170, 300].map((x) => (
              <g key={x}>
                <rect x={x} y="156" width="64" height="10" fill="#c9935b" {...S} />
                <path d={`M${x + 6},166 v24 M${x + 58},166 v24`} {...S} />
              </g>
            ))}
          </g>
        )}
        {place === "overseas" && (
          <g>
            <rect x="20" y="20" width="200" height="110" fill="#ffd59a" {...S} />
            {[30, 70, 110, 150, 180].map((x, k) => (
              <rect key={x} x={x} y={60 - (k % 3) * 18} width="26" height={70 + (k % 3) * 18} fill="#e49b5a" {...S} />
            ))}
            <path d="M330,190 q6,-80 -4,-120" stroke="#8a5a32" strokeWidth="8" fill="none" />
            <path d="M326,72 q-40,-6 -54,22 M326,72 q40,-6 54,22 M326,72 q-10,-30 -40,-34 M326,72 q10,-30 40,-34" stroke="#2e9d5b" strokeWidth="9" fill="none" strokeLinecap="round" />
            <rect x="130" y="150" width="120" height="10" fill="#c9935b" {...S} />
            <path d="M140,160 v30 M240,160 v30" {...S} />
          </g>
        )}
        {dark && <rect width="400" height="220" fill="#1d2b4a" opacity="0.3" />}
      </ArtSlot>
      {children}
    </svg>
  );
}

/* ---------- 盤面 ---------- */
type Pt = { x: number; y: number };
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};
export const TRUNK: Pt[] = [
  { x: 70, y: 360 },
  { x: 165, y: 300 },
  { x: 265, y: 340 },
  { x: 360, y: 240 },
];
const FORK = TRUNK[3];
const LANE_END: Record<BranchId, number> = { abroad: 40, indep: 110, other: 180, same: 250, relearn: 320, stay: 390 };
export function laneTile(b: BranchId, k: number, n: number): Pt {
  const end = { x: 860, y: LANE_END[b] };
  return bez(FORK, { x: FORK.x + 70, y: FORK.y + (end.y - FORK.y) * 0.6 }, { x: end.x - 260, y: end.y }, end, 0.3 + (0.7 * k) / Math.max(1, n - 1));
}
export function lanePath(b: BranchId) {
  const end = { x: 860, y: LANE_END[b] };
  return `M${FORK.x},${FORK.y} C${FORK.x + 70},${FORK.y + (end.y - FORK.y) * 0.6} ${end.x - 260},${end.y} ${end.x},${end.y}`;
}
export const BRANCH_COLOR: Record<BranchId, string> = { stay: "#e23d28", same: "#f2b824", other: "#2e9d5b", indep: "#7d4fc4", relearn: "#1c9ea0", abroad: "#2d6cdf" };

export function BoardBase() {
  return (
    <ArtSlot id="i:board" w={900} h={430}>
      <rect x="6" y="6" width="888" height="418" rx="22" fill="#fbf4e6" stroke={INK} strokeWidth="3" />
      <path d={`M${TRUNK.map((p) => `${p.x},${p.y}`).join(" L")}`} stroke={INK} strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${TRUNK.map((p) => `${p.x},${p.y}`).join(" L")}`} stroke="#f3e2c0" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {BRANCHES.map((b) => (
        <g key={b.id}>
          <path d={lanePath(b.id)} stroke={INK} strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d={lanePath(b.id)} stroke="#f3e2c0" strokeWidth="16" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <text x="40" y="410" fontSize="15" fill={INK} className="i-boardtxt">スタート</text>
    </ArtSlot>
  );
}

/** 盤の上のコマ */
export function Piece({ x, y }: { x: number; y: number }) {
  return (
    <g className="i-piece" style={{ transform: `translate(${x}px, ${y}px)` }}>
      <g className="i-pieceHop">
        <ellipse cx="0" cy="2" rx="14" ry="5" fill="rgba(31,27,22,.25)" />
        <path d="M-12,0 L-6,-28 L6,-28 L12,0 Z" fill="#e23d28" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <circle cy="-36" r="10" fill="#e23d28" stroke={INK} strokeWidth={SW} />
        <circle cx="-3" cy="-39" r="3" fill="#fff" opacity="0.7" />
      </g>
    </g>
  );
}

/** 求人一覧の小さな絵 */
export function Thumb({ place }: { place: Place }) {
  return (
    <div className="i-thumb">
      <Stage place={place}>
        <Doll who="me" act={place === "factory" ? "machine" : place === "office" ? "pc" : place === "construction" ? "build" : place === "logistics" ? "carry" : "cook"} x={place === "office" ? 190 : 200} mood="元気" />
      </Stage>
    </div>
  );
}
