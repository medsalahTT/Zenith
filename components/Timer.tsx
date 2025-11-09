import React from 'react';
import { useTimer } from '../hooks/useTimer';
import { PlayIcon, PauseIcon, RotateCwIcon } from '../constants';

interface TimerProps {
  duration: number; // in minutes
}

const Timer: React.FC<TimerProps> = ({ duration }) => {
  const onTimerEnd = () => {
    alert(`Timer for ${duration} minutes has finished!`);
  };

  const { timeLeft, isRunning, start, pause, reset } = useTimer({
    initialMinutes: duration,
    onEnd: onTimerEnd,
  });

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center space-x-4">
      <div className="text-2xl font-semibold tabular-nums bg-gray-700/50 px-3 py-1 rounded-md">
        <span>{String(minutes).padStart(2, '0')}</span>:
        <span>{String(seconds).padStart(2, '0')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={isRunning ? pause : start}
          className="p-2 rounded-full bg-gray-700 hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>
        <button
          onClick={reset}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <RotateCwIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Timer;
