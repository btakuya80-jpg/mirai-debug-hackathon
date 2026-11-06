"use client";

/* H・I・J案（作り直し）で共通に使う、生涯の筋書きデータと画面の流れ。
   いまはAIにつながず、ここに書いた見本の筋書きで動く。会社・人物はすべて架空。 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { isDemoMode } from "./mirai";
import { companyByUrl, readVibes, type Vibe } from "./reviews";
import { setKnowYears, type Years } from "./know";
import { FORK_Y1, FORK_Y5 } from "./years";

export const ABILITIES = ["段取り", "対人", "専門スキル", "AI活用", "企画", "指導", "体力・継続", "自分で決める力"] as const;
export const GRADES = ["G", "F", "E", "D", "C", "B", "A", "S"] as const;
export type Level = "高" | "中" | "低";
export type Mood = "元気" | "普通" | "しんどい";
export const gi = (g: string) => GRADES.indexOf(g as (typeof GRADES)[number]);

export type Place = "office" | "factory" | "construction" | "logistics" | "food" | "home" | "school" | "overseas";
export const PLACE_LABEL: Record<Place, string> = {
  office: "オフィス",
  factory: "工場",
  construction: "建設現場",
  logistics: "物流倉庫",
  food: "飲食店",
  home: "家",
  school: "学校",
  overseas: "海外の拠点",
};
/** 分身の動き */
export type Act = "pc" | "machine" | "build" | "carry" | "cook" | "teach" | "talk" | "cheer" | "down" | "rest";
export type CutKind = "ほめられた" | "ピンチ" | "立ち上がる" | "人生のできごと";
export type Who = "me" | "boss" | "senpai" | "peer" | "local" | "family" | "student";
export type Talk = { who: Who; text: string; /** 話しかけている相手 */ to?: Who };
export type Life = { money: Level; health: Level; learning: Level; ties: Level };
export const LIFE_LABEL: Record<keyof Life, string> = { money: "お金のゆとり", health: "体力", learning: "学び", ties: "人とのつながり" };

export type Chapter = {
  /** 入社から何年後か（end は 75歳ちょうど） */
  at: number | "end";
  label?: string;
  place: Place;
  act: Act;
  events: string[];
  talks: Talk[];
  cutin?: { kind: CutKind; who: Who; line: string };
  lifeEvent?: string;
  /** くじけた場面 */
  down?: boolean;
  abilities: string[];
  skills: string[];
  life: Life;
  mood: Mood;
  fork?: boolean;
  /** 口コミ・会社情報から読み取った職場の空気（チームの案） */
  vibes?: Vibe[];
};

export type BranchId = "stay" | "same" | "other" | "indep" | "relearn" | "abroad";
export const BRANCHES: { id: BranchId; label: string; short: string }[] = [
  { id: "stay", label: "残る", short: "残る" },
  { id: "same", label: "同じ業界で移る", short: "同業へ" },
  { id: "other", label: "違う業界へ", short: "異業種へ" },
  { id: "indep", label: "独立する", short: "独立" },
  { id: "relearn", label: "学び直す", short: "学び直し" },
  { id: "abroad", label: "海外へ", short: "海外へ" },
];

export type Person = { role: string; name: string; trait: string };
export type Job = {
  id: string;
  place: Place;
  industry: string;
  company: string;
  title: string;
  area: string;
  pay: string;
  hours: string;
  tags: string[];
  body: string[];
  url: string;
  people: { boss: Person; senpai: Person; peer: Person };
  skills: string[];
  trunk: Chapter[];
  /** 作り込んだ筋書き（デモ用） */
  detailed?: Partial<Record<BranchId, { title: string; chapters: Chapter[] }>>;
  otherIndustry: string;
};

const L = (money: Level, health: Level, learning: Level, ties: Level): Life => ({ money, health, learning, ties });
const A = (s: string) => s.split("");

/* 作り込みが簡易な求人で使う、能力の伸び方の見本 */
const SIMPLE_AB = [A("FEGGFGDE"), A("FEFGFGEE"), A("DDEFFGDE"), A("CCDEEECD")];
const SIMPLE_SK = [A("GGGF"), A("FGGF"), A("EDFE"), A("DCED")];
const SIMPLE_LIFE = [L("低", "高", "中", "低"), L("低", "中", "中", "低"), L("中", "中", "中", "中"), L("中", "中", "中", "中")];

