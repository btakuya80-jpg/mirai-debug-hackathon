"use client";

/* H・I・J案で共通に使う部品。見た目は各案の CSS 変数（--lf-*）で変える。
   絵（場面・キャラ・求人の小さな絵）は各案から render… で渡す。 */

import { useState, type ReactNode } from "react";
import {
  ABILITIES,
  BRANCHES,
  JOBS,
  LIFE_LABEL,
  PROFILE_Q,
  ageAt,
  chapterLabel,
  gi,
  jobByUrl,
  simpleBranch,
  type BranchId,
  type Chapter,
  type Job,
  type Level,
  type LifeState,
  type LStep,
} from "@/lib/life";
import { COMPANY_INFO, SAMPLE_REVIEWS } from "@/lib/reviews";

export const LEVEL_N: Record<Level, number> = { 低: 1, 中: 2, 高: 3 };

/* ---------- 1. 求人を選ぶ ---------- */
export function JobBoard({ s, thumb, cta = "この求人で試す", next = "make", showUrl = true, showExtras = true }: { s: LifeState; thumb: (j: Job) => ReactNode; cta?: string; next?: LStep; showUrl?: boolean; showExtras?: boolean }) {
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const load = (u: string) => {
    const j = jobByUrl(u);
    if (!j) {
      setMsg("見本では、下の5件の求人URLだけ読み込めます。");
      return;
    }
    setMsg(`読み込みました：${j.company}「${j.title}」`);
    s.pickJob(j.id);
  };
  return (
    <div className="grid gap-6">
      {showUrl && (
      <div className="lf-card grid gap-3 p-5" data-h="url">
        <p className="lf-h text-[17px]">求人URLを貼る</p>
        <div className="flex flex-wrap gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://kyujin.example/job/…"
            className="lf-input min-w-0 flex-1 px-3 py-2.5 text-[14px]"
            inputMode="url"
            aria-label="求人のURL"
          />
          <button type="button" className="lf-btn px-5 py-2.5 text-[14px]" onClick={() => load(url)}>
            読み込む
          </button>
        </div>
        <p className="text-[12.5px] text-[var(--lf-sub)]">
          見本のURL：
          {JOBS.map((j) => (
            <button
              key={j.id}
              type="button"
              className="mr-3 underline underline-offset-2"
              onClick={() => {
                setUrl(j.url);
                load(j.url);
              }}
            >
              {j.url.replace("https://", "")}
            </button>
          ))}
        </p>
        {msg && <p className="text-[13px] font-bold text-[var(--lf-accent)]">{msg}</p>}
      </div>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-h="jobs">
        {JOBS.map((j) => {
          const on = s.jobId === j.id;
          return (
            <li key={j.id}>
              <button type="button" aria-pressed={on} onClick={() => s.pickJob(j.id)} className={`lf-card lf-job grid h-full w-full content-start overflow-hidden p-0 text-left ${on ? "is-on" : ""}`}>
                <span className="block">{thumb(j)}</span>
                <span className="grid gap-1.5 p-4">
                  <span className="text-[12px] text-[var(--lf-sub)]">
                    {j.industry}｜{j.company}｜{j.area}
                  </span>
                  <span className="lf-h text-[17px] leading-snug">{j.title}</span>
                  <span className="text-[13px]">
                    {j.pay}　{j.hours}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {j.tags.map((t) => (
                      <span key={t} className="lf-tag px-2 py-0.5 text-[11.5px]">
                        {t}
                      </span>
                    ))}
                  </span>
                  {j.detailed && <span className="text-[11.5px] font-bold text-[var(--lf-accent)]">デモ用に生涯2本を作り込んだ求人</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {showExtras && <CompanyExtras s={s} />}
      <div className="lf-card grid gap-2 p-5 text-[14px] leading-7">
        <p className="lf-h text-[16px]">
          {s.job.company}「{s.job.title}」
        </p>
        {s.job.body.map((b) => (
          <p key={b}>{b}</p>
        ))}
        <p className="text-[13px] text-[var(--lf-sub)]">
          職場の人：{(["boss", "senpai", "peer"] as const).map((k) => `${s.job.people[k].role} ${s.job.people[k].name}（${s.job.people[k].trait}）`).join("　")}
        </p>
        <div className="mt-2">
          <button type="button" className="lf-btn px-6 py-3 text-[15px]" onClick={() => s.go(next)}>
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 1b. 会社情報のURLと口コミ（どちらも任意・チームの案） ---------- */
export function CompanyExtras({ s, stack }: { s: LifeState; stack?: boolean }) {
  const sample = COMPANY_INFO[s.job.id];
  const ci = s.companyInfo;
  return (
    <div className={`lf-card grid gap-5 p-5 ${stack ? "" : "lg:grid-cols-2"}`} data-h="extras">
      <div className="grid content-start gap-2" data-h="company">
        <p className="lf-h text-[16px]">
          会社情報のURL <span className="text-[12px] font-normal text-[var(--lf-sub)]">（任意）</span>
        </p>
        <input value={s.companyUrl} onChange={(e) => s.setCompanyUrl(e.target.value)} placeholder="https://kaisha.example/…" className="lf-input px-3 py-2.5 text-[14px]" inputMode="url" aria-label="会社情報のURL" />
        <p className="text-[12.5px] text-[var(--lf-sub)]">
          見本：
          <button type="button" className="underline underline-offset-2" onClick={() => s.setCompanyUrl(sample.url)}>
            {sample.url.replace("https://", "")}
          </button>
        </p>
        {ci ? (
          <div className="lf-note grid gap-1 p-3 text-[13px] leading-6">
            <p className="font-bold">
              {ci.founded}創業／{ci.staff}／{ci.avgAge}
            </p>
            {ci.points.map((p) => (
              <p key={p}>・{p}</p>
            ))}
          </div>
        ) : (
          s.companyUrl.trim() !== "" && <p className="text-[12.5px] font-bold text-[var(--lf-accent)]">見本では、kaisha.example の5社だけ読み込めます。</p>
        )}
      </div>
      <div className="grid content-start gap-2" data-h="reviews">
        <p className="lf-h text-[16px]">
          自分で読んだ口コミを貼る <span className="text-[12px] font-normal text-[var(--lf-sub)]">（任意）</span>
        </p>
        <textarea
          value={s.reviewText}
          onChange={(e) => s.setReviewText(e.target.value)}
          rows={3}
          placeholder="例）教え方が丁寧。ただ繁忙期は残業が多い。"
          className="lf-input px-3 py-2.5 text-[14px] leading-6"
          aria-label="口コミの文章"
        />
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--lf-sub)]">
          <button type="button" className="underline underline-offset-2" onClick={() => s.setReviewText(SAMPLE_REVIEWS[s.job.id])}>
            見本の口コミ（架空）を入れる
          </button>
          <span>口コミサイトを自動で読むことはしません。</span>
        </p>
        <div className="flex flex-wrap items-center gap-1.5" aria-live="polite">
          <span className="text-[12.5px] font-bold">場面に出る職場の空気：</span>
          {s.vibes.length === 0 && <span className="text-[12.5px] text-[var(--lf-sub)]">まだありません</span>}
          {s.vibes.map((v) => (
            <span key={v.id} className={`lf-vibe is-${v.tone} px-2 py-0.5 text-[12px]`}>
              {v.label}
              <span className="ml-1 opacity-70">（{v.from}）</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. 分身をつくる ---------- */
export function MakeForm({ s, avatar, cta = "この分身で生涯を始める" }: { s: LifeState; avatar: ReactNode; cta?: string }) {
  const p = s.profile;
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="lf-card grid content-start justify-items-center gap-3 p-5 text-center">
        {avatar}
        <p className="lf-h text-[18px]">{p.age}歳の分身</p>
        <p className="text-[13px] leading-6 text-[var(--lf-sub)]">
          {p.kind}／{p.terms}／{p.style}
          <br />
          {p.prefs.join("・") || "こだわりなし"}
        </p>
      </div>
      <div className="grid gap-4" data-h="profile">
        <div className="lf-card p-5">
          <label className="flex flex-wrap items-center gap-4">
            <span className="lf-h text-[16px]">年齢</span>
            <input type="range" min={18} max={60} value={p.age} onChange={(e) => s.setProfile({ ...p, age: Number(e.target.value) })} className="lf-range min-w-[160px] flex-1" aria-label="年齢" />
            <span className="lf-num text-[26px]">{p.age}</span>
            <span className="text-[13px]">歳から75歳まで</span>
          </label>
        </div>
        {PROFILE_Q.map((q) => (
          <fieldset key={q.id} className="lf-card p-5">
            <legend className="sr-only">{q.text}</legend>
            <p className="lf-h text-[16px]">{q.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => {
                const v = p[q.id as keyof typeof p];
                const on = Array.isArray(v) ? v.includes(o) : v === o;
                return (
                  <button key={o} type="button" aria-pressed={on} onClick={() => s.toggle(q.id, o)} className="lf-chip px-3.5 py-1.5 text-[14px]">
                    {o}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        <div>
          <button
            type="button"
            className="lf-btn px-6 py-3 text-[15px]"
            onClick={() => {
              s.restart();
              s.go("life");
            }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 力・スキル・暮らし ---------- */
export function Grade({ g, hot }: { g: string; hot?: "up" | "down" }) {
  return <span className={`lf-grade ${hot ? `is-${hot}` : ""}`}>{g}</span>;
}

export function StatsPanel({ job, ch, prev, compact }: { job: Job; ch: Chapter; prev?: Chapter; compact?: boolean }) {
  const hot = (a: string, b?: string) => (b === undefined ? undefined : gi(a) > gi(b) ? "up" : gi(a) < gi(b) ? "down" : undefined);
  return (
    <div className="grid gap-4">
      <div className="lf-card p-4" data-h="abilities">
        <p className="lf-h text-[14px]">8つの力（S〜G）</p>
        <ul className={`mt-2 grid gap-x-4 gap-y-1 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-1"}`}>
          {ABILITIES.map((a, k) => (
            <li key={a} className="flex items-center justify-between gap-2 text-[13px]">
              <span className="truncate">{a}</span>
              <Grade g={ch.abilities[k]} hot={hot(ch.abilities[k], prev?.abilities[k])} />
            </li>
          ))}
        </ul>
        <p className="mt-3 lf-h text-[14px]">この求人で身につくスキル</p>
        <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
          {job.skills.map((a, k) => (
            <li key={a} className="flex items-center justify-between gap-2 text-[13px]">
              <span className="truncate">{a}</span>
              <Grade g={ch.skills[k]} hot={hot(ch.skills[k], prev?.skills[k])} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-5 text-[var(--lf-sub)]">選んだ目標への近さです。人の格付けではありません。</p>
      </div>
      <div className="lf-card p-4" data-h="life">
        <p className="lf-h text-[14px]">暮らし（高・中・低）</p>
        <LifeBars life={ch.life} />
      </div>
    </div>
  );
}

export function LifeBars({ life }: { life: Chapter["life"] }) {
  return (
    <ul className="mt-2 grid gap-1.5">
      {(Object.keys(LIFE_LABEL) as (keyof typeof LIFE_LABEL)[]).map((k) => (
        <li key={k} className="grid grid-cols-[7.5rem_1fr_1.6rem] items-center gap-2 text-[13px]">
          <span>{LIFE_LABEL[k]}</span>
          <span className="lf-meter" aria-hidden>
            {[1, 2, 3].map((n) => (
              <i key={n} className={n <= LEVEL_N[life[k]] ? "on" : ""} />
            ))}
          </span>
          <b className="text-right">{life[k]}</b>
        </li>
      ))}
    </ul>
  );
}

/* ---------- 分かれ道 ---------- */
export function BranchPick({ s, title = "分かれ道。どの道を見る？" }: { s: LifeState; title?: string }) {
  return (
    <div className="lf-card p-5" data-h="branches">
      <p className="lf-h text-[18px]">{title}</p>
      <p className="mt-1 text-[12.5px] text-[var(--lf-sub)]">あとでこの分かれ道に戻って、別の道を選び直せます。</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {BRANCHES.map((b) => {
          const d = s.job.detailed?.[b.id];
          const seen = s.saves.includes(b.id);
          return (
            <button key={b.id} type="button" onClick={() => s.choose(b.id)} className="lf-branch grid gap-1 p-3 text-left">
              <span className="flex items-center justify-between gap-2">
                <span className="lf-h text-[15px]">{b.label}</span>
                {seen && <span className="text-[11px] text-[var(--lf-sub)]">セーブ済み</span>}
              </span>
              <span className="text-[12.5px] leading-5 text-[var(--lf-sub)]">{d ? d.title : simpleBranch(s.job, b.id, s.profile.age).lines[0]}</span>
              <span className="text-[11px] font-bold text-[var(--lf-accent)]">{d ? "場面つき（作り込み）" : "簡易表示"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SimpleBranchView({ s }: { s: LifeState }) {
  const b = BRANCHES.find((x) => x.id === s.branch)!;
  const sb = simpleBranch(s.job, b.id, s.profile.age);
  return (
    <div className="lf-card p-5">
      <p className="text-[12px] font-bold text-[var(--lf-accent)]">簡易表示の筋書き</p>
      <p className="lf-h mt-1 text-[19px]">「{b.label}」を選んだ人生</p>
      <ol className="mt-3 grid gap-2 text-[14.5px] leading-7">
        {sb.lines.map((l) => (
          <li key={l}>・{l}</li>
        ))}
      </ol>
      <div className="mt-3 max-w-[420px]">
        <LifeBars life={sb.life} />
      </div>
    </div>
  );
}

/* ---------- 年表（デバッグ：過去へ戻る） ---------- */
export function DebugBar({ s }: { s: LifeState }) {
  const start = s.profile.age;
  return (
    <div className="lf-debug" data-h="debug">
      <ol className="flex flex-wrap items-center gap-1.5">
        {s.chapters.map((c, i) => (
          <li key={i}>
            <button type="button" onClick={() => s.jump(i)} disabled={i > s.idx} aria-current={i === s.idx} className="lf-tick px-2.5 py-1 text-[12px]">
              {chapterLabel(c, start)}
              {c.fork && " ◆"}
            </button>
          </li>
        ))}
      </ol>
      {s.branch && (
        <button type="button" onClick={s.rewind} className="lf-rewind px-3 py-1.5 text-[13px]">
          ↺ 分かれ道に戻って選び直す
        </button>
      )}
    </div>
  );
}

/* ---------- 人生を並べる ---------- */
export function SaveCompare({ s, thumb }: { s: LifeState; thumb: (b: BranchId) => ReactNode }) {
  const start = s.profile.age;
  const order = [...s.saves, ...BRANCHES.map((b) => b.id).filter((b) => !s.saves.includes(b))];
  return (
    <div className="grid gap-4" data-h="saves">
      <div className="lf-scroll -mx-4 overflow-x-auto px-4 pb-2">
        <div className="grid auto-cols-[minmax(250px,1fr)] grid-flow-col gap-4">
          {order.map((id, n) => {
            const b = BRANCHES.find((x) => x.id === id)!;
            const d = s.job.detailed?.[id];
            const seen = s.saves.includes(id);
            const last = d?.chapters[d.chapters.length - 1];
            const sb = simpleBranch(s.job, id, start);
            return (
              <article key={id} className={`lf-card lf-save grid content-start gap-3 overflow-hidden p-0 ${seen ? "" : "is-dim"}`}>
                <div>{thumb(id)}</div>
                <div className="grid gap-2 px-4 pb-4">
                  <p className="flex items-center justify-between text-[12px] text-[var(--lf-sub)]">
                    <span>{seen ? `セーブ ${n + 1}` : "まだ見ていない道"}</span>
                    <span>{d ? "作り込み" : "簡易表示"}</span>
                  </p>
                  <p className="lf-h text-[17px]">{b.label}</p>
                  <ol className="grid gap-1 text-[13px] leading-6">
                    {d
                      ? d.chapters.map((c, i) => (
                          <li key={i}>
                            <b>{ageAt(c, start)}歳</b> {c.events[0]}
                            {c.lifeEvent && <span className="text-[var(--lf-accent)]">／{c.lifeEvent}</span>}
                          </li>
                        ))
                      : sb.lines.map((l) => <li key={l}>{l}</li>)}
                  </ol>
                  <LifeBars life={last ? last.life : sb.life} />
                  {last && (
                    <p className="flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
                      {ABILITIES.map((a, k) => (
                        <span key={a} className="whitespace-nowrap">
                          {a} <b>{last.abilities[k]}</b>
                        </span>
                      ))}
                    </p>
                  )}
                  <button
                    type="button"
                    className="lf-rewind mt-1 justify-self-start px-3 py-1.5 text-[12.5px]"
                    onClick={() => {
                      s.choose(id);
                      s.go("life");
                    }}
                  >
                    この道をもう一度見る
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <p className="text-[13px] leading-6 text-[var(--lf-sub)]">
        ここに出るのは「予測」ではなく、AIが何度も試走して見えた筋書き（シナリオ）です。どの道が正解かは決めません。合否・点数・％は、企業に渡しません。
      </p>
    </div>
  );
}

export function Notice() {
  return <p className="pb-6 text-center text-[12px] text-[var(--lf-sub)]">この画面はすべて見本（ダミーデータ）です。登場する会社・人物はすべて架空です。</p>;
}
