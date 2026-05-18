import Image from "next/image";
import Link from "next/link";

const navItems = ["产品", "案例库", "方法论", "数据来源"];

type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function SiteHeader({
  ctaHref = "/input",
  ctaLabel = "立即生成方案",
}: SiteHeaderProps) {
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

        <nav className="ml-auto hidden items-center gap-8 text-sm text-white/85 md:flex">
          {navItems.map((item, i) => (
            <Link
              key={item}
              href={item === "产品" ? "/" : "#"}
              className={
                i === 0
                  ? "relative font-medium text-white after:absolute after:-bottom-6 after:left-0 after:right-0 after:h-0.5 after:bg-pink-pale"
                  : "hover:text-white"
              }
            >
              {item}
            </Link>
          ))}
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
