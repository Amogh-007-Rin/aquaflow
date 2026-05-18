import { HTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "normal" | "warning" | "breach" | "info";

export function Badge({
  className,
  children,
  variant = "info",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full border px-2 py-1 text-xs font-semibold",
        variant === "normal" && "border-emerald-500/40 bg-emerald-500/20 text-emerald-300",
        variant === "warning" && "border-amber-500/40 bg-amber-500/20 text-amber-200",
        variant === "breach" && "border-rose-500/40 bg-rose-500/20 text-rose-200",
        variant === "info" && "border-cyan-500/40 bg-cyan-500/20 text-cyan-200",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
