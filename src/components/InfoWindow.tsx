"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type HelpItem = {
  id: string;
  /** 画面側の指し先（CSSセレクタ）。文字の推測では探さない */
  sel: string;
  name: string;
  what: string;
  why: string;
  /** 理由の出どころ。無い時は「未記入」 */
  src?: string;
};

type Props = {
  screen: string;
  screenNote: string;
  items: HelpItem[];
  features: string[];
  /** 項目が別の段階にある時、その段階へ切り替える */
  onBeforeFlash?: (item: HelpItem) => void;
  accent?: string;
};

type Memo = { at: string; screen: string; dest: string; item: string; text: string; photo?: string };
const KEY = "mirai-debug:memos";
const POS = "mirai-debug:iw-pos";
type Box = { x: number; y: number; w: number; h: number };

function clamp(b: Box): Box {
  if (typeof window === "undefined") return b;
  const w = Math.min(Math.max(b.w, 260), window.innerWidth - 16);
  const h = Math.min(Math.max(b.h, 240), window.innerHeight - 16);
  const x = Math.min(Math.max(b.x, 8), window.innerWidth - w - 8);
  const y = Math.min(Math.max(b.y, 8), window.innerHeight - h - 8);
  return { x, y, w, h };
}
function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback; // 保存が使えない環境でも動く
  }
}
const noop = () => () => {};

/**
 * インフォ窓（ⓘ）。この画面／項目の理由／機能一覧／メモ の4つ。
 * 項目を押すと画面側が光る。見出し帯のどこでもつかんで動かせ、8か所で大きさを変えられる。
 * デモ撮影の時は URL に ?demo を付けると出さない。
 */
