import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandProps {
  tone?: "dark" | "light";
  className?: string;
}

export function Brand({ tone = "dark", className }: BrandProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[0.7rem] bg-gradient-to-br from-aqua-300 via-aqua-400 to-aqua-600 text-deep-950 shadow-[0_4px_18px_rgba(18,184,160,0.25)]">
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent_52%)]"
        />
        <Languages
          aria-hidden="true"
          className="relative size-[1.15rem]"
          strokeWidth={2.2}
        />
      </span>
      <span className="flex flex-col gap-1">
        <span
          className={cn(
            "text-[1.05rem] leading-none font-semibold tracking-[0.16em]",
            tone === "light" ? "text-white" : "text-deep-950",
          )}
        >
          万语鉴
        </span>
        <span
          className={cn(
            "text-[0.54rem] leading-none font-medium tracking-[0.2em] uppercase",
            tone === "light" ? "text-aqua-200/75" : "text-deep-500",
          )}
        >
          Cross-Culture Check
        </span>
      </span>
    </span>
  );
}
