import { cn } from "@/lib/utils";

type BadgeVariant = "wine" | "gold" | "green" | "blue" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  wine: "bg-wine-pale text-wine",
  gold: "bg-gold-pale text-gold",
  green: "bg-green-pale text-green",
  blue: "bg-blue-pale text-blue",
  muted: "bg-surface-2 text-muted",
};

export function Badge({ variant = "muted", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
