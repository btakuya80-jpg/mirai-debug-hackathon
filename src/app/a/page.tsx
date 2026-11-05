import type { Metadata } from "next";
import DebuggerApp from "./DebuggerApp";
import "./a.css";

export const metadata: Metadata = { title: "A案 デバッガー画面風 — 未来デバッグ" };

export default function Page() {
  return <DebuggerApp />;
}
