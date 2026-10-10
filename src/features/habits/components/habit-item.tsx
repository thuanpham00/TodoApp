import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { IconButton } from "../../../components/icon-button";
import type { Habit } from "../types/habit";

interface HabitItemProps {
  habit: Habit;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function HabitItem({
  habit,
  onRename,
  onDelete,
}: HabitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(habit.name);

  function startEdit(): void {
    setDraft(habit.name);
    setIsEditing(true);
  }

  function commit(): void {
    onRename(habit.id, draft);
    setIsEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") commit();
    if (event.key === "Escape") setIsEditing(false);
  }

  return (
    <li className="group flex items-center gap-3 rounded-lg px-1 py-2">
      {isEditing ? (
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={startEdit}
          title={habit.name}
          className="min-w-0 flex-1 cursor-text truncate text-left text-sm font-medium text-foreground transition-colors"
        >
          {habit.name}
        </button>
      )}

      <div className="flex items-center gap-0.5">
        <IconButton
          icon={Pencil}
          label="Sửa thói quen"
          onClick={startEdit}
          className="pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
        />
        <IconButton
          icon={Trash2}
          label="Xoá thói quen"
          onClick={() => onDelete(habit.id)}
          className="pointer-events-none opacity-0 transition-opacity hover:text-rose-500 group-hover:pointer-events-auto group-hover:opacity-100"
        />
      </div>
    </li>
  );
}
