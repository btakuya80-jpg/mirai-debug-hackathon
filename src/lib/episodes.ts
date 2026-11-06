/* 入社1年の「場面」（2026-11-06 依頼）。
   スキルが上がる時は、毎回この順で見せる：
     ① 仕事の場面 → ② 壁 → ③ 学び（だれに何を教わったか／自分で何を工夫したか）→ ④ カットイン（Lv.○ → Lv.○）→ ⑤ その後
   時間は飛ばさない。まず入社1年を、この場面を重ねてじっくり見せる。その先は利用者が「先を見る」を選んだ時だけ。
   Lv は 0＝まだ、1＝知った、2＝できる、3＝任される、4＝教えられる（know.ts の STAGES と同じ並び）。
   1年目の終わりの Lv は、know.ts の grow[2]（1年後）＋1 と必ず合わせる。
   会社・人物・数字はすべて架空。 */

import type { Act, Job, Place, Talk, Who } from "./life";
import type { Vibe } from "./reviews";

export const LV_NAME = ["まだ", "知った", "できる", "任される", "教えられる"] as const;
export const BEATS = ["仕事", "壁", "学び", "スキルアップ", "その後"] as const;
export type Beat = 0 | 1 | 2 | 3 | 4;

export type Episode = {
  id: string;
  /** 入社からいつか（画面に出す言葉） */
  when: string;
  place: Place;
  act: Act;
  title: string;
  /** ① 仕事の場面 */
  work: { text: string; talk: Talk };
  /** ② 壁 */
  wall: { text: string; think: string; tint?: "night" | "sweat" };
  /** ③ 学び */
  learn: { who: Who; how: "教わる" | "工夫"; text: string; line: string };
  /** ④ カットイン：どの専門スキルが、Lv いくつから いくつへ */
  up: { know: string; from: number; to: number };
  /** ⑤ その後：このスキルが、あとでどう役に立ったか */
  after: { when: string; text: string };
};

const E = (e: Episode) => e;

