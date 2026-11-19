import { cn } from "@/lib/utils";

interface BrandProps {
  tone?: "dark" | "light";
  className?: string;
}

export function Brand({ tone = "dark", className }: BrandProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="group relative grid size-9 shrink-0 place-items-center rounded-full border border-white/80 bg-white shadow-[0_6px_18px_rgba(15,76,95,0.14)] transition-transform duration-300 hover:scale-105">
        <span
          aria-hidden="true"
          className="absolute inset-[2px] rounded-full bg-[conic-gradient(from_140deg,#a4f3e2,#34d3b7,#dbeafe,#a4f3e2)] opacity-75"
        />
        <span
          aria-hidden="true"
          className="absolute inset-[4px] rounded-full bg-white/95"
        />
        <span className="relative text-[12px] font-semibold tracking-[-0.1em] text-deep-950">
          文A
        </span>
        <span className="absolute right-0 bottom-0 size-2 rounded-full bg-aqua-500 ring-2 ring-white" />
      </span>
      <span className="flex flex-col gap-1">
        <span
          className={cn(
            "text-[1.08rem] leading-none font-semibold tracking-[0.16em]",
            tone === "light" ? "text-white" : "text-deep-950",
          )}
        >
          万语鉴
        </span>
        <span
          className={cn(
            "text-[0.6rem] leading-none font-medium tracking-[0.2em] uppercase",
            tone === "light" ? "text-aqua-200/75" : "text-deep-500",
          )}
        >
          Cross-Culture Check
        </span>
      </span>
    </span>
  );
}
