"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ============================================================
   常量定义
   ============================================================ */

// Loading 4 阶段配色:对应 Stage OS 品牌 4 个点缀色 + 3 大方法论
const LOADING_STEPS: ReadonlyArray<{
  text: string;
  method: string;
  color: string;
}> = [
  { text: "正在分析受众...", method: "戏剧观众七问", color: "var(--accent-yellow)" },
  { text: "正在匹配渠道...", method: "ABC 三层模型", color: "var(--accent-teal)" },
  { text: "正在生成内容...", method: "小红书 5 篇", color: "var(--accent-coral)" },
  { text: "正在编排时间表...", method: "T-60 倒计时引擎", color: "var(--ink)" },
];

// 六维 Tab 定义。color = 品牌点缀色;keywords 用于把 AI 生成的 H2 章节智能归类到对应 tab。
const TABS = [
  {
    id: "audience",
    label: "受众洞察",
    color: "var(--accent-yellow)",
    keywords: ["受众", "七问", "观众", "画像"],
  },
  {
    id: "channel",
    label: "渠道策略 ABC",
    color: "var(--accent-teal)",
    keywords: ["渠道", "ABC", "策略", "矩阵"],
  },
  {
    id: "content",
    label: "小红书 5 篇",
    color: "var(--accent-coral)",
    keywords: ["内容", "小红书", "种草", "文案包"],
  },
  {
    id: "calendar",
    label: "60 天日历",
    color: "var(--ink)",
    keywords: ["60 天", "日历", "T-60", "排期", "倒计时"],
  },
  {
    id: "data",
    label: "数据回收",
    color: "var(--berry-deep)",
    keywords: ["数据回收", "看板", "复盘"],
  },
  {
    id: "more",
    label: "更多平台",
    color: "var(--ink-mute)",
    keywords: ["媒体通稿", "通稿", "媒体", "其他"],
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ============================================================
   类型
   ============================================================ */

type Status = "idle" | "loading" | "ready" | "error";

type ParsedSection = { title: string; content: string; tabId: TabId };

type FormDataShape = {
  content?: {
    playName?: string;
    playType?: string;
    copyright?: string;
  };
  show?: {
    city?: string;
    venue?: string;
    showCount?: string;
    seatCount?: string;
  };
};

/* ============================================================
   纯函数:markdown 解析 + tab 归类
   ============================================================ */

function matchTabByTitle(title: string): TabId {
  for (const tab of TABS) {
    for (const keyword of tab.keywords) {
      if (title.includes(keyword)) return tab.id as TabId;
    }
  }
  return "more";
}

function parseMarkdown(md: string): {
  hero: string;
  sections: ParsedSection[];
} {
  const lines = md.split("\n");
  const heroLines: string[] = [];
  const sectionsRaw: { title: string; content: string[] }[] = [];
  let current: { title: string; content: string[] } | null = null;
  let inSectionMode = false;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const title = h2Match[1].trim();
      const matchedTab = TABS.find((tab) =>
        tab.keywords.some((k) => title.includes(k))
      );
      // 第一个匹配到 tab 关键词的 H2 才正式进入 sections 模式。
      // 此前的 H2(比如"副标题")被视作 hero 的一部分。
      if (matchedTab || inSectionMode) {
        inSectionMode = true;
        if (current) sectionsRaw.push(current);
        current = { title, content: [] };
        continue;
      }
      heroLines.push(line);
      continue;
    }
    if (inSectionMode && current) {
      current.content.push(line);
    } else {
      heroLines.push(line);
    }
  }
  if (current) sectionsRaw.push(current);

  return {
    hero: heroLines.join("\n").trim(),
    sections: sectionsRaw.map((s) => ({
      title: s.title,
      content: s.content.join("\n").trim(),
      tabId: matchTabByTitle(s.title),
    })),
  };
}

/* ============================================================
   品牌弧形 SVG —— 4 段莓紫深浅,呼应主视觉
   ============================================================ */

