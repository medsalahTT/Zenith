import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import GoalList, { GoalWithProgress } from './components/GoalList';
import GoalForm from './components/GoalForm';
import { Task, DayOfWeek, DAYS_OF_WEEK, Goal } from './types';
import { PlusIcon } from './constants';
import Header from './components/Header';
import Stats from './components/Stats';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      // Migration for old data structures
      return parsedTasks.map((task: any) => {
        const migratedTask = { ...task };
        if (typeof task.isCompleted === 'boolean') {
          delete migratedTask.isCompleted;
          migratedTask.completedOn = [];
        }
        if (!task.deletedOn) {
          migratedTask.deletedOn = [];
        }
        return migratedTask;
      })
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
      return [];
    }
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const storedGoals = localStorage.getItem('goals');
      return storedGoals ? JSON.parse(storedGoals) : [];
    } catch (error) {
      console.error("Failed to load goals from localStorage", error);
      return [];
    }
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [currentView, setCurrentView] = useState<'tasks' | 'goals' | 'stats'>('tasks');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);


  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('goals', JSON.stringify(goals));
    } catch (error) {
      console.error("Failed to save goals to localStorage", error);
    }
  }, [goals]);

  const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'completedOn' | 'createdAt' | 'deletedOn'>, id?: string) => {
    if (id) {
      // Editing existing task
      setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, ...taskData } : t));
    } else {
      // Adding new task
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        completedOn: [],
        deletedOn: [],
        createdAt: Date.now(),
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
  }, []);
  
  const handleToggleComplete = useCallback((id: string) => {
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === id) {
        const completedOn = t.completedOn || [];
        const isCompleted = completedOn.includes(dateString);
        const newCompletedOn = isCompleted
          ? completedOn.filter(d => d !== dateString)
          : [...completedOn, dateString];
        return { ...t, completedOn: newCompletedOn };
      }
      return t;
    }));
  }, [selectedDate]);

  const handleDeleteRequest = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTaskToDelete(task);
    }
  }, [tasks]);

  const handleDeleteForToday = useCallback(() => {
    if (!taskToDelete) return;
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskToDelete.id) {
        const deletedOn = t.deletedOn || [];
        if (!deletedOn.includes(dateString)) {
            return { ...t, deletedOn: [...deletedOn, dateString] };
        }
      }
      return t;
    }));
    setTaskToDelete(null);
  }, [taskToDelete, selectedDate]);

  const handleDeleteAll = useCallback(() => {
    if (!taskToDelete) return;
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskToDelete.id));
    setTaskToDelete(null);
  }, [taskToDelete]);

  const handleCloseDeleteDialog = useCallback(() => {
    setTaskToDelete(null);
  }, []);

  const handleOpenEditForm = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  }, []);

  const handleOpenAddForm = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleUpsertGoal = useCallback((goalData: Omit<Goal, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goalData } : g));
    } else {
      const newGoal: Goal = {
        ...goalData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setGoals(prev => [...prev, newGoal]);
    }
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this goal? This will unlink it from all associated tasks.')) {
        setGoals(prev => prev.filter(g => g.id !== id));
        // Unlink tasks
        setTasks(prev => prev.map(t => t.goalId === id ? { ...t, goalId: undefined } : t));
    }
  }, []);

  const handleOpenAddGoalForm = () => {
    setEditingGoal(null);
    setIsGoalFormOpen(true);
  };

  const handleOpenEditGoalForm = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalFormOpen(true);
  }, []);

  const handleCloseGoalForm = () => {
    setIsGoalFormOpen(false);
    setEditingGoal(null);
  };

  const tasksForSelectedDay = useMemo(() => {
    const dayOfWeek: DayOfWeek = DAYS_OF_WEEK[selectedDate.getDay()];
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const selectedDateStartOfDay = new Date(selectedDate);
    selectedDateStartOfDay.setHours(0,0,0,0);

    return tasks.filter(task => {
      // Rule 1: Exclude if explicitly deleted for this day
      if (task.deletedOn?.includes(dateString)) {
        return false;
      }
      
      const taskCreatedAt = new Date(task.createdAt);
      taskCreatedAt.setHours(0,0,0,0);
      
      // Rule 2: Determine if today is a scheduled day for this task
      const isRepeatDay = task.repeatDays.includes(dayOfWeek);
      const isSpecificDate = task.dates.includes(dateString);

      if (!isRepeatDay && !isSpecificDate) {
          return false; // Not scheduled for today
      }

      // Rule 3: For repeating tasks, ensure they don't appear in the past
      if (isRepeatDay && selectedDateStartOfDay < taskCreatedAt) {
          return false;
      }
      
      // If we reach here, the task is scheduled for today and not excluded
      return true;

    }).sort((a,b) => a.createdAt - b.createdAt);
  }, [tasks, selectedDate]);

  const goalsWithProgress: GoalWithProgress[] = useMemo(() => {
    const achievedDurations = new Map<string, number>();
    tasks.forEach(task => {
        if (task.goalId && task.completedOn.length > 0) {
            const current = achievedDurations.get(task.goalId) || 0;
            achievedDurations.set(task.goalId, current + (task.duration * task.completedOn.length));
        }
    });
    
    return goals.map(goal => ({
        ...goal,
        achievedDuration: achievedDurations.get(goal.id) || 0,
    })).sort((a,b) => a.createdAt - b.createdAt);
  }, [tasks, goals]);

  const productivityStats = useMemo(() => {
    const totalCompletions = tasks.reduce((sum, task) => sum + task.completedOn.length, 0);
    const totalTimeFocused = tasks.reduce((sum, task) => sum + (task.duration * task.completedOn.length), 0);
    
    const tasksCompleted = totalCompletions;
    const avgSessionDuration = tasksCompleted > 0 ? totalTimeFocused / tasksCompleted : 0;
    
    const goalsAchieved = goalsWithProgress.filter(goal => goal.achievedDuration >= goal.targetDuration).length;
    const totalGoals = goals.length;

    const completedTasksDetailed = tasks
        .filter(task => task.completedOn.length > 0)
        .map(task => ({
            id: task.id,
            title: task.title,
            completionCount: task.completedOn.length,
            totalDuration: task.duration * task.completedOn.length,
        }))
        .sort((a, b) => b.totalDuration - a.totalDuration);

    return {
        totalTimeFocused,
        tasksCompleted,
        avgSessionDuration,
        goalsAchieved,
        totalGoals,
        completedTasksDetailed,
    };
  }, [tasks, goals, goalsWithProgress]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, []);
  const isPastDate = selectedDate < today;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'tasks' && (
           <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1 space-y-8">
              <Calendar 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate}
                tasks={tasks}
              />
            </aside>
            <section className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </h2>
                  <p className="text-gray-400">
                    {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={handleOpenAddForm}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Task
                </button>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 min-h-[60vh]">
                <TaskList 
                  tasks={tasksForSelectedDay} 
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteRequest}
                  onEdit={handleOpenEditForm}
                  selectedDate={selectedDate}
                  isPastDate={isPastDate}
                />
              </div>
            </section>
          </main>
        )}
        
        {currentView === 'goals' && (
            <main>
                <GoalList 
                    goals={goalsWithProgress}
                    onAddGoal={handleOpenAddGoalForm}
                    onEditGoal={handleOpenEditGoalForm}
                    onDeleteGoal={handleDeleteGoal}
                />
            </main>
        )}

        {currentView === 'stats' && (
            <main>
                <Stats stats={productivityStats} />
            </main>
        )}
      </div>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddTask}
        initialTask={editingTask}
        selectedDate={selectedDate}
        goals={goals}
      />
      <GoalForm
        isOpen={isGoalFormOpen}
        onClose={handleCloseGoalForm}
        onSubmit={handleUpsertGoal}
        initialGoal={editingGoal}
      />
      <DeleteConfirmationDialog
        task={taskToDelete}
        selectedDate={selectedDate}
        onClose={handleCloseDeleteDialog}
        onDeleteToday={handleDeleteForToday}
        onDeleteAll={handleDeleteAll}
      />
    </div>
  );
};

export default App;