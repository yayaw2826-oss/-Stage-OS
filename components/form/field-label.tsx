import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldLabelProps = {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
};

export function FieldLabel({
  htmlFor,
  children,
  hint,
  required,
  className,
}: FieldLabelProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {children}
        </Label>
        {required && (
          <span className="rounded bg-pink-mist px-1.5 py-0.5 text-[10px] font-medium text-berry">
            必填
          </span>
        )}
        {hint && <span className="text-xs text-ink-mute">{hint}</span>}
      </div>
    </div>
  );
}
