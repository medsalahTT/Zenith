import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  selectedDate: Date;
  isPastDate: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDelete, onEdit, selectedDate, isPastDate }) => {
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
        {incompleteTasks.map((task) => (
            <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            isCompletedToday={false}
            isPastDate={isPastDate}
            />
        ))}

        {completedTasks.length > 0 && incompleteTasks.length > 0 && <hr className="border-gray-700 my-6"/>}

        {completedTasks.map((task) => (
            <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            isCompletedToday={true}
            isPastDate={isPastDate}
            />
        ))}
    </div>
  );
};

export default React.memo(TaskList);
