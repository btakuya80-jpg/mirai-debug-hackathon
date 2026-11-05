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
  {
    href: "/d",
    name: "D案　未来の履歴書",
    aim: "履歴書の職歴欄に、1か月後から10年後までの職歴が手書きで書き込まれていく。辞めたくなる時期は赤いはんこ、分かれ道は付箋で見せる。",
    tone: "bg-[#f7f8f5] text-[#1f2a44]",
  },
  {
    href: "/e",
    name: "E案　キャリア路線図",
    aim: "時点を駅、分かれ道を乗り換えにした路線図。5本の列車が同時に走り、3年後の駅で残る線・移る線・違う業界線に分かれていく。",
    tone: "bg-[#f4f6f8] text-[#1c2433]",
  },
  {
    href: "/f",
    name: "F案　出発案内板",
    aim: "空港や駅の案内板のように、文字がパタパタとめくれて未来の出来事や辞めたくなる度合いが表示される。動きでデモ動画に映える。",
    tone: "bg-[#1b1e25] text-[#f2efe6]",
  },
];

function PreviewD() {
  const rows = [
    ["1か月後", "担当が3事業にまたがる"],
    ["1年後", "新しい企画を任される"],
    ["3年後", "専門を深めたくなる"],
  ];
  return (
    <div className="w-full max-w-[260px] border-[1.5px] border-[#1f2a44] bg-white" style={{ fontFamily: "var(--font-zenold)" }}>
      <p className="border-b-[1.5px] border-[#1f2a44] px-3 py-1 text-[11px] tracking-[0.2em]">職 歴</p>
      {rows.map(([a, b], i) => (
        <p key={a} className="grid grid-cols-[4.2rem_1fr] border-b border-[#c9d3dc] px-3 py-1.5 text-[12px] last:border-b-0">
          <span className="text-[#5b6478]">{a}</span>
          <span style={{ fontFamily: "var(--font-klee)", color: i === 2 ? "#c8382f" : undefined }}>{b}</span>
        </p>
      ))}
    </div>
  );
}

function PreviewE() {
  return (
    <svg viewBox="0 0 300 120" className="h-auto w-full" aria-hidden>
      <path d="M20,60 L170,60" stroke="#2b3445" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M170,60 C200,60 205,22 235,22 L280,22" stroke="#1f6fd1" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M170,60 L280,60" stroke="#1b9e5a" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M170,60 C200,60 205,98 235,98 L280,98" stroke="#e8820c" strokeWidth="8" strokeLinecap="round" fill="none" />
      {[20, 70, 120, 170].map((x) => (
        <circle key={x} cx={x} cy="60" r="7" fill="#fff" stroke="#2b3445" strokeWidth="4" />
      ))}
      <circle cx="170" cy="60" r="13" fill="none" stroke="#e0323c" strokeWidth="2.5" />
      <rect x="84" y="53" width="20" height="14" rx="4" fill="#1b9e5a" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function PreviewF() {
  const cell = (ch: string, i: number) => (
    <span key={i} className="inline-grid h-[1.45em] min-w-[1.05em] place-items-center rounded-[3px]" style={{ background: "linear-gradient(180deg,#2a2e37 0 49%,#111 49% 51%,#23272f 51%)" }}>
      {ch}
    </span>
  );
  return (
    <div className="grid gap-2 text-[14px]" style={{ fontFamily: "var(--font-biz)" }}>
      <p className="flex items-center gap-3">
        <span className="text-[#ffb000]" style={{ fontFamily: "var(--font-oswald)" }}>3年後</span>
        <span className="flex gap-[2px]">{"専門を深めたい".split("").map(cell)}</span>
        <span className="flex text-[#ff5a4f]">{cell("高", 0)}</span>
      </p>
      <p className="flex items-center gap-3">
        <span className="text-[#ffb000]" style={{ fontFamily: "var(--font-oswald)" }}>10年後</span>
        <span className="flex gap-[2px]">{"企画のまとめ役".split("").map(cell)}</span>
        <span className="flex text-[#39d98a]">{cell("低", 0)}</span>
      </p>
    </div>
  );
}

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
        <p className="text-[14px] font-medium text-[#56627a]">Built with Claude: Japan 2026 提出作品　デザイン6案の比較用モック</p>
        <h1 className="mt-3 text-[40px] leading-tight font-bold tracking-tight sm:text-[64px]">
          <span className="w">未来デバッグ</span>
        </h1>
        <p className="mt-3 max-w-[34ch] text-[20px] leading-9 sm:text-[24px]">
          <span className="w">入社する前に、</span>
          <span className="w">その会社での将来を試運転する。</span>
        </p>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-8 text-[#3d4759]">
          求職者の分身と、仮想の会社・上司・同僚をAIでつくり、1か月後・3か月後・1年後・3年後・10年後にどうなるかを何度も試走します。
          6案とも同じ見本データ・同じ画面の流れです。見た目だけを変えています。
        </p>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <li key={p.href}>
              <Link href={p.href} className="group block h-full overflow-hidden rounded-2xl bg-white ring-1 ring-[#dfe3ea] transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(20,30,50,.45)]">
                <div className={`flex h-[170px] items-center justify-center px-5 ${p.tone}`}>
                  {i === 0 && <PreviewA />}
                  {i === 1 && <PreviewB />}
                  {i === 3 && <PreviewD />}
                  {i === 4 && <PreviewE />}
                  {i === 5 && <PreviewF />}
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
