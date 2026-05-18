"use client";

import { cn } from "@/lib/utils";

type TagToggleGroupProps = {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  accent?: "yellow" | "teal" | "coral" | "berry";
};

const accentSelected: Record<NonNullable<TagToggleGroupProps["accent"]>, string> = {
  yellow: "border-accent-yellow bg-accent-yellow/15 text-ink ring-1 ring-accent-yellow/40",
  teal: "border-accent-teal bg-accent-teal/12 text-ink ring-1 ring-accent-teal/35",
  coral: "border-accent-coral bg-accent-coral/12 text-ink ring-1 ring-accent-coral/35",
  berry: "border-berry bg-pink-mist text-berry ring-1 ring-berry/30",
};

export function TagToggleGroup({
  options,
  value,
  onChange,
  accent = "berry",
}: TagToggleGroupProps) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const selected = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={cn(
              "rounded-full border border-stage-border bg-white px-3.5 py-1.5 text-sm text-ink-soft transition hover:border-berry/30",
              selected && accentSelected[accent]
            )}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
