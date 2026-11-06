import type { Metadata } from "next";
import PackApp from "@/components/pack/PackApp";
import "../life.css";
import "../pack.css";

export const metadata: Metadata = { title: "H-1 — 未来デバッグ" };

export default function Page() {
  return <PackApp style="h1" />;
}
