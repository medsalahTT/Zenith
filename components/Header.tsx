import React from 'react';
import { TargetIcon } from '../constants';

interface HeaderProps {
  currentView: 'tasks' | 'goals' | 'stats';
  onViewChange: (view: 'tasks' | 'goals' | 'stats') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const navItemClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-40 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <TargetIcon className="h-7 w-7 text-indigo-400" />
             <h1 className="text-2xl font-bold text-white tracking-tight">Zenith Focus</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => onViewChange('tasks')}
              className={`${navItemClasses} ${currentView === 'tasks' ? activeClasses : inactiveClasses}`}
              aria-current={currentView === 'tasks' ? 'page' : undefined}
            >
              Tasks
            </button>
            <button
              onClick={() => onViewChange('goals')}
              className={`${navItemClasses} ${currentView === 'goals' ? activeClasses : inactiveClasses}`}
               aria-current={currentView === 'goals' ? 'page' : undefined}
            >
              Goals
            </button>
            <button
              onClick={() => onViewChange('stats')}
              className={`${navItemClasses} ${currentView === 'stats' ? activeClasses : inactiveClasses}`}
               aria-current={currentView === 'stats' ? 'page' : undefined}
            >
              Stats
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;