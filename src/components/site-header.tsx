import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  variant?: "landing" | "workspace";
}

export function SiteHeader({ variant = "landing" }: SiteHeaderProps) {
  const isLanding = variant === "landing";

  return (
    <header
      className={cn(
        "z-40 print:hidden",
        isLanding
          ? "absolute inset-x-0 top-0"
          : "sticky top-0 border-b border-deep-100/80 bg-white/85 backdrop-blur-xl",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8",
          isLanding ? "max-w-[92rem]" : "max-w-[92rem]",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label="万语鉴首页"
            className="shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Brand tone="dark" />
          </Link>
          {!isLanding && (
            <>
              <span className="hidden h-5 w-px bg-deep-200 sm:block" />
              <span className="hidden text-xs font-medium text-deep-500 sm:block">
                内容风险预检
              </span>
            </>
          )}
        </div>

        {isLanding ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden items-center gap-6 text-[15px] text-deep-600 md:flex">
              <Link
                href="#how-it-works"
                className="transition-colors hover:text-deep-950"
              >
                工作方式
              </Link>
              <Link
                href="#markets"
                className="transition-colors hover:text-deep-950"
              >
                支持市场
              </Link>
            </nav>
            <Link
              href="#knowledge"
              className="hidden rounded-full border border-aqua-200/70 bg-aqua-50/70 px-3 py-1 text-xs whitespace-nowrap text-aqua-800 transition-colors hover:bg-aqua-100 sm:inline-flex"
            >
              知识库增强
            </Link>
            <Link
              href="/analyze"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "h-8 gap-1.5 rounded-full bg-deep-950 px-3.5 text-white hover:bg-deep-800",
              )}
            >
              进入工作台
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Badge
              variant="outline"
              className="hidden border-aqua-200 bg-aqua-50 text-aqua-800 sm:inline-flex"
            >
              <span className="size-1.5 rounded-full bg-aqua-500" />
              真实 AI 检测
            </Badge>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-deep-600 hover:bg-deep-50 hover:text-deep-950",
              )}
            >
              <ArrowLeft className="size-3.5" />
              返回首页
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
