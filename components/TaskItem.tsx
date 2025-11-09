import React from 'react';
import { Task } from '../types';
import Timer from './Timer';
import { EditIcon, TrashIcon } from '../constants';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isCompletedToday: boolean;
  isPastDate: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onEdit, isCompletedToday, isPastDate }) => {
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
          </div>
        </div>
        {!isCompletedToday && !isPastDate && <div className="ml-4"><Timer duration={task.duration} /></div>}
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
