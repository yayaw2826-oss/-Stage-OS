"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 加载阶段的 4 个步骤,对应 Stage OS 品牌的 4 个点缀色 + 3 大方法论 + 1 个核心交付物。
// 每条停留 4 秒,最后一条停住直到 API 返回。
const LOADING_STEPS: ReadonlyArray<{
  text: string;
  method: string;
  color: string;
}> = [
  // 明黄 #F5C842 — 受众洞察 / Awareness
  { text: "正在分析受众...", method: "戏剧观众七问", color: "var(--accent-yellow)" },
  // 青绿 #2BB8A3 — 渠道策略 / Community
  { text: "正在匹配渠道...", method: "ABC 三层模型", color: "var(--accent-teal)" },
  // 珊瑚橙 #F0683C — 小红书 5 篇 / Buying
  { text: "正在生成内容...", method: "小红书 5 篇", color: "var(--accent-coral)" },
  // 深锚色 #2A1424 — T-60 日历主轴
  { text: "正在编排时间表...", method: "T-60 倒计时引擎", color: "var(--ink)" },
];

type Status = "idle" | "loading" | "ready" | "error";

export default function ResultPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  // 防止 React Strict Mode 双重挂载时调用两次 API
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 优先级 1:如果有缓存的结果,直接展示(比如用户回到 result 页但没重新生成)
    const cached = sessionStorage.getItem("stage-os-result");
    if (cached) {
      setMarkdown(cached);
      setStatus("ready");
      return;
    }

    // 优先级 2:有表单数据,开始调 API 生成
    const formDataStr = sessionStorage.getItem("stage-os-form-data");
    if (!formDataStr) {
      setStatus("idle");
      return;
    }

    setStatus("loading");

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: formDataStr,
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

  // 加载文案每 4 秒切换一次,到最后一个就停住
  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="min-h-screen bg-stage-bg">
      <SiteHeader ctaHref="/input" ctaLabel="重新填写" />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        {/* idle:没数据,用户直接打开了 /result */}
        {status === "idle" && (
          <div className="rounded-2xl border border-stage-border bg-white p-10 text-center">
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

        {/* loading:正在调 API,显示动画 + 切换文案 + 4 色点缀 */}
        {status === "loading" && (
          <div className="rounded-2xl border border-stage-border bg-gradient-to-br from-white via-white to-pink-mist py-20 text-center">
            {/* 转圈圈 + 2 层呼吸光晕,3 层都跟随当前阶段颜色 */}
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

            {/* 切换的文案——主行(动作)+ 副行(方法论名字露脸,品牌铁律) */}
            <div key={loadingStep} className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
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

            {/* 4 段进度条 —— 每段用自己的品牌点缀色,走完正好是 Stage OS 4 色 */}
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

        {/* error:生成失败 */}
        {status === "error" && (
          <div className="rounded-2xl border border-accent-coral/30 bg-white p-10 text-center">
            <p className="font-serif text-2xl font-bold text-accent-coral">
              生成失败
            </p>
            <p className="mt-3 text-ink-soft">{errorMsg}</p>
            <p className="mt-4 text-xs text-ink-mute">
              你可以返回输入页重试,或者过一会儿再试(可能 API 临时拥堵)。
            </p>
          </div>
        )}

        {/* ready:展示 markdown */}
        {status === "ready" && markdown && (
          <article className="markdown-result rounded-2xl border border-stage-border bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>
        )}

        {/* 底部按钮——loading 状态下隐藏,避免用户分心 */}
        {status !== "loading" && (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/input"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full border-berry px-6 text-berry hover:bg-pink-mist"
              )}
            >
              {status === "ready" ? "返回修改信息" : "返回输入页"}
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
        )}
      </main>
    </div>
  );
}
