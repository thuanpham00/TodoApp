import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "ghost" | "danger";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

function getVariantClasses(variant: ButtonVariant): string {
  return cn(
    variant === "primary" &&
      "bg-brand text-white hover:bg-brand-hover shadow-sm",
    variant === "ghost" &&
      "bg-transparent text-muted hover:bg-background hover:text-foreground",
    variant === "danger" && "bg-transparent text-muted hover:text-rose-500",
  );
}

export default function Button({
  variant = "primary",
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        getVariantClasses(variant),
        className,
      )}
      {...rest}
    />
  );
}
