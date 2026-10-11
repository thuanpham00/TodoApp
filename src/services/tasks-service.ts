import { supabase } from "@/lib/supabase";
import type { Task } from "@/features/todo/types/task";

interface TaskRow {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  due_time: string | null;
  status: Task["status"];
  important: boolean;
  scope: Task["scope"];
  estimate_minutes: number | null;
  created_at: string;
  completed_at: string | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    dueTime: row.due_time ? row.due_time.slice(0, 5) : null,
    status: row.status,
    important: row.important,
    scope: row.scope,
    estimateMinutes: row.estimate_minutes ?? null,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

function taskToRow(task: Task): TaskRow {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    due_date: task.dueDate,
    due_time: task.dueTime ? `${task.dueTime}:00` : null,
    status: task.status,
    important: task.important,
    scope: task.scope,
    estimate_minutes: task.estimateMinutes,
    created_at: task.createdAt,
    completed_at: task.completedAt,
  };
}

export async function fetchAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToTask);
}

export async function upsertTask(task: Task): Promise<void> {
  const { error } = await supabase.from("tasks").upsert(taskToRow(task));
  if (error) throw error;
}

export async function deleteTaskById(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
