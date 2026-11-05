/* 絵の差し替え口。
   いまは各案が SVG で絵を描いている。画像生成サービスの絵に入れ替える時は、
   ART に「絵の名前 → 画像のURL」を足すだけで、その場所が画像に置きかわる（コードの他の場所は直さない）。

   絵の名前の付け方：「案:種類:名前」
     h:place:factory   … H案の工場の場面
     i:place:office    … I案のオフィスの場面
     j:place:overseas  … J案の海外の拠点の場面
     h:chara:me        … H案の分身（同じ要領で boss / senpai / peer / local / family / student）
     i:thumb:tsumugi   … I案の求人一覧の小さな絵（求人のid）                                  */

import type { ReactNode } from "react";

export const ART: Record<string, string> = {
  // 例）"h:place:factory": "https://…/h-factory.png",
};

/** SVG の中で使う差し替え口。画像が登録されていれば画像を、なければ描いた絵（children）を出す */
export function ArtSlot({ id, x = 0, y = 0, w, h, children }: { id: string; x?: number; y?: number; w: number; h: number; children: ReactNode }) {
  const url = ART[id];
  if (url) return <image href={url} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" data-art={id} />;
  return <g data-art={id}>{children}</g>;
}
