/**
 * Supabase 服务端客户端封装
 *
 * 用 service_role key 创建,具备绕过 RLS 的完整读写权限。
 * ⚠️ 永远只在 server-side(API Route)使用,绝不暴露给浏览器。
 *
 * 如果 env 变量缺失(部署在没配的环境),导出 null —— 调用方应做 null 检查,
 * 优雅降级,而不是 crash 整个 API 路由。
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: SupabaseClient | null =
  url && serviceKey
    ? createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

/**
 * 把原始 IP 哈希成 16 位匿名标识。
 * 用途:在不存储真实 IP 的前提下,识别重复访客 + 反爬。
 * Salt 是写死的——MVP 阶段够用,商业化时换成 env-based。
 */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + "_stage-os-mvp-salt-v1")
    .digest("hex")
    .slice(0, 16);
}

/**
 * Submissions 表的写入字段(根据 Supabase 建表 SQL 来的)。
 * 字段都是 optional,不传就用 DB default 或 null。
 */
export type SubmissionInsert = {
  ip_hash?: string;
  user_agent?: string;
  form_data: unknown;
  play_name?: string | null;
  play_type?: string | null;
  copyright?: string | null;
  city?: string | null;
  status?: string;
};

export type SubmissionUpdate = {
  status?: string;
  output_markdown?: string | null;
  output_length?: number | null;
  duration_ms?: number | null;
  error_message?: string | null;
  updated_at?: string;
};

/**
 * 插入一条 submission 记录,返回 id;失败返回 null(不抛错,不阻塞主流程)。
 */
export async function insertSubmission(
  data: SubmissionInsert
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: row, error } = await supabase
      .from("submissions")
      .insert(data)
      .select("id")
      .single();
    if (error) {
      console.error("[supabase insert]", error);
      return null;
    }
    return row?.id ?? null;
  } catch (e) {
    console.error("[supabase insert] threw:", e);
    return null;
  }
}

/**
 * 异步更新 submission;失败只 log 不抛错。
 * 调用方一般 `void updateSubmission(id, ...)`,fire-and-forget。
 */
export async function updateSubmission(
  id: string | null,
  patch: SubmissionUpdate
): Promise<void> {
  if (!id || !supabase) return;
  try {
    const { error } = await supabase
      .from("submissions")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) console.error("[supabase update]", error);
  } catch (e) {
    console.error("[supabase update] threw:", e);
  }
}