export default function InfoWindow({ screen, screenNote, items, features, onBeforeFlash, accent = "#3a7bd5" }: Props) {
  const [open, setOpen] = useState(false);
  // ?demo の時は出さない（サーバーでは出さず、ブラウザで判断）
  const hidden = useSyncExternalStore(noop, () => new URLSearchParams(window.location.search).has("demo"), () => true);
  const [tab, setTab] = useState<"screen" | "why" | "feat" | "memo">("screen");
  const [box, setBox] = useState<Box>(() =>
    typeof window === "undefined" ? { x: 24, y: 80, w: 360, h: 460 } : clamp(read(POS, { x: window.innerWidth - 396, y: 80, w: 360, h: 460 })),
  );
  const [miss, setMiss] = useState<string | null>(null);
  const [memos, setMemos] = useState<Memo[]>(() => (typeof window === "undefined" ? [] : read(KEY, [])));
  const [text, setText] = useState("");
  const [dest, setDest] = useState("この画面への改修メモ");
  const [item, setItem] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const drag = useRef<{ mode: string; sx: number; sy: number; b: Box; moved: boolean } | null>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) < 3) return; // 3px 動いてから
      d.moved = true;
      const b = { ...d.b };
      if (d.mode === "move") {
        b.x += dx;
        b.y += dy;
      } else {
        if (d.mode.includes("e")) b.w += dx;
        if (d.mode.includes("s")) b.h += dy;
        if (d.mode.includes("w")) { b.x += dx; b.w -= dx; }
        if (d.mode.includes("n")) { b.y += dy; b.h -= dy; }
      }
      setBox(clamp(b));
    };
    const up = () => {
      if (drag.current?.moved) {
        try { localStorage.setItem(POS, JSON.stringify(box)); } catch { /* noop */ }
      }
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  });

  const begin = (mode: string, e: React.PointerEvent) => {
    if (mode === "move" && (e.target as HTMLElement).closest("button,input,select,textarea,a")) return;
    drag.current = { mode, sx: e.clientX, sy: e.clientY, b: box, moved: false };
  };

  function flash(it: HelpItem) {
    onBeforeFlash?.(it);
    setMiss(null);
    window.setTimeout(() => {
      const el = Array.from(document.querySelectorAll<HTMLElement>(it.sel)).find(
        (n) => !n.closest("[data-iw]"),
      );
      if (!el) {
        setMiss(it.name);
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("iw-flash");
      void el.offsetWidth;
      el.classList.add("iw-flash");
      window.setTimeout(() => el.classList.remove("iw-flash"), 2400);
    }, 120);
  }

  function save() {
    if (!text.trim()) return;
    const m: Memo = { at: new Date().toISOString(), screen, dest, item, text: text.trim(), photo };
    const next = [m, ...memos].slice(0, 50);
    setMemos(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
    setText("");
    setPhoto(undefined);
  }

  function readPhoto(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      setPhoto(c.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  if (hidden) return null;

  const edges = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

  return (
    <div data-iw style={{ ["--iw-accent" as string]: accent }}>
      <button
        type="button"
        className="iw-fab"
        aria-label="この画面の説明を開く"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        i
      </button>
      {open && (
        <section
          className="iw-win"
          role="dialog"
          aria-label="インフォ窓"
          style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
        >
          {edges.map((m) => (
            <span key={m} className={`iw-edge iw-${m}`} onPointerDown={(e) => begin(m, e)} />
          ))}
          <header className="iw-head" onPointerDown={(e) => begin("move", e)}>
            <strong>ⓘ {screen}</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="閉じる">
              ×
            </button>
          </header>
          <nav className="iw-tabs">
            {(
              [
                ["screen", "この画面"],
                ["why", "項目の理由"],
                ["feat", "機能一覧"],
                ["memo", "メモ"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>
                {l}
              </button>
            ))}
          </nav>
          <div className="iw-body">
            {tab === "screen" && <p>{screenNote}</p>}
            {tab === "why" && (
              <ul className="iw-list">
                {miss && (
                  <li className="iw-miss">
                    「{miss}」の指し先が、いまの画面に見つかりませんでした。
                    <button
                      type="button"
                      onClick={() => {
                        setItem(miss);
                        setText(`「${miss}」の指し先が見つからない`);
                        setTab("memo");
                      }}
                    >
                      改修メモに残す
                    </button>
                  </li>
                )}
                {items.map((it) => (
                  <li key={it.id}>
                    <button type="button" className="iw-item" onClick={() => flash(it)}>
                      {it.name}
                    </button>
                    <p>{it.what}</p>
                    <p className="iw-why">理由：{it.why}</p>
                    <p className="iw-src">出どころ：{it.src ?? "未記入"}</p>
                  </li>
                ))}
              </ul>
            )}
            {tab === "feat" && (
              <ul className="iw-feat">
                {features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
            {tab === "memo" && (
              <div className="iw-memo">
                <label>
                  保存先
                  <select value={dest} onChange={(e) => setDest(e.target.value)}>
                    <option>この画面への改修メモ</option>
                    <option>Claudeへの実装依頼</option>
                    <option>案件</option>
                  </select>
                </label>
                <label>
                  対象の画面
                  <input value={screen} readOnly />
                </label>
                <label>
                  項目
                  <select value={item} onChange={(e) => setItem(e.target.value)}>
                    <option value="">（画面全体）</option>
                    {items.map((it) => (
                      <option key={it.id}>{it.name}</option>
                    ))}
                  </select>
                </label>
                <textarea
                  value={text}
                  placeholder="気づいたこと（画像は貼り付けでも付きます）"
                  onChange={(e) => setText(e.target.value)}
                  onPaste={(e) => readPhoto(e.clipboardData.files?.[0])}
                />
                <div className="iw-row">
                  <label className="iw-file">
                    写真を付ける
                    <input type="file" accept="image/*" onChange={(e) => readPhoto(e.target.files?.[0])} />
                  </label>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {photo && <img src={photo} alt="添付した写真" className="iw-thumb" />}
                  <button type="button" className="iw-save" onClick={save}>
                    メモを保存
                  </button>
                </div>
                {memos.filter((m) => m.screen === screen).length > 0 && (
                  <ul className="iw-memos">
                    {memos
                      .filter((m) => m.screen === screen)
                      .map((m) => (
                        <li key={m.at}>
                          <small>
                            {new Date(m.at).toLocaleString("ja-JP")}／{m.dest}
                            {m.item && `／${m.item}`}
                          </small>
                          <p>{m.text}</p>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
