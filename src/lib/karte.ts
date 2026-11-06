/* 会社のまとめ（チームの案）。求人原稿と会社の公式ページから「読み取った」ことだけを並べ、
   1項目ずつ出典を付ける。読み取れない項目は推測で埋めず「不明」と出す。
   いまはモックなので、見本のURLを貼ると用意した架空のデータを読み込む。 */

import type { Job } from "./life";
import type { CompanyInfo } from "./reviews";

export type KarteSrc = { kind: "求人原稿" | "会社の公式ページ"; url: string; where: string };
export type KarteItem = { label: string; value: string | null; src: KarteSrc | null; why?: string };

const host = (u: string) => u.replace("https://", "");

export function karteOf(job: Job, ci?: CompanyInfo): { items: KarteItem[]; known: number; unknown: number } {
  const J = (where: string): KarteSrc => ({ kind: "求人原稿", url: host(job.url), where });
  const C = (where: string): KarteSrc | null => (ci ? { kind: "会社の公式ページ", url: host(ci.url), where } : null);
  const fromPoints = (re: RegExp) => ci?.points.find((p) => re.test(p)) ?? null;
  const items: KarteItem[] = [
    { label: "仕事の内容", value: job.body[0], src: J("1段落目") },
    { label: "最初の教わり方", value: job.body[1], src: J("2段落目") },
    { label: "会社の支え", value: job.body[2], src: J("3段落目") },
    { label: "勤務地", value: job.area, src: J("勤務地の欄") },
    { label: "給与", value: job.pay, src: J("給与の欄") },
    { label: "働く時間", value: job.hours, src: J("勤務時間の欄") },
    { label: "創業", value: ci?.founded ?? null, src: C("会社概要"), why: ci ? undefined : "会社情報のURLを貼ると読み取ります" },
    { label: "人数", value: ci?.staff ?? null, src: C("会社概要"), why: ci ? undefined : "会社情報のURLを貼ると読み取ります" },
    { label: "平均年齢", value: ci?.avgAge ?? null, src: C("会社概要"), why: ci ? undefined : "会社情報のURLを貼ると読み取ります" },
    { label: "研修・資格の支え", value: fromPoints(/研修|資格|免許|勉強会/), src: fromPoints(/研修|資格|免許|勉強会/) ? C("特徴の欄") : null, why: ci ? "会社のページに書いていません" : "会社情報のURLを貼ると読み取ります" },
    { label: "海外の拠点", value: fromPoints(/海外/), src: fromPoints(/海外/) ? C("特徴の欄") : null, why: ci ? "会社のページに書いていません" : "会社情報のURLを貼ると読み取ります" },
    { label: "平均の残業時間", value: null, src: null, why: "求人原稿にも会社のページにも書いていません" },
    { label: "3年後も働いている人の割合", value: null, src: null, why: "求人原稿にも会社のページにも書いていません" },
  ];
  return { items, known: items.filter((i) => i.value).length, unknown: items.filter((i) => !i.value).length };
}
