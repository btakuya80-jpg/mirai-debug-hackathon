/* G案で使う、オリジナルのちびキャラ（2頭身）と職場の背景。すべて SVG で描く。
   足元が (0,0)。高さはおよそ 100。 */

export type Pose = "stand" | "type" | "phone" | "carry" | "present" | "teach" | "study" | "cheer" | "walk";
export type Face = "good" | "normal" | "tired";
export type Mood = "元気" | "普通" | "しんどい";
export type Look = { hair: string; shirt: string; style: "short" | "spiky" | "bob" | "long" | "bun"; glasses?: boolean; skin?: string };

export const MOOD_OF: Record<string, Mood> = { 低: "元気", 中: "普通", 高: "しんどい" };
export const FACE_OF: Record<string, Face> = { 低: "good", 中: "normal", 高: "tired" };

const SKIN = "#f7d6b8";
const INK = "#2b2a2f";

function Hair({ look }: { look: Look }) {
  const c = look.hair;
  switch (look.style) {
    case "spiky":
      return <path d="M-21,-1 C-23,-18 -16,-24 -12,-25 L-8,-31 L-3,-25 L3,-32 L7,-25 L13,-29 L14,-22 C20,-18 23,-10 21,-1 C13,-10 -6,-13 -21,-1Z" fill={c} />;
    case "bob":
      return <path d="M-23,10 C-27,-29 27,-29 23,10 L16,10 C17,-5 9,-12 -14,-9 L-16,10Z" fill={c} />;
    case "long":
      return (
        <g fill={c}>
          <path d="M-23,24 C-29,-29 29,-29 23,24 L17,24 C18,-4 8,-12 -15,-9 L-17,24Z" />
        </g>
      );
    case "bun":
      return (
        <g fill={c}>
          <circle cx="0" cy="-24" r="8" />
          <path d="M-21,-1 C-22,-27 22,-27 21,-1 C14,-12 -6,-14 -21,-1Z" />
        </g>
      );
    default:
      return <path d="M-21,-1 C-22,-27 22,-27 21,-1 C15,-11 -8,-14 -21,-1Z" fill={c} />;
  }
}

