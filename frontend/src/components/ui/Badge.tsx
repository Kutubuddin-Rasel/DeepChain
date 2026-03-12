import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-foreground text-background": variant === "default",
          "border-transparent bg-[var(--color-status-completed)] text-white": variant === "success",
          "border-transparent bg-[var(--color-status-pending)] text-white": variant === "warning",
          "border-transparent bg-primary text-white": variant === "destructive",
          "border-transparent bg-[var(--color-status-preparing)] text-white": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
