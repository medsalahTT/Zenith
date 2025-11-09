import React from 'react';
import { Task } from '../types';
import { EditIcon, TrashIcon, PlayIcon, RotateCwIcon } from '../constants';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStartTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  isCompletedToday: boolean;
  isPastDate: boolean;
  timeSpentToday: number; // in seconds
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onEdit, onStartTimer, onResetTimer, isCompletedToday, isPastDate, timeSpentToday }) => {
  const remainingSeconds = (task.duration * 60) - timeSpentToday;
  const hasBeenStarted = timeSpentToday > 0;

  const formatTime = (seconds: number) => {
    if (seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return (
    <div className={`p-4 rounded-lg transition-all duration-300 ${isCompletedToday ? 'bg-gray-800/50' : 'bg-gray-800'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isCompletedToday}
            onChange={() => onToggleComplete(task.id)}
            className="mt-1 h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPastDate}
            aria-label={`Mark task ${task.title} as ${isCompletedToday ? 'incomplete' : 'complete'}`}
          />
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${isCompletedToday ? 'line-through text-gray-500' : 'text-gray-100'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 break-words ${isCompletedToday ? 'text-gray-600' : 'text-gray-400'}`}>
                {task.description}
              </p>
            )}
            {hasBeenStarted && !isCompletedToday && (
              <div className="mt-2 text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-1 rounded-md inline-block">
                  Time Remaining: {formatTime(remainingSeconds)}
              </div>
            )}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
             {hasBeenStarted && !isCompletedToday && !isPastDate && (
              <button
                onClick={() => onResetTimer(task.id)}
                className="p-2 rounded-full bg-gray-700 text-gray-400 hover:bg-yellow-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label={`Reset timer for ${task.title}`}
              >
                <RotateCwIcon className="h-5 w-5" />
              </button>
            )}
             {!isCompletedToday && !isPastDate && (
                <button 
                    onClick={() => onStartTimer(task.id)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label={`Start timer for ${task.title}`}
                >
                    <PlayIcon className="h-5 w-5" />
                </button>
             )}
        </div>
      </div>
      <div className="flex justify-end items-center space-x-3 mt-4">
        <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-indigo-400 transition-colors p-1" aria-label={`Edit task ${task.title}`}>
            <EditIcon className="h-5 w-5"/>
        </button>
        <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1" aria-label={`Delete task ${task.title}`}>
            <TrashIcon className="h-5 w-5"/>
        </button>
      </div>
    </div>
  );
};

export default React.memo(TaskItem);