function BrandArc({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 4 段从外到内,从深到浅 */}
      <path
        d="M 20 180 A 160 160 0 0 1 180 20"
        stroke="#5C1F47"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 40 180 A 130 130 0 0 1 170 50"
        stroke="#8A4775"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 60 180 A 100 100 0 0 1 160 80"
        stroke="#B25A87"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 80 180 A 70 70 0 0 1 150 110"
        stroke="#EBD3E4"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   组件:Hero 区(剧目名 + 4 个 metric)
   ============================================================ */

function ResultHero({
  formData,
  heroMarkdown,
}: {
  formData: FormDataShape | null;
  heroMarkdown: string;
}) {
  const playName = formData?.content?.playName || "你的剧目";
  const city = formData?.show?.city || "";
  const venue = formData?.show?.venue || "";
  const showCount = formData?.show?.showCount || "";
  const seatCount = formData?.show?.seatCount || "";

  // 计算总座位数(用作第 4 个 metric 数字)
  const totalSeats = useMemo(() => {
    const s = parseInt(seatCount.replace(/[^\d]/g, ""), 10);
    const c = parseInt(showCount.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(s) && Number.isFinite(c) && s > 0 && c > 0) {
      return (s * c).toLocaleString();
    }
    if (Number.isFinite(s) && s > 0) return s.toLocaleString();
    return null;
  }, [seatCount, showCount]);

  const eyebrowParts = [
    "STAGE OS",
    city ? `${city}巡演方案` : null,
    "MVP 标杆",
  ].filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-stage-bg px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
      <div className="relative mx-auto max-w-6xl">
        {/* 品牌弧形装饰,右上角 */}
        <BrandArc className="pointer-events-none absolute -right-4 -top-4 h-48 w-48 opacity-90 sm:h-56 sm:w-56" />

        {/* eyebrow chip */}
        <div className="relative inline-flex items-center gap-2 rounded-full bg-pink-mist px-4 py-1.5 text-xs font-medium tracking-wider text-berry-deep">
          {eyebrowParts.map((part, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-berry-light">·</span>}
              <span>{part}</span>
            </span>
          ))}
        </div>

        {/* 主标题:剧名 · 城市 */}
        <h1 className="relative mt-5 font-serif text-3xl font-bold leading-tight text-berry-deep sm:text-4xl md:text-5xl">
          <span className="italic">《{playName}》</span>
          {city && (
            <>
              <span className="mx-2 text-berry-light">·</span>
              <span className="italic">{city}</span>
            </>
          )}
        </h1>

        {/* 副标题 */}
        <p className="relative mt-3 text-lg font-medium text-ink">
          营销方案 · 由{" "}
          <span className="font-serif italic">Stage OS</span> 一次性输出
        </p>

        {/* AI 生成的 hero 文本(intro 段落)。若 AI 没产出则用兜底文案。 */}
        <div className="markdown-hero relative mt-6 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
          {heroMarkdown ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {heroMarkdown}
            </ReactMarkdown>
          ) : (
            <p>
              这是一份完整的剧目营销方案 —— 以《{playName}》
              为样本输入。下面六个 Tab 是它的六件交付物,你不必从头读到尾,按推荐顺序拿走即可。
            </p>
          )}
        </div>

        {/* 4 个 metric 卡片 */}
        <div className="relative mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          <MetricCard
            number="1"
            unit="次点击"
            sub="完整方案到手,不再凭感觉做营销"
          />
          <MetricCard
            number="6"
            unit="维"
            sub="方案交付件数 · 受众/渠道/内容/PR/日历/数据"
          />
          <MetricCard
            number="60"
            unit="天"
            sub="T-60 倒计时引擎 · 从邀约到复盘的完整闭环"
          />
          <MetricCard
            number={totalSeats || (seatCount ? seatCount : "—")}
            unit={venue || "座位待售"}
            sub={
              venue && showCount
                ? `${showCount} 场 · 共 ${totalSeats || seatCount} 个座位待售`
                : "请回输入页填写场地信息"
            }
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  number,
  unit,
  sub,
}: {
  number: string;
  unit: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-stage-border bg-white p-5">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl font-bold italic text-berry-deep sm:text-4xl">
          {number}
        </span>
        <span className="text-sm font-medium text-ink-soft">{unit}</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-mute">{sub}</p>
    </div>
  );
}

