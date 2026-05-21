import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

// Vercel Hobby 单函数 60s 上限。流式响应在数据持续流动期间不算超时,
// 但首字节(TTFB)还是会被记入。
export const maxDuration = 60;

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
      model: "claude-sonnet-4-6",
      // 6000 token ≈ 4000-4500 字方案。比之前的 4500 大,因为流式不再硬卡 60s。
      max_tokens: 6000,
      thinking: { type: "disabled" },
      output_config: { effort: "medium" },
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
