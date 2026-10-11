import { useMemo } from "react";
import WidgetCard from "../../../components/widget-card/widget-card";
import { useTasks } from "../../todo/hooks/use-tasks";
import { buildImportantAlerts } from "../utils/build-alerts";
import AlertItem from "./alert-item";

interface AlertsWidgetProps {
  className?: string;
}

export default function AlertsWidget({ className }: AlertsWidgetProps = {}) {
  const { tasks, isLoading } = useTasks();

  const alerts = useMemo(() => buildImportantAlerts(tasks), [tasks]);

  return (
    <WidgetCard
      title="Quan trọng"
      icon={
        <img
          src="/icons/star.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      }
      className={`min-h-0 ${className ?? "flex-1"}`}
      bodyClassName="scrollbar-clean overflow-y-auto"
    >
      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Đang tải…</p>
      ) : alerts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted opacity-70">
          Tuyệt! Không có gì cần nhắc 🎉
        </p>
      ) : (
        <ul className="flex flex-col">
          {alerts.map((item) => (
            <AlertItem key={item.key} item={item} />
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