function simpleTrunk(rows: { place?: Place; act: Act; events: string[]; talks: Talk[]; cutin?: Chapter["cutin"]; down?: boolean; mood: Mood }[], place: Place): Chapter[] {
  const at = [0, 0.1, 1, 3];
  const label = ["入社", "1か月後", "1年後", "3年後"];
  return rows.map((r, i) => ({
    at: at[i],
    label: label[i],
    place: r.place ?? place,
    act: r.act,
    events: r.events,
    talks: r.talks,
    cutin: r.cutin,
    down: r.down,
    mood: r.mood,
    abilities: SIMPLE_AB[i],
    skills: SIMPLE_SK[i],
    life: SIMPLE_LIFE[i],
    fork: i === 3,
  }));
}

export const JOBS: Job[] = [
  {
    id: "tsumugi",
    place: "factory",
    industry: "製造",
    company: "仮想 つむぎ精工",
    title: "製造オペレーター（未経験から）",
    area: "群馬県・工業団地",
    pay: "月給 22万円〜",
    hours: "2交替（日勤・夜勤）",
    tags: ["未経験OK", "資格の支援", "寮・社宅あり"],
    body: ["自動車部品の加工ラインで、機械の操作と検査をします。", "班は6人。最初の3か月は先輩がつきます。", "機械保全や品質管理の資格をとる人を、会社が支えます。"],
    url: "https://kyujin.example/job/tsumugi-001",
    people: {
      boss: { role: "班長", name: "石原", trait: "口数は少ないが、筋は通す" },
      senpai: { role: "先輩", name: "久保", trait: "面倒見がよい。夜勤が多い" },
      peer: { role: "同期", name: "森下", trait: "器用で何でも早い" },
    },
    skills: ["機械の操作", "品質の検査", "改善の提案", "安全の管理"],
    otherIndustry: "物流",
    trunk: [
      {
        at: 0,
        label: "入社",
        place: "factory",
        act: "machine",
        events: ["ラインの見学と安全講習。機械の音の大きさに驚く"],
        talks: [
          { who: "boss", text: "まずは、止め方から覚えておこうか" },
          { who: "me", text: "（思ったより暑い…）" },
        ],
        abilities: A("FEGGFGDE"),
        skills: A("GGGF"),
        life: L("低", "高", "中", "低"),
        mood: "普通",
      },
      {
        at: 0.1,
        label: "1か月後",
        place: "factory",
        act: "down",
        events: ["夜勤が始まり、生活のリズムが崩れる", "部品の向きを間違え、ラインを10分止めてしまう"],
        talks: [
          { who: "peer", text: "気にしないで。私も最初は同じことをしたよ" },
          { who: "me", text: "（向いてないのかも）" },
        ],
        cutin: { kind: "ピンチ", who: "boss", line: "止めたのは悪くないよ。黙っているのが一番困るんだ" },
        down: true,
        abilities: A("FEFGFGEE"),
        skills: A("FGGF"),
        life: L("低", "中", "中", "低"),
        mood: "しんどい",
      },
      {
        at: 1,
        label: "1年後",
        place: "factory",
        act: "machine",
        events: ["先輩の久保さんと、朝5分の引き継ぎメモを始める", "検査の見落としが、班で一番少なくなる"],
        talks: [
          { who: "senpai", text: "そのメモ、班のみんなでも使わせてもらえる？" },
          { who: "me", text: "書いておけば、夜勤でも迷わない" },
        ],
        cutin: { kind: "立ち上がる", who: "me", line: "メモにすれば、夜勤でも迷わない" },
        abilities: A("DDEFFGDE"),
        skills: A("EDFE"),
        life: L("中", "中", "中", "中"),
        mood: "元気",
      },
      {
        at: 3,
        label: "3年後",
        place: "factory",
        act: "teach",
        events: ["新人2人の教え係になる", "海外工場の立ち上げメンバー募集の話が来る", "機械保全の資格の勉強を始めるか、迷う"],
        talks: [
          { who: "boss", text: "次の班長を任せたいと思っている。考えてみてくれる？" },
          { who: "me", text: "ここは2回確かめよう" },
        ],
        cutin: { kind: "ほめられた", who: "boss", line: "次の班長を任せたいと思っている。考えてみてくれる？" },
        abilities: A("CCDEEECD"),
        skills: A("DCED"),
        life: L("中", "中", "中", "中"),
        mood: "普通",
        fork: true,
      },
    ],
    detailed: {
      stay: {
        title: "残って、工場の柱になる（国内で活躍）",
        chapters: [
          {
            at: 5,
            place: "factory",
            act: "teach",
            events: ["班長になる。夜勤の組み方を自分で変える"],
            lifeEvent: "結婚する（地元の同級生と）",
            talks: [
              { who: "peer", text: "班長が組んでくれるシフト、休みが取りやすくなったよ" },
              { who: "me", text: "きつい時は、無理になる前に教えてね" },
            ],
            cutin: { kind: "人生のできごと", who: "family", line: "これからは2人で決めていこう" },
            abilities: A("BCDEDDCC"),
            skills: A("CCDC"),
            life: L("中", "中", "中", "高"),
            mood: "元気",
          },
          {
            at: 10,
            place: "home",
            act: "rest",
            events: ["子どもが生まれ、日勤だけの働き方に変えてもらう", "機械保全の資格を取る"],
            lifeEvent: "家族が増える",
            talks: [
              { who: "family", text: "日勤になって、夕ごはんが一緒だね" },
              { who: "me", text: "資格の勉強、やっと終わった" },
            ],
            abilities: A("BBCDDCCC"),
            skills: A("BCCC"),
            life: L("中", "中", "高", "高"),
            mood: "元気",
          },
          {
            at: 18,
            place: "factory",
            act: "down",
            events: ["設備の入れ替えで自動化が進み、自分の担当工程がなくなる"],
            talks: [
              { who: "peer", text: "私たちの作業、新しい機械がやるようになったね" },
              { who: "me", text: "（この工場で、自分にできることは何だろう）" },
            ],
            cutin: { kind: "ピンチ", who: "me", line: "この工場で、自分にできることは何だろう" },
            down: true,
            abilities: A("BBCDCCDC"),
            skills: A("BCCC"),
            life: L("中", "中", "中", "中"),
            mood: "しんどい",
          },
          {
            at: 20,
            place: "factory",
            act: "machine",
            events: ["自動化した機械の見張り役と、若手への教え方を任される", "資格で身につけた保全の知識が生きる"],
            talks: [
              { who: "boss", text: "機械の調子に一番早く気づけるのは、あなただよ" },
              { who: "me", text: "止まる前に気づけば、ラインは守れる" },
            ],
            cutin: { kind: "立ち上がる", who: "boss", line: "機械の調子に一番早く気づけるのは、あなただよ" },
            abilities: A("ABBCCBCB"),
            skills: A("ABBB"),
            life: L("高", "中", "中", "高"),
            mood: "元気",
          },
          {
            at: 33,
            place: "factory",
            act: "talk",
            events: ["工場長になる", "地域の工業高校と、実習の受け入れを始める"],
            lifeEvent: "工場の近くに家を建てる",
            talks: [
              { who: "student", text: "機械の音で、調子まで分かるんですね" },
              { who: "me", text: "毎日聞いていると、いつもとのちがいが分かるようになるよ" },
            ],
            cutin: { kind: "ほめられた", who: "student", line: "この工場で働きたいです" },
            abilities: A("SAACBACA"),
            skills: A("AABA"),
            life: L("高", "中", "中", "高"),
            mood: "元気",
          },
          {
            at: "end",
            place: "school",
            act: "teach",
            events: ["定年後、工業高校で週2日、機械の安全を教える", "教え子の1人が、同じ工場に入る"],
            lifeEvent: "週末は孫と川で釣り",
            talks: [
              { who: "student", text: "先生の手順書、まだ使われてます" },
              { who: "me", text: "手順書にしておくと、何年たっても役に立つね" },
            ],
            abilities: A("SAACBSDA"),
            skills: A("AASA"),
            life: L("中", "中", "中", "高"),
            mood: "元気",
          },
        ],
      },
      abroad: {
        title: "海外工場の立ち上げへ（海外で活躍）",
        chapters: [
          {
            at: 4,
            place: "overseas",
            act: "down",
            events: ["東南アジアの新工場へ。言葉が通じず、手順が伝わらない", "暑さと食事で体調をくずす"],
            talks: [
              { who: "local", text: "……？（首をかしげる）" },
              { who: "me", text: "（日本と同じやり方が通じない）" },
            ],
            cutin: { kind: "ピンチ", who: "me", line: "言葉が、まったく通じない" },
            down: true,
            abilities: A("CDDEEEDC"),
            skills: A("DCED"),
            life: L("中", "低", "高", "低"),
            mood: "しんどい",
          },
          {
            at: 6,
            place: "overseas",
            act: "teach",
            events: ["写真つきの手順書を現地の言葉で作る", "立ち上げが予定どおりに進む"],
            talks: [
              { who: "local", text: "この手順書、ほかのラインにも使いたい" },
              { who: "me", text: "言葉より、見せた方が早かった" },
            ],
            cutin: { kind: "立ち上がる", who: "me", line: "言葉より先に、手順を見せよう" },
            abilities: A("BCCDDDDB"),
            skills: A("CCCC"),
            life: L("中", "中", "高", "中"),
            mood: "元気",
          },
          {
            at: 9,
            place: "overseas",
            act: "talk",
            events: ["立ち上げ責任者の補佐になる"],
            lifeEvent: "現地で出会った人と結婚する",
            talks: [
              { who: "family", text: "こっちの家族にも紹介させて" },
              { who: "me", text: "帰る場所が2つになった" },
            ],
            cutin: { kind: "人生のできごと", who: "family", line: "2つの国で、家族になろう" },
            abilities: A("BBCDCCDB"),
            skills: A("CBCC"),
            life: L("高", "中", "高", "高"),
            mood: "元気",
          },
          {
            at: 16,
            place: "home",
            act: "rest",
            events: ["親の介護が始まり、帰国を考える", "家族で話し合い、日本と行き来する働き方に変える"],
            lifeEvent: "住まいを日本と海外の2か所に",
            talks: [
              { who: "family", text: "日本か海外か、どちらか1つに決めなくてもいいよ" },
              { who: "me", text: "半分ずつなら、仕事も家族も続けられそう" },
            ],
            abilities: A("ABCCCCDA"),
            skills: A("BBCB"),
            life: L("中", "中", "中", "高"),
            mood: "普通",
          },
          {
            at: 28,
            place: "overseas",
            act: "talk",
            events: ["工場の立ち上げを助ける専門家として、3つの国を担当する"],
            talks: [
              { who: "local", text: "次の国でも、あなたの手順書から始めます" },
              { who: "me", text: "最初の1か月が、いちばん大事" },
            ],
            cutin: { kind: "ほめられた", who: "local", line: "あなたの手順書から始めます" },
            abilities: A("SABCBBDS"),
            skills: A("ABAB"),
            life: L("高", "中", "高", "中"),
            mood: "元気",
          },
          {
            at: "end",
            place: "school",
            act: "teach",
            events: ["日本に戻り、海外で働きたい若手の相談役になる"],
            lifeEvent: "家族と2つの国を行き来する暮らし",
            talks: [
              { who: "student", text: "言葉に自信がなくても行けますか" },
              { who: "me", text: "手順を見せられれば、だいじょうぶ" },
            ],
            abilities: A("SABCBAES"),
            skills: A("ABAA"),
            life: L("中", "中", "高", "高"),
            mood: "元気",
          },
        ],
      },
    },
  },
  {
    id: "soyokaze",
    place: "office",
    industry: "事務・企画",
    company: "仮想 そよかぜ企画",
    title: "企画・事務スタッフ",
    area: "大阪府・本町",
    pay: "月給 23万円〜",
    hours: "9:30〜18:30（土日休み）",
    tags: ["土日休み", "転勤なし", "未経験OK"],
    body: ["地域のイベントや店の販促を企画する会社です。", "資料づくり・数字のまとめ・取引先との連絡が中心です。", "AIの道具を、毎月みんなで試しています。"],
    url: "https://kyujin.example/job/soyokaze-014",
    people: {
      boss: { role: "課長", name: "藤枝", trait: "決めるのが早い。説明は短め" },
      senpai: { role: "先輩", name: "宮内", trait: "数字に強い。忙しいと口数が減る" },
      peer: { role: "同期", name: "千田", trait: "話し上手。営業向き" },
    },
    skills: ["資料づくり", "表計算", "社外との調整", "AIの道具"],
    otherIndustry: "飲食",
    trunk: simpleTrunk(
      [
        { act: "pc", events: ["取引先リストの整理から始まる"], talks: [{ who: "boss", text: "まずは、これまでの企画書を10本読んでみて" }], mood: "普通" },
        { act: "down", events: ["数字のまちがいで、資料を作り直しになる"], talks: [{ who: "senpai", text: "合計は、2回たしかめよう" }], cutin: { kind: "ピンチ", who: "boss", line: "これ、明日の朝までに直せる？" }, down: true, mood: "しんどい" },
        { act: "pc", events: ["AIの道具で、資料の下書きを半分の時間に"], talks: [{ who: "peer", text: "その作り方、教えて！" }], cutin: { kind: "立ち上がる", who: "me", line: "下書きは道具に任せて、考える時間を増やそう" }, mood: "元気" },
        { act: "talk", events: ["小さなイベントの企画を丸ごと任される", "同業の大手から声がかかる"], talks: [{ who: "boss", text: "この企画、あなたに任せる" }], cutin: { kind: "ほめられた", who: "boss", line: "この企画、あなたに任せる" }, mood: "普通" },
      ],
      "office",
    ),
  },
  {
    id: "tamayura",
    place: "construction",
    industry: "建設",
    company: "仮想 たまゆら建設",
    title: "施工管理の見習い",
    area: "福岡県・博多",
    pay: "月給 25万円〜",
    hours: "8:00〜17:00（現場による）",
    tags: ["資格の支援", "未経験OK"],
    body: ["マンションや学校の工事現場で、工程と安全を管理します。", "最初は所長について、図面の読み方から覚えます。", "建築施工管理技士の資格取得を支援します。"],
    url: "https://kyujin.example/job/tamayura-203",
    people: {
      boss: { role: "所長", name: "大垣", trait: "声が大きい。段取りに厳しい" },
      senpai: { role: "先輩", name: "新井", trait: "職人さんと仲がよい" },
      peer: { role: "同期", name: "竹中", trait: "図面に強い" },
    },
    skills: ["図面を読む", "工程の管理", "安全の管理", "職人との調整"],
    otherIndustry: "製造",
    trunk: simpleTrunk(
      [
        { act: "build", events: ["朝礼と安全確認。ヘルメットの重さに慣れない"], talks: [{ who: "boss", text: "まずは一緒に、現場を見て回ろう" }], mood: "普通" },
        { act: "down", events: ["雨で工程がずれ、職人さんに頭を下げる"], talks: [{ who: "senpai", text: "謝り方より、次の段取りだよ" }], cutin: { kind: "ピンチ", who: "boss", line: "雨の日の分も、先に予定に入れておこう" }, down: true, mood: "しんどい" },
        { act: "build", events: ["職人さんの名前と得意を覚え、話が通るようになる"], talks: [{ who: "senpai", text: "親方が、あなたのことを名前で呼んでいたよ" }], cutin: { kind: "立ち上がる", who: "me", line: "人の名前を覚えれば、段取りが回る" }, mood: "元気" },
        { act: "teach", events: ["小さな現場を1つ任される", "資格の試験を受けるか迷う"], talks: [{ who: "boss", text: "次の現場は、あなたに任せたい" }], cutin: { kind: "ほめられた", who: "boss", line: "次の現場は、あなたに任せたい" }, mood: "普通" },
      ],
      "construction",
    ),
  },
  {
    id: "shiosai",
    place: "logistics",
    industry: "物流",
    company: "仮想 しおさい物流",
    title: "倉庫スタッフ（リーダー候補）",
    area: "千葉県・湾岸エリア",
    pay: "時給 1,350円〜（正社員登用あり）",
    hours: "シフト制（週4日〜）",
    tags: ["週4日〜", "未経験OK", "正社員登用"],
    body: ["通販の商品を保管し、注文に合わせて出荷します。", "フォークリフトの免許取得を支援します。", "繁忙期は年末と春です。"],
    url: "https://kyujin.example/job/shiosai-077",
    people: {
      boss: { role: "センター長", name: "秋山", trait: "数字で話す。手順を大事にする" },
      senpai: { role: "先輩", name: "堀", trait: "教え方がていねい" },
      peer: { role: "同期", name: "坂口", trait: "体力自慢" },
    },
    skills: ["在庫の管理", "フォークリフト", "シフトづくり", "段取りの改善"],
    otherIndustry: "事務・企画",
    trunk: simpleTrunk(
      [
        { act: "carry", events: ["棚の場所を覚えるところから"], talks: [{ who: "senpai", text: "番号の付け方には決まりがあるよ" }], mood: "普通" },
        { act: "down", events: ["年末の出荷が重なり、腰を痛める"], talks: [{ who: "peer", text: "持ち方、こうすると楽だよ" }], cutin: { kind: "ピンチ", who: "me", line: "体がついていかない…" }, down: true, mood: "しんどい" },
        { act: "carry", events: ["フォークリフトの免許をとり、重い作業が減る"], talks: [{ who: "boss", text: "免許、1回で取れたんだってね" }], cutin: { kind: "立ち上がる", who: "me", line: "道具を使えば、体は守れる" }, mood: "元気" },
        { act: "teach", events: ["シフトづくりを任される", "本社の企画部門から声がかかる"], talks: [{ who: "boss", text: "来月のシフト、組んでみない？" }], cutin: { kind: "ほめられた", who: "boss", line: "来月のシフト、組んでみない？" }, mood: "普通" },
      ],
      "logistics",
    ),
  },
  {
    id: "komugi",
    place: "food",
    industry: "飲食",
    company: "仮想 こむぎ食堂",
    title: "キッチンスタッフ（店長候補）",
    area: "北海道・札幌",
    pay: "月給 21万円〜（まかない付き）",
    hours: "シフト制（11:00〜22:00の間）",
    tags: ["まかない付き", "未経験OK", "独立の支援"],
    body: ["地元の野菜を使う定食屋です。3店舗あります。", "仕込みから始めて、2年目からは発注も担当します。", "のれん分けで独立した先輩が2人います。"],
    url: "https://kyujin.example/job/komugi-005",
    people: {
      boss: { role: "店長", name: "三浦", trait: "味にきびしい。人には優しい" },
      senpai: { role: "先輩", name: "中西", trait: "手が早い。無口" },
      peer: { role: "同期", name: "佐野", trait: "接客が好き" },
    },
    skills: ["仕込み", "調理", "原価の管理", "接客"],
    otherIndustry: "事務・企画",
    trunk: simpleTrunk(
      [
        { act: "cook", events: ["玉ねぎを毎日20個きざむ"], talks: [{ who: "boss", text: "包丁の音を聞けば、慣れてきたか分かるよ" }], mood: "普通" },
        { act: "down", events: ["昼のピークで注文をまちがえ、お客さんを待たせる"], talks: [{ who: "senpai", text: "伝票は、声に出して読むと間違えにくいよ" }], cutin: { kind: "ピンチ", who: "me", line: "手が、追いつかない" }, down: true, mood: "しんどい" },
        { act: "cook", events: ["日替わりの1品を任され、常連さんにほめられる"], talks: [{ who: "peer", text: "あの煮物、また頼まれたよ" }], cutin: { kind: "立ち上がる", who: "me", line: "自分の味を、覚えてもらえた" }, mood: "元気" },
        { act: "teach", events: ["2号店の副店長の話が来る", "原価の計算を任される"], talks: [{ who: "boss", text: "2号店の副店長、やってみない？" }], cutin: { kind: "ほめられた", who: "boss", line: "2号店の副店長、やってみない？" }, mood: "普通" },
      ],
      "food",
    ),
  },
];

