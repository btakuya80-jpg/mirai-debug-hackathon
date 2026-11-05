import type { Metadata } from "next";
import App from "./BoardApp";
import "../life.css";
import "./i.css";

export const metadata: Metadata = { title: "I案 人生のすごろく盤 — 未来デバッグ" };

export default function Page() {
  return <App />;
}
