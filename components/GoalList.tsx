import React from 'react';
import { Goal } from '../types';
import { EditIcon, PlusIcon, TargetIcon, TrashIcon } from '../constants';

export interface GoalWithProgress extends Goal {
  achievedDuration: number;
}

interface GoalListProps {
  goals: GoalWithProgress[];
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

const GoalItem: React.FC<{ goal: GoalWithProgress; onEdit: () => void; onDelete: () => void; }> = ({ goal, onEdit, onDelete }) => {
    const progressPercentage = goal.targetDuration > 0 ? (goal.achievedDuration / goal.targetDuration) * 100 : 0;
    const hoursAchieved = (goal.achievedDuration / 60).toFixed(1);
    const hoursTarget = (goal.targetDuration / 60).toFixed(1);


    return (
        <div className="bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col justify-between h-full animate-fade-in-up">
            <div>
              <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg text-gray-100">{goal.name}</h4>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      <button onClick={onEdit} className="text-gray-400 hover:text-indigo-400 transition-colors p-1" aria-label={`Edit goal ${goal.name}`}>
                          <EditIcon className="h-5 w-5"/>
                      </button>
                      <button onClick={onDelete} className="text-gray-400 hover:text-red-400 transition-colors p-1" aria-label={`Delete goal ${goal.name}`}>
                          <TrashIcon className="h-5 w-5"/>
                      </button>
                  </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                      className="bg-indigo-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      aria-valuenow={progressPercentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      role="progressbar"
                      aria-label={`Progress for goal ${goal.name}`}
                  ></div>
              </div>
            </div>
            <div className="flex justify-between items-end text-sm mt-3">
                <p className="text-gray-400"><span className="font-semibold text-white">{hoursAchieved}</span> / {hoursTarget} hr</p>
                <p className="font-semibold text-indigo-400">{Math.round(progressPercentage)}%</p>
            </div>
        </div>
    );
};

const GoalList: React.FC<GoalListProps> = ({ goals, onAddGoal, onEditGoal, onDeleteGoal }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-gray-700 pb-4 gap-4">
            <h2 className="text-2xl font-semibold flex items-center gap-3"><TargetIcon className="w-7 h-7 text-indigo-400"/> My Goals Dashboard</h2>
            <button
                onClick={onAddGoal}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
              >
                <PlusIcon className="h-5 w-5" />
                Add New Goal
            </button>
        </div>
        
        {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {goals.map(goal => (
                    <GoalItem 
                        key={goal.id} 
                        goal={goal} 
                        onEdit={() => onEditGoal(goal)} 
                        onDelete={() => onDeleteGoal(goal.id)}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 px-4">
                <TargetIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400">You haven't set any goals yet.</h3>
                <p className="text-gray-500 mt-2">Goals help you focus your efforts. Ready to create one?</p>
                <button
                    onClick={onAddGoal}
                    className="mt-6 flex items-center mx-auto gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    <PlusIcon className="h-5 w-5" />
                    Create Your First Goal
                </button>
            </div>
        )}
    </div>
  );
};

export default GoalList;