export const getJob = (id: string) => JOBS.find((j) => j.id === id) ?? JOBS[0];
export const jobByUrl = (url: string) => JOBS.find((j) => url.trim() !== "" && (j.url === url.trim() || url.includes(j.id)));

/** 簡易表示の分かれ道（作り込んでいない筋） */
export function simpleBranch(job: Job, b: BranchId, age: number): { lines: string[]; life: Life; place: Place } {
  const ind = job.industry;
  const s = job.skills;
  switch (b) {
    case "stay":
      return { lines: [`${age + 5}歳：${job.company.replace("仮想 ", "")}のまとめ役になる`, `${age + 20}歳：${ind}の現場の柱として、若手を育てる`, `75歳：地域で${ind}の仕事を教える`], life: L("中", "中", "中", "高"), place: job.place };
    case "same":
      return { lines: [`${age + 4}歳：同じ${ind}の、規模の大きな会社へ移る`, `${age + 15}歳：「${s[0]}」の経験を買われて、部署のまとめ役`, `75歳：業界の中で顔の広い相談役`], life: L("高", "中", "中", "中"), place: job.place };
    case "other":
      return { lines: [`${age + 4}歳：${job.otherIndustry}の仕事へ移る`, `${age + 12}歳：${ind}で身につけた「${s[1]}」が、新しい職場で生きる`, `75歳：2つの業界をつなぐ役`], life: L("中", "中", "高", "中"), place: job.otherIndustry === "物流" ? "logistics" : job.otherIndustry === "製造" ? "factory" : job.otherIndustry === "飲食" ? "food" : "office" };
    case "indep":
      return { lines: [`${age + 10}歳：小さく独立し、${ind}の仕事を請け負う`, `${age + 20}歳：仲間を3人やとう`, `75歳：店や事務所を若手に引き継ぐ`], life: L("中", "低", "高", "中"), place: job.place };
    case "relearn":
      return { lines: [`${age + 6}歳：働きながら、夜の学校で学び直す`, `${age + 10}歳：資格を生かして専門職へ`, `75歳：学び続ける人の手本になる`], life: L("中", "中", "高", "中"), place: "school" };
    case "abroad":
      return { lines: [`${age + 5}歳：海外の拠点へ。最初の半年は言葉に苦しむ`, `${age + 15}歳：現地の仲間と、新しい拠点を立ち上げる`, `75歳：国内と海外の両方に仲間がいる`], life: L("高", "中", "高", "中"), place: "overseas" };
  }
}

