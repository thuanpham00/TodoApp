import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

interface IconButtonProps extends ComponentProps<"button"> {
  icon: LucideIcon;
  label: string;
}

export default function IconButton({
  icon: Icon,
  label,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted transition-colors",
        "hover:bg-background hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted",
        className,
      )}
      {...rest}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
