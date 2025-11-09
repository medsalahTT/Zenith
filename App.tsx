import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { Task, DayOfWeek, DAYS_OF_WEEK } from './types';
import { PlusIcon } from './constants';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
      return [];
    }
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'isCompleted' | 'createdAt'>, id?: string) => {
    if (id) {
      // Editing existing task
      setTasks(tasks.map(t => t.id === id ? { ...t, ...taskData } : t));
    } else {
      // Adding new task
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        isCompleted: false,
        createdAt: Date.now(),
      };
      setTasks([...tasks, newTask]);
    }
  };
  
  const handleToggleComplete = useCallback((id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  }, [tasks]);

  const handleDeleteTask = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        setTasks(tasks.filter(t => t.id !== id));
    }
  }, [tasks]);

  const handleOpenEditForm = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleOpenAddForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const tasksForSelectedDay = useMemo(() => {
    const dayOfWeek: DayOfWeek = DAYS_OF_WEEK[selectedDate.getDay()];
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    return tasks.filter(task => 
      task.dates.includes(dateString) || task.repeatDays.includes(dayOfWeek)
    ).sort((a,b) => a.createdAt - b.createdAt);
  }, [tasks, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white">Zenith Focus</h1>
          <p className="text-lg text-gray-400">Your daily dashboard for productivity.</p>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1">
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
                onDelete={handleDeleteTask}
                onEdit={handleOpenEditForm}
              />
            </div>
          </section>
        </main>
      </div>

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddTask}
        initialTask={editingTask}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default App;