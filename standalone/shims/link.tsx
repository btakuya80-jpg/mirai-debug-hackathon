// next/link の代わり。公開ページどうしのリンク先は、書き出し時に window.__MIRAI_LINKS で渡す。
import type { AnchorHTMLAttributes } from "react";

declare global {
  interface Window {
    __MIRAI_LINKS?: Record<string, string>;
  }
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export default function Link({ href, children, ...rest }: Props) {
  const to = (typeof window !== "undefined" && window.__MIRAI_LINKS?.[href]) || href;
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
}
