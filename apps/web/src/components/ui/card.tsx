import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "wine" | "gold";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-6 shadow-sm",
        variant === "wine" && "border-l-3 border-l-wine",
        variant === "gold" && "border-l-3 border-l-gold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
