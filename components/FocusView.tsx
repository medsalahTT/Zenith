import React from 'react';
import { Task } from '../types';
import { PauseIcon } from '../constants';

interface FocusViewProps {
  task: Task;
  timeLeft: number;
  onPause: () => void;
}

const FocusView: React.FC<FocusViewProps> = ({ task, timeLeft, onPause }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="text-center w-full max-w-2xl">
        <p className="text-xl font-medium text-indigo-400 mb-2">Focusing on:</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 truncate">{task.title}</h1>
        {task.description && (
          <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">{task.description}</p>
        )}
        <div className="my-12">
            <span className="text-8xl sm:text-9xl font-bold font-mono tabular-nums text-white tracking-wider">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
        <button
          onClick={onPause}
          className="flex items-center gap-3 mx-auto px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg text-xl font-semibold"
          aria-label="Pause timer"
        >
          <PauseIcon className="h-7 w-7" />
          Pause
        </button>
      </div>
    </div>
  );
};

export default FocusView;
