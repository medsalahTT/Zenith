import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStartTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  selectedDate: Date;
  isPastDate: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDelete, onEdit, onStartTimer, onResetTimer, selectedDate, isPastDate }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="text-xl font-semibold text-gray-400">No tasks for this day.</h3>
        <p className="text-gray-500 mt-2">Ready to be productive? Add a new task!</p>
      </div>
    );
  }

  const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  
  const completedTasks = tasks.filter(t => t.completedOn?.includes(dateString));
  const incompleteTasks = tasks.filter(t => !t.completedOn?.includes(dateString));

  return (
    <div className="space-y-4">
        {incompleteTasks.map((task) => {
            const timeSpentToday = task.timeSpent?.[dateString] || 0;
            return (
                <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onStartTimer={onStartTimer}
                onResetTimer={onResetTimer}
                isCompletedToday={false}
                isPastDate={isPastDate}
                timeSpentToday={timeSpentToday}
                />
            );
        })}

        {completedTasks.length > 0 && incompleteTasks.length > 0 && <hr className="border-gray-700 my-6"/>}

        {completedTasks.map((task) => {
            const timeSpentToday = task.timeSpent?.[dateString] || 0;
             return (
                <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onStartTimer={onStartTimer}
                onResetTimer={onResetTimer}
                isCompletedToday={true}
                isPastDate={isPastDate}
                timeSpentToday={timeSpentToday}
                />
             );
        })}
    </div>
  );
};

export default React.memo(TaskList);