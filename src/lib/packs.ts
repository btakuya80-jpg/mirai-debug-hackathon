/* Higgsfield で作った絵のセット（4案ぶん）。
   絵は public/packs/{案}/{名前}.webp に、案ごとにまとめて置いてある。
   1枚だけ入れ替える時は：
     ① 同じ名前で public/packs/{案}/ に上書きする、または
     ② 下の PACKS[案].swap に「名前: 新しいファイル名」を足す（例：{"bg-office": "bg-office-v2.webp"}）。
   コードの他の場所は直さなくてよい。 */

import type { Mood, Place, Who } from "./life";

export type StyleId = "g1" | "g2" | "h1" | "h2";

export const PACK_KEYS = [
  "me-m-genki", "me-m-futsu", "me-m-shindoi",
  "me-f-genki", "me-f-futsu", "me-f-shindoi",
  "boss", "senpai", "peer", "partner-m", "partner-f",
  "bg-office", "bg-factory", "bg-construction", "bg-logistics", "bg-food",
  "cut-rankup", "cut-rise", "cut-fork",
  "ev-family", "ev-home", "ev-overseas", "ev-independent", "ev-relearn",
  "town",
] as const;
export type PackKey = (typeof PACK_KEYS)[number];

export type Pack = {
  id: StyleId;
  /** 案の名前 */
  name: string;
  /** 絵のタッチ */
  touch: string;
  /** 町の全景があるか（H案のみ） */
  town: boolean;
  /** 差し替え（名前 → ファイル名） */
  swap: Partial<Record<PackKey, string>>;
};

export const PACKS: Record<StyleId, Pack> = {
  g1: { id: "g1", name: "G-1　育成シミュレーション（平面イラスト）", touch: "くっきりした線と平らな塗りのイラスト", town: false, swap: {} },
  g2: { id: "g2", name: "G-2　育成シミュレーション（絵の具）", touch: "絵の具で描いたような、やわらかい筆の跡", town: false, swap: {} },
  h1: { id: "h1", name: "H-1　ジオラマ（模型）", touch: "粘土とプラスチックの小さな模型を、斜め上から撮った写真", town: true, swap: {} },
  h2: { id: "h2", name: "H-2　ジオラマ（紙と木）", touch: "紙工作と木のおもちゃの模型。夕方の光", town: true, swap: {} },
};

declare global {
  interface Window {
    __MIRAI_PACK_BASE?: string;
  }
}

/** 絵のURL。単体HTMLでは書き出し時に window.__MIRAI_PACK_BASE（"./packs"）を渡す */
export function art(style: StyleId, key: PackKey) {
  const base = (typeof window !== "undefined" && window.__MIRAI_PACK_BASE) || "/packs";
  return `${base}/${style}/${PACKS[style].swap[key] ?? `${key}.webp`}`;
}

export const PLACE_ART: Record<Place, PackKey> = {
  office: "bg-office",
  factory: "bg-factory",
  construction: "bg-construction",
  logistics: "bg-logistics",
  food: "bg-food",
  home: "ev-home",
  school: "ev-relearn",
  overseas: "ev-overseas",
};

export type Look = "m" | "f";
const MOOD_KEY: Record<Mood, "genki" | "futsu" | "shindoi"> = { 元気: "genki", 普通: "futsu", しんどい: "shindoi" };

export function meArt(look: Look, mood: Mood): PackKey {
  return `me-${look}-${MOOD_KEY[mood]}` as PackKey;
}

/** 絵のある人物（家族・現地の仲間・教え子は吹き出しだけ） */
export function whoArt(who: Who, look: Look, mood: Mood): PackKey | null {
  if (who === "me") return meArt(look, mood);
  if (who === "boss" || who === "senpai" || who === "peer") return who;
  return null;
}

/** 人生のできごとの文から、合う絵を選ぶ */
export function eventArt(text: string): PackKey {
  if (/海外|国/.test(text)) return "ev-overseas";
  if (/独立|店を|開業/.test(text)) return "ev-independent";
  if (/学|教|資格|学校/.test(text)) return "ev-relearn";
  if (/家を|住まい|引っ越|建てる/.test(text)) return "ev-home";
  return "ev-family";
}
