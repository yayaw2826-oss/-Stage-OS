"use client";

import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Accent = "yellow" | "teal" | "coral" | "berry";

const accentStyles: Record<
  Accent,
  { border: string; icon: string; ring: string }
> = {
  yellow: {
    border: "border-t-accent-yellow",
    icon: "bg-accent-yellow/25 text-[#8B6500]",
    ring: "ring-accent-yellow/30",
  },
  teal: {
    border: "border-t-accent-teal",
    icon: "bg-accent-teal/20 text-[#0F6E56]",
    ring: "ring-accent-teal/30",
  },
  coral: {
    border: "border-t-accent-coral",
    icon: "bg-accent-coral/18 text-[#993C1D]",
    ring: "ring-accent-coral/30",
  },
  berry: {
    border: "border-t-berry",
    icon: "bg-pink-mist text-berry",
    ring: "ring-berry/25",
  },
};

type FormSectionCardProps = {
  step: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  accent: Accent;
  children: React.ReactNode;
  id?: string;
  isOpen: boolean;
  isComplete?: boolean;
  onOpen: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  showPrev?: boolean;
  isLast?: boolean;
};

export function FormSectionCard({
  step,
  title,
  description,
  icon,
  accent,
  children,
  id,
  isOpen,
  isComplete,
  onOpen,
  onNext,
  onPrev,
  nextLabel = "下一步",
  showPrev = false,
  isLast = false,
}: FormSectionCardProps) {
  const styles = accentStyles[accent];

  return (
    <Card
      id={id}
      className={cn(
        "scroll-mt-28 border-stage-border bg-white/90 shadow-sm backdrop-blur-sm transition-shadow",
        styles.border,
        "border-t-[3px]",
        isOpen && cn("shadow-md ring-1", styles.ring)
      )}
    >
      <CardHeader
        className={cn(
          "flex cursor-pointer flex-row items-start gap-4 pb-4",
          isOpen ? "border-b border-stage-border/60" : "pb-0"
        )}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        aria-expanded={isOpen}
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            styles.icon
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-ink-mute">{step}</p>
          <div className="flex items-center gap-2">
            <CardTitle className="font-sans text-sm font-medium text-ink">{title}</CardTitle>
            {isComplete && !isOpen && (
              <span className="rounded bg-accent-teal/15 px-1.5 py-0.5 text-[10px] font-medium text-[#0F6E56]">
                已填写
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm font-normal text-ink-mute">{description}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "mt-2 h-5 w-5 shrink-0 text-ink-mute transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CardHeader>

      {isOpen && (
        <>
          <CardContent className="space-y-6 pt-2 font-sans">{children}</CardContent>
          {(showPrev || onNext) && (
            <div className="flex items-center justify-between border-t border-stage-border/60 px-4 py-4">
              {showPrev && onPrev ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                  className="rounded-full border-stage-border text-ink-soft hover:bg-pink-mist"
                >
                  ← 上一步
                </Button>
              ) : (
                <span />
              )}
              {onNext && (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="ml-auto rounded-full bg-berry px-6 hover:bg-berry-deep"
                >
                  {isLast ? "完成填写" : `${nextLabel} →`}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
