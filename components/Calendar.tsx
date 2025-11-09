import React, { useMemo } from 'react';
import { Task, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, tasks }) => {
  const { days, daysWithTasks } = useMemo(() => {
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const localDays: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endOfMonth || localDays.length % 7 !== 0) {
      localDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
      if (localDays.length > 42) break; // Safety break
    }

    const activeTaskDays = new Set<string>();

    localDays.forEach(day => {
        const dayOfWeek: DayOfWeek = DAYS_OF_WEEK[day.getDay()];
        const dateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        const dateStartOfDay = new Date(day);
        dateStartOfDay.setHours(0, 0, 0, 0);

        const hasTasksOnThisDay = tasks.some(task => {
            if (task.deletedOn?.includes(dateString)) {
                return false;
            }
            
            const taskCreatedAt = new Date(task.createdAt);
            taskCreatedAt.setHours(0, 0, 0, 0);
            
            const isRepeatDay = task.repeatDays.includes(dayOfWeek);
            const isSpecificDate = task.dates.includes(dateString);

            if (!isRepeatDay && !isSpecificDate) {
                return false;
            }

            if (isRepeatDay && dateStartOfDay < taskCreatedAt) {
                return false;
            }
            
            return true;
        });

        if (hasTasksOnThisDay) {
            activeTaskDays.add(dateString);
        }
    });

    return { days: localDays, daysWithTasks: activeTaskDays };
  }, [tasks, selectedDate]);

  const hasTask = (date: Date): boolean => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return daysWithTasks.has(dateString);
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