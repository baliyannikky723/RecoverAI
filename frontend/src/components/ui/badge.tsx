import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-slate-700 bg-slate-800 text-slate-300",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400",
        outline:
          "border-slate-700 text-slate-300",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium",
        info:
          "border-sky-500/30 bg-sky-500/10 text-sky-400 font-medium",
        purple:
          "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-medium",
        neutral:
          "border-slate-700/60 bg-slate-800/60 text-slate-400",
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
