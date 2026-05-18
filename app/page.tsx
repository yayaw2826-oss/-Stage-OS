import Image from "next/image";
import Link from "next/link";

const navItems = ["产品", "案例库", "方法论", "数据来源"];

const steps = [
  { num: "01", title: "填写四维表单", sub: "~3 分钟" },
  { num: "02", title: "AI 分析匹配", sub: "~30 秒" },
  { num: "03", title: "完整方案生成", sub: "含小红书 5 篇" },
  { num: "04", title: "60 天排期表", sub: "可直接执行" },
];

const methods = [
  {
    accent: "yellow" as const,
    icon: "七",
    title: "戏剧观众七问",
    en: "Audience Discovery Framework",
    desc: "从「她为什么今晚出门」到「她会带谁来」，七个维度还原你的真实观众，而不是你以为的观众。",
    foot: "已应用于 18 个案例",
  },
  {
    accent: "teal" as const,
    icon: "ABC",
    title: "ABC 三层模型",
    en: "Channel Strategy Model",
    desc: "Awareness → Buying → Community，每一层对应不同平台与内容策略，资源少也能环环相扣。",
    foot: "适配小预算制作",
  },
  {
    accent: "coral" as const,
    icon: "T",
    title: "T-60 倒计时引擎",
    en: "60-Day Countdown Engine",
    desc: "演出前 60 天开始，让每一步都落在票房曲线最该发力的位置。",
    foot: "· 60 天 · 全流程陪伴 · 不再凭感觉",
    footNoDot: true,
  },
];

const cases = [
  {
    city: "上海",
    title: "候鸟来的那天",
    tags: ["音乐剧", "校园原创"],
    metric: "上座率提升 34%，小红书自然曝光 12 万",
    bg: "bg-pink-mist",
    dot: "bg-accent-yellow",
  },
  {
    city: "北京",
    title: "裂缝",
    tags: ["肢体剧场", "实验"],
    metric: "首演即售罄，豆瓣小组帖破 800 条讨论",
    bg: "bg-[#E8F6F3]",
    dot: "bg-accent-teal",
  },
  {
    city: "成都",
    title: "外婆的灶台",
    tags: ["方言戏剧", "地方性"],
    metric: "口碑传播系数 4.2，媒体自发报道 6 篇",
    bg: "bg-[#FDF5E0]",
    dot: "bg-accent-coral",
  },
];

const accentMap = {
  yellow: {
    border: "border-t-accent-yellow",
    iconBg: "bg-accent-yellow/20",
    iconText: "text-[#8B6500]",
    dot: "bg-accent-yellow",
  },
  teal: {
    border: "border-t-accent-teal",
    iconBg: "bg-accent-teal/18",
    iconText: "text-[#0F6E56]",
    dot: "bg-accent-teal",
  },
  coral: {
    border: "border-t-accent-coral",
    iconBg: "bg-accent-coral/16",
    iconText: "text-[#993C1D]",
    dot: "bg-accent-coral",
  },
};

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1.2l1.55 3.14 3.47.5-2.51 2.45.59 3.46L8 9.35l-3.1 1.63.59-3.46L3 4.84l3.47-.5L8 1.2z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-stage-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-berry text-white shadow-md shadow-berry/20">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-4 px-5 sm:px-8">
          <div className="flex shrink-0 items-center gap-2.5">
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
          </div>

          <span className="hidden rounded-full border border-white/35 px-3 py-1 text-xs text-white/90 sm:inline-block">
            Promo Studio
          </span>

          <nav className="ml-auto hidden items-center gap-8 text-sm text-white/85 md:flex">
            {navItems.map((item, i) => (
              <a
                key={item}
                href="#"
                className={i === 0 ? "relative font-medium text-white after:absolute after:-bottom-6 after:left-0 after:right-0 after:h-0.5 after:bg-pink-pale" : "hover:text-white"}
              >
                {item}
              </a>
            ))}
          </nav>

          <Link
            href="/input"
            className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-berry transition hover:bg-pink-mist md:ml-4"
          >
            <StarIcon className="h-3.5 w-3.5 text-accent-yellow" />
            立即生成方案
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <div
          className="pointer-events-none absolute -right-24 -top-12 h-72 w-72 rounded-full border border-berry/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-8 h-56 w-56 rounded-full border border-berry/8"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-mist px-4 py-2 text-sm font-medium text-berry">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow" />
            剧目营销助手 · 公测版
          </span>

          <h1 className="mt-8 font-serif text-4xl font-bold leading-tight tracking-tight text-berry sm:text-5xl md:text-[3.25rem]">
            戏剧人的
            <span className="italic"> AI 工作台</span>
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
            让 AI 无限拓展戏剧人的能力边界吧
          </p>

          <p className="mt-4 text-base text-ink-mute">
            四维输入剧目内容 → 完整营销方案 → 60 天执行排期追踪
            <br className="hidden sm:block" />
            <span className="sm:ml-1">一次填写，拿走一份专业可执行的剧目营销方案。</span>
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/input"
              className="inline-flex items-center gap-2 rounded-full bg-berry px-8 py-4 text-base font-medium text-white shadow-lg shadow-berry/25 transition hover:bg-berry-deep"
            >
              <StarIcon className="h-4 w-4 text-accent-yellow" />
              立即生成我的方案
              <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border-2 border-berry bg-white px-7 py-3.5 text-base font-medium text-berry transition hover:bg-pink-mist"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-berry/10 text-xs">▶</span>
              看一个真实案例
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink-mute">
            <span className="flex items-center gap-1">
              <span className="text-accent-teal">✓</span>
              基于 30 份戏剧文献与 18 个真实案例训练
            </span>
            <span className="hidden text-stage-border sm:inline">|</span>
            <span className="flex items-center gap-1">
              <span className="text-accent-teal">✓</span>
              不存储您的创作内容
            </span>
          </div>
        </div>

        {/* 流程步骤条 */}
        <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-stage-border bg-white/70 px-4 py-5 backdrop-blur-sm sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center sm:text-left">
                {i > 0 && (
                  <span className="absolute -left-2 top-3 hidden text-ink-mute sm:inline" aria-hidden>
                    →
                  </span>
                )}
                <p className="text-xs font-semibold text-berry-light">{step.num}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{step.title}</p>
                <p className="mt-0.5 text-xs text-ink-mute">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 方法论 */}
      <section className="border-t border-stage-border bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-mist px-4 py-1.5 text-sm text-berry">
            <span aria-hidden>📖</span>
            方法论基础
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold text-berry sm:text-4xl">
            懂戏的方法，才配做戏的营销。
          </h2>
          <p className="mt-3 text-ink-soft">
            三套经过实战检验的框架，驱动每一份方案的底层逻辑。
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {methods.map((m) => {
            const a = accentMap[m.accent];
            return (
              <article
                key={m.title}
                className={`rounded-2xl border border-stage-border bg-white p-7 shadow-sm ${a.border} border-t-[3px]`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${a.iconBg} ${a.iconText}`}
                >
                  {m.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-berry">{m.title}</h3>
                <p className="mt-1 text-xs text-ink-mute">{m.en}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{m.desc}</p>
                <p className="mt-5 flex items-center gap-2 text-xs text-ink-mute">
                  {"footNoDot" in m && m.footNoDot ? null : (
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.dot}`} />
                  )}
                  {m.foot}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 案例库 */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-pink-mist px-3 py-1 text-sm text-berry">
              <StarIcon className="h-3.5 w-3.5 text-accent-yellow" />
              案例库
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-berry">真实剧目，真实数据。</h2>
            <p className="mt-2 text-sm text-ink-soft">
              每个案例都完整保留了四维表单输入与方案输出，供参考。
            </p>
          </div>
          <a href="#" className="text-sm font-medium text-berry hover:underline">
            查看全部案例 →
          </a>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {cases.map((c) => (
            <article
              key={c.title}
              className="overflow-hidden rounded-2xl border border-stage-border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className={`relative px-5 pb-8 pt-5 ${c.bg}`}>
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                    {c.city}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-berry/15">
                    <span className="h-4 w-4 rounded-full border border-berry/25" />
                  </span>
                </div>
                <p className="mt-6 text-center font-serif text-xl italic text-berry">
                  《{c.title}》
                </p>
              </div>
              <div className="px-5 py-5">
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-pink-mist px-2.5 py-0.5 text-xs text-berry"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  <span className="text-berry-light">"</span>
                  {c.metric}
                </p>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-accent-teal">
                  <span>✓</span>
                  完整方案可查看
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-5xl text-center text-xs text-ink-mute">
          基于 30 份戏剧文献与 18 个真实案例训练 · 持续更新中
        </p>
      </section>

      {/* 底部 CTA */}
      <section className="bg-berry px-5 py-20 text-center text-white sm:px-8">
        <p className="text-sm text-pink-pale/90">准备好了？</p>
        <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
          30 秒，拿走你的剧目营销方案。
        </h2>
        <Link
          href="/input"
          className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-berry shadow-xl transition hover:bg-pink-mist"
        >
          <StarIcon className="h-4 w-4 text-accent-yellow" />
          立即生成我的方案
          <span aria-hidden>→</span>
        </Link>
        <p className="mt-5 text-sm text-pink-pale/75">
          免费使用 · 无需注册 · 不存储创作内容
        </p>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-white/10 bg-berry px-5 py-6 text-xs text-pink-pale/70 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="flex items-center gap-1.5">
            <StarIcon className="h-3 w-3 text-accent-yellow" />
            好戏台 Stage OS · Promo Studio
          </span>
          <span>© 2025 Stage OS · 专注独立戏剧的数字工具</span>
          <nav className="flex gap-5">
            <a href="#" className="hover:text-white">
              隐私政策
            </a>
            <a href="#" className="hover:text-white">
              使用条款
            </a>
            <a href="#" className="hover:text-white">
              联系我们
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
