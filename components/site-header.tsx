"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems: { label: string; href: string }[] = [
  { label: "产品", href: "/" },
  { label: "历史", href: "/history" },
  { label: "案例库", href: "#" },
  { label: "方法论", href: "#" },
  { label: "数据来源", href: "#" },
];

type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function SiteHeader({
  ctaHref = "/input",
  ctaLabel = "立即生成方案",
}: SiteHeaderProps) {
  const pathname = usePathname();

  // 判断某个 nav 项是否处于活跃状态
  const isActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <header className="sticky top-0 z-50 bg-berry text-white shadow-md shadow-berry/20">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="好戏台 Stage OS"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg bg-white/95 object-contain p-0.5"
            priority
          />
          <span className="text-lg font-semibold tracking-wide">
            好戏台
            <span className="ml-1 font-serif italic text-pink-pale">Stage OS</span>
          </span>
        </Link>

        <span className="hidden rounded-full border border-white/35 px-3 py-1 text-xs text-white/90 sm:inline-block">
          Promo Studio
        </span>

        <nav className="ml-auto hidden items-center gap-7 text-sm text-white/85 md:flex">
          {navItems.map(({ label, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                className={
                  active
                    ? "relative font-medium text-white after:absolute after:-bottom-6 after:left-0 after:right-0 after:h-0.5 after:bg-pink-pale"
                    : "transition hover:text-white"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <Link
          href={ctaHref}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-berry transition hover:bg-pink-mist md:ml-4"
        >
          <span className="text-accent-yellow">✦</span>
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
