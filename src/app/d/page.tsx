import type { Metadata } from "next";
import ResumeApp from "./ResumeApp";
import "./d.css";

export const metadata: Metadata = { title: "D案 未来の履歴書 — 未来デバッグ" };

export default function Page() {
  return <ResumeApp />;
}
