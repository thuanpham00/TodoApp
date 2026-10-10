import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

interface ChipProps extends ComponentProps<"button"> {
  label: string;
  isActive?: boolean;
}

export default function Chip({
  label,
  isActive = false,
  className,
  type = "button",
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        "disabled:cursor-not-allowed disabled:opacity-40",
        isActive && "bg-brand text-white",
        !isActive && "bg-background text-muted hover:text-foreground",
        className,
      )}
      {...rest}
    >
      {label}
    </button>
  );
}
