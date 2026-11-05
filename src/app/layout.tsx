import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "未来デバッグ — 入社する前に、その会社での将来を試運転する",
  description:
    "求職者の分身と、仮想の会社・上司・同僚をAIでつくり、1か月後〜10年後を何度も試走するキャリアのデバッグ。Built with Claude: Japan 2026 提出作品（モック）。",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const FONTS =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=JetBrains+Mono:wght@400;500;700",
    "family=IBM+Plex+Sans+JP:wght@400;500;700",
    "family=Zen+Kaku+Gothic+New:wght@400;500;700;900",
    "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800",
    "family=DotGothic16",
    "family=M+PLUS+Rounded+1c:wght@400;500;800",
    "family=Yusei+Magic",
    "family=Klee+One:wght@400;600",
    "family=Zen+Old+Mincho:wght@400;700;900",
    "family=Murecho:wght@400;700;900",
    "family=Barlow+Condensed:wght@500;700",
    "family=BIZ+UDGothic:wght@400;700",
    "family=Oswald:wght@500;700",
  ].join("&") +
  "&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
