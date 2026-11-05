import type { Metadata } from "next";
import App from "./DioramaApp";
import "../life.css";
import "./h.css";

export const metadata: Metadata = { title: "H案 ジオラマ — 未来デバッグ" };

export default function Page() {
  return <App />;
}
