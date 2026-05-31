"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2, FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type HistoryEntry,
  loadHistory,
  deleteHistoryEntry,
  formatRelativeTime,
} from "@/lib/history";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadHistory());
    setLoaded(true);
  }, []);

  const handleDelete = (id: string, playName: string) => {
    if (!confirm(`确定删除《${playName}》这个方案吗?删除后无法恢复。`)) return;
    deleteHistoryEntry(id);
    setEntries(loadHistory());
  };

  return (
    <div className="min-h-screen bg-stage-bg">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-mist px-4 py-1.5 text-xs font-medium tracking-wider text-berry-deep">
            STAGE OS · 历史方案
          </div>
          <h1 className="mt-5 font-serif text-3xl font-bold text-berry-deep sm:text-4xl">
            {loaded ? (
              <>
                <span className="italic">{entries.length}</span>{" "}
                <span className="text-2xl font-medium text-ink">
                  {entries.length === 0 ? "个方案" : "个方案"}
                </span>
              </>
            ) : (
              <span className="text-ink-mute">加载中...</span>
            )}
          </h1>
          <p className="mt-3 text-sm text-ink-soft sm:text-base">
            所有生成过的方案都自动存在这台电脑、这个浏览器里。
            <br />
            换浏览器、清缓存、或者开无痕模式时会丢——重要方案记得复制/截图保存。
          </p>
        </div>

        {/* Empty state */}
        {loaded && entries.length === 0 && (
          <div className="mx-auto max-w-xl rounded-2xl border border-stage-border bg-white p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-berry-light" strokeWidth={1.5} />
            <p className="mt-4 font-serif text-2xl font-bold text-berry-deep">
              还没有历史方案
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              生成的方案会自动保存到这里。
            </p>
            <Link
              href="/input"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "mt-6 inline-flex h-12 rounded-full bg-berry-deep px-6 hover:bg-berry"
              )}
            >
              去生成第一个方案
            </Link>
          </div>
        )}

        {/* List */}
        {loaded && entries.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                onDelete={() => handleDelete(entry.id, entry.playName)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const STATUS_META: Record<
  HistoryEntry["status"],
  { color: string; label: string }
> = {
  complete: { color: "bg-accent-teal", label: "完成" },
  interrupted: { color: "bg-accent-coral", label: "中断" },
  partial: { color: "bg-accent-yellow", label: "进行中" },
};

function HistoryCard({
  entry,
  onDelete,
}: {
  entry: HistoryEntry;
  onDelete: () => void;
}) {
  const meta = STATUS_META[entry.status];

  // 摘要:截 markdown 的第一段非标题文字,不超过 80 字
  const summary =
    entry.markdown
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0 && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith("*"))
      ?.replace(/[*_`#>]/g, "")
      ?.slice(0, 80) ?? "(暂无摘要)";

  return (
    <article className="group relative flex flex-col rounded-2xl border border-stage-border bg-white p-6 transition hover:border-berry/40">
      {/* Status row + delete */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-mute">
          <span className={cn("inline-block h-1.5 w-1.5 rounded-full", meta.color)} />
          {meta.label} · {formatRelativeTime(entry.updatedAt)}
        </span>
        <button
          onClick={onDelete}
          className="rounded-md p-1 text-ink-mute opacity-0 transition hover:bg-pink-mist hover:text-accent-coral group-hover:opacity-100 focus:opacity-100"
          aria-label={`删除《${entry.playName}》`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl font-bold leading-tight text-berry-deep">
        <span className="italic">《{entry.playName}》</span>
      </h3>

      {/* Meta */}
      {(entry.city || entry.venue) && (
        <p className="mt-2 text-sm text-ink-soft">
          {[entry.city, entry.venue].filter(Boolean).join(" · ")}
        </p>
      )}

      {/* Summary */}
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">
        {summary}
      </p>

      {/* Footer link */}
      <Link
        href={`/result?id=${entry.id}`}
        className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-berry transition hover:text-berry-deep"
      >
        查看方案 <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
