import { supabase } from "@/lib/supabase";
import type { Habit } from "@/features/habits/types/habit";

interface HabitRow {
  id: string;
  name: string;
}

export async function fetchAllHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row: HabitRow) => ({ id: row.id, name: row.name }));
}

export async function upsertHabit(habit: Habit): Promise<void> {
  const { error } = await supabase
    .from("habits")
    .upsert({ id: habit.id, name: habit.name });
  if (error) throw error;
}

export async function deleteHabitById(id: string): Promise<void> {
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw error;
}
