import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/utils/cn";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Dùng stylesheet gốc của react-day-picker (layout chuẩn) + class "rdp-themed"
// để override màu/brand qua CSS variables trong index.css.
function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("rdp-themed p-3", className)}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
