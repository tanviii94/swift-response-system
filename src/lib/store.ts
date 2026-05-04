import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Food, FoodCategory } from "./foods";

export interface LogEntry {
  id: string;
  food: Food;
  servings: number;
  timestamp: number; // ms
}

export interface DayTotals {
  date: string; // yyyy-mm-dd
  calories: number;
}

interface ProfileState {
  name: string;
  email: string;
  goal: number;
  photo: string | null;
  theme: "green" | "blue" | "pink";
}

interface AppState {
  log: LogEntry[];
  profile: ProfileState;
  addEntry: (food: Food, servings: number) => void;
  removeEntry: (id: string) => void;
  clearToday: () => void;
  updateProfile: (p: Partial<ProfileState>) => void;
}

const todayKey = (ts: number) => new Date(ts).toISOString().slice(0, 10);

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      log: [],
      profile: {
        name: "Alex Doe",
        email: "alex@example.com",
        goal: 2000,
        photo: null,
        theme: "green",
      },
      addEntry: (food, servings) =>
        set((s) => ({
          log: [
            { id: crypto.randomUUID(), food, servings, timestamp: Date.now() },
            ...s.log,
          ],
        })),
      removeEntry: (id) => set((s) => ({ log: s.log.filter((e) => e.id !== id) })),
      clearToday: () => {
        const today = todayKey(Date.now());
        set((s) => ({ log: s.log.filter((e) => todayKey(e.timestamp) !== today) }));
      },
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
    }),
    { name: "food-cal-store" }
  )
);

export function getTodayEntries(log: LogEntry[]) {
  const today = todayKey(Date.now());
  return log.filter((e) => todayKey(e.timestamp) === today);
}

export function caloriesOf(e: LogEntry) {
  return Math.round(e.food.calories * e.servings);
}

export function sumCalories(entries: LogEntry[]) {
  return entries.reduce((acc, e) => acc + caloriesOf(e), 0);
}

export function caloriesByCategory(entries: LogEntry[]) {
  const map = new Map<FoodCategory, number>();
  for (const e of entries) {
    map.set(e.food.category, (map.get(e.food.category) ?? 0) + caloriesOf(e));
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function last7DaysTrend(log: LogEntry[]) {
  const days: { date: string; label: string; calories: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const cals = log
      .filter((e) => todayKey(e.timestamp) === key)
      .reduce((acc, e) => acc + caloriesOf(e), 0);
    days.push({
      date: key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      calories: cals,
    });
  }
  return days;
}
