import { useCallback, useEffect, useState } from "react";
import type { Habit } from "../types/habit";
import {
  deleteHabitById,
  fetchAllHabits,
  upsertHabit,
} from "@/services/habits-service";

interface UseHabitsResult {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  addHabit: (name: string) => Promise<void>;
  renameHabit: (id: string, name: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
}

export function useHabits(): UseHabitsResult {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchAllHabits()
      .then((loaded) => {
        if (!isMounted) return;
        setHabits(loaded);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Không tải được habits");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const addHabit = useCallback(
    async function addHabit(name: string): Promise<void> {
      const trimmed = name.trim();
      if (!trimmed) return;

      const newHabit: Habit = { id: crypto.randomUUID(), name: trimmed };
      setHabits((prev) => [...prev, newHabit]);
      try {
        await upsertHabit(newHabit);
      } catch (err) {
        setHabits((prev) => prev.filter((h) => h.id !== newHabit.id));
        throw err;
      }
    },
    [],
  );

  const renameHabit = useCallback(
    async function renameHabit(id: string, name: string): Promise<void> {
      const trimmed = name.trim();
      if (!trimmed) return;

      let nextHabit: Habit | null = null;
      const prevSnapshot = habits;

      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== id) return habit;
          nextHabit = { ...habit, name: trimmed };
          return nextHabit;
        }),
      );

      if (!nextHabit) return;

      try {
        await upsertHabit(nextHabit);
      } catch (err) {
        setHabits(prevSnapshot);
        throw err;
      }
    },
    [habits],
  );

  const deleteHabit = useCallback(
    async function deleteHabit(id: string): Promise<void> {
      const prevSnapshot = habits;
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
      try {
        await deleteHabitById(id);
      } catch (err) {
        setHabits(prevSnapshot);
        throw err;
      }
    },
    [habits],
  );

  return {
    habits,
    isLoading,
    error,
    addHabit,
    renameHabit,
    deleteHabit,
  };
}
