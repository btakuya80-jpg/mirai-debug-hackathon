import Link from "next/link";
import data from "@/data/mirai.json";
import Sprite from "./c/Sprite";

const PLANS = [
  {
    href: "/a",
    name: "A案　デバッガー画面風",
    aim: "人生を「実行」し、1か月後・1年後などのブレークポイントで止めて中を調べる。辞めたくなる場面は赤い警告、分かれ道はブランチの図。",
    tone: "bg-[#12161d] text-[#cfd8e3]",
  },
  {
    href: "/b",
    name: "B案　10年の山",
    aim: "8つの力を山並みで見せる。時点を進めると山が育ち、毎日の小さな差が10年で大きな山になる様子が分かる。",
    tone: "bg-gradient-to-b from-[#cfe6fb] to-[#fff3e3] text-[#17302b]",
  },
  {
    href: "/c",
    name: "C案　ゲームのセーブ画面風",
    aim: "分身をキャラクターにして、時点ごとのセーブデータを行き来する。ステータスと冒険の記録で、10年の変化を遊ぶように見る。",
    tone: "bg-[#e9e4ff] text-[#2a2350]",
  },
];

function PreviewA() {
  return (
    <div className="font-mono text-[12px] leading-6">
      <p className="text-[#6f7f94]">$ mirai-debug run --runs 5</p>
      <p>[1か月後] <span className="text-[#f5c266]">warn: 辞めたくなる度合い=中</span></p>
      <p>[1年後] <span className="text-[#7bd88f]">info: 企画 C→A</span></p>
      <p>[3年後] <span className="text-[#ff6b6b]">error: 辞めたくなる度合い=高</span></p>
      <p className="text-[#c49bff]">⎇ 分かれ道：残る／移る／違う業界へ</p>
    </div>
  );
}

function PreviewB() {
  return (
    <svg viewBox="0 0 300 110" className="h-auto w-full" aria-hidden>
      <circle cx="240" cy="32" r="16" fill="#ffc94a" />
      <path d="M0,110 L0,80 C30,70 40,40 60,42 C80,44 90,75 110,72 C130,69 140,20 165,18 C190,16 200,70 220,66 C240,62 250,44 270,46 C285,48 292,70 300,74 L300,110 Z" fill="#2e6a5e" />
      <path d="M150,26 L165,18 L180,26 Z" fill="#fffdf9" />
      <path d="M0,110 L0,96 C80,86 160,100 300,90 L300,110 Z" fill="#24584d" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#f2f4f7] text-[#1b2330]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
        <p className="text-[14px] font-medium text-[#56627a]">Built with Claude: Japan 2026 提出作品　デザイン3案の比較用モック</p>
        <h1 className="mt-3 text-[40px] leading-tight font-bold tracking-tight sm:text-[64px]">
          <span className="w">未来デバッグ</span>
        </h1>
        <p className="mt-3 max-w-[34ch] text-[20px] leading-9 sm:text-[24px]">
          <span className="w">入社する前に、</span>
          <span className="w">その会社での将来を試運転する。</span>
        </p>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-8 text-[#3d4759]">
          求職者の分身と、仮想の会社・上司・同僚をAIでつくり、1か月後・3か月後・1年後・3年後・10年後にどうなるかを何度も試走します。
          3案とも同じ見本データ・同じ画面の流れです。見た目だけを変えています。
        </p>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <li key={p.href}>
              <Link href={p.href} className="group block h-full overflow-hidden rounded-2xl bg-white ring-1 ring-[#dfe3ea] transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(20,30,50,.45)]">
                <div className={`flex h-[170px] items-center justify-center px-5 ${p.tone}`}>
                  {i === 0 && <PreviewA />}
                  {i === 1 && <PreviewB />}
                  {i === 2 && (
                    <div className="flex items-end gap-4">
                      <Sprite size={64} level={0} />
                      <Sprite size={64} level={3} mood="中" />
                      <Sprite size={64} level={5} star />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-[19px] font-bold">{p.name}</h2>
                  <p className="mt-2 text-[14px] leading-7 text-[#3d4759]">{p.aim}</p>
                  <p className="mt-4 text-[14px] font-bold text-[#1f5fd1] group-hover:underline">{p.href} を開く</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-14 grid gap-6 rounded-2xl bg-white p-6 ring-1 ring-[#dfe3ea] sm:p-8 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-[22px] font-bold">当たるのか？</h2>
            <p className="mt-2 text-[15px] leading-8 text-[#3d4759]">{data.proof.lead}</p>
          </div>
          <ul className="grid gap-4">
            {data.proof.cases.map((c) => (
              <li key={c.name} className="grid grid-cols-[6rem_1fr] gap-3">
                <div>
                  <p className="text-[13px] text-[#56627a]">{c.name}</p>
                  <p className="text-[22px] font-bold tabular-nums">
                    {c.base[0].toFixed(1)}
                    <span className="text-[13px] font-medium text-[#56627a]">／{c.base[1]}点</span>
                  </p>
                </div>
                <p className="text-[14px] leading-7 text-[#3d4759]">{c.after}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-[13px] leading-7 text-[#56627a]">
          {data.meta.notice}
          <br />
          {data.meta.sampleNote}　いまはAIにつないでいません（data/mirai.json の見本で動きます）。
        </p>
      </div>
    </main>
  );
}