/* ---------- 分身づくりの選択肢（一般的な求人サイトの条件の分け方にそろえる） ---------- */
export const PROFILE_Q = [
  { id: "kind", text: "職種", multi: false, options: ["事務・企画", "製造", "建設", "物流", "飲食"] },
  { id: "terms", text: "働き方の条件", multi: false, options: ["正社員", "契約社員", "パート・アルバイト", "副業OK"] },
  { id: "prefs", text: "こだわり条件（3つまで）", multi: true, options: ["土日休み", "転勤なし", "資格の支援", "寮・社宅あり", "残業少なめ", "未経験OK"] },
  { id: "style", text: "働き方のスタイル", multi: false, options: ["コツコツ続けたい", "チームで動きたい", "任されたい", "手に職をつけたい"] },
] as const;
export type Profile = { age: number; kind: string; terms: string; prefs: string[]; style: string };
export const DEFAULT_PROFILE: Profile = { age: 22, kind: "製造", terms: "正社員", prefs: ["資格の支援", "寮・社宅あり"], style: "手に職をつけたい" };

export const END_AGE = 75;
export function ageAt(c: Chapter, start: number) {
  return c.at === "end" ? END_AGE : Math.floor(start + c.at);
}
export function chapterLabel(c: Chapter, start: number) {
  if (c.label) return c.label;
  return `${ageAt(c, start)}歳`;
}

