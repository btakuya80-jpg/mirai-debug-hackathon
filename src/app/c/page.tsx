import type { Metadata } from "next";
import SaveApp from "./SaveApp";
import "./c.css";

export const metadata: Metadata = { title: "C案 セーブ画面風 — 未来デバッグ" };

export default function Page() {
  return <SaveApp />;
}
