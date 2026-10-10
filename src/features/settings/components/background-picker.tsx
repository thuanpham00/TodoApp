import { cn } from "../../../utils/cn";
import { BACKGROUND_OPTIONS } from "../constants/settings-options";

interface BackgroundPickerProps {
  value: string;
  onChange: (id: string) => void;
}

export default function BackgroundPicker({
  value,
  onChange,
}: BackgroundPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {BACKGROUND_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "relative flex h-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-background ring-1 ring-border-card",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            option.id === value &&
              "ring-2 ring-brand ring-offset-2 ring-offset-surface",
          )}
        >
          {option.thumbUrl ? (
            <img
              src={option.thumbUrl}
              alt={option.label}
              width={240}
              height={160}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-muted">
              {option.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
