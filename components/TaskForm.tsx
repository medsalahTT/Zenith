import React, { useState, useEffect } from 'react';
import { Task, DayOfWeek, DAYS_OF_WEEK, Goal } from '../types';
import { XIcon } from '../constants';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'completedOn' | 'createdAt' | 'deletedOn' | 'timeSpent'>, id?: string) => void;
  initialTask?: Task | null;
  selectedDate: Date;
  goals: Goal[];
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, initialTask, selectedDate, goals }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(25);
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [goalId, setGoalId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDuration(initialTask.duration);
      setRepeatDays(initialTask.repeatDays);
      setDates(initialTask.dates);
      setGoalId(initialTask.goalId);
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setDuration(25);
      setRepeatDays([]);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDates([`${year}-${month}-${day}`]);
      setGoalId(undefined);
    }
  }, [initialTask, isOpen, selectedDate]);

  const handleRepeatDayToggle = (day: DayOfWeek) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || duration <= 0) {
      alert('Please provide a valid title and duration.');
      return;
    }

    const finalDates = dates.length > 0 ? dates : [];

    onSubmit(
      { title, description, duration, repeatDays, dates: finalDates, goalId: goalId || undefined },
      initialTask?.id
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6">{initialTask ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Task Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duration (minutes)</label>
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              min="1"
              required
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-300">Repeat on</span>
            <div className="mt-2 grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleRepeatDayToggle(day)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    repeatDays.includes(day)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
             {repeatDays.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">No repeat days selected. This task will only occur on the date(s) specified below.</p>
             )}
          </div>
           <div>
            <label htmlFor="goalId" className="block text-sm font-medium text-gray-300">Link to Goal (Optional)</label>
            <select
              id="goalId"
              value={goalId || ''}
              onChange={(e) => setGoalId(e.target.value || undefined)}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
            >
              <option value="">No Goal</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {initialTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
