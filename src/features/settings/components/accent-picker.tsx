import { Check } from "lucide-react";
import { cn } from "../../../utils/cn";
import { ACCENT_OPTIONS } from "../constants/settings-options";
import type { AccentColorKey } from "../types/settings";

interface AccentPickerProps {
  value: AccentColorKey;
  onChange: (value: AccentColorKey) => void;
}

export default function AccentPicker({ value, onChange }: AccentPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {ACCENT_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.key)}
          style={{ backgroundColor: option.base }}
          className={cn(
            "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-transform",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
            option.key === value &&
              "ring-2 ring-foreground ring-offset-2 ring-offset-surface",
          )}
        >
          {option.key === value && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}
