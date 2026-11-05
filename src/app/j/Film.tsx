/* J案「映画のフィルム」の絵。横長の画面に、夕焼けや夜の色を背にした影絵（シルエット）で描く。
   絵の差し替え口は ArtSlot（j:place:〇〇 / j:thumb:〇〇）。 */

import { ArtSlot } from "@/lib/art";
import type { Act, Mood, Place, Who } from "@/lib/life";

const SIL = "#121110";
export const SKY: Record<Mood, [string, string]> = {
  元気: ["#f6b26b", "#fde7c4"],
  普通: ["#8f86b8", "#e7c6c0"],
  しんどい: ["#3c4b66", "#8796ad"],
};

export function Figure({ who, act = "talk", x, y = 176, flip, s = 1 }: { who: Who; act?: Act; x: number; y?: number; flip?: boolean; s?: number }) {
  const me = who === "me";
  const rim = me ? "#ffcf7a" : "rgba(220,230,255,.45)";
  const arm = (d: string) => <path d={d} stroke={SIL} strokeWidth="6" strokeLinecap="round" fill="none" />;
  const arms = (() => {
    switch (act) {
      case "pc":
        return <g className="j-tap">{arm("M-8,-40 L12,-30")}{arm("M8,-40 L22,-30")}</g>;
      case "machine":
      case "build":
        return <g>{arm("M-9,-40 L-12,-20")}<g className="j-swing">{arm("M9,-40 L22,-56")}<rect x="18" y="-66" width="10" height="7" fill={SIL} /></g></g>;
      case "carry":
        return <g>{arm("M-8,-40 L-12,-70")}{arm("M8,-40 L12,-70")}<rect x="-16" y="-92" width="32" height="22" fill={SIL} /></g>;
      case "cook":
        return <g>{arm("M-9,-40 L-12,-20")}<g className="j-swing">{arm("M9,-38 L24,-34")}<path d="M22,-38 h24 l-4,7 h-16z" fill={SIL} /></g></g>;
      case "teach":
        return <g>{arm("M-9,-40 L-12,-20")}{arm("M9,-40 L28,-62")}<path d="M28,-62 l12,-12" stroke={SIL} strokeWidth="2.5" /></g>;
      case "cheer":
        return <g className="j-cheer">{arm("M-8,-42 L-20,-68")}{arm("M8,-42 L20,-68")}</g>;
      case "rest":
        return <g>{arm("M-9,-40 L-2,-28")}{arm("M9,-40 L12,-28")}</g>;
      case "down":
        return <g>{arm("M-8,-36 L-4,-14")}{arm("M8,-36 L4,-14")}</g>;
      default:
        return <g>{arm("M-9,-40 L-12,-20")}<g className="j-swing">{arm("M9,-40 L22,-46")}</g></g>;
    }
  })();
  const down = act === "down";
  return (
    <g style={{ transform: `translate(${x}px, ${y}px) scale(${flip ? -s : s}, ${s})` }} className="j-fig">
      <g className={down ? "j-slump" : act === "cheer" ? "j-rise" : "j-breath"}>
        <path d="M-9,0 L-8,-14 L-11,-44 Q0,-52 11,-44 L8,-14 L9,0 Z" fill={SIL} stroke={rim} strokeWidth="1.4" />
        <g transform={down ? "translate(4,8) rotate(18)" : undefined}>
          <circle cy="-62" r="12" fill={SIL} stroke={rim} strokeWidth="1.4" />
          {who === "boss" && <rect x="-13" y="-66" width="26" height="4" fill={SIL} />}
          {(who === "family" || who === "local") && <path d="M-12,-62 q-4,16 4,22 l4,-10z" fill={SIL} />}
        </g>
        {arms}
      </g>
    </g>
  );
}

