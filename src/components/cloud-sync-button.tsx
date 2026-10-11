import { useCallback, useEffect, useState } from "react";
import { CloudUpload } from "lucide-react";
import { STORAGE_KEY } from "@/features/todo/constants/storage-keys";
import { HABITS_STORAGE_KEY } from "@/features/habits/constants/storage-keys";
import { SETTINGS_STORAGE_KEY } from "@/features/settings/constants/settings-options";
import { migrateTasks } from "@/features/todo/utils/migrate-tasks";
import type { Task } from "@/features/todo/types/task";
import type { Habit } from "@/features/habits/types/habit";
import type { Settings } from "@/features/settings/types/settings";
import {
  DEFAULT_SETTINGS,
} from "@/features/settings/constants/settings-options";
import { fetchAllTasks, upsertTask } from "@/services/tasks-service";
import { fetchAllHabits, upsertHabit } from "@/services/habits-service";
import { fetchSettings, updateSettings } from "@/services/settings-service";
import { Button } from "@/components/ui/button";

type Status = "checking" | "ready" | "syncing" | "done" | "hidden" | "error";

function readLocalTasks(): Task[] | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Task[];
  } catch {
    return null;
  }
}

function readLocalHabits(): Habit[] | null {
  const raw = localStorage.getItem(HABITS_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Habit[];
  } catch {
    return null;
  }
}

function readLocalSettings(): Settings | null {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Settings;
  } catch {
    return null;
  }
}

function clearLocalData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HABITS_STORAGE_KEY);
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
}

export default function CloudSyncButton() {
  const [status, setStatus] = useState<Status>("checking");
  const [counts, setCounts] = useState<{ tasks: number; habits: number; settings: boolean }>({
    tasks: 0,
    habits: 0,
    settings: false,
  });
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Kiểm tra xem có data local cũ + cloud rỗng hay không.
  useEffect(() => {
    let isMounted = true;

    (async () => {
      const localTasks = readLocalTasks();
      const localHabits = readLocalHabits();
      const localSettings = readLocalSettings();

      const hasLocal =
        (localTasks && localTasks.length > 0) ||
        (localHabits && localHabits.length > 0) ||
        localSettings !== null;

      if (!hasLocal) {
        if (isMounted) setStatus("hidden");
        return;
      }

      try {
        const [cloudTasks, cloudHabits, cloudSettings] = await Promise.all([
          fetchAllTasks(),
          fetchAllHabits(),
          fetchSettings(),
        ]);

        if (!isMounted) return;

        const cloudEmpty =
          cloudTasks.length === 0 &&
          cloudHabits.length === 0 &&
          JSON.stringify(cloudSettings) === JSON.stringify(DEFAULT_SETTINGS);

        if (!cloudEmpty) {
          // Cloud đã có data → không cần migrate, ẩn nút.
          setStatus("hidden");
          return;
        }

        setCounts({
          tasks: localTasks?.length ?? 0,
          habits: localHabits?.length ?? 0,
          settings: localSettings !== null,
        });
        setStatus("ready");
      } catch (err) {
        if (!isMounted) return;
        setErrorMsg(err instanceof Error ? err.message : "Không kiểm tra được cloud");
        setStatus("error");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSync = useCallback(async () => {
    setStatus("syncing");
    setErrorMsg("");

    try {
      const localTasks = readLocalTasks();
      const localHabits = readLocalHabits();
      const localSettings = readLocalSettings();

      const tasksToPush = localTasks ? migrateTasks(localTasks) : [];
      const habitsToPush = localHabits ?? [];
      const settingsToPush: Partial<Settings> = localSettings
        ? { ...DEFAULT_SETTINGS, ...localSettings }
        : {};

      await Promise.all([
        ...tasksToPush.map((task) => upsertTask(task)),
        ...habitsToPush.map((habit) => upsertHabit(habit)),
        ...(Object.keys(settingsToPush).length > 0
          ? [updateSettings(settingsToPush)]
          : []),
      ]);

      clearLocalData();
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Đồng bộ thất bại");
      setStatus("error");
    }
  }, []);

  if (status === "hidden" || status === "checking") return null;

  return (
    <div className="fixed bottom-3 right-3 left-3 z-50 rounded-xl border border-border-card bg-surface p-3 shadow-lg sm:left-auto sm:max-w-xs">
      <div className="flex items-start gap-2">
        <CloudUpload className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div className="min-w-0 flex-1 text-xs sm:text-sm">
          {status === "ready" && (
            <>
              <p className="font-medium text-foreground">Đồng bộ lên cloud?</p>
              <p className="mt-0.5 text-xs text-muted">
                Phát hiện dữ liệu cũ ở trình duyệt: {counts.tasks} task
                {counts.habits > 0 && `, ${counts.habits} thói quen`}
                {counts.settings && ", settings"}.
              </p>
            </>
          )}
          {status === "syncing" && (
            <p className="text-muted">Đang đồng bộ…</p>
          )}
          {status === "done" && (
            <>
              <p className="font-medium text-foreground">Đã đồng bộ xong.</p>
              <p className="mt-0.5 text-xs text-muted">
                Dữ liệu cũ trong trình duyệt đã được xoá.
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <p className="font-medium text-rose-500">Lỗi đồng bộ</p>
              <p className="mt-0.5 text-xs text-muted">{errorMsg}</p>
            </>
          )}
        </div>
      </div>

      {(status === "ready" || status === "error") && (
        <div className="mt-2 flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={() => void handleSync()}
          >
            {status === "error" ? "Thử lại" : "Đồng bộ lên cloud"}
          </Button>
        </div>
      )}
    </div>
  );
}