/* ============================================================
   组件:Tab 切换条
   ============================================================ */

function TabStrip({
  active,
  onChange,
  availableCount,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
  availableCount: Record<TabId, number>;
}) {
  return (
    <div className="sticky top-[68px] z-30 border-y border-berry-deep/30 bg-berry-deep/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 sm:px-8">
        {TABS.map((tab) => {
          const has = availableCount[tab.id] > 0;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id as TabId)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-[13.5px] transition sm:px-4",
                isActive
                  ? "font-medium text-white"
                  : has
                  ? "text-white/65 hover:text-white/90"
                  : "text-white/30"
              )}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: has ? tab.color : "rgba(255,255,255,0.2)",
                }}
              />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-pink-pale sm:inset-x-4" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   组件:当前 tab 的内容(目前直接渲染 markdown)
   ============================================================ */

function TabContent({
  sections,
  activeTab,
}: {
  sections: ParsedSection[];
  activeTab: TabId;
}) {
  const matched = sections.filter((s) => s.tabId === activeTab);
  const tabMeta = TABS.find((t) => t.id === activeTab)!;

  if (matched.length === 0) {
    return (
      <div className="rounded-2xl border border-stage-border bg-white p-10 text-center">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: tabMeta.color }}
        />
        <p className="mt-4 font-serif text-xl font-medium text-berry-deep">
          这一栏暂时空着
        </p>
        <p className="mt-2 text-sm text-ink-mute">
          AI 这次没有为「{tabMeta.label}」生成专属内容。
          可以试试重新生成,或在其他 Tab 里找相关内容。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {matched.map((section, i) => (
        <article
          key={i}
          className="markdown-result rounded-2xl border border-stage-border bg-white px-6 py-8 sm:px-10 sm:py-10"
        >
          {/* 章节标题旁的色点 */}
          <header className="mb-6 flex items-center gap-3 border-b border-stage-border pb-4">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: tabMeta.color }}
            />
            <h2
              className="font-serif text-2xl font-bold text-berry-deep"
              style={{ margin: 0, border: 0, paddingBottom: 0 }}
            >
              {section.title}
            </h2>
          </header>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section.content}
          </ReactMarkdown>
        </article>
      ))}
    </div>
  );
}

/* ============================================================
   主页面
   ============================================================ */

