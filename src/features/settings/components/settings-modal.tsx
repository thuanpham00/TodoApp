import { Moon, MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Settings, ThemeMode } from "../types/settings";
import AccentPicker from "./accent-picker";
import BackgroundPicker from "./background-picker";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

interface ThemeOption {
  key: ThemeMode;
  label: string;
  icon: typeof Sun;
}

const THEME_OPTIONS: ThemeOption[] = [
  { key: "light", label: "Sáng", icon: Sun },
  { key: "dark", label: "Tối", icon: Moon },
  { key: "auto", label: "Tự động", icon: MoonStar },
];

export default function SettingsModal({
  open,
  onOpenChange,
  settings,
  onChange,
}: SettingsModalProps) {
  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ boardName: event.target.value });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-clean max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
          <DialogDescription>
            Tuỳ chỉnh tên board, giao diện, màu chủ đạo và ảnh nền.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="board-name">Tên board</Label>
            <Input
              id="board-name"
              value={settings.boardName}
              onChange={handleNameChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Giao diện</Label>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((option) => {
                const isActive = settings.theme === option.key;
                const Icon = option.icon;

                return (
                  <Button
                    key={option.key}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => onChange({ theme: option.key })}
                  >
                    <Icon />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Màu chủ đạo</Label>
            <AccentPicker
              value={settings.accentColor}
              onChange={(accentColor) => onChange({ accentColor })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ảnh nền</Label>
            <BackgroundPicker
              value={settings.background}
              onChange={(background) => onChange({ background })}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
