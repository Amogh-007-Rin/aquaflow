import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={clsx(
        "rounded-md px-3 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
        variant === "ghost" && "border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900",
        variant === "danger" && "bg-rose-500 text-white hover:bg-rose-400",
        className,
      )}
      {...props}
    />
  );
}