function Head({ look, face }: { look: Look; face: Face }) {
  return (
    <g className="vg-head">
      {look.style === "long" && <path d="M-22,0 L-22,24 L22,24 L22,0Z" fill={look.hair} />}
      <circle r="21" fill={look.skin ?? SKIN} />
      <Hair look={look} />
      {face === "tired" ? (
        <g stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M-10,3 q3,-2.5 6,0" />
          <path d="M4,3 q3,-2.5 6,0" />
          <path d="M-5,12 q2.5,-3 5,0 q2.5,3 5,0" />
        </g>
      ) : (
        <g>
          <circle className="vg-eye" cx="-7" cy="3" r="2.6" fill={INK} />
          <circle className="vg-eye" cx="7" cy="3" r="2.6" fill={INK} />
          {face === "good" ? (
            <path d="M-5,9 q5,6 10,0" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M-4,11 h8" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          )}
        </g>
      )}
      {face === "good" && (
        <g fill="#ff8f8f" opacity="0.45">
          <circle cx="-13" cy="9" r="3.2" />
          <circle cx="13" cy="9" r="3.2" />
        </g>
      )}
      {face === "tired" && <path className="vg-sweat" d="M18,-8 q-4,6 0,8 q4,-2 0,-8Z" fill="#8cc9f0" />}
      {look.glasses && (
        <g stroke={INK} strokeWidth="1.6" fill="none">
          <circle cx="-7" cy="3" r="5.5" />
          <circle cx="7" cy="3" r="5.5" />
          <path d="M-1.5,3 h3" />
        </g>
      )}
    </g>
  );
}

function Arms({ pose, look }: { pose: Pose; look: Look }) {
  const s = { stroke: look.shirt, strokeWidth: 6.5, strokeLinecap: "round" as const, fill: "none" };
  const hand = (x: number, y: number) => <circle cx={x} cy={y} r="3.4" fill={look.skin ?? SKIN} />;
  switch (pose) {
    case "type":
      return (
        <g className="vg-tap">
          <path d="M-10,-33 L2,-24" {...s} />
          <path d="M10,-33 L20,-24" {...s} />
          {hand(3, -23)}
          {hand(21, -23)}
        </g>
      );
    case "phone":
      return (
        <g>
          <path d="M-12,-34 L-16,-18" {...s} />
          {hand(-16, -17)}
          <path d="M11,-34 L17,-47" {...s} />
          <rect x="14" y="-60" width="6" height="12" rx="1.5" fill="#3b3f4a" />
          {hand(16, -49)}
        </g>
      );
    case "carry":
      return (
        <g>
          <rect x="2" y="-40" width="24" height="19" rx="2" fill="#c8925a" stroke="#9a6a3a" strokeWidth="1.5" />
          <path d="M2,-31 h24" stroke="#9a6a3a" strokeWidth="1.2" />
          <path d="M-9,-34 L5,-27" {...s} />
          <path d="M10,-34 L24,-28" {...s} />
          {hand(5, -27)}
          {hand(24, -28)}
        </g>
      );
    case "present":
      return (
        <g>
          <path d="M-12,-34 L-16,-18" {...s} />
          {hand(-16, -17)}
          <path d="M11,-34 L26,-49" {...s} />
          {hand(27, -50)}
        </g>
      );
    case "teach":
      return (
        <g className="vg-wave">
          <path d="M-12,-34 L-16,-18" {...s} />
          {hand(-16, -17)}
          <path d="M11,-33 L27,-36" {...s} />
          {hand(28, -36)}
        </g>
      );
    case "study":
      return (
        <g>
          <rect x="-4" y="-35" width="18" height="13" rx="1.5" fill="#fff" stroke="#b9b1a3" strokeWidth="1.2" />
          <path d="M5,-35 v13" stroke="#b9b1a3" strokeWidth="1" />
          <path d="M-10,-34 L-2,-26" {...s} />
          <path d="M10,-34 L12,-27" {...s} />
          {hand(-2, -26)}
          <g className="vg-pen">
            {hand(12, -27)}
            <path d="M12,-27 l5,-8" stroke="#3b3f4a" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>
      );
    case "cheer":
      return (
        <g className="vg-cheer">
          <path d="M-10,-34 L-19,-52" {...s} />
          <path d="M10,-34 L19,-52" {...s} />
          {hand(-19, -53)}
          {hand(19, -53)}
        </g>
      );
    default:
      return (
        <g>
          <path d="M-12,-34 L-16,-18" {...s} />
          <path d="M12,-34 L16,-18" {...s} />
          {hand(-16, -17)}
          {hand(16, -17)}
        </g>
      );
  }
}

/** 頭の上の「きもち」アイコン。元気＝芽、普通＝くもり、しんどい＝雨雲 */
export function MoodIcon({ mood }: { mood: Mood }) {
  return (
    <g className="vg-mood">
      <circle r="14" fill="#fff" stroke="#e1d6c3" strokeWidth="1.5" />
      {mood === "元気" && (
        <g>
          <path d="M0,8 V-3" stroke="#3f9d55" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M0,-2 C-9,-3 -9,-10 -2,-10 C0,-7 0,-4 0,-2Z" fill="#5cc072" />
          <path d="M0,0 C8,-1 9,-8 2,-8 C0,-5 0,-2 0,0Z" fill="#79d28c" />
        </g>
      )}
      {mood === "普通" && <path d="M-9,4 a5,5 0 0 1 2,-9 a6,6 0 0 1 11,-1 a4.5,4.5 0 0 1 4,9Z" fill="#c7ccd4" />}
      {mood === "しんどい" && (
        <g>
          <path d="M-9,1 a5,5 0 0 1 2,-9 a6,6 0 0 1 11,-1 a4.5,4.5 0 0 1 4,9Z" fill="#7d8796" />
          <path className="vg-rain" d="M-5,5 l-1.5,4 M1,5 l-1.5,4 M7,5 l-1.5,4" stroke="#5aa8e0" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

export function Chibi({ look, pose = "stand", face = "good", flip = false, mood }: { look: Look; pose?: Pose; face?: Face; flip?: boolean; mood?: Mood }) {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="17" ry="3.6" fill="rgba(40,30,20,.14)" />
      <g className={`vg-body ${pose === "walk" || pose === "carry" ? "vg-walk" : "vg-idle"}`}>
        <g transform={flip ? "scale(-1,1)" : undefined}>
          <rect x="-9" y="-15" width="7" height="15" rx="3" fill="#3d4250" />
          <rect x="2" y="-15" width="7" height="15" rx="3" fill="#3d4250" />
          <rect x="-13.5" y="-41" width="27" height="29" rx="10" fill={look.shirt} />
          <path d="M-5,-41 L0,-34 L5,-41" fill="#fff" opacity="0.85" />
          <Arms pose={pose} look={look} />
          <g transform="translate(0,-62)">
            <Head look={look} face={face} />
          </g>
        </g>
        {mood && (
          <g transform="translate(0,-104)">
            <MoodIcon mood={mood} />
          </g>
        )}
      </g>
    </g>
  );
}

/* ---------- 職場の背景（幅640×高さ300、床は y=250 あたり） ---------- */
export type Bg = "office" | "office2" | "warehouse" | "shop";

function Boxes({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {[
        [0, 0, 34, 26],
        [36, 0, 30, 26],
        [8, -24, 34, 24],
      ].map(([bx, by, w, h], i) => (
        <g key={i}>
          <rect x={bx} y={by - h} width={w} height={h} rx="2" fill="#d7a46b" stroke="#a87642" strokeWidth="1.5" />
          <path d={`M${bx},${by - h + 7} h${w}`} stroke="#a87642" strokeWidth="1.2" />
        </g>
      ))}
    </g>
  );
}

export function Backdrop({ bg, night = false }: { bg: Bg; night?: boolean }) {
  if (bg === "warehouse")
    return (
      <g>
        <rect width="640" height="300" fill="#dfe3e8" />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M${i * 40 + 20},0 V200`} stroke="#cfd4da" strokeWidth="2" />
        ))}
        <rect x="0" y="200" width="640" height="100" fill="#bfc5cc" />
        <path d="M0,262 H640" stroke="#f2c230" strokeWidth="5" strokeDasharray="34 18" />
        {[30, 360].map((rx) => (
          <g key={rx}>
            <rect x={rx} y="40" width="190" height="8" fill="#e46a3b" />
            <rect x={rx} y="110" width="190" height="8" fill="#e46a3b" />
            <rect x={rx} y="180" width="190" height="8" fill="#e46a3b" />
            <rect x={rx} y="30" width="8" height="180" fill="#36618f" />
            <rect x={rx + 182} y="30" width="8" height="180" fill="#36618f" />
            <Boxes x={rx + 16} y={40} />
            <Boxes x={rx + 100} y={110} />
            <Boxes x={rx + 30} y={180} />
          </g>
        ))}
        <rect x="560" y="214" width="56" height="8" rx="3" fill="#5a6270" />
        <circle cx="568" cy="226" r="5" fill="#3d4250" />
        <circle cx="608" cy="226" r="5" fill="#3d4250" />
      </g>
    );
  if (bg === "shop")
    return (
      <g>
        <rect width="640" height="300" fill="#fbe7d3" />
        <rect x="0" y="0" width="640" height="18" fill="#e9b88c" />
        {[120, 320, 520].map((x) => (
          <g key={x}>
            <path d={`M${x},18 V58`} stroke="#6b4b36" strokeWidth="2" />
            <path d={`M${x - 18},74 Q${x},50 ${x + 18},74Z`} fill="#f2a541" />
            <circle cx={x} cy="78" r="5" fill="#fff4c9" />
          </g>
        ))}
        <rect x="360" y="70" width="200" height="110" rx="8" fill="#334036" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M384,${96 + i * 22} h${110 - i * 14}`} stroke="#f4efe0" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        ))}
        <rect x="0" y="236" width="640" height="64" fill="#e2c49f" />
      </g>
    );
  if (bg === "office2")
    return (
      <g>
        <rect width="640" height="300" fill="#e9f1f8" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={30 + i * 150} y="30" width="130" height="150" fill="#cfe6f7" stroke="#b2cde2" strokeWidth="3" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${50 + i * 150},170 l40,-60 l30,30 l20,-40`} stroke="#9ec4e0" strokeWidth="3" fill="none" />
        ))}
        <rect x="0" y="232" width="640" height="68" fill="#cbd5df" />
        <circle cx="600" cy="214" r="18" fill="#6fb37a" />
        <rect x="592" y="214" width="16" height="22" rx="3" fill="#8a6a4f" />
      </g>
    );
  // office（少人数の事務所）
  return (
    <g>
      <rect width="640" height="300" fill={night ? "#e5dccb" : "#f6eddc"} />
      <rect x="40" y="36" width="150" height="104" rx="4" fill={night ? "#2c3559" : "#bfe2f3"} stroke="#c9b693" strokeWidth="5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={50 + i * 28} y={70 + ((i * 17) % 30)} width="22" height={70 - ((i * 17) % 30)} fill={night ? "#3d4875" : "#93c3dc"} />
      ))}
      {night && [0, 1, 2, 3, 4].map((i) => <rect key={`w${i}`} x={56 + i * 28} y={92 + ((i * 11) % 20)} width="6" height="6" fill="#ffd977" />)}
      {night && <circle cx="168" cy="56" r="9" fill="#fff5c4" />}
      <rect x="420" y="50" width="170" height="104" rx="4" fill="#fff" stroke="#b9b3a6" strokeWidth="4" />
      {[
        ["#ffd36b", 436, 66],
        ["#9be0c4", 470, 66],
        ["#ffb0a3", 504, 66],
        ["#b9d3ff", 436, 100],
        ["#ffd36b", 538, 100],
      ].map(([c, x, y], i) => (
        <rect key={i} x={x as number} y={y as number} width="26" height="24" fill={c as string} transform={`rotate(${(i % 2 ? 3 : -3)} ${x} ${y})`} />
      ))}
      <path d="M440,140 h120" stroke="#7aa6d6" strokeWidth="3" strokeLinecap="round" />
      <rect x="0" y="236" width="640" height="64" fill="#dcc8a5" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M${i * 90},236 V300`} stroke="#cdb68e" strokeWidth="2" />
      ))}
      <Boxes x={46} y={248} />
      <circle cx="612" cy="196" r="20" fill="#6fb37a" />
      <circle cx="598" cy="210" r="13" fill="#5ea36a" />
      <rect x="602" y="216" width="20" height="26" rx="4" fill="#c07a52" />
    </g>
  );
}

/** 机とノートPC（キャラの手前に置く） */
export function Desk({ x }: { x: number }) {
  return (
    <g transform={`translate(${x},0)`}>
      <path d="M2,200 L30,196 L34,224 L6,228Z" fill="#3d4250" />
      <path d="M4,202 L28,198 L31,221 L7,225Z" fill="#7fd1e8" className="vg-screen" />
      <rect x="-46" y="226" width="104" height="9" rx="2" fill="#b78452" />
      <rect x="-40" y="235" width="7" height="16" fill="#8d6239" />
      <rect x="45" y="235" width="7" height="16" fill="#8d6239" />
    </g>
  );
}
