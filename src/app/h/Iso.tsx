/* H案「ジオラマ」の絵。斜め上から見下ろす模型（アイソメトリック）で、箱を組み合わせて描く。
   絵の差し替え口は ArtSlot（h:place:〇〇 / h:town / h:thumb:〇〇）。 */

import { ArtSlot } from "@/lib/art";
import type { Act, Place, Who } from "@/lib/life";

export const TW = 32;
export const TH = 16;
export const ZH = 15;
export const iso = (x: number, y: number, z = 0): [number, number] => [((x - y) * TW) / 2, ((x + y) * TH) / 2 - z * ZH];
const P = (...pts: [number, number][]) => pts.map((p) => p.join(",")).join(" ");

export function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

export function Box({ x, y, z = 0, w, d, h, c, top }: { x: number; y: number; z?: number; w: number; d: number; h: number; c: string; top?: string }) {
  return (
    <g>
      <polygon points={P(iso(x, y + d, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x, y + d, z))} fill={shade(c, 0.86)} />
      <polygon points={P(iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x + w, y, z))} fill={shade(c, 0.7)} />
      <polygon points={P(iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h))} fill={top ?? c} />
    </g>
  );
}

function Roof({ x, y, z, w, d, h, c }: { x: number; y: number; z: number; w: number; d: number; h: number; c: string }) {
  const apexA = iso(x + w / 2, y, z + h);
  const apexB = iso(x + w / 2, y + d, z + h);
  return (
    <g>
      <polygon points={P(iso(x, y, z), apexA, apexB, iso(x, y + d, z))} fill={shade(c, 1)} />
      <polygon points={P(iso(x + w, y, z), apexA, apexB, iso(x + w, y + d, z))} fill={shade(c, 0.72)} />
      <polygon points={P(iso(x, y + d, z), apexB, iso(x + w, y + d, z))} fill={shade(c, 0.86)} />
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const [px, py] = iso(x, y);
  return (
    <g transform={`translate(${px},${py}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="7" ry="3.5" fill="rgba(0,0,0,.12)" />
      <rect x="-1.5" y="-10" width="3" height="10" fill="#9a6b45" />
      <circle cx="0" cy="-17" r="9" fill="#5fb06a" />
      <circle cx="-3" cy="-20" r="4" fill="#7cc685" />
    </g>
  );
}

/* ---------- 人形（分身・上司など） ---------- */
export const LOOK: Record<Who, { shirt: string; hair: string }> = {
  me: { shirt: "#ff7a45", hair: "#3b2a22" },
  boss: { shirt: "#3d5a80", hair: "#222" },
  senpai: { shirt: "#e9b949", hair: "#6b4226" },
  peer: { shirt: "#5aa9a3", hair: "#1d1d1d" },
  local: { shirt: "#8e6fd0", hair: "#2a1d14" },
  family: { shirt: "#e5839b", hair: "#4a3226" },
  student: { shirt: "#6aa84f", hair: "#2b2b2b" },
};

function Item({ act }: { act: Act }) {
  switch (act) {
    case "pc":
      return (
        <g transform="translate(9,-12)">
          <polygon points="0,0 12,-6 12,-15 0,-9" fill="#334" />
          <polygon points="1,-1 11,-6 11,-14 1,-9" fill="#8fd3ff" />
        </g>
      );
    case "machine":
      return <path d="M9,-16 l9,-6 m-2,-2 l4,4" stroke="#7a828c" strokeWidth="3" strokeLinecap="round" className="h-swing" />;
    case "build":
      return (
        <g className="h-swing">
          <rect x="9" y="-26" width="3" height="14" fill="#9a6b45" />
          <rect x="6" y="-28" width="10" height="5" rx="1" fill="#7a828c" />
        </g>
      );
    case "carry":
      return <polygon points="-8,-40 0,-44 8,-40 8,-32 0,-28 -8,-32" fill="#d7a46b" stroke="#a87642" strokeWidth="1" />;
    case "cook":
      return (
        <g className="h-swing">
          <ellipse cx="15" cy="-16" rx="8" ry="3" fill="#444" />
          <rect x="22" y="-17" width="8" height="2" fill="#444" />
        </g>
      );
    case "teach":
      return <path d="M8,-22 L24,-34" stroke="#c9a46b" strokeWidth="2.4" strokeLinecap="round" className="h-swing" />;
    case "rest":
      return <rect x="8" y="-16" width="6" height="7" rx="1.5" fill="#fff" stroke="#ccc" />;
    default:
      return null;
  }
}

export function Pawn({ who, act = "talk", x, y, mood, small }: { who: Who; act?: Act; x: number; y: number; mood?: "元気" | "普通" | "しんどい"; small?: boolean }) {
  const [px, py] = iso(x, y);
  const l = LOOK[who];
  const cls = act === "cheer" ? "h-jump" : act === "down" ? "h-down" : act === "carry" ? "h-walk" : "h-idle";
  return (
    <g className="h-mover" style={{ transform: `translate(${px}px, ${py}px) scale(${small ? 0.8 : 1})` }}>
      <ellipse cx="0" cy="0" rx="9" ry="4.5" fill="rgba(0,0,0,.16)" />
      <g className={cls}>
        <path d="M-8,0 L-8,-15 Q-8,-24 0,-24 Q8,-24 8,-15 L8,0 Z" fill={l.shirt} />
        <path d="M-8,-15 Q-8,-24 0,-24 Q8,-24 8,-15" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
        <circle cx="0" cy="-31" r="8" fill="#f6d2b4" />
        <path d="M-8,-32 Q-8,-41 0,-41 Q8,-41 8,-32 Q4,-36 -8,-32Z" fill={l.hair} />
        {act === "down" ? <path d="M-4,-29 h3 M2,-29 h3" stroke="#333" strokeWidth="1.4" /> : (
          <g fill="#333">
            <circle cx="-3" cy="-30" r="1.2" />
            <circle cx="3" cy="-30" r="1.2" />
          </g>
        )}
        {who === "me" && act !== "carry" && <Item act={act} />}
        {who === "me" && act === "carry" && <Item act="carry" />}
      </g>
      {mood && (
        <g transform="translate(0,-54)" className="h-mood">
          <circle r="7.5" fill="#fff" stroke="#e6e0d4" />
          {mood === "元気" && <path d="M-4,1 q4,4 8,0 M-3,-2 h0.1 M3,-2 h0.1" stroke="#f08c2e" strokeWidth="2" strokeLinecap="round" fill="none" />}
          {mood === "普通" && <path d="M-4,1.5 h8 M-3,-2 h0.1 M3,-2 h0.1" stroke="#8a8f98" strokeWidth="2" strokeLinecap="round" />}
          {mood === "しんどい" && <path d="M-4,3 q4,-4 8,0 M-3,-2 h0.1 M3,-2 h0.1" stroke="#4d7fc0" strokeWidth="2" strokeLinecap="round" fill="none" />}
        </g>
      )}
    </g>
  );
}

/* ---------- 職場や家の建物（町の模型用） ---------- */
export function Building({ place, x, y }: { place: Place; x: number; y: number }) {
  switch (place) {
    case "office":
      return (
        <g>
          <Box x={x} y={y} w={2.6} d={2} h={5} c="#9fb8d6" top="#c9daec" />
          {[1, 2, 3, 4].map((k) => (
            <Box key={k} x={x + 0.2} y={y + 2} z={k - 0.4} w={2.2} d={0.02} h={0.5} c="#e8f3ff" />
          ))}
        </g>
      );
    case "factory":
      return (
        <g>
          <Box x={x} y={y} w={3} d={2} h={1.8} c="#d9d4c7" />
          {[0, 1, 2].map((k) => (
            <Roof key={k} x={x + k} y={y} z={1.8} w={1} d={2} h={0.8} c="#c96f4a" />
          ))}
          <Box x={x + 2.4} y={y + 0.2} z={0} w={0.4} d={0.4} h={4} c="#8a8f98" />
          <circle cx={iso(x + 2.6, y + 0.4, 4.6)[0]} cy={iso(x + 2.6, y + 0.4, 4.6)[1]} r="5" fill="#eef" opacity="0.8" className="h-smoke" />
        </g>
      );
    case "construction":
      return (
        <g>
          {[0, 1.2, 2.4].map((k) => (
            <g key={k}>
              <Box x={x + k} y={y} w={0.2} d={0.2} h={3.4} c="#f2a33a" />
              <Box x={x + k} y={y + 1.8} w={0.2} d={0.2} h={3.4} c="#f2a33a" />
            </g>
          ))}
          <Box x={x} y={y} z={1.7} w={2.6} d={2} h={0.15} c="#c9c2b2" />
          <Box x={x} y={y} z={3.4} w={2.6} d={2} h={0.15} c="#c9c2b2" />
          <Box x={x + 3} y={y + 0.5} w={0.3} d={0.3} h={6} c="#f5c518" />
          <Box x={x + 0.6} y={y + 0.5} z={6} w={3.2} d={0.3} h={0.3} c="#f5c518" />
        </g>
      );
    case "logistics":
      return (
        <g>
          <Box x={x} y={y} w={3.4} d={2.2} h={1.7} c="#b9c6cf" top="#d6dee4" />
          {[0.3, 1.3, 2.3].map((k) => (
            <Box key={k} x={x + k} y={y + 2.2} w={0.8} d={0.02} h={1.1} c="#6f7f8c" />
          ))}
        </g>
      );
    case "food":
      return (
        <g>
          <Box x={x} y={y} w={2.2} d={2} h={1.7} c="#f4e3c3" />
          <Box x={x} y={y + 2} z={1.2} w={2.2} d={0.5} h={0.12} c="#e2574c" />
          <Roof x={x} y={y} z={1.7} w={2.2} d={2} h={0.9} c="#7d5a44" />
        </g>
      );
    case "home":
      return (
        <g>
          <Box x={x} y={y} w={2} d={1.8} h={1.6} c="#fff3df" />
          <Roof x={x} y={y} z={1.6} w={2} d={1.8} h={1.1} c="#5b8fd1" />
          <Box x={x + 0.7} y={y + 1.8} w={0.5} d={0.02} h={0.9} c="#9a6b45" />
        </g>
      );
    case "school":
      return (
        <g>
          <Box x={x} y={y} w={3.2} d={1.6} h={2.4} c="#f1d9a7" />
          <Box x={x + 1.2} y={y + 0.2} z={2.4} w={0.8} d={0.8} h={1} c="#f1d9a7" />
          <circle cx={iso(x + 1.6, y + 1, 3)[0]} cy={iso(x + 1.6, y + 1, 3)[1] + 2} r="4" fill="#fff" stroke="#999" />
        </g>
      );
    case "overseas":
      return (
        <g>
          <Box x={x} y={y} w={0.9} d={0.9} h={5.5} c="#7fa7c9" />
          <Box x={x + 1.2} y={y + 0.2} w={0.8} d={0.8} h={3.6} c="#b0c4de" />
          <Box x={x + 0.3} y={y + 1.2} w={1.4} d={0.7} h={2.2} c="#e6d2b5" />
          <path d={`M${iso(x + 2.2, y + 1.6)[0]},${iso(x + 2.2, y + 1.6)[1]} l0,-24`} stroke="#7a5a3a" strokeWidth="2" />
          <path d={`M${iso(x + 2.2, y + 1.6)[0]},${iso(x + 2.2, y + 1.6)[1] - 24} q-10,2 -12,10 M${iso(x + 2.2, y + 1.6)[0]},${iso(x + 2.2, y + 1.6)[1] - 24} q10,2 12,10 M${iso(x + 2.2, y + 1.6)[0]},${iso(x + 2.2, y + 1.6)[1] - 24} q0,-6 -8,-8`} stroke="#4f9a5a" strokeWidth="3" fill="none" />
        </g>
      );
  }
}

/** 町の中の建物の場所と、入口の位置 */
export const TOWN: Record<"work" | "home" | "school" | "overseas", { x: number; y: number; door: [number, number] }> = {
  work: { x: 1, y: 1, door: [2.4, 3.8] },
  home: { x: 8, y: 1.2, door: [8.9, 3.8] },
  school: { x: 7.6, y: 5.8, door: [9.2, 7.9] },
  overseas: { x: 9, y: 10, door: [8.8, 11.3] },
};
export function townSpot(place: Place, workPlace: Place): keyof typeof TOWN {
  if (place === "home" || place === "school" || place === "overseas") return place;
  return place === workPlace ? "work" : "work";
}

export function Town({ workPlace, here, mood }: { workPlace: Place; here: keyof typeof TOWN; mood?: "元気" | "普通" | "しんどい" }) {
  const [dx, dy] = TOWN[here].door;
  return (
    <svg viewBox="-200 -90 400 300" className="block h-auto w-full" role="img" aria-label="町の模型。分身がいる場所">
      <ArtSlot id="h:town" x={-200} y={-90} w={400} h={300}>
        <Box x={0} y={0} z={-0.6} w={12} d={12} h={0.6} c="#8fcf8a" top="#a6dc9b" />
        <Box x={0} y={9.2} z={-0.55} w={12} d={2.8} h={0.56} c="#6fb8e0" top="#8fd0f0" />
        <Box x={8.6} y={9.6} z={0} w={3} d={2.2} h={0.12} c="#e7d7a8" />
        <Box x={5} y={0} w={1} d={9.2} h={0.05} c="#efe3c4" />
        <Box x={0} y={4.2} w={12} d={1} h={0.05} c="#efe3c4" />
        <Building place={workPlace} x={TOWN.work.x} y={TOWN.work.y} />
        <Building place="home" x={TOWN.home.x} y={TOWN.home.y} />
        <Tree x={11} y={1} />
        <Tree x={3.6} y={6.4} />
        <Tree x={1.2} y={7.4} s={0.8} />
        <Tree x={6.6} y={7.8} s={0.9} />
        <Building place="school" x={TOWN.school.x} y={TOWN.school.y} />
        <Building place="overseas" x={TOWN.overseas.x} y={TOWN.overseas.y} />
        <g className="h-plane">
          <path d="M-10,0 l20,0 l-6,-3 M-2,0 l-4,6 M-2,0 l-4,-6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      </ArtSlot>
      <Pawn who="me" act="talk" x={dx} y={dy} mood={mood} />
    </svg>
  );
}

/* ---------- 部屋の中（場面） ---------- */
const FLOOR: Record<Place, string> = {
  office: "#e9e3d6",
  factory: "#c8ccd1",
  construction: "#d9c29a",
  logistics: "#c3c9ce",
  food: "#efd9bd",
  home: "#e8d2b0",
  school: "#d8c4a0",
  overseas: "#e3dccf",
};
const WALL: Record<Place, string> = {
  office: "#f7f4ee",
  factory: "#e2e5e8",
  construction: "#cfe8f5",
  logistics: "#dfe4e8",
  food: "#fbeedd",
  home: "#fdf3e4",
  school: "#f6efe0",
  overseas: "#f5efe3",
};

function Props({ place }: { place: Place }) {
  switch (place) {
    case "office":
      return (
        <g>
          <Box x={0.2} y={0.2} w={0.6} d={1.8} h={2.6} c="#c9a77c" />
          <Box x={2} y={1.2} w={2.2} d={1} h={0.9} c="#e6e1d8" />
          <Box x={2.4} y={1.3} z={0.9} w={0.1} d={0.7} h={0.6} c="#334" />
          <Box x={4.8} y={2.6} w={1.4} d={1.4} h={0.9} c="#e6e1d8" />
          <Tree x={6.3} y={0.8} s={0.7} />
        </g>
      );
    case "factory":
      return (
        <g>
          <Box x={0.4} y={0.4} w={1.6} d={1.4} h={2} c="#9aa5b1" top="#f08c2e" />
          <Box x={0.3} y={2.6} w={5.8} d={0.8} h={0.7} c="#6b7480" />
          {[1, 2.4, 3.8, 5.2].map((k) => (
            <Box key={k} x={k} y={2.75} z={0.7} w={0.5} d={0.5} h={0.4} c="#d7a46b" />
          ))}
          <Box x={4.4} y={0.3} w={1.8} d={1.3} h={1.6} c="#9aa5b1" top="#ffd166" />
        </g>
      );
    case "construction":
      return (
        <g>
          {[0.3, 2.3, 4.3].map((k) => (
            <Box key={k} x={k} y={0.3} w={0.25} d={0.25} h={3.4} c="#f2a33a" />
          ))}
          <Box x={0.3} y={0.3} z={3.4} w={4.3} d={0.25} h={0.25} c="#f2a33a" />
          <Box x={3.2} y={2.8} w={1.8} d={0.5} h={0.3} c="#b78452" />
          {[5.6, 6.2].map((k) => (
            <g key={k}>
              <Box x={k} y={3.8} w={0.4} d={0.4} h={0.6} c="#ff7043" />
            </g>
          ))}
        </g>
      );
    case "logistics":
      return (
        <g>
          {[0.3, 3.6].map((k) => (
            <g key={k}>
              <Box x={k} y={0.3} w={2.6} d={0.8} h={2.6} c="#5d7fa3" />
              {[0.3, 1.3].map((z) => (
                <Box key={z} x={k + 0.2} y={0.5} z={z + 0.2} w={0.9} d={0.6} h={0.6} c="#d7a46b" />
              ))}
            </g>
          ))}
          <Box x={5} y={3} w={1.2} d={0.8} h={0.4} c="#5a6270" />
        </g>
      );
    case "food":
      return (
        <g>
          <Box x={0.3} y={0.3} w={5.6} d={0.9} h={1.1} c="#b9bec4" top="#dfe3e6" />
          <Box x={1} y={0.4} z={1.1} w={0.7} d={0.6} h={0.4} c="#444" />
          <Box x={2.6} y={0.4} z={1.1} w={0.7} d={0.6} h={0.4} c="#444" />
          <Box x={0.3} y={3} w={4} d={0.9} h={1} c="#c9935b" />
        </g>
      );
    case "home":
      return (
        <g>
          <Box x={0.3} y={0.4} w={2.6} d={1} h={0.9} c="#7aa6d6" />
          <Box x={3.4} y={2} w={1.6} d={1.2} h={0.7} c="#c9935b" />
          <Tree x={6.2} y={0.8} s={0.7} />
        </g>
      );
    case "school":
      return (
        <g>
          <Box x={1} y={0.02} z={1} w={3.6} d={0.05} h={1.6} c="#2f5d50" />
          {[
            [1.2, 2.6],
            [3.2, 2.6],
            [5.2, 2.6],
          ].map(([x, y]) => (
            <Box key={x} x={x} y={y} w={1} d={0.7} h={0.7} c="#c9a77c" />
          ))}
        </g>
      );
    case "overseas":
      return (
        <g>
          <Box x={2} y={1.2} w={2.4} d={1} h={0.9} c="#e6e1d8" />
          <Box x={2.4} y={1.3} z={0.9} w={0.1} d={0.7} h={0.6} c="#334" />
          <Tree x={0.8} y={0.8} s={0.9} />
          <Tree x={6.3} y={0.8} s={0.7} />
        </g>
      );
  }
}

/** 部屋の中で人が立つ位置 */
export const SPOTS: Record<Place, [number, number][]> = {
  office: [
    [3.1, 2.8],
    [5.5, 3.6],
    [1.6, 3.4],
    [4.6, 4.4],
  ],
  factory: [
    [2.4, 2],
    [4.2, 2],
    [1.2, 4.2],
    [5.6, 4.4],
  ],
  construction: [
    [2.6, 2.2],
    [4.6, 2],
    [1.2, 3.8],
    [5.2, 4.4],
  ],
  logistics: [
    [2.4, 2.2],
    [4.4, 2.4],
    [1.2, 3.8],
    [5.8, 4.4],
  ],
  food: [
    [1.8, 1.8],
    [3.6, 1.8],
    [5, 3],
    [1.4, 4.4],
  ],
  home: [
    [2.4, 2],
    [3.8, 3.8],
    [1.2, 3.6],
    [5.4, 3.8],
  ],
  school: [
    [2.6, 1.6],
    [1.8, 3.8],
    [3.8, 3.8],
    [5.8, 3.8],
  ],
  overseas: [
    [3.1, 2.8],
    [5.2, 3.2],
    [1.6, 3.6],
    [4.4, 4.4],
  ],
};

export function Room({ place, night, children }: { place: Place; night?: boolean; children?: React.ReactNode }) {
  const W = 7;
  const D = 5;
  const outdoor = place === "construction";
  return (
    <svg viewBox="-90 -72 212 180" className="block h-auto w-full" role="img" aria-label="場面">
      <ArtSlot id={`h:place:${place}`} x={-90} y={-72} w={212} h={180}>
        {!outdoor && (
          <g>
            <polygon points={P(iso(0, 0, 0), iso(W, 0, 0), iso(W, 0, 4), iso(0, 0, 4))} fill={shade(WALL[place], night ? 0.75 : 1)} />
            <polygon points={P(iso(0, 0, 0), iso(0, D, 0), iso(0, D, 4), iso(0, 0, 4))} fill={shade(WALL[place], night ? 0.68 : 0.9)} />
            <polygon points={P(iso(1, 0, 1.6), iso(3, 0, 1.6), iso(3, 0, 3.2), iso(1, 0, 3.2))} fill={place === "overseas" ? "#ffd59a" : night ? "#2c3559" : "#bfe3f3"} />
            {place === "overseas" && <polygon points={P(iso(1.2, 0, 1.6), iso(1.6, 0, 1.6), iso(1.6, 0, 2.8), iso(1.2, 0, 2.8))} fill="#d79c63" />}
          </g>
        )}
        {outdoor && <polygon points={P(iso(-2, -2, 6), iso(W + 2, -2, 6), iso(W + 2, -2, -1), iso(-2, -2, -1))} fill="#cfe8f5" opacity="0.7" />}
        <Box x={0} y={0} z={-0.3} w={W} d={D} h={0.3} c={FLOOR[place]} />
        <Props place={place} />
      </ArtSlot>
      {children}
    </svg>
  );
}

/** 求人一覧などの小さな絵（建物1つ） */
export function Thumb({ place }: { place: Place }) {
  return (
    <svg viewBox="-75 -90 150 165" className="block h-auto w-full" aria-hidden>
      <ArtSlot id={`h:thumb:${place}`} x={-75} y={-90} w={150} h={165}>
        <Box x={-0.5} y={-0.5} z={-0.4} w={4.6} d={4.2} h={0.4} c="#8fcf8a" top="#a6dc9b" />
        <Building place={place} x={0.3} y={0.4} />
        <Tree x={3.6} y={3.2} s={0.7} />
      </ArtSlot>
    </svg>
  );
}
