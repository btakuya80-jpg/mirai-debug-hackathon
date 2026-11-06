"use client";

import Link from "next/link";
import { art, type StyleId } from "@/lib/packs";
import { Doll, Stage } from "./i/Board";
import { Figure, Screen } from "./j/Film";

/* トップページ：Higgsfield の絵で作り直した G案・H案（4ページ）と、I・J案を並べる */
const PACK_PLANS: { href: string; style: StyleId; name: string; look: string; aim: string; bg: string; place: string; me: string; other: string }[] = [
  { href: "/g", style: "g1", name: "G-1　育成シミュレーション（平面イラスト）", look: "くっきりした線と平らな塗り／クリームと青緑", aim: "職場の絵を画面いっぱいに出し、2頭身の分身と上司・同僚が並んで働く。ゲームの画面のような太い線と影。", bg: "bg-factory", place: "工場", me: "me-m-genki", other: "boss" },
  { href: "/g2", style: "g2", name: "G-2　育成シミュレーション（絵の具）", look: "絵の具の筆の跡／紙の色とテラコッタ", aim: "G-1と同じ遊び方を、絵本のようなやわらかい絵で。手書き風の文字と紙の手ざわり。", bg: "bg-food", place: "飲食店", me: "me-f-genki", other: "senpai" },
  { href: "/h", style: "h1", name: "H-1　ジオラマ（模型）", look: "粘土とプラスチックの模型／やさしい昼の光", aim: "町と職場を小さな模型にして、机の上からのぞきこむ。人形の分身が職場・家・学校・海外を行き来する。", bg: "bg-office", place: "オフィス", me: "me-m-genki", other: "peer" },
  { href: "/h2", style: "h2", name: "H-2　ジオラマ（紙と木）", look: "紙工作と木のおもちゃ／夕方の金色の光", aim: "H-1と同じ遊び方を、紙と木の手づくりの模型で。あたたかい夕方の色。", bg: "bg-construction", place: "建設現場", me: "me-f-genki", other: "boss" },
];

const OLD = [
  { href: "/i", name: "I案　人生のすごろく盤", aim: "生涯をひとつの盤にし、マスに止まるたびに職場の場面のカードが開く。", look: "太い墨の線の刷り物／赤・黄・青・緑" },
  { href: "/j", name: "J案　映画のフィルム", aim: "人生を1本の映画にする。シーンごとに影絵の場面と字幕。年表はフィルムのコマ。", look: "暗い客席と影絵／夕焼けの色" },
];

function PackPreview({ p }: { p: (typeof PACK_PLANS)[number] }) {
  const h = p.style.startsWith("h");
  return (
    <span className={`np-prev ${h ? "is-h" : ""}`}>
      <img src={art(p.style, p.bg as never)} alt="" className="np-bg" loading="lazy" />
      <img src={art(p.style, p.other as never)} alt="" className="np-ch is-other" loading="lazy" />
      <img src={art(p.style, p.me as never)} alt="" className="np-ch" loading="lazy" />
      <span className="np-tag">{p.place}</span>
    </span>
  );
}

function OldPreview({ i }: { i: number }) {
  if (i === 0)
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

export default function NewPlans() {
  return (
    <section className="mt-10">
      <p className="text-[13px] font-bold tracking-[0.12em] text-[#1f5fd1]">NEW　Higgsfield の絵で作り直し</p>
      <h2 className="mt-1 text-[24px] font-bold sm:text-[30px]">G案とH案を、4つの絵のタッチで</h2>
      <p className="mt-2 max-w-[72ch] text-[15px] leading-8 text-[#3d4759]">
        同じ人物（分身・上司・先輩・同期）が、どの場面でも同じ見た目で出るように描いた絵のセットを、4つのタッチで作りました。
        4ページとも中身は同じです：求人5件（URL貼り付け可）、会社情報のURLと自分で読んだ口コミ（任意）、年齢から75歳までの生涯、分かれ道6種、カットイン・ランクアップ、セーブデータの比較、過去に戻って選び直す（デバッグ）。
      </p>
      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {PACK_PLANS.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="group block h-full overflow-hidden rounded-2xl bg-white ring-1 ring-[#dfe3ea] transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(20,30,50,.45)]">
              <PackPreview p={p} />
              <div className="p-5">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#1f5fd1] px-2.5 py-0.5 text-[12px] font-bold text-white">新</span>
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
      <h2 className="mt-12 text-[20px] font-bold">前回の作り直し案　I・J</h2>
      <ul className="mt-5 grid gap-5 md:grid-cols-2">
        {OLD.map((p, i) => (
          <li key={p.href}>
            <Link href={p.href} className="group block h-full overflow-hidden rounded-2xl bg-white ring-1 ring-[#dfe3ea] transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(20,30,50,.45)]">
              <div className={`flex h-[200px] items-center justify-center overflow-hidden px-6 ${i === 0 ? "bg-[#f6efe2]" : "bg-[#0e0d0c]"}`}>
                <OldPreview i={i} />
              </div>
              <div className="p-5">
                <p className="text-[12.5px] text-[#56627a]">{p.look}</p>
                <h3 className="mt-2 text-[19px] font-bold">{p.name}</h3>
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
