import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-semibold border whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-surface-muted text-text-muted border-border-light",
        success: "bg-success-bg text-success-fg border-success-border",
        warning: "bg-warning-bg text-warning-fg border-warning-border",
        danger: "bg-danger-bg text-danger-fg border-danger-border",
        info: "bg-info-bg text-info-fg border-info-border",
        olive: "bg-olive-50 text-olive-700 border-olive-200",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

const DOT_TONE: Record<BadgeTone, string> = {
  neutral: "bg-gray-400",
  success: "bg-status-green",
  warning: "bg-status-yellow",
  danger: "bg-status-red",
  info: "bg-status-blue",
  olive: "bg-accent-olive",
};

export interface StatusPillProps extends Omit<BadgeProps, "tone"> {
  tone?: BadgeTone;
  pulse?: boolean;
}

/** Badge with a leading status dot, for live/operational statuses. */
export function StatusPill({ tone = "neutral", pulse, children, className, ...props }: StatusPillProps) {
  return (
    <Badge tone={tone} className={className} {...props}>
      <span
        className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_TONE[tone], pulse && "animate-pulse")}
      />
      {children}
    </Badge>
  );
}

export { badgeVariants };