function Props({ place }: { place: Place }) {
  switch (place) {
    case "office":
      return (
        <g fill={SIL}>
          <rect x="300" y="138" width="140" height="8" />
          <rect x="310" y="146" width="6" height="30" />
          <rect x="424" y="146" width="6" height="30" />
          <rect x="350" y="108" width="44" height="30" />
          <rect x="40" y="70" width="40" height="106" />
          <circle cx="60" cy="58" r="20" />
        </g>
      );
    case "factory":
      return (
        <g fill={SIL}>
          <path d="M0,40 l40,-20 v20 l40,-20 v20 l40,-20 v20 l40,-20 v20 h340 v-40 h-480z" opacity="0.9" />
          <rect x="20" y="70" width="90" height="106" />
          <rect x="140" y="140" width="320" height="18" />
          {[170, 240, 310, 380].map((x) => (
            <rect key={x} x={x} y="122" width="24" height="18" className="j-belt" />
          ))}
          <rect x="400" y="10" width="14" height="70" />
        </g>
      );
    case "construction":
      return (
        <g fill={SIL}>
          {[40, 110, 180].map((x) => (
            <rect key={x} x={x} y="40" width="7" height="136" />
          ))}
          {[40, 96].map((y) => (
            <rect key={y} x="40" y={y} width="147" height="7" />
          ))}
          <rect x="380" y="10" width="8" height="166" />
          <rect x="250" y="10" width="160" height="7" />
          <path d="M290,17 v40" stroke={SIL} strokeWidth="2" />
          <rect x="280" y="57" width="20" height="12" />
        </g>
      );
    case "logistics":
      return (
        <g fill={SIL}>
          {[20, 330].map((x) => (
            <g key={x}>
              <rect x={x} y="20" width="6" height="156" />
              <rect x={x + 124} y="20" width="6" height="156" />
              {[60, 110, 160].map((y) => (
                <rect key={y} x={x} y={y} width="130" height="6" />
              ))}
              {[34, 84, 134].map((y, k) => (
                <rect key={y} x={x + 14 + k * 26} y={y} width="36" height="26" />
              ))}
            </g>
          ))}
        </g>
      );
    case "food":
      return (
        <g fill={SIL}>
          <rect x="20" y="126" width="220" height="50" />
          <rect x="44" y="106" width="44" height="20" />
          <path className="j-steam" d="M58,100 q-6,-10 0,-20 q6,-10 0,-20 M76,100 q-6,-10 0,-20" stroke="rgba(255,255,255,.55)" strokeWidth="3" fill="none" />
          {[120, 240, 360].map((x) => (
            <g key={x}>
              <path d={`M${x},0 v26`} stroke={SIL} strokeWidth="2" />
              <path d={`M${x - 14},40 q14,-24 28,0z`} />
            </g>
          ))}
          <rect x="330" y="140" width="130" height="36" />
        </g>
      );
    case "home":
      return (
        <g fill={SIL}>
          <rect x="220" y="122" width="200" height="40" rx="12" />
          <rect x="230" y="162" width="8" height="14" />
          <rect x="402" y="162" width="8" height="14" />
          <rect x="60" y="20" width="110" height="90" fill="none" stroke={SIL} strokeWidth="8" />
          <path d="M115,20 v90" stroke={SIL} strokeWidth="6" />
          <path d="M440,176 v-100" stroke={SIL} strokeWidth="3" />
          <path d="M424,76 h32 l-6,-20 h-20z" />
        </g>
      );
    case "school":
      return (
        <g fill={SIL}>
          <rect x="60" y="20" width="320" height="90" fill="none" stroke={SIL} strokeWidth="8" />
          {[40, 190, 340].map((x) => (
            <g key={x}>
              <rect x={x} y="146" width="80" height="8" />
              <rect x={x + 6} y="154" width="5" height="22" />
              <rect x={x + 69} y="154" width="5" height="22" />
            </g>
          ))}
        </g>
      );
    case "overseas":
      return (
        <g fill={SIL}>
          {[10, 50, 96, 130, 170, 200].map((x, k) => (
            <rect key={x} x={x} y={40 + (k % 3) * 22} width={30 + (k % 2) * 8} height={136 - (k % 3) * 22} opacity="0.75" />
          ))}
          <path d="M380,176 q8,-90 -6,-130" stroke={SIL} strokeWidth="9" fill="none" />
          <path d="M374,48 q-46,-4 -60,26 M374,48 q46,-4 60,26 M374,48 q-12,-34 -44,-38 M374,48 q12,-34 44,-38" stroke={SIL} strokeWidth="9" fill="none" strokeLinecap="round" />
          <rect x="250" y="140" width="110" height="8" />
        </g>
      );
  }
}

export function Screen({ place, mood, children, id }: { place: Place; mood: Mood; children?: React.ReactNode; id?: string }) {
  const [top, bottom] = SKY[mood];
  const gid = `sky-${id ?? place}-${mood}`;
  return (
    <svg viewBox="0 0 480 200" className="block h-auto w-full" role="img" aria-label="場面">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <ArtSlot id={`j:place:${place}`} w={480} h={200}>
        <rect width="480" height="200" fill={`url(#${gid})`} />
        <circle cx={mood === "しんどい" ? 420 : 380} cy={mood === "しんどい" ? 40 : 70} r={mood === "しんどい" ? 14 : 34} fill={mood === "しんどい" ? "#dfe6f0" : "#fff3d6"} opacity="0.8" />
        <Props place={place} />
        <rect y="176" width="480" height="24" fill={SIL} />
      </ArtSlot>
      {children}
    </svg>
  );
}