/** 前の場面から変わった能力・スキル */
export function changesOf(prev: Chapter | undefined, cur: Chapter, job: Job) {
  if (!prev) return [];
  const out: { name: string; from: string; to: string; up: boolean }[] = [];
  ABILITIES.forEach((n, k) => {
    const d = gi(cur.abilities[k]) - gi(prev.abilities[k]);
    if (d) out.push({ name: n, from: prev.abilities[k], to: cur.abilities[k], up: d > 0 });
  });
  job.skills.forEach((n, k) => {
    const d = gi(cur.skills[k]) - gi(prev.skills[k]);
    if (d) out.push({ name: n, from: prev.skills[k], to: cur.skills[k], up: d > 0 });
  });
  return out;
}

export function nameOf(job: Job, who: Who) {
  switch (who) {
    case "me":
      return "あなた";
    case "boss":
    case "senpai":
    case "peer":
      return job.people[who].name;
    case "local":
      return "現地の仲間";
    case "family":
      return "家族";
    case "student":
      return "教え子";
  }
}

/** 場面が画面の上に隠れていたら、場面まで戻す（スマホで「次へ」を押した時など） */
function showScene() {
  const el = document.querySelector('[data-h="scene"]');
  if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- 画面の流れ ---------- */
export const LSTEPS = ["jobs", "make", "life", "saves"] as const;
/** G・H案（Higgsfield版）は、求人のあとに「会社のまとめ」をはさむ */
export const PSTEPS = ["jobs", "karte", "make", "life", "saves", "take"] as const;
export type LStep = (typeof PSTEPS)[number];
export const LSTEP_LABEL: Record<LStep, string> = { jobs: "求人を選ぶ", karte: "会社のまとめ", make: "自分を設定", life: "生涯を進める", saves: "人生を並べる", take: "持ち帰る" };

export type Save = { branch: BranchId; reached: number };

/**
 * 3案共通の状態。分かれ道で選んだ筋は「セーブ」に残り、あとで並べて比べられる。
 * 分かれ道まで戻って別の筋を選び直せる（＝デバッグ）。
 */
export function useLife() {
  const [step, setStep] = useState<LStep>("jobs");
  const [jobId, setJobId] = useState(JOBS[0].id);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [branch, setBranch] = useState<BranchId | null>(null);
  const [idx, setIdx] = useState(0);
  const [saves, setSaves] = useState<BranchId[]>([]);
  /** 会社情報のURL（任意）と、本人が読んで貼った口コミの文章（任意） */
  const [companyUrl, setCompanyUrl] = useState("");
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace("#", "").replace(/^demo-/, "") as LStep;
      if ((PSTEPS as readonly string[]).includes(h)) setStep(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const go = useCallback((s: LStep) => {
    setStep(s);
    const next = `#${isDemoMode() ? "demo-" : ""}${s}`;
    if (window.location.hash !== next) {
      try {
        history.pushState(null, "", next);
      } catch {
        window.location.hash = next;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const job = getJob(jobId);
  const company = companyByUrl(companyUrl);
  const companyInfo = company?.[1];
  const vibes = useMemo(() => {
    const fromReview = readVibes(reviewText, "口コミ");
    const fromCompany = companyInfo ? readVibes(companyInfo.points.join("。"), "会社情報") : [];
    return [...fromReview, ...fromCompany.filter((v) => !fromReview.some((r) => r.id === v.id))];
  }, [reviewText, companyInfo]);
  const trunk = useMemo(
    () =>
      job.trunk.map((c, i) => {
        const vs = vibes.filter((v) => v.at === i);
        if (!vs.length) return c;
        return {
          ...c,
          vibes: vs,
          talks: [...c.talks, ...vs.map((v) => v.talk)],
          events: [...c.events, ...vs.map((v) => `${v.from}より：${v.event}`)],
          mood: vs.find((v) => v.mood)?.mood ?? c.mood,
        };
      }),
    [job, vibes],
  );
  /* 分かれ道の時点（1年／3年／5年）。3年が初期。作り込んだ道（detailed）は3年の時だけ使う */
  const [years, setYearsRaw] = useState<Years>(3);
  setKnowYears(years);
  const yTrunk = useMemo<Chapter[]>(() => {
    if (years === 3) return trunk;
    if (years === 1) {
      const y1 = FORK_Y1[job.id];
      const last = trunk[2];
      return [...trunk.slice(0, 2), { ...last, fork: true, events: y1 ? [y1.event, ...last.events.slice(1)] : last.events, talks: y1 ? [y1.talk, ...last.talks] : last.talks }];
    }
    const y5 = FORK_Y5[job.id];
    const f = trunk[3];
    return [...trunk.slice(0, 3), { ...f, fork: false }, { ...f, at: 5, label: "5年後", fork: true, vibes: undefined, cutin: undefined, down: false, mood: "元気", events: [y5?.event ?? "5年が過ぎ、身についた知識を人に教える立場になる"], talks: y5 ? [y5.talk] : f.talks }];
  }, [years, trunk, job.id]);
  const forkIdx = yTrunk.length - 1;
  const detail = branch && years === 3 ? job.detailed?.[branch] : undefined;
  const chapters: Chapter[] = detail ? [...yTrunk, ...detail.chapters] : yTrunk;
  const chapter = chapters[Math.min(idx, chapters.length - 1)];
  const prev = idx > 0 ? chapters[idx - 1] : undefined;
  const atFork = idx === forkIdx && !branch;
  const atEnd = !!branch && (detail ? idx >= chapters.length - 1 : idx >= forkIdx);

  const pickJob = (id: string) => {
    const j = getJob(id);
    setJobId(id);
    setProfile((p) => ({ ...p, kind: j.industry }));
    setBranch(null);
    setIdx(0);
    setSaves([]);
    if (id !== jobId) {
      setCompanyUrl("");
      setReviewText("");
    }
  };
  const toggle = (qid: string, opt: string) =>
    setProfile((p) => {
      if (qid === "prefs") {
        const cur = p.prefs;
        if (cur.includes(opt)) return { ...p, prefs: cur.filter((x) => x !== opt) };
        return { ...p, prefs: cur.length >= 3 ? [...cur.slice(1), opt] : [...cur, opt] };
      }
      return { ...p, [qid]: opt };
    });
  const choose = (b: BranchId) => {
    setBranch(b);
    setSaves((s) => (s.includes(b) ? s : [...s, b]));
    setIdx(forkIdx + (years === 3 && job.detailed?.[b] ? 1 : 0));
    showScene();
  };
  /** 分かれ道まで戻る（デバッグ） */
  const rewind = () => {
    setBranch(null);
    setIdx(forkIdx);
  };
  /** 過去の場面へ戻る。分かれ道より前に戻ると、選んだ筋はいったん外れる */
  const jump = (i: number) => {
    if (i <= forkIdx) setBranch(null);
    setIdx(i);
    showScene();
  };
  const next = () => {
    setIdx((i) => Math.min(i + 1, chapters.length - 1));
    showScene();
  };
  const restart = () => {
    setBranch(null);
    setIdx(0);
  };
  /** 分かれ道の時点を切り替える。選んだ道はいったん外し、新しい分かれ道に立つ */
  const setYears = (y: Years) => {
    setKnowYears(y);
    setYearsRaw(y);
    setBranch(null);
    setIdx(y === 1 ? 2 : y === 3 ? 3 : 4);
  };

  return { step, go, job, jobId, pickJob, companyUrl, setCompanyUrl, companyInfo, reviewText, setReviewText, vibes, profile, setProfile, toggle, branch, choose, rewind, jump, next, restart, idx, chapters, chapter, prev, forkIdx, atFork, atEnd, detail, saves, years, setYears };
}
export type LifeState = ReturnType<typeof useLife>;

/**
 * 1つの場面の演出の順番：場面 → カットイン → ランクアップ → 完了。
 * key（場面の番号など）が変わるたびに最初からやり直す。呼ぶ側で key を付けて作り直す。
 */
export function useFx(hasCut: boolean, hasRank: boolean, reduced: boolean, scene = 1600, cut = 2600, rank = 2200) {
  const [phase, setPhase] = useState<"scene" | "cut" | "rank" | "done">(reduced ? "done" : "scene");
  useEffect(() => {
    if (reduced) return;
    const ts: number[] = [];
    let t = scene;
    if (hasCut) {
      ts.push(window.setTimeout(() => setPhase("cut"), t));
      t += cut;
    }
    if (hasRank) {
      ts.push(window.setTimeout(() => setPhase("rank"), t));
      t += rank;
    }
    ts.push(window.setTimeout(() => setPhase("done"), t));
    return () => ts.forEach(clearTimeout);
  }, [hasCut, hasRank, reduced, scene, cut, rank]);
  return { phase, skip: () => setPhase("done") };
}
