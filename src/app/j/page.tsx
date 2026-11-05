import type { Metadata } from "next";
import App from "./FilmApp";
import "../life.css";
import "./j.css";

export const metadata: Metadata = { title: "J案 映画のフィルム — 未来デバッグ" };

export default function Page() {
  return <App />;
}
