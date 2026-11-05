import type { HelpItem } from "@/components/InfoWindow";
import type { Step } from "@/lib/mirai";

const SPEC = "企画書・仕様書（2026-10-14・設計案）";
const PROOF = "答え合わせの見本1〜3（2026-10-19）／企画書11章";

/** 3案共通のⓘ項目。画面側は data-h 属性で指す（3案とも同じ指し先） */
export const HELP: (HelpItem & { step: Step })[] = [
  { id: "cta", step: "job", sel: '[data-h="cta"]', name: "入社後を試運転するボタン", what: "求人ページから、その会社での将来の試走へ進む入口。", why: "求人原稿だけでは職場の実態が伝わらず、早く辞めるミスマッチが起きるため、応募の前に確かめられる入口を求人の横に置く。", src: SPEC + " 2章" },
  { id: "q", step: "input", sel: '[data-h="questions"]', name: "選ぶだけの質問10問", what: "本人の好み・得意・伸ばしたい力を選ぶ。文字は打たない。", why: "5分で終わる量にしないと、求職者が途中でやめる。", src: SPEC + " 5章" },
  { id: "area", step: "input", sel: '[data-h="area"]', name: "住むエリア", what: "結果の後で、通える範囲の求人を見せるために使う。", why: "試走の結果を、エリア内の求人表示や本人が同意したスカウトにつなげるため。", src: SPEC + " 4章4・6章" },
  { id: "co", step: "company", sel: '[data-h="companies"]', name: "会社を選ぶ（架空の2社）", what: "仮想 あおば社と仮想 みどり物流。どちらも架空。", why: "同じ本人が別の会社に入った違いを見せるのが、デモの完成基準。実在の会社・人名は使わない。", src: SPEC + " 4章6・8章" },
  { id: "run", step: "run", sel: '[data-h="runs"]', name: "5本の試走", what: "同じ条件でAIが5回試走し、時点ごとに進む。", why: "1回だけだと偶然の筋が混ざる。複数回走らせて、よく起きる筋とまれな筋を分ける。", src: PROOF },
  { id: "tl", step: "result", sel: '[data-h="timeline"]', name: "時点ごとの出来事と分身の動き", what: "1か月後〜10年後に起きる出来事2〜3個と、分身がどう動いたか。", why: "「なぜそうなったか」が分からない結果は信用されない。出来事と動きを並べて見せる。", src: SPEC + " 5章4" },
  { id: "ab", step: "result", sel: '[data-h="abilities"]', name: "能力表（8項目・S〜G）", what: "本人が選んだ目標に、どこまで近づいたか。各項目に理由の一文。", why: "人の格付けにしないため、目標への近さとして出す。理由のない数字は出さない。", src: SPEC + " 5章4・8章" },
  { id: "risk", step: "result", sel: '[data-h="risk"]', name: "辞めたくなる度合い（高・中・低）", what: "時点ごとの度合いと、その理由。％は出さない。", why: "予測ではなく筋書きとして見せるため。％は確率に見えてしまう。", src: SPEC + " 4章3" },
  { id: "br", step: "result", sel: '[data-h="branches"]', name: "分かれ道（筋書き2〜3本）", what: "残る／理由を持って移る、の筋書き。1本は必ず違う業界へ移る筋。", why: "AIは今の仕事の延長に寄せる癖がある。違う業界の筋を必ず1本出すと、外れていた所が3回とも当たった。", src: PROOF + "（見本2）" },
  { id: "boss", step: "result", sel: '[data-h="boss"]', name: "上司あり・なしの比べ表示", what: "上司・同僚の情報を入れた試走と、入れない試走を並べる。", why: "上司の情報を入れると「任されて抜てき」が当たるが、別の筋が消える。片方だけでは見落とす。", src: PROOF + "（見本1）" },
  { id: "ask", step: "result", sel: '[data-h="ask"]', name: "持ち帰り：面接で確かめる質問", what: "結果から、面接で聞くとよい質問を出す。", why: "結果を見て終わりにせず、本人が次に動ける形にする。", src: SPEC + " 5章4" },
  { id: "cmp", step: "compare", sel: '[data-h="compare"]', name: "2社の比べ表示", what: "同じ本人が2社に入った場合の違いを1画面で。", why: "どちらが正解かは決めない。何を優先するかで合う会社が変わることを見せる。", src: SPEC + " 8章" },
];

export const FEATURES = [
  "求人ページから「入社後を試運転する」へ進める",
  "選ぶだけの10問＋住むエリアの入力（初期値は見本の回答）",
  "架空の2社から会社を選ぶ",
  "5本の試走の演出（時点ごとの進み具合）",
  "結果：時点ごとの出来事・能力表・辞めたくなる度合い・分かれ道・上司あり/なし・面接で確かめる質問",
  "2社に入った場合の比べ表示",
  "URLの #job #input #company #run #result #compare で各段階を直接開ける",
  "URLに ?demo を付けるか、#demo-result のように開くとⓘ窓を出さない（デモ動画の撮影用）",
  "いまはAIにつながず、data/mirai.json の見本データで動く",
];

export const SCREEN_NOTE: Record<Step, string> = {
  job: "架空の求人ページ。ここから試走へ進む。",
  input: "本人の10問と住むエリアを選ぶ画面。",
  company: "試走させる会社を選ぶ画面（架空の2社）。",
  run: "AIが5本の試走を走らせている様子。いまは演出のみ。",
  result: "試走の結果。筋書きとして見せ、合否・点数・％は出さない。",
  compare: "同じ本人が2社に入った場合の違い。",
};
