import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)] text-white hover:bg-[var(--primary)]/80",
        secondary:
          "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80",
        destructive:
          "border-transparent bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/80",
        outline: "text-[var(--foreground)] border-[var(--border)]",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        warning:
          "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/30",
        produce:
          "border-transparent bg-green-500/20 text-green-400 border-green-500/30",
        dairy:
          "border-transparent bg-blue-500/20 text-blue-400 border-blue-500/30",
        bakery:
          "border-transparent bg-orange-500/20 text-orange-400 border-orange-500/30",
        meat:
          "border-transparent bg-red-500/20 text-red-400 border-red-500/30",
        beverages:
          "border-transparent bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        pantry:
          "border-transparent bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
