import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-stage-bg">
      <SiteHeader ctaHref="/input" ctaLabel="重新填写" />
      <main className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
        <p className="font-serif text-3xl font-bold text-berry">方案生成页</p>
        <p className="mt-4 text-ink-soft">
          此处将展示 AI 生成的营销方案（当前为占位，尚未接入数据与接口）。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/input"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full border-berry px-6 text-berry hover:bg-pink-mist"
            )}
          >
            返回修改信息
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 rounded-full bg-berry px-6 hover:bg-berry-deep"
            )}
          >
            回到首页
          </Link>
        </div>
      </main>
    </div>
  );
}
