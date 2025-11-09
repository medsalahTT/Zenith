import { openDB } from 'idb';
import { Task, Goal } from './types';

const DB_NAME = 'zenith-focus';
const DB_VERSION = 1;
const TASK_STORE = 'tasks';
const GOAL_STORE = 'goals';
const MIGRATION_KEY = 'zenith-focus-migrated';

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(TASK_STORE)) {
      db.createObjectStore(TASK_STORE, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(GOAL_STORE)) {
      db.createObjectStore(GOAL_STORE, { keyPath: 'id' });
    }
  },
});

export const migrateFromLocalStorage = async () => {
  const migrated = localStorage.getItem(MIGRATION_KEY);
  if (migrated) {
    return;
  }

  const db = await dbPromise;

  const storedTasks = localStorage.getItem('tasks');
  if (storedTasks) {
    const tasks = JSON.parse(storedTasks).map((task: any) => {
      const migratedTask = { ...task };
      if (typeof task.isCompleted === 'boolean') {
        delete migratedTask.isCompleted;
        migratedTask.completedOn = [];
      }
      if (!task.deletedOn) {
        migratedTask.deletedOn = [];
      }
      return migratedTask;
    });

    const tx = db.transaction(TASK_STORE, 'readwrite');
    await Promise.all(tasks.map((task: Task) => tx.store.put(task)));
    await tx.done;
  }

  const storedGoals = localStorage.getItem('goals');
  if (storedGoals) {
    const goals = JSON.parse(storedGoals);
    const tx = db.transaction(GOAL_STORE, 'readwrite');
    await Promise.all(goals.map((goal: Goal) => tx.store.put(goal)));
    await tx.done;
  }

  localStorage.setItem(MIGRATION_KEY, 'true');
};

export const getTasks = async (): Promise<Task[]> => {
  return (await dbPromise).getAll(TASK_STORE);
};

export const addTask = async (task: Task) => {
  return (await dbPromise).put(TASK_STORE, task);
};

export const deleteTask = async (id: string) => {
  return (await dbPromise).delete(TASK_STORE, id);
};

export const getGoals = async (): Promise<Goal[]> => {
  return (await dbPromise).getAll(GOAL_STORE);
};

export const addGoal = async (goal: Goal) => {
  return (await dbPromise).put(GOAL_STORE, goal);
};

export const deleteGoal = async (id: string) => {
  return (await dbPromise).delete(GOAL_STORE, id);
};
