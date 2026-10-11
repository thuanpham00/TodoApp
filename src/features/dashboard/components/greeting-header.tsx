import { useNow } from "../hooks/use-now";
import { formatClock, getGreeting } from "../utils/greeting";

interface GreetingHeaderProps {
  name: string;
}

export default function GreetingHeader({ name }: GreetingHeaderProps) {
  const now = useNow();
  const greeting = getGreeting(now.getHours());

  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <span className="text-lg leading-none" aria-hidden="true">
        {greeting.emoji}
      </span>
      <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
        {greeting.text}, <span className="text-brand">{name}</span>
        <span className="mx-1.5 hidden text-muted sm:inline">—</span>
        <span className="hidden tabular-nums sm:inline">
          {formatClock(now)}
        </span>
      </h1>
    </div>
  );
}
