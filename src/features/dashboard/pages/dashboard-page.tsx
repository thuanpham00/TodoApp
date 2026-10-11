import { Settings } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import Button from "../../../components/button/button";
import { cn } from "../../../utils/cn";
import { HabitsWidget } from "../../habits/components";
import { useSettings } from "../../settings/hooks/use-settings";
import { TodoWidget } from "../../todo/components";
import AlertsWidget from "../components/alerts-widget";
import GreetingHeader from "../components/greeting-header";

const SettingsModal = lazy(() =>
  import("../../settings/components/settings-modal").then((module) => ({
    default: module.default,
  })),
);

export default function DashboardPage() {
  const { settings, updateSettings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isPlainBackground = settings.background === "none";

  // Xoá key rác từ feature Reminders/Bookmarks đã bỏ (chạy 1 lần lúc mount).
  useEffect(() => {
    try {
      for (const key of ["reminders", "bookmarks"]) {
        localStorage.removeItem(key);
      }
    } catch {
      // bỏ qua nếu storage không khả dụng
    }
  }, []);

  return (
    <div className="flex min-h-dvh w-full flex-col p-2 pb-safe sm:p-3 sm:pb-safe lg:p-4 lg:pb-safe">
      <div
        className={cn(
          "flex flex-1 flex-col gap-3 rounded-3xl p-2 ring-1 ring-border-card backdrop-blur-xl sm:p-3 lg:p-4",
          isPlainBackground ? "bg-surface/90" : "bg-surface/55",
        )}
      >
        <header className="sticky top-0 z-30 mb-3 flex items-center justify-between gap-2 rounded-full bg-surface/90 p-1.5 px-3 pt-2 ring-1 ring-border-card backdrop-blur-md sm:p-2 sm:px-4 sm:pt-2.5">
          <GreetingHeader name={settings.boardName} />
          <Button
            variant="primary"
            className="rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Cài đặt</span>
          </Button>
        </header>

        <div className="grid gap-3 lg:flex-1 lg:grid-cols-3">
          <div className="order-1 flex min-h-0 flex-col lg:col-span-2 lg:h-full">
            <TodoWidget />
          </div>
          <div className="order-2 flex min-h-0 flex-col gap-3 lg:order-2 lg:h-full">
            <AlertsWidget className="shrink-0 lg:flex-1" />
            <HabitsWidget className="shrink-0 lg:flex-1" />
          </div>
        </div>
      </div>

      <Suspense>
        <SettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          settings={settings}
          onChange={updateSettings}
        />
      </Suspense>
    </div>
  );
}
