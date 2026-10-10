import { useNow } from "../hooks/use-now";
import { formatClock, getGreeting } from "../utils/greeting";

interface GreetingHeaderProps {
  name: string;
}

export default function GreetingHeader({ name }: GreetingHeaderProps) {
  const now = useNow();
  const greeting = getGreeting(now.getHours());

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-lg leading-none" aria-hidden="true">
        {greeting.emoji}
      </span>
      <h1 className="text-lg font-bold text-foreground">
        {greeting.text}, <span className="text-brand">{name}</span>
        <span className="mx-1.5 text-muted">—</span>
        <span className="tabular-nums">{formatClock(now)}</span>
      </h1>
    </div>
  );
}
