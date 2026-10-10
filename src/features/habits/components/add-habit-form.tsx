import { Plus } from "lucide-react";
import { useState } from "react";
import { IconButton } from "../../../components/icon-button";

interface AddHabitFormProps {
  onAdd: (name: string) => void;
}

export default function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [name, setName] = useState("");

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!name.trim()) return;

    onAdd(name);
    setName("");
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={name}
        onChange={handleChange}
        placeholder="Thêm thói quen mới…"
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none"
      />
      <IconButton
        type="submit"
        icon={Plus}
        label="Thêm thói quen"
        disabled={!name.trim()}
        className="h-9 w-9 rounded-full bg-brand text-white hover:bg-brand-hover hover:text-white"
      />
    </form>
  );
}
