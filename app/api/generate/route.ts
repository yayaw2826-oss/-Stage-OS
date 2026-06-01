import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

// Vercel Pro 单函数最长 300 秒(5 分钟)。两阶段生成 + 联网搜索可能用到 2-3 分钟。
export const maxDuration = 300;

const client = new Anthropic();

/* ----------------- 类型 ----------------- */

type FormData = {
  content?: {
    copyright?: string;
    playName?: string;
    [k: string]: unknown;
  };
  marketing?: {
    days?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

/* ----------------- 主 handler ----------------- */

export async function POST(request: Request) {
  // 1. 解析表单数据
  let formData: FormData;
  try {
    formData = (await request.json()) as FormData;
  } catch {
    return Response.json(
      { error: "请求体不是合法的 JSON" },
      { status: 400 }
    );
  }

  const copyright = formData.content?.copyright ?? "";
  const needsWebSearch = copyright === "改编" || copyright === "引进";
  const days = parseDays(formData.marketing?.days);

  /* ----------------- Phase 1 messages ----------------- */

  const baseUserBlock = `用户输入:

\`\`\`json
${JSON.stringify(formData, null, 2)}
\`\`\``;

  const phase1Instructions = needsWebSearch
    ? `请生成方案的 **Block 1 (Hero)** 和 **Block 2 的前 4 个 section**(① 受众洞察 / ② 渠道策略矩阵 / ③ 内容包 / ④ 视觉语言建议)。**暂时不要生成 ⑤ 营销排期日历,等下一轮调用。**

⚠️ **${copyright}作品 · 视觉建议必须联网调研**:
在生成 ④ 视觉语言建议 之前,**必须用 web_search 工具搜索原作的视觉资料**,搜索词参考:
- \`${formData.content?.playName ?? "[剧目名]"} poster key art visual design\`
- \`${formData.content?.playName ?? "[剧目名]"} brand colors\`
- \`${formData.content?.playName ?? "[剧目名]"} promotional materials\`

基于搜索结果做**中国本土化建议**(不是照搬原版)。在 ④ section 开头注明"已联网检索原作《XXX》视觉资料,以下是中国本土化建议"。

如果搜索没有有效结果,降级为基于用户输入生成,改在 ④ section 开头注明:"未找到原作可靠视觉资料,以下基于您填写的剧目信息生成"。`
    : `请生成方案的 **Block 1 (Hero)** 和 **Block 2 的前 4 个 section**(① 受众洞察 / ② 渠道策略矩阵 / ③ 内容包 / ④ 视觉语言建议)。**暂时不要生成 ⑤ 营销排期日历,等下一轮调用。**

(本剧是${copyright || "原创"}作品,④ 视觉语言建议**不需要联网**,基于用户填写的剧目信息生成。)`;

  const phase1UserMessage = `${baseUserBlock}\n\n---\n\n${phase1Instructions}`;

  /* ----------------- Stream ----------------- */

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let phase1Output = "";
      let phase1FullyDone = false;

      // ===== Phase 1 =====
      try {
        const phase1Stream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 8000,
          thinking: { type: "adaptive" },
          output_config: { effort: "high" },
          cache_control: { type: "ephemeral" },
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: phase1UserMessage }],
          // 改编/引进 → 加 web_search 工具(server-side tool,Anthropic 自己跑)
          ...(needsWebSearch
            ? {
                tools: [
                  {
                    type: "web_search_20260209" as const,
                    name: "web_search" as const,
                    max_uses: 4,
                  },
                ],
              }
            : {}),
        });

        for await (const event of phase1Stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            phase1Output += text;
            controller.enqueue(encoder.encode(text));
          }
        }
        phase1FullyDone = true;
      } catch (error) {
        console.error("[/api/generate phase1] error:", error);
        // Phase 1 还没收到任何内容就崩了 → 客户端会看到空响应,客户端的 catch 会处理
        // 如果有部分内容,客户端的 catch 会保留它(逻辑在 result page)
        try {
          controller.enqueue(
            encoder.encode(
              `\n\n---\n\n⚠️ **生成中断**(Phase 1):${
                error instanceof Error ? error.message : "unknown"
              }\n\n方案不完整。请回输入页重新生成。`
            )
          );
        } catch {
          /* ignore */
        }
        controller.close();
        return;
      }

      // ===== Phase 2:营销排期日历 =====
      if (phase1FullyDone && phase1Output.length > 500) {
        try {
          const phase2Instructions = `现在请基于**上方已生成的 4 个 section 的具体内容**,以及用户的营销节奏 = **${days} 天**,生成 \`## ⑤ 营销排期日历\`。

❗❗ **严禁脱离前 4 个 section 的内容凭空编排**——例如:
- 内容包没提"卡司见面会" → 日历不能凭空安排"卡司见面会预热周"
- 内容包推荐了某个 KOL 类型 → 日历的 W-X 阶段应回扣该类型
- 视觉语言建议给了某个色板 → 日历的"物料制作周"应引用该色板

❗ 营销节奏 ${days} 天 → 日历从 **T-${days}** 排到 **T+7**(${
            days <= 14
              ? "短窗口,适当压缩阶段数"
              : days <= 30
              ? "中等窗口"
              : "标准 60+ 天窗口,10 阶段标配"
          })。

❗ 只生成 \`## ⑤ 营销排期日历\` 这一个 section,**不要重复输出前 4 个 section**。

输出格式按 system prompt 的 ⑤ 营销排期日历 详细规范,W-N → W+1 各阶段含:
- goal(一句话目标)
- 时间分配
- 具体步骤(每步回扣前 4 section 的具体产出)
- 至少 1 个可复制代码块(邮件/文案/KOL 协调表)
- 今日产出 checklist(4-6 条,含至少 1 个 ✅ 里程碑)`;

          const phase2Stream = client.messages.stream({
            model: "claude-opus-4-7",
            max_tokens: 6000,
            thinking: { type: "adaptive" },
            output_config: { effort: "high" },
            cache_control: { type: "ephemeral" },
            system: SYSTEM_PROMPT,
            messages: [
              { role: "user", content: phase1UserMessage },
              { role: "assistant", content: phase1Output },
              { role: "user", content: phase2Instructions },
            ],
          });

          // Phase 2 输出前加个分隔符,让客户端 markdown 解析正确
          controller.enqueue(encoder.encode("\n\n"));

          for await (const event of phase2Stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (error) {
          console.error("[/api/generate phase2] error:", error);
          // Phase 2 失败但 phase 1 已经发出去了,加一行降级提示
          try {
            controller.enqueue(
              encoder.encode(
                `\n\n---\n\n## ⑤ 营销排期日历\n\n⚠️ **本 section 生成中断**:${
                  error instanceof Error ? error.message : "unknown"
                }\n\n方案的前 4 个 section 已完整生成,你可以基于它们手动排期,或回输入页重新生成完整方案。`
              )
            );
          } catch {
            /* ignore */
          }
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

/* ----------------- 工具函数 ----------------- */

/** 把用户输入的营销节奏天数解析成整数,容错。默认 60。 */
function parseDays(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.min(365, Math.max(1, Math.floor(raw)));
  }
  if (typeof raw === "string") {
    const n = parseInt(raw.trim(), 10);
    if (Number.isFinite(n) && n > 0) {
      return Math.min(365, Math.max(1, n));
    }
  }
  return 60;
}