export default function ResultPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [formData, setFormData] = useState<FormDataShape | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("audience");
  const initialized = useRef(false);

  /* === 初始化:读 sessionStorage,决定状态 === */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 读表单数据(用于 hero 区域的剧名/城市/场地)
    const fd = sessionStorage.getItem("stage-os-form-data");
    if (fd) {
      try {
        setFormData(JSON.parse(fd));
      } catch {
        /* ignore */
      }
    }

    // 优先级 1:已有缓存结果
    const cached = sessionStorage.getItem("stage-os-result");
    if (cached) {
      setMarkdown(cached);
      setStatus("ready");
      return;
    }

    // 优先级 2:有表单数据,开始调 API
    if (!fd) {
      setStatus("idle");
      return;
    }

    setStatus("loading");

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: fd,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `请求失败 (HTTP ${res.status})`);
        }
        sessionStorage.setItem("stage-os-result", data.markdown);
        setMarkdown(data.markdown);
        setStatus("ready");
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : "生成失败,请重试");
        setStatus("error");
      });
  }, []);

  /* === Loading 文案 4 秒切一次 === */
  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [status]);

  /* === 解析 markdown 成 hero + sections === */
  const parsed = useMemo(() => {
    if (!markdown) return null;
    return parseMarkdown(markdown);
  }, [markdown]);

  /* === 每个 tab 下有多少 section(用于 tab 上的可点击/灰显状态) === */
  const availableCount = useMemo(() => {
    const map: Record<TabId, number> = {
      audience: 0,
      channel: 0,
      content: 0,
      calendar: 0,
      data: 0,
      more: 0,
    };
    if (parsed) {
      parsed.sections.forEach((s) => {
        map[s.tabId] += 1;
      });
    }
    return map;
  }, [parsed]);

  /* === ready 时,默认选第一个有内容的 tab === */
  useEffect(() => {
    if (status !== "ready" || !parsed) return;
    const firstWithContent = TABS.find((t) => availableCount[t.id] > 0);
    if (firstWithContent) setActiveTab(firstWithContent.id as TabId);
  }, [status, parsed, availableCount]);

  return (
    <div className="min-h-screen bg-stage-bg">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* idle:没数据 */}
        {status === "idle" && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-stage-border bg-white p-10 text-center">
            <p className="font-serif text-2xl font-bold text-berry">
              还没有方案数据
            </p>
            <p className="mt-3 text-ink-soft">
              请先回到输入页填写信息并点击「生成营销方案」。
            </p>
            <Link
              href="/input"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "mt-6 inline-flex h-12 rounded-full bg-berry px-6 hover:bg-berry-deep"
              )}
            >
              去填写
            </Link>
          </div>
        )}

        {/* loading:4 色品牌动画 */}
        {status === "loading" && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-stage-border bg-gradient-to-br from-white via-white to-pink-mist py-20 text-center">
            <div className="relative inline-flex h-20 w-20 items-center justify-center">
              <span
                className="absolute inset-0 animate-ping rounded-full"
                style={{
                  backgroundColor: LOADING_STEPS[loadingStep].color,
                  opacity: 0.15,
                  transition: "background-color 700ms ease",
                }}
              />
              <span
                className="absolute inset-2 animate-pulse rounded-full"
                style={{
                  backgroundColor: LOADING_STEPS[loadingStep].color,
                  opacity: 0.22,
                  transition: "background-color 700ms ease",
                }}
              />
              <Loader2
                className="relative h-12 w-12 animate-spin"
                style={{
                  color: LOADING_STEPS[loadingStep].color,
                  transition: "color 700ms ease",
                }}
              />
            </div>

            <div
              key={loadingStep}
              className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-700"
            >
              <p className="flex items-center justify-center gap-3 font-serif text-2xl font-medium text-berry-deep">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: LOADING_STEPS[loadingStep].color }}
                />
                {LOADING_STEPS[loadingStep].text}
              </p>
              <p
                className="mt-2 text-sm tracking-wide"
                style={{ color: LOADING_STEPS[loadingStep].color }}
              >
                {LOADING_STEPS[loadingStep].method}
              </p>
            </div>

            <div className="mt-7 flex justify-center gap-2">
              {LOADING_STEPS.map((step, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full",
                    i < loadingStep && "w-8",
                    i === loadingStep && "w-12 animate-pulse",
                    i > loadingStep && "w-4"
                  )}
                  style={{
                    backgroundColor:
                      i <= loadingStep ? step.color : "var(--border)",
                    transition:
                      "width 500ms ease, background-color 500ms ease",
                  }}
                />
              ))}
            </div>

            <p className="mt-8 text-sm text-ink-mute">
              通常{" "}
              <span className="font-serif italic text-base text-ink-soft">
                20-40
              </span>{" "}
              秒 · 不会保存你的剧目信息
            </p>
          </div>
        )}

        {/* error */}
        {status === "error" && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-accent-coral/30 bg-white p-10 text-center">
            <p className="font-serif text-2xl font-bold text-accent-coral">
              生成失败
            </p>
            <p className="mt-3 text-ink-soft">{errorMsg}</p>
            <p className="mt-4 text-xs text-ink-mute">
              你可以返回输入页重试,或者过一会儿再试(可能 API 临时拥堵)。
            </p>
            <Link
              href="/input"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "mt-6 inline-flex h-12 rounded-full bg-berry px-6 hover:bg-berry-deep"
              )}
            >
              返回输入页
            </Link>
          </div>
        )}
      </main>

      {/* ready 状态下的整页结构:Hero -> TabStrip -> TabContent */}
      {status === "ready" && parsed && (
        <>
          <ResultHero formData={formData} heroMarkdown={parsed.hero} />

          <TabStrip
            active={activeTab}
            onChange={setActiveTab}
            availableCount={availableCount}
          />

          <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
            <TabContent sections={parsed.sections} activeTab={activeTab} />

            {/* 底部按钮 */}
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
          </section>
        </>
      )}
    </div>
  );
}
