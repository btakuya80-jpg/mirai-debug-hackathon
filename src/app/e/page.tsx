import type { Metadata } from "next";
import RouteApp from "./RouteApp";
import "./e.css";

export const metadata: Metadata = { title: "E案 キャリア路線図 — 未来デバッグ" };

export default function Page() {
  return <RouteApp />;
}
