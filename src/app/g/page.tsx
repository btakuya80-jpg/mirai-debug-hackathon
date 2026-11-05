import type { Metadata } from "next";
import GrowApp from "./GrowApp";
import "./g.css";

export const metadata: Metadata = { title: "G案 働く姿が見える育成シミュレーション風 — 未来デバッグ" };

export default function Page() {
  return <GrowApp />;
}
