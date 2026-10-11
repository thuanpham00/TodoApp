import { supabase } from "@/lib/supabase";
import type {
  AccentColorKey,
  Settings,
  ThemeMode,
} from "@/features/settings/types/settings";
import { DEFAULT_SETTINGS } from "@/features/settings/constants/settings-options";

interface SettingsRow {
  id: number;
  board_name: string;
  theme: string;
  accent_color: string;
  background: string;
}

function rowToSettings(row: SettingsRow): Settings {
  return {
    boardName: row.board_name,
    theme: (row.theme as ThemeMode) ?? DEFAULT_SETTINGS.theme,
    accentColor: (row.accent_color as AccentColorKey) ?? DEFAULT_SETTINGS.accentColor,
    background: row.background ?? DEFAULT_SETTINGS.background,
  };
}

function isThemeMode(v: string): v is ThemeMode {
  return v === "light" || v === "dark" || v === "auto";
}

function isAccentKey(v: string): v is AccentColorKey {
  return (
    v === "emerald" ||
    v === "blue" ||
    v === "violet" ||
    v === "rose" ||
    v === "amber" ||
    v === "slate"
  );
}

function patchToRow(patch: Partial<Settings>): Partial<SettingsRow> {
  const row: Partial<SettingsRow> = {};

  if (patch.boardName !== undefined) {
    row.board_name = patch.boardName;
  }
  if (patch.theme !== undefined) {
    row.theme = isThemeMode(patch.theme) ? patch.theme : DEFAULT_SETTINGS.theme;
  }
  if (patch.accentColor !== undefined) {
    row.accent_color = isAccentKey(patch.accentColor)
      ? patch.accentColor
      : DEFAULT_SETTINGS.accentColor;
  }
  if (patch.background !== undefined) {
    row.background = patch.background;
  }

  return row;
}

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return DEFAULT_SETTINGS;
  return rowToSettings(data as SettingsRow);
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const row = patchToRow(patch);
  if (Object.keys(row).length === 0) return;

  const { error } = await supabase
    .from("settings")
    .update(row)
    .eq("id", 1);

  if (error) throw error;
}
