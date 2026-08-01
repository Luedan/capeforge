import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gold text-ink shadow-[0_10px_30px_rgba(210,166,72,.18)] hover:bg-gold-light hover:-translate-y-0.5",
        secondary: "bg-surface-2 text-cream border border-line hover:border-gold/40 hover:bg-surface-3",
        ghost: "text-muted hover:bg-white/5 hover:text-cream",
        outline: "border border-gold/35 bg-transparent text-gold-light hover:bg-gold/10",
        danger: "bg-red-500/12 text-red-300 border border-red-400/20 hover:bg-red-500/20",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 px-7 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({ className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function buttonClassName({ className, ...options }: VariantProps<typeof buttonVariants> & { className?: string } = {}) {
  return cn(buttonVariants(options), className);
}
