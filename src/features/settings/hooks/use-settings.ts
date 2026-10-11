import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, getAccentOption, getBackgroundUrl, resolveTheme } from "../constants/settings-options";
import type { Settings } from "../types/settings";
import { fetchSettings, updateSettings } from "@/services/settings-service";

interface UseSettingsResult {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

function mergeDefaults(loaded: Settings): Settings {
  return { ...DEFAULT_SETTINGS, ...loaded };
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchSettings()
      .then((loaded) => {
        if (!isMounted) return;
        setSettings(mergeDefaults(loaded));
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Không tải được settings");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function applyTheme(): void {
      const resolved = resolveTheme(settings.theme, new Date().getHours());
      document.documentElement.classList.toggle("dark", resolved === "dark");
    }

    applyTheme();

    if (settings.theme !== "auto") return;

    const intervalId = window.setInterval(applyTheme, 60_000);
    return () => window.clearInterval(intervalId);
  }, [settings.theme]);

  useEffect(() => {
    const accent = getAccentOption(settings.accentColor);
    const root = document.documentElement;
    root.style.setProperty("--brand", accent.base);
    root.style.setProperty("--brand-hover", accent.hover);
  }, [settings.accentColor]);

  useEffect(() => {
    const url = getBackgroundUrl(settings.background);
    document.body.style.setProperty(
      "--bg-image",
      url ? `url("${url}")` : "none",
    );
  }, [settings.background]);

  const update = useCallback(
    async function update(patch: Partial<Settings>): Promise<void> {
      const prev = settings;
      const next = { ...settings, ...patch };
      setSettings(next);
      try {
        await updateSettings(patch);
      } catch (err) {
        setSettings(prev);
        throw err;
      }
    },
    [settings],
  );

  return {
    settings,
    isLoading,
    error,
    updateSettings: update,
  };
}
