import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { useTimer } from './hooks/useTimer';
import FocusView from './components/FocusView';

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
        if (!task.timeSpent) {
            migratedTask.timeSpent = {};
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
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState(0);

  const tasksRef = useRef(tasks);
  const justResetTaskIdRef = useRef<string | null>(null);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);


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

  const activeTaskForTimer = useMemo(
    () => tasks.find(t => t.id === activeTimerTaskId),
    [tasks, activeTimerTaskId]
  );
  
  const handleTimerEnd = useCallback(() => {
    if (activeTaskForTimer) {
        const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        setTasks(prevTasks => prevTasks.map(t => {
            if (t.id === activeTaskForTimer.id) {
                const completedOn = t.completedOn || [];
                const newCompletedOn = completedOn.includes(dateString) ? completedOn : [...completedOn, dateString];
                
                // On timer end, mark the full duration as spent for that day
                const newTimeSpent = { ...(t.timeSpent || {}) };
                newTimeSpent[dateString] = t.duration * 60;

                return { ...t, completedOn: newCompletedOn, timeSpent: newTimeSpent };
            }
            return t;
        }));
    }
    setActiveTimerTaskId(null);
  }, [activeTaskForTimer, selectedDate]);
  
  const { timeLeft, isRunning, start, pause } = useTimer({
    initialSeconds: timerInitialSeconds,
    onEnd: handleTimerEnd,
  });

  const memoizedPauseHandler = useCallback(() => {
    if (!activeTaskForTimer) return;

    const timeElapsedThisSession = timerInitialSeconds - timeLeft;
    
    if (timeElapsedThisSession > 0) {
        const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        
        setTasks(prevTasks => prevTasks.map(t => {
            if (t.id === activeTaskForTimer.id) {
                const timeSpent = t.timeSpent || {};
                const timeAlreadySpent = timeSpent[dateString] || 0;
                const newTotalTimeSpent = timeAlreadySpent + timeElapsedThisSession;
                return {
                    ...t,
                    timeSpent: {
                        ...timeSpent,
                        [dateString]: newTotalTimeSpent
                    }
                };
            }
            return t;
        }));
    }

    pause();
    setActiveTimerTaskId(null);
  }, [pause, activeTaskForTimer, timerInitialSeconds, timeLeft, selectedDate]);


  useEffect(() => {
    if (activeTimerTaskId && !isRunning) {
      start();
    }
  }, [activeTimerTaskId, isRunning, start]);

  const handleStartTimer = useCallback((taskId: string) => {
    const task = tasksRef.current.find(t => t.id === taskId);
    if (!task) return;

    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    let timeSpentToday = task.timeSpent?.[dateString] || 0;

    // If the task was just reset, ignore any stale timeSpent data from state and start from scratch.
    if (justResetTaskIdRef.current === taskId) {
      timeSpentToday = 0;
      justResetTaskIdRef.current = null; // Consume the flag so it only applies once
    }

    const remainingSeconds = (task.duration * 60) - timeSpentToday;

    if (remainingSeconds > 0) {
        setTimerInitialSeconds(Math.round(remainingSeconds));
        setActiveTimerTaskId(taskId);
    }
  }, [selectedDate]);

  const handleResetTimer = useCallback((taskId: string) => {
    if (taskId === activeTimerTaskId) {
        pause();
        setActiveTimerTaskId(null);
    }
    
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const newTimeSpent = { ...(t.timeSpent || {}) };
        delete newTimeSpent[dateString];
        return { ...t, timeSpent: newTimeSpent };
      }
      return t;
    }));

    // Set a flag to communicate to handleStartTimer that this task should start from 0,
    // overcoming the stale state in case of a rapid reset-and-start action.
    justResetTaskIdRef.current = taskId;
  }, [selectedDate, activeTimerTaskId, pause]);


  const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'completedOn' | 'createdAt' | 'deletedOn' | 'timeSpent'>, id?: string) => {
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
        timeSpent: {},
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
  }, []);
  
  const handleToggleComplete = useCallback((id: string) => {
    if (id === activeTimerTaskId) {
        memoizedPauseHandler();
    }
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === id) {
        const completedOn = t.completedOn || [];
        const isCompleted = completedOn.includes(dateString);
        const newCompletedOn = isCompleted
          ? completedOn.filter(d => d !== dateString)
          : [...completedOn, dateString];
        
        // Reset time spent for the day if toggling completion
        const newTimeSpent = { ...(t.timeSpent || {}) };
        if (!isCompleted) { // if we are marking it as complete
            newTimeSpent[dateString] = t.duration * 60; // mark as fully spent
        } else { // if we are un-marking it
            delete newTimeSpent[dateString];
        }

        return { ...t, completedOn: newCompletedOn, timeSpent: newTimeSpent };
      }
      return t;
    }));
  }, [selectedDate, activeTimerTaskId, memoizedPauseHandler]);

  const handleDeleteRequest = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTaskToDelete(task);
    }
  }, [tasks]);

  const handleDeleteForToday = useCallback(() => {
    if (!taskToDelete) return;
     if (taskToDelete.id === activeTimerTaskId) {
        memoizedPauseHandler();
    }
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskToDelete.id) {
        const deletedOn = t.deletedOn || [];
        const newTimeSpent = { ...(t.timeSpent || {}) };
        delete newTimeSpent[dateString];
        if (!deletedOn.includes(dateString)) {
            return { ...t, deletedOn: [...deletedOn, dateString], timeSpent: newTimeSpent };
        }
      }
      return t;
    }));
    setTaskToDelete(null);
  }, [taskToDelete, selectedDate, activeTimerTaskId, memoizedPauseHandler]);

  const handleDeleteAll = useCallback(() => {
    if (!taskToDelete) return;
    if (taskToDelete.id === activeTimerTaskId) {
        memoizedPauseHandler();
    }
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskToDelete.id));
    setTaskToDelete(null);
  }, [taskToDelete, activeTimerTaskId, memoizedPauseHandler]);

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
    const achievedDurations = new Map<string, number>(); // in seconds
    tasks.forEach(task => {
        if (task.goalId) {
            const taskTotalSeconds = Object.values(task.timeSpent || {}).reduce((sum, seconds) => sum + seconds, 0);
            if (taskTotalSeconds > 0) {
                 const current = achievedDurations.get(task.goalId) || 0;
                 achievedDurations.set(task.goalId, current + taskTotalSeconds);
            }
        }
    });
    
    return goals.map(goal => ({
        ...goal,
        // convert achieved seconds to minutes for comparison with target
        achievedDuration: (achievedDurations.get(goal.id) || 0) / 60,
    })).sort((a,b) => a.createdAt - b.createdAt);
  }, [tasks, goals]);

  const productivityStats = useMemo(() => {
    let totalSecondsFocused = 0;
    const completedTasksDetailedMap = new Map<string, { title: string; completionCount: number; totalSeconds: number }>();

    tasks.forEach(task => {
        const taskTotalSeconds = Object.values(task.timeSpent || {}).reduce((sum, seconds) => sum + seconds, 0);
        totalSecondsFocused += taskTotalSeconds;

        if (task.completedOn.length > 0 || taskTotalSeconds > 0) {
            if (!completedTasksDetailedMap.has(task.id)) {
                completedTasksDetailedMap.set(task.id, {
                    title: task.title,
                    completionCount: 0,
                    totalSeconds: 0,
                });
            }
            const stat = completedTasksDetailedMap.get(task.id)!;
            stat.completionCount = task.completedOn.length;
            stat.totalSeconds = taskTotalSeconds;
        }
    });
    
    const totalTimeFocusedInMinutes = totalSecondsFocused / 60;
    const tasksCompleted = tasks.reduce((sum, task) => sum + task.completedOn.length, 0);
    const avgSessionDuration = tasksCompleted > 0 ? totalTimeFocusedInMinutes / tasksCompleted : 0;
    
    const goalsAchieved = goalsWithProgress.filter(goal => goal.achievedDuration >= goal.targetDuration).length;
    const totalGoals = goals.length;

    const completedTasksDetailed = Array.from(completedTasksDetailedMap.entries())
        .map(([id, data]) => ({
            id,
            title: data.title,
            completionCount: data.completionCount,
            totalDuration: data.totalSeconds / 60, // convert to minutes
        }))
        .sort((a, b) => b.totalDuration - a.totalDuration);

    return {
        totalTimeFocused: totalTimeFocusedInMinutes,
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
                  onStartTimer={handleStartTimer}
                  onResetTimer={handleResetTimer}
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
      {activeTaskForTimer && (
        <FocusView
            task={activeTaskForTimer}
            timeLeft={timeLeft}
            onPause={memoizedPauseHandler}
        />
      )}
    </div>
  );
};

export default App;