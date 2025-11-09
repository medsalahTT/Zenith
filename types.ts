export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  completedOn: string[]; // YYYY-MM-DD format for each completion date
  repeatDays: DayOfWeek[];
  dates: string[]; // YYYY-MM-DD format
  createdAt: number; // timestamp
  goalId?: string;
  deletedOn: string[]; // YYYY-MM-DD format for dates this task is "deleted"
  timeSpent: { [date: string]: number }; // seconds spent per date (YYYY-MM-DD)
}

export interface Goal {
  id: string;
  name: string;
  targetDuration: number; // in minutes
  createdAt: number;
}
