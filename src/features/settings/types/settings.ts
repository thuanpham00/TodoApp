export type ThemeMode = "light" | "dark" | "auto";

export type ResolvedTheme = "light" | "dark";

export type AccentColorKey =
  | "emerald"
  | "blue"
  | "violet"
  | "rose"
  | "amber"
  | "slate";

export interface Settings {
  boardName: string;
  theme: ThemeMode;
  accentColor: AccentColorKey;
  background: string; // id ảnh nền, "none" = trơn
}
