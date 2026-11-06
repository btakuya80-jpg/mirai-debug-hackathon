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
  /** この出来事が何を意味するか（ひとこと） */
  mean: string;
  /** この場面のあとの役割（任される仕事の階段） */
  role: string;
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
      mean: "入社して最初の週。まだ先輩が横について、機械の動かし方を覚えている段階",
      role: "見習い（先輩が横につく）",
      work: { text: "加工ラインで、部品をセットしてボタンを押す仕事を覚える", talk: { who: "boss", to: "me", text: "まずは、止め方から覚えておこうか" } },
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
      mean: "1か月たち、先輩が横を離れて、1台の機械を1人で動かしはじめた",
      role: "1台を1人で動かす",
      work: { text: "1人で1台の機械を任されはじめる", talk: { who: "peer", to: "me", text: "だいぶ慣れてきたね" } },
      wall: { text: "部品の向きをまちがえ、ラインを30分止めてしまう。怒られるのがこわくて、言い出せない", think: "（言わずに、こっそり直せないかな…）", tint: "sweat" },
      learn: { who: "boss", how: "教わる", text: "石原班長に「止めたのは悪くない。黙ってたら悪い」と言われ、すぐ報告する大切さを知る", line: "止めたのは悪くないよ。黙っているのが一番困るんだ" },
      up: { know: "safety", from: 1, to: 2 },
      after: { when: "3年後", text: "班でいちばん早く「止めました」と言える人として、新人の手本になる" },
    }),
    E({
      id: "t3",
      when: "3か月後",
      place: "factory",
      act: "machine",
      title: "検査の当番が回ってくる",
      mean: "3か月たち、作るだけでなく「良い品か」を確かめる検査も、1人で任されるようになった",
      role: "検査も1人で担当",
      work: { text: "できた部品の長さを測って、記録表に書く「検査」の当番を始める", talk: { who: "senpai", to: "me", text: "測ったら、その場ですぐ書いてね" } },
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
      mean: "半年たち、夜の当番（夜勤）にも入るようになった。朝の班へ仕事を渡す役もある",
      role: "夜勤と引き継ぎも担当",
      work: { text: "夜勤に入るようになり、朝の班に仕事を引き継ぐ", talk: { who: "peer", to: "me", text: "眠いね…あと1時間、がんばろう" } },
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
      mean: "1年たち、機械の小さな変化に気づけるくらい、毎日の仕事に慣れてきた",
      role: "機械の見張り役も任される",
      work: { text: "同じ機械を毎日使い、いつもの音を覚えてくる", talk: { who: "boss", to: "me", text: "最近、3号機の調子はどう？" } },
      wall: { text: "3号機の音が少しだけ高い。でもまだ動いているので、言うか迷う", think: "（気のせいかな…でも、いつもとちがう）" },
      learn: { who: "boss", how: "教わる", text: "石原班長に伝えると、保全の人と一緒に点検。部品のすり減りが見つかり、「止まる前に気づくのが保全だ」と教わる", line: "止まる前に気づけたね。それが保全の仕事なんだよ" },
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
      mean: "入社1か月。先輩の見本を見ながら、資料の数字を作りはじめた段階",
      role: "見習い（見本を見て作る）",
      work: { text: "イベントの見積もりの表を、先輩の見本どおりに作る", talk: { who: "boss", to: "me", text: "明日の打ち合わせで使うから、今日中にお願いできる？" } },
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
      mean: "半年たち、同時に3つのイベントの資料を1人で受け持つようになった",
      role: "資料を1人で受け持つ",
      work: { text: "3つのイベントの資料を、同じ週に仕上げる", talk: { who: "peer", to: "me", text: "今週、資料多くない？ 手伝えることある？" } },
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
      mean: "1年たち、資料だけでなく、企画の中身（案）も出す側になった",
      role: "企画の案も出す",
      work: { text: "お店の販促の企画書を書く", talk: { who: "boss", to: "me", text: "来週までに、3案くらい考えてみてくれる？" } },
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
      mean: "入社した週。所長について現場を回り、見て覚える段階",
      role: "見習い（所長について回る）",
      work: { text: "所長について、工事の現場を見て回る", talk: { who: "boss", to: "me", text: "最初は一緒に、現場を見て回ろうか" } },
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
      mean: "1か月たち、職人さんの予定（工程表）の確認を任されるようになった",
      role: "工程表の確認を担当",
      work: { text: "職人さんの入る日を、工程表で確かめる", talk: { who: "boss", to: "me", text: "明日の段取り、もう一度いっしょに確かめておこう" } },
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
      mean: "1年たち、職人さんへの作業のお願いも、自分で伝えるようになった",
      role: "職人さんへの段取りを担当",
      work: { text: "職人さんに、作業の順番をお願いする", talk: { who: "senpai", to: "me", text: "今日は2階から始めてほしいって、職人さんに伝えてきてくれる？" } },
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
      mean: "入社した週。注文の品を棚から集める、いちばん最初の仕事を覚えている",
      role: "見習い（ピッキング）",
      work: { text: "注文の紙を見て、商品を棚から集める（ピッキング）", talk: { who: "boss", to: "me", text: "慣れてきたら、1時間で40件くらいが目安だよ" } },
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
      mean: "1か月たち、出荷だけでなく、戻ってきた品（返品）を棚に戻す係も任された",
      role: "返品の係を1人で担当",
      work: { text: "お客さんから戻ってきた商品を、棚に戻す", talk: { who: "peer", to: "me", text: "返品、今日もすごい量だね" } },
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
      mean: "3か月たち、一番忙しい月末にも、戦力として数えられるようになった",
      role: "月末の出荷の戦力に",
      work: { text: "月末で、出荷が重なる。倉庫中が走り回る", talk: { who: "boss", to: "me", text: "今日中に全部出したいんだ。手を貸してくれる？" } },
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
      mean: "1年たち、2回目の年末。体の使い方と、道具に任せる判断が必要になった",
      role: "フォークリフトで荷物を動かす",
      work: { text: "年末の繁忙期。重い箱を1日に何百個も運ぶ", talk: { who: "peer", to: "me", text: "腰、大丈夫？ 持ち方をこうすると楽だよ" } },
      wall: { text: "腰を痛めて2日休む。このままでは続けられないと思う", think: "（体が、ついていかない…）", tint: "sweat" },
      learn: { who: "boss", how: "教わる", text: "秋山センター長にすすめられ、会社の費用でフォークリフトの免許をとる。重い物は道具で運ぶと決める", line: "体を守るのも、仕事のうちだよ。免許、取ってみないか" },
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
      mean: "入社した週。開店前の仕込み（下ごしらえ）から覚えている段階",
      role: "見習い（仕込み）",
      work: { text: "開店前に、玉ねぎを毎日20個きざむ", talk: { who: "boss", to: "me", text: "包丁の音を聞けば、慣れてきたか分かるんだよ" } },
      wall: { text: "1時間たっても終わらず、大きさもバラバラ。開店に間に合わない", think: "（手が痛い…まだ半分）" },
      learn: { who: "senpai", how: "教わる", text: "無口な中西さんが、横で黙って切ってみせる。指の置き方と、包丁を前に滑らせる動きをまねする", line: "力はいらないよ。前に滑らせてごらん" },
      up: { know: "prep", from: 0, to: 1 },
      after: { when: "1か月後", text: "20個を30分で、同じ大きさに切れるようになる" },
    }),
    E({
      id: "k2",
      when: "1か月後",
      place: "food",
      act: "cook",
      title: "ピークの途中で、材料が切れる",
      mean: "1か月たち、昼の一番忙しい時間（ピーク）にも、調理場に立つようになった",
      role: "ピークの調理も担当",
      work: { text: "昼のピークに、注文の料理を出す", talk: { who: "peer", to: "me", text: "3番テーブルの料理、あとどれくらいかかりそう？" } },
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
      mean: "1年たち、料理だけでなく、仕入れの伝票（お金のこと）にもふれるようになった",
      role: "仕入れの手伝いも担当",
      work: { text: "仕入れの伝票を整理する手伝いを始める", talk: { who: "boss", to: "me", text: "玉ねぎ、また値上がりしたんだよね" } },
      wall: { text: "材料が値上がりし、同じ値段で出すと店にお金が残らないと知る", think: "（1皿で、いくら残ってるんだろう）" },
      learn: { who: "me", how: "工夫", text: "1皿ごとに材料の値段を書き出す表を、自分で作ってみる。三浦店長が「これが原価だ」と見てくれる", line: "1皿いくらで作れるか、書き出してみよう" },
      up: { know: "cost", from: 0, to: 1 },
      after: { when: "2年目", text: "発注を任される（求人原稿：2年目からは発注も担当）" },
    }),
  ],
};

/** 1年後から3年後の分かれ道までの2年間に起きたこと（時間が進む演出で、ひとことで見せる） */
export const BRIDGE: Record<string, string> = {
  tsumugi: "2年目は、夜勤の引き継ぎメモが班の決まりになり、新人に機械の動かし方を見せる場面がふえた",
  soyokaze: "2年目は、ひな形とAIの道具で資料が早くなり、小さな企画の打ち合わせに1人で出るようになった",
  tamayura: "2年目は、雨の週でも工程がずれにくくなり、職人さんから名前で呼ばれるようになった",
  shiosai: "2年目は、フォークリフトで荷物の流れを任され、月末の棚卸しでは新人に数え方を教えた",
  komugi: "2年目から、求人原稿のとおり発注も担当。仕込みの量と、仕入れの値段を毎日見るようになった",
};

/** 3年後（分かれ道）の役割 */
export const ROLE_AT_FORK: Record<string, string> = {
  tsumugi: "新人2人の教え係",
  soyokaze: "小さな企画を丸ごと担当",
  tamayura: "小さな現場を1つ任される",
  shiosai: "シフトづくりを任される（リーダー候補）",
  komugi: "2号店の副店長の話が来る",
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
