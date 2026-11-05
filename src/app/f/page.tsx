import type { Metadata } from "next";
import BoardApp from "./BoardApp";
import "./f.css";

export const metadata: Metadata = { title: "F案 出発案内板 — 未来デバッグ" };

export default function Page() {
  return <BoardApp />;
}
