import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface WidgetCardProps {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export default function WidgetCard({
  title,
  icon,
  action,
  className,
  bodyClassName,
  children,
}: WidgetCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl bg-surface p-4 ring-1 ring-border-card sm:p-5",
        className,
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
        </div>
        {action}
      </header>

      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