export const EPISODES: Record<string, Episode[]> = {
  tsumugi: [
    E({
      id: "t1",
      when: "入社1週間",
      place: "factory",
      act: "machine",
      title: "聞いたことのない音で、手が止まる",
      work: { text: "加工ラインで、部品をセットしてボタンを押す仕事を覚える", talk: { who: "boss", text: "まず止め方から覚えろ" } },
      wall: { text: "機械から聞いたことのない音。どこを押せば止まるのか分からず、固まってしまう", think: "（どれを押せばいいの…？）" },
      learn: { who: "senpai", how: "教わる", text: "久保さんが、非常停止の場所と「止める・呼ぶ・待つ」の順番を、手を取って教えてくれる", line: "止める、呼ぶ、待つ。この順番だけ守って" },
      up: { know: "safety", from: 0, to: 1 },
      after: { when: "その次の週", text: "また音がした時、迷わず止めるボタンに手が伸びた" },
    }),
    E({
      id: "t2",
      when: "1か月後",
      place: "factory",
      act: "machine",
      title: "ラインを止めて、黙ってしまう",
      work: { text: "1人で1台の機械を任されはじめる", talk: { who: "peer", text: "だいぶ慣れてきたね" } },
      wall: { text: "部品の向きをまちがえ、ラインを30分止めてしまう。怒られるのがこわくて、言い出せない", think: "（言わずに、こっそり直せないかな…）", tint: "sweat" },
      learn: { who: "boss", how: "教わる", text: "石原班長に「止めたのは悪くない。黙ってたら悪い」と言われ、すぐ報告する大切さを知る", line: "止めたのは悪くない。黙ってたら悪い" },
      up: { know: "safety", from: 1, to: 2 },
      after: { when: "3年後", text: "班でいちばん早く「止めました」と言える人として、新人の手本になる" },
    }),
    E({
      id: "t3",
      when: "3か月後",
      place: "factory",
      act: "machine",
      title: "検査の当番が回ってくる",
      work: { text: "できた部品の長さを測って、記録表に書く「検査」の当番を始める", talk: { who: "senpai", text: "測ったら、すぐ書いてね" } },
      wall: { text: "測った数字を後でまとめて書いたら、どの数字がどの部品か分からなくなる", think: "（あれ…この数字、どの部品だっけ）" },
      learn: { who: "senpai", how: "教わる", text: "久保さんから「測る・書く・確かめる、を1セットで」と教わり、1個ずつ書いてから次に進む", line: "測る・書く・確かめる。1セットでね" },
      up: { know: "qc", from: 0, to: 1 },
      after: { when: "半年後", text: "記録の書きまちがいが、班でいちばん少なくなる" },
    }),
    E({
      id: "t4",
      when: "半年後",
      place: "factory",
      act: "machine",
      title: "夜勤明けに、見落としてしまう",
      work: { text: "夜勤に入るようになり、朝の班に仕事を引き継ぐ", talk: { who: "peer", text: "眠いね…あと1時間" } },
      wall: { text: "夜勤明けに、検査の抜けを見落とす。朝の班が気づいてくれて、出荷前に止まった", think: "（疲れていると、同じところを見落とす）", tint: "night" },
      learn: { who: "me", how: "工夫", text: "確かめた所に印をつける「引き継ぎメモ」を自分で作る。久保さんが「班で使わせて」と言ってくれる", line: "書いておけば、夜勤でも迷わない" },
      up: { know: "qc", from: 1, to: 2 },
      after: { when: "3年後", text: "この引き継ぎメモが、班の決まりになる" },
    }),
    E({
      id: "t5",
      when: "1年後",
      place: "factory",
      act: "machine",
      title: "機械の音のちがいに気づく",
      work: { text: "同じ機械を毎日使い、いつもの音を覚えてくる", talk: { who: "boss", text: "最近、3号機はどうだ" } },
      wall: { text: "3号機の音が少しだけ高い。でもまだ動いているので、言うか迷う", think: "（気のせいかな…でも、いつもとちがう）" },
      learn: { who: "boss", how: "教わる", text: "石原班長に伝えると、保全の人と一緒に点検。部品のすり減りが見つかり、「止まる前に気づくのが保全だ」と教わる", line: "止まる前に気づく。それが保全だ" },
      up: { know: "maint", from: 0, to: 1 },
      after: { when: "3年後", text: "会社の支えで、機械保全の資格の勉強を始める" },
    }),
  ],
  soyokaze: [
    E({
      id: "s1",
      when: "入社1か月",
      place: "office",
      act: "pc",
      title: "表の合計が、1万円ずれる",
      work: { text: "イベントの見積もりの表を、先輩の見本どおりに作る", talk: { who: "boss", text: "明日の打ち合わせで使うから" } },
      wall: { text: "表の合計が、見本と1万円ずれる。どこがまちがっているのか分からない", think: "（何回たしても、合わない…）", tint: "night" },
      learn: { who: "senpai", how: "教わる", text: "宮内さんに「合計は、縦と横の2回たしかめる」と教わり、式の入れ忘れを見つける", line: "合計は、縦と横で2回たしかめよう" },
      up: { know: "sheet", from: 0, to: 1 },
      after: { when: "半年後", text: "数字の表は、まず自分に回ってくるようになる" },
    }),
    E({
      id: "s2",
      when: "半年後",
      place: "office",
      act: "pc",
      title: "急ぎの資料が、同じ週に3つ",
      work: { text: "3つのイベントの資料を、同じ週に仕上げる", talk: { who: "peer", text: "今週、資料多くない？" } },
      wall: { text: "毎回ゼロから表を作るので、時間がまったく足りない", think: "（同じ形の表を、何回も作ってる…）" },
      learn: { who: "me", how: "工夫", text: "よく使う表を、ひな形にまとめる。宮内さんがチームのフォルダに置いてくれる", line: "ひな形にしておけば、次から10分で終わる" },
      up: { know: "sheet", from: 1, to: 2 },
      after: { when: "3年後", text: "企画の予算づくりを、丸ごと任される" },
    }),
    E({
      id: "s3",
      when: "1年後",
      place: "office",
      act: "pc",
      title: "下書きだけで、2日かかる",
      work: { text: "お店の販促の企画書を書く", talk: { who: "boss", text: "来週までに3案ほしい" } },
      wall: { text: "文章の下書きに丸2日かかり、中身を考える時間が残らない", think: "（書くだけで終わっちゃう…）" },
      learn: { who: "senpai", how: "教わる", text: "毎月の社内の勉強会で、宮内さんからAIの道具に下書きを任せるやり方を教わる。下書きの時間が半分になる", line: "下書きは道具に。考えるのは自分で" },
      up: { know: "ai", from: 0, to: 1 },
      after: { when: "3年後", text: "社内でAIの道具の使い方を教える役を任される" },
    }),
  ],
  tamayura: [
    E({
      id: "m1",
      when: "入社1週間",
      place: "construction",
      act: "build",
      title: "図面の線が、読めない",
      work: { text: "所長について、工事の現場を見て回る", talk: { who: "boss", text: "現場は、まず見て回れ" } },
      wall: { text: "「この壁、図面のどこ？」と聞かれても、線の意味が分からない", think: "（線ばっかりで、どこが何なのか…）" },
      learn: { who: "peer", how: "教わる", text: "同期の竹中さんが、図面の記号を色ペンで分けて見せてくれる。現場と図面を見比べて覚える", line: "記号ごとに色を分けると、すっと読めるよ" },
      up: { know: "draw", from: 0, to: 1 },
      after: { when: "1年後", text: "図面を見て、明日どこに何を運ぶか言えるようになる" },
    }),
    E({
      id: "m2",
      when: "1か月後",
      place: "construction",
      act: "build",
      title: "雨で、工程が2日ずれる",
      work: { text: "職人さんの入る日を、工程表で確かめる", talk: { who: "boss", text: "明日の段取り、大丈夫か" } },
      wall: { text: "雨で作業が2日ずれ、職人さんの予定がぶつかる。頭を下げて回る", think: "（どこから直せばいいんだ…）", tint: "sweat" },
      learn: { who: "senpai", how: "教わる", text: "新井さんから「謝り方より、次の段取り」と教わり、天気予報を見て予備の日を入れる組み方を覚える", line: "謝り方より、次の段取りだよ" },
      up: { know: "plan", from: 0, to: 1 },
      after: { when: "1年後", text: "雨の週でも、工程がほとんどずれなくなる" },
    }),
    E({
      id: "m3",
      when: "1年後",
      place: "construction",
      act: "build",
      title: "同じお願いが、自分だと通らない",
      work: { text: "職人さんに、作業の順番をお願いする", talk: { who: "senpai", text: "今日は2階からでお願いします、って言ってきて" } },
      wall: { text: "同じお願いをしても、新井さんだと通るのに、自分だと通らない", think: "（何がちがうんだろう…）" },
      learn: { who: "me", how: "工夫", text: "職人さんの名前と得意な作業を手帳に書き、名前で話しかける。少しずつ話が通るようになる", line: "人の名前を覚えれば、段取りが回る" },
      up: { know: "plan", from: 1, to: 2 },
      after: { when: "3年後", text: "小さな現場を1つ、まるごと任される" },
    }),
  ],
  shiosai: [
    E({
      id: "w1",
      when: "入社1週間",
      place: "logistics",
      act: "carry",
      title: "棚が、見つからない",
      work: { text: "注文の紙を見て、商品を棚から集める（ピッキング）", talk: { who: "boss", text: "1時間で40件が目安だ" } },
      wall: { text: "棚の場所が分からず、1件に5分かかる", think: "（同じ通路を、何回も歩いてる…）" },
      learn: { who: "senpai", how: "教わる", text: "堀さんから「棚の番号は、通路・段・列の順」という決まりを教わる。番号だけで場所が分かるようになる", line: "番号の付け方には、決まりがあるよ" },
      up: { know: "stock", from: 0, to: 1 },
      after: { when: "1か月後", text: "地図を見なくても、棚に向かえるようになる" },
    }),
    E({
      id: "w2",
      when: "1か月後",
      place: "logistics",
      act: "carry",
      title: "返品が、山になる",
      work: { text: "お客さんから戻ってきた商品を、棚に戻す", talk: { who: "peer", text: "返品、今日もすごい量だね" } },
      wall: { text: "返品が置き場にたまり、どれがどこに戻るのか分からなくなる", think: "（このままじゃ、明日もっと増える）" },
      learn: { who: "me", how: "工夫", text: "返品を、戻す通路ごとに箱を分けて置く。戻す時間が半分になり、堀さんが班でまねしてくれる", line: "戻す場所ごとに分けておけば、迷わない" },
      up: { know: "stock", from: 1, to: 2 },
      after: { when: "3か月後", text: "棚の入れ替えの手伝いを、まかされる" },
    }),
    E({
      id: "w3",
      when: "3か月後",
      place: "logistics",
      act: "carry",
      title: "月末、在庫の数が合わない",
      work: { text: "月末で、出荷が重なる。倉庫中が走り回る", talk: { who: "boss", text: "今日中に、全部出すぞ" } },
      wall: { text: "記録では10個あるはずの商品が、棚には7個しかない。出荷が止まる", think: "（3個、どこに行ったの…？）", tint: "sweat" },
      learn: { who: "senpai", how: "教わる", text: "堀さんに「棚卸し」（数を数えて記録と合わせる作業）のやり方を教わる。動かしたその場で記録する、を徹底する", line: "数は、動かしたその場で記録する" },
      up: { know: "stock", from: 2, to: 3 },
      after: { when: "3年後", text: "「在庫の数が合う班」の人として、リーダーを任される" },
    }),
    E({
      id: "w4",
      when: "1年後",
      place: "logistics",
      act: "carry",
      title: "重い箱で、腰を痛める",
      work: { text: "年末の繁忙期。重い箱を1日に何百個も運ぶ", talk: { who: "peer", text: "持ち方、こうすると楽だよ" } },
      wall: { text: "腰を痛めて2日休む。このままでは続けられないと思う", think: "（体が、ついていかない…）", tint: "sweat" },
      learn: { who: "boss", how: "教わる", text: "秋山センター長にすすめられ、会社の費用でフォークリフトの免許をとる。重い物は道具で運ぶと決める", line: "体を守るのも、仕事のうちだ" },
      up: { know: "fork", from: 0, to: 1 },
      after: { when: "3年後", text: "フォークリフトで、荷物の流れを任される" },
    }),
  ],
  komugi: [
    E({
      id: "k1",
      when: "入社1週間",
      place: "food",
      act: "cook",
      title: "玉ねぎ20個が、終わらない",
      work: { text: "開店前に、玉ねぎを毎日20個きざむ", talk: { who: "boss", text: "包丁は、音で分かる" } },
      wall: { text: "1時間たっても終わらず、大きさもバラバラ。開店に間に合わない", think: "（手が痛い…まだ半分）" },
      learn: { who: "senpai", how: "教わる", text: "無口な中西さんが、横で黙って切ってみせる。指の置き方と、包丁を前に滑らせる動きをまねする", line: "力じゃない。前に滑らせる" },
      up: { know: "prep", from: 0, to: 1 },
      after: { when: "1か月後", text: "20個を30分で、同じ大きさに切れるようになる" },
    }),
    E({
      id: "k2",
      when: "1か月後",
      place: "food",
      act: "cook",
      title: "ピークの途中で、材料が切れる",
      work: { text: "昼のピークに、注文の料理を出す", talk: { who: "peer", text: "3番テーブル、まだですか！" } },
      wall: { text: "ピークの途中で、きざんだ野菜が切れる。お客さんを15分待たせる", think: "（手が、追いつかない…）", tint: "sweat" },
      learn: { who: "boss", how: "教わる", text: "三浦店長から、前の週に売れた数を見て、仕込む量を決めるやり方を教わる", line: "仕込みの量は、昨日の伝票が教えてくれる" },
      up: { know: "prep", from: 1, to: 2 },
      after: { when: "半年後", text: "ピークで材料が切れることが、ほぼなくなる" },
    }),
    E({
      id: "k3",
      when: "1年後",
      place: "food",
      act: "cook",
      title: "材料の値段が、上がる",
      work: { text: "仕入れの伝票を整理する手伝いを始める", talk: { who: "boss", text: "玉ねぎ、また上がったな" } },
      wall: { text: "材料が値上がりし、同じ値段で出すと店にお金が残らないと知る", think: "（1皿で、いくら残ってるんだろう）" },
      learn: { who: "me", how: "工夫", text: "1皿ごとに材料の値段を書き出す表を、自分で作ってみる。三浦店長が「これが原価だ」と見てくれる", line: "1皿いくらで作れるか、書き出してみよう" },
      up: { know: "cost", from: 0, to: 1 },
      after: { when: "2年目", text: "発注を任される（求人原稿：2年目からは発注も担当）" },
    }),
  ],
};

