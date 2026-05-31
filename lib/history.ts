/**
 * 浏览器本地历史方案存储 —— 基于 localStorage
 *
 * 一切数据只存在用户这台电脑、这个浏览器里。换浏览器/清缓存会丢。
 * 这是 MVP 阶段的「方案 A · 不需登录」实现。
 *
 * 未来可演进:
 * - 方案 B:每条历史可"上传"到 Vercel KV 拿到分享链接(不替代本地)
 * - 方案 C:用户账号系统 + 云同步(大改)
 */

const HISTORY_KEY = "stage-os-history-v1";
const MAX_ENTRIES = 100; // 防止 localStorage 撑爆

export type HistoryStatus = "complete" | "interrupted" | "partial";

export type HistoryEntry = {
  id: string;
  playName: string;
  city?: string;
  venue?: string;
  createdAt: number;   // 第一次创建时间(unix ms)
  updatedAt: number;   // 最近一次更新时间
  formData: unknown;   // 用户输入的四维数据,留着回填用
  markdown: string;    // AI 生成的完整 markdown
  status: HistoryStatus;
};

const isBrowser = () => typeof window !== "undefined";

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 写入或更新一条历史。
 * - 同 id 已存在 → 覆盖
 * - 新 id → 插到最前(最近优先)
 * - 超过 MAX_ENTRIES → 截掉最老的
 */
export function saveHistoryEntry(entry: HistoryEntry): void {
  if (!isBrowser()) return;
  try {
    const all = loadHistory();
    const idx = all.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      all[idx] = entry;
    } else {
      all.unshift(entry);
    }
    const trimmed = all.slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    // 容量满了/被禁用都吞掉,不让它把生成流程搞崩
    console.warn("[history] save failed:", e);
  }
}

export function deleteHistoryEntry(id: string): void {
  if (!isBrowser()) return;
  try {
    const all = loadHistory();
    const filtered = all.filter((e) => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch {
    /* ignore */
  }
}

export function getHistoryEntry(id: string): HistoryEntry | null {
  return loadHistory().find((e) => e.id === id) ?? null;
}

export function clearAllHistory(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

/** 生成一个 UUID。优先用 crypto.randomUUID,旧浏览器降级 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 把 unix 时间戳格式化成「刚刚 / N 分钟前 / N 小时前 / N 天前 / YYYY-MM-DD」 */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 0) return "刚刚";
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return new Date(timestamp).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
