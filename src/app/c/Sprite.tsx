/** 分身のドット絵（完全オリジナル。12×16マス） */
const BASE = [
  "...hhhhhh...",
  "..hhhhhhhh..",
  ".hhhhhhhhhh.",
  ".hhsssssshh.",
  ".hssessessh.",
  "..ssssssss..",
  "MOUTH",
  "...ssssss...",
  "..kkkkkkkk..",
  ".cckkcccccc.",
  "sccccccccccs",
  "sccgcccccccs",
  "..cccccccc..",
  "..ppp..ppp..",
  "..ppp..ppp..",
  ".bbbb..bbbb.",
];

const MOUTH: Record<string, string> = {
  低: "..ssmmmmss..",
  中: "..sssmmsss..",
  高: "..sssmmsss..",
};

const SHIRT = ["#a7aec2", "#6aa8ff", "#3dd6c0", "#7c6cf0", "#ff6fa5", "#ffb020"];

type Props = { level?: number; mood?: "高" | "中" | "低"; star?: boolean; size?: number; className?: string };

export default function Sprite({ level = 0, mood = "低", star = false, size = 96, className = "" }: Props) {
  const col: Record<string, string> = {
    h: "#3b2a55",
    s: "#ffd9b8",
    e: "#2a2350",
    m: "#c2416b",
    k: "#ff6fa5",
    c: SHIRT[Math.min(level, SHIRT.length - 1)],
    g: star ? "#ffcc33" : SHIRT[Math.min(level, SHIRT.length - 1)],
    p: "#3d4a8a",
    b: "#2a2350",
  };
  const rows = BASE.map((r) => (r === "MOUTH" ? MOUTH[mood] : r));
  return (
    <svg
      viewBox="0 0 14 17"
      width={size}
      height={(size * 17) / 14}
      className={`vc-pix ${className}`}
      role="img"
      aria-label={`分身（辞めたくなる度合い ${mood}）`}
    >
      {rows.map((r, y) =>
        r.split("").map((ch, x) =>
          ch === "." ? null : <rect key={`${x}-${y}`} x={x + 1} y={y + 0.5} width="1.02" height="1.02" fill={col[ch]} />,
        ),
      )}
      {mood === "高" && <rect x="12" y="3.5" width="1" height="2" fill="#6aa8ff" />}
      {mood === "高" && <rect x="12" y="5.5" width="1" height="1" fill="#6aa8ff" opacity=".6" />}
    </svg>
  );
}
