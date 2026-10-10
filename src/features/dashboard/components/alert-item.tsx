import { cn } from "../../../utils/cn";
import type { AlertItem as AlertItemData } from "../utils/build-alerts";
import { formatAlertDate } from "../utils/format-alert-date";

interface AlertItemProps {
  item: AlertItemData;
}

interface BadgeConfig {
  key: string;
  label: string;
  className: string;
}

function getDotClass(item: AlertItemData): string {
  if (item.isImportant || item.tone === "overdue") return "bg-red-500";
  if (item.tone === "week" || item.tone === "month") return "bg-blue-500";
  if (item.diff === 0) return "bg-amber-500";
  if (item.diff === 1) return "bg-orange-500";

  return "bg-muted";
}

// Task quan trọng luôn giữ tag "Quan trọng", kể cả khi đã có ngày hết hạn.
function getBadges(item: AlertItemData): BadgeConfig[] {
  const badges: BadgeConfig[] = [];

  if (item.isImportant) {
    badges.push({
      key: "important",
      label: "Quan trọng",
      className:
        "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    });
  }

  if (item.scope) {
    badges.push({
      key: "scope",
      label: item.scope === "week" ? "Tuần này" : "Tháng này",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    });
  }

  return badges;
}

export default function AlertItem({ item }: AlertItemProps) {
  const badges = getBadges(item);
  const dateLabel = item.dueDate ? formatAlertDate(item.dueDate) : null;

  return (
    <li className="flex items-center gap-3 rounded-lg px-1 py-2">
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", getDotClass(item))}
      />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {dateLabel && (
          <span className="shrink-0 text-sm text-brand">{dateLabel}</span>
        )}

        <p
          title={item.message}
          className="min-w-0 shrink truncate text-sm text-foreground"
        >
          {item.message}
        </p>

        {badges.map((badge) => (
          <span
            key={badge.key}
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              badge.className,
            )}
          >
            {badge.label}
          </span>
        ))}
      </div>
    </li>
  );
}
