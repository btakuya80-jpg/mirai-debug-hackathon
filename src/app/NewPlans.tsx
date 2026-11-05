"use client";

import Link from "next/link";
import { Backdrop, Chibi, Desk } from "./g/Chibi";
import { Pawn, Room } from "./h/Iso";
import { Doll, Stage } from "./i/Board";
import { Figure, Screen } from "./j/Film";

/* トップページ：G案（基準）と、作り直したH・I・J案を並べる */
const NEW = [
  {
    href: "/g",
    tag: "基準",
    name: "G案　育成シミュレーション風",
    aim: "ちびキャラの分身が職場で働き、カレンダーがめくれて出来事が起き、力の＋−ときもちのアイコンで変化を見せる。10年まで。",
    look: "2頭身のちびキャラ／紙の色と青緑",
  },
  {
    href: "/h",
    tag: "新",
    name: "H案　ジオラマ",
    aim: "町と職場を小さな模型のように見下ろす。分身が職場・家・学校・海外の拠点を行き来しながら、75歳まで生涯が進む。",
    look: "斜め上から見た箱の模型／空色と芝の緑",
  },
  {
    href: "/i",
    tag: "新",
    name: "I案　人生のすごろく盤",
    aim: "生涯をひとつの盤にし、マスに止まるたびに職場の場面のカードが開く。分かれ道は盤の6本の分岐。止まったマスへ戻って選び直せる。",
    look: "太い墨の線の刷り物／赤・黄・青・緑",
  },
  {
    href: "/j",
    tag: "新",
    name: "J案　映画のフィルム",
    aim: "人生を1本の映画にする。シーンごとに影絵の場面と字幕、カットインは黒帯と一行のせりふ。年表はフィルムのコマ。",
    look: "暗い客席と影絵／夕焼けの色",
  },
];

function Preview({ i }: { i: number }) {
  if (i === 0)
    return (
      <svg viewBox="150 130 340 130" className="h-auto w-full" aria-hidden>
        <Backdrop bg="office" />
        <g transform="translate(260,250)">
          <Chibi look={{ hair: "#3a2a20", shirt: "#20a39e", style: "short" }} pose="type" mood="元気" />
        </g>
        <g transform="translate(400,250)">
          <Chibi look={{ hair: "#23262d", shirt: "#3b4a6b", style: "spiky", glasses: true }} pose="teach" flip />
        </g>
        <Desk x={260} />
      </svg>
    );
  if (i === 1)
    return (
      <div className="w-[78%]">
        <Room place="factory">
          <Pawn who="boss" act="talk" x={4.2} y={2} />
          <Pawn who="me" act="machine" x={2.4} y={2} mood="元気" />
        </Room>
      </div>
    );
  if (i === 2)
    return (
      <div className="w-full overflow-hidden rounded-lg border-[2.5px] border-[#1f1b16]">
        <Stage place="food">
          <Doll who="peer" act="talk" x={310} flip s={0.92} />
          <Doll who="me" act="cook" x={120} mood="元気" />
        </Stage>
      </div>
    );
  return (
    <div className="w-full">
      <Screen place="overseas" mood="普通" id="home">
        <Figure who="local" act="talk" x={340} flip />
        <Figure who="me" act="teach" x={220} />
      </Screen>
    </div>
  );
}

const TONE = ["bg-[#f3ebdc]", "bg-gradient-to-b from-[#d7eef7] to-[#eaf4ef]", "bg-[#f6efe2]", "bg-[#0e0d0c]"];

export default function NewPlans() {
  return (
    <section className="mt-10">
      <h2 className="text-[24px] font-bold sm:text-[30px]">作り直して比べる　G案（基準）とH・I・J案</h2>
      <p className="mt-2 max-w-[70ch] text-[15px] leading-8 text-[#3d4759]">
        H・I・J案は、G案で評価が高かった3点（分身が働く姿が見える／時間が進んで出来事が起き、力が変わる／違う道を選んだ人生を並べて比べられる）を条件に、見た目をゼロから作り直した案です。
        3案とも、求人5件（オフィス・工場・建設・物流・飲食）、年齢から75歳までの生涯、分かれ道6種、過去に戻って選び直す（デバッグ）を備えています。
      </p>
      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {NEW.map((p, i) => (
          <li key={p.href}>
            <Link href={p.href} className="group block h-full overflow-hidden rounded-2xl bg-white ring-1 ring-[#dfe3ea] transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(20,30,50,.45)]">
              <div className={`flex h-[230px] items-center justify-center overflow-hidden px-6 ${TONE[i]}`}>
                <Preview i={i} />
              </div>
              <div className="p-5">
                <p className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${i === 0 ? "bg-[#e6e9ef] text-[#3d4759]" : "bg-[#1f5fd1] text-white"}`}>{p.tag}</span>
                  <span className="text-[12.5px] text-[#56627a]">{p.look}</span>
                </p>
                <h3 className="mt-2 text-[20px] font-bold">{p.name}</h3>
                <p className="mt-2 text-[14px] leading-7 text-[#3d4759]">{p.aim}</p>
                <p className="mt-4 text-[14px] font-bold text-[#1f5fd1] group-hover:underline">{p.href} を開く</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
