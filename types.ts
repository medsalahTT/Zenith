export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  isCompleted: boolean;
  repeatDays: DayOfWeek[];
  dates: string[]; // YYYY-MM-DD format
  createdAt: number; // timestamp
}