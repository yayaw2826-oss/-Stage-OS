import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

// Vercel Pro 计划单函数最长 300 秒(5 分钟),够 Opus 4.7 + adaptive thinking 跑完。
// 用 Hobby 计划的话此参数最高被允许到 60。
export const maxDuration = 300;

const client = new Anthropic();

export async function POST(request: Request) {
  // 1. 解析表单数据
  let formData: unknown;
  try {
    formData = await request.json();
  } catch {
    return Response.json(
      { error: "请求体不是合法的 JSON" },
      { status: 400 }
    );
  }

  const userMessage = `请基于以下 4 个维度的输入,为我生成一份完整的营销方案:

\`\`\`json
${JSON.stringify(formData, null, 2)}
\`\`\``;

  // 2. 启动 Claude 流式生成。这里不 await,只是初始化迭代器。
  let stream: ReturnType<typeof client.messages.stream>;
  try {
    stream = client.messages.stream({
      // Opus 4.7 是目前最聪明的 Claude,文化/营销策划任务首选。
      // 在 5 分钟时限内,配合 adaptive thinking,质量比 Sonnet 4.6 上一个档次。
      model: "claude-opus-4-7",
      // 10000 token ≈ 6500-7500 字完整方案。Opus 4.7 上限是 128K,这里给个稳妥值。
      max_tokens: 10000,
      // adaptive thinking:让 Opus 自己决定要不要深度思考、思考多少
      thinking: { type: "adaptive" },
      // effort high:对智能要求高的任务的最低推荐(skill 原话)
      output_config: { effort: "high" },
      // 把超长的 system prompt 缓存起来,第二次调用便宜 ~90%
      cache_control: { type: "ephemeral" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
  } catch (error) {
    // 流还没开,这里捕获的是请求构造层错误(认证、参数等)
    console.error("[/api/generate] init error:", error);
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "API key 无效或未设置" },
        { status: 500 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: `Claude API 错误:${error.message}` },
        { status: error.status ?? 500 }
      );
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }

  // 3. 把 Anthropic 的 SDK 事件流,转换成纯文本字节流,推给客户端
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          // 只关心 text_delta 事件,把 token 文字直接 enqueue 出去
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        console.error("[stream] error during iteration:", error);
        // 流内部错误:能写就写一条提示文本,然后 error 终止
        try {
          controller.enqueue(
            encoder.encode(
              `\n\n---\n\n**生成中断**:${
                error instanceof Error ? error.message : "未知错误"
              }`
            )
          );
        } catch {
          /* ignore */
        }
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      // 阻止任何中间代理(nginx/cloudflare 之类)做缓冲,确保 chunk 立刻发到客户端
      "X-Accel-Buffering": "no",
    },
  });
}
