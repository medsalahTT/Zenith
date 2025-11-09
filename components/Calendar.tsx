import React from 'react';
import { Task } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, tasks }) => {
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const days = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endOfMonth || days.length % 7 !== 0) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const taskDays = React.useMemo(() => {
    const datesWithTasks = new Set<string>();
    const dayOfWeekMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const taskDayOfWeeks = new Set<number>();
    
    tasks.forEach(task => {
        task.dates.forEach(date => datesWithTasks.add(date));
        task.repeatDays.forEach(day => taskDayOfWeeks.add(dayOfWeekMap[day]));
    });
    return { datesWithTasks, taskDayOfWeeks };
  }, [tasks]);

  const hasTask = (date: Date): boolean => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (taskDays.datesWithTasks.has(dateString)) return true;
    if (taskDays.taskDayOfWeeks.has(date.getDay())) return true;
    return false;
  };

  const changeMonth = (amount: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + amount);
    onDateChange(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-lg">
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <button
              key={index}
              onClick={() => onDateChange(day)}
              className={`relative flex items-center justify-center h-10 w-10 rounded-full transition-colors 
                ${isCurrentMonth ? 'text-gray-100' : 'text-gray-600'}
                ${isSelected ? 'bg-indigo-600' : 'hover:bg-gray-700'}
                ${isToday(day) && !isSelected ? 'border border-gray-500' : ''}
              `}
            >
              {day.getDate()}
              {hasTask(day) && <span className="absolute bottom-1.5 h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