export const episodesOf = (job: Job) => EPISODES[job.id] ?? [];

/** 口コミ・会社情報（vibe.at：入社=0／1か月後=1／1年後=2）を、どの場面に入れるか */
export function episodeOfVibe(job: Job, v: Vibe): number | null {
  const n = episodesOf(job).length;
  if (!n || v.at > 2) return null;
  return v.at === 0 ? 0 : v.at === 1 ? Math.min(1, n - 1) : n - 1;
}

/** e 番目の場面の beat 段まで進んだ時の、各スキルの Lv（0＝まだ） */
export function levelsAt(job: Job, e: number, beat: number): Record<string, number> {
  const lv: Record<string, number> = {};
  episodesOf(job).forEach((ep, i) => {
    if (i > e) return;
    const done = i < e || beat >= 3;
    lv[ep.up.know] = Math.max(lv[ep.up.know] ?? 0, done ? ep.up.to : ep.up.from);
  });
  return lv;
}

/** 場面がどの年表の章に当たるか（8つの力の表示用。入社=0／1か月〜半年=1／1年後=2） */
export function trunkIdxOf(ep: Episode): number {
  if (ep.when.includes("1年後") || ep.when.includes("1年")) return 2;
  if (ep.when.includes("週間")) return 0;
  return 1;
}
