import type { Metadata } from "next";
import MountainApp from "./MountainApp";
import "./b.css";

export const metadata: Metadata = { title: "B案 10年の山 — 未来デバッグ" };

export default function Page() {
  return <MountainApp />;
}
