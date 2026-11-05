// 各案を「1ファイルのHTML」に書き出す（claude.ai の Artifact で公開するため）。
//   node scripts/build-standalone.mjs
//   → dist-standalone/home.html, a.html, b.html, c.html
// React は cdnjs の UMD 版から読み込み、それ以外（画面のコード・CSS・見本データ）は中に入れる。
// 公開ページどうしのリンク先は standalone/links.json（無ければ同じフォルダの .html）を使う。
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "dist-standalone");
mkdirSync(out, { recursive: true });

const REACT = "18.3.1";
const FONTS =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=JetBrains+Mono:wght@400;500;700",
    "family=IBM+Plex+Sans+JP:wght@400;500;700",
    "family=Zen+Kaku+Gothic+New:wght@400;500;700;900",
    "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800",
    "family=DotGothic16",
    "family=M+PLUS+Rounded+1c:wght@400;500;800",
  ].join("&") +
  "&display=swap";

const PAGES = [
  { id: "home", title: "未来デバッグ", bg: "#f2f4f7", scheme: "light" },
  { id: "a", title: "未来デバッグ A案", bg: "#12161d", scheme: "dark" },
  { id: "b", title: "未来デバッグ B案", bg: "#e9f2fb", scheme: "light" },
  { id: "c", title: "未来デバッグ C案", bg: "#e9e4ff", scheme: "light" },
];

const linksFile = resolve(root, "standalone/links.json");
const links = existsSync(linksFile)
  ? JSON.parse(readFileSync(linksFile, "utf8"))
  : { "/": "home.html", "/a": "a.html", "/b": "b.html", "/c": "c.html" };

for (const p of PAGES) {
  const js = await build({
    entryPoints: [resolve(root, `standalone/${p.id}.tsx`)],
    bundle: true,
    minify: true,
    write: false,
    format: "iife",
    target: "es2019",
    jsx: "automatic",
    tsconfig: resolve(root, "tsconfig.json"),
    alias: {
      react: resolve(root, "standalone/shims/react.js"),
      "react/jsx-runtime": resolve(root, "standalone/shims/jsx-runtime.js"),
      "react-dom/client": resolve(root, "standalone/shims/react-dom-client.js"),
      "next/link": resolve(root, "standalone/shims/link.tsx"),
    },
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "error",
  });
  const code = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

  const cssOut = resolve(out, `${p.id}.css`);
  execFileSync("npx", ["@tailwindcss/cli", "-i", `standalone/${p.id}.css`, "-o", cssOut, "--minify"], {
    cwd: root,
    stdio: "ignore",
  });
  const css = readFileSync(cssOut, "utf8");

  // Artifact は <!doctype>/<html>/<head>/<body> を自分で付けるので、中身だけを書く
  const html = `<title>${p.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
:root{color-scheme:${p.scheme}}
body{background:${p.bg}}
${css}
</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/${REACT}/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/${REACT}/umd/react-dom.production.min.js"></script>
<script>window.__MIRAI_LINKS=${JSON.stringify(links)};</script>
<script>${code}</script>
`;
  writeFileSync(resolve(out, `${p.id}.html`), html);
  console.log(`${p.id}.html  ${(html.length / 1024).toFixed(0)}KB`);
}
