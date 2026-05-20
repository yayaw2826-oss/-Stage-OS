import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

// 让这个 Route Handler 在 Vercel 上最多跑 60 秒(Vercel Hobby 计划的上限)。
// Opus 4.7 + adaptive thinking 生成一份营销方案大约 30-60 秒。
export const maxDuration = 60;

// 创建 Claude 客户端。它会自动从环境变量 ANTHROPIC_API_KEY 读取 key。
const client = new Anthropic();

export async function POST(request: Request) {
  try {
    // 1. 解析用户表单数据
    const formData = await request.json();

    // 2. 把用户输入打包成一段文本喂给 Claude
    const userMessage = `请基于以下 4 个维度的输入,为我生成一份完整的营销方案:

\`\`\`json
${JSON.stringify(formData, null, 2)}
\`\`\``;

    // 3. 调用 Claude API
    //    - 模型:claude-opus-4-7(目前最聪明的 Claude)
    //    - adaptive thinking:让模型自己决定要思考多深
    //    - effort: high:用于"对智能要求高"的任务
    //    - cache_control:把 system prompt 缓存起来,下次调用便宜 ~90%
    const response = await client.messages.create({
      // Sonnet 4.6 比 Opus 4.7 快 2-3 倍,中文文案质量不输 Opus
      model: "claude-sonnet-4-6",
      // 8000 token 够写一份 4000-6000 字的完整方案,避免 SDK timeout
      max_tokens: 8000,
      // 关掉 thinking。对结构化文案生成,Sonnet 4.6 不思考反而更快、质量也够
      thinking: { type: "disabled" },
      // medium effort 是速度和质量的甜蜜点
      output_config: { effort: "medium" },
      cache_control: { type: "ephemeral" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    // 4. 从响应里提取 markdown 文本
    //    Claude 返回的 content 是一个数组,里面可能有 thinking 块和 text 块
    //    我们只要 text 块
    const markdown = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("\n");

    if (!markdown) {
      return Response.json(
        { error: "Claude 没有返回内容,请稍后重试" },
        { status: 500 }
      );
    }

    return Response.json({
      markdown,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_input_tokens: response.usage.cache_read_input_tokens,
      },
    });
  } catch (error) {
    // 把错误信息整理一下返给前端
    console.error("[/api/generate] error:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "API key 无效或未设置,请检查 .env.local 或 Vercel 环境变量" },
        { status: 500 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "API 调用太频繁,请等一会再试" },
        { status: 429 }
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
}
