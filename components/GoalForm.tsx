import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { XIcon } from '../constants';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt'>, id?: string) => void;
  initialGoal?: Goal | null;
}

const GoalForm: React.FC<GoalFormProps> = ({ isOpen, onClose, onSubmit, initialGoal }) => {
  const [name, setName] = useState('');
  const [targetDuration, setTargetDuration] = useState(600); // Default to 10 hours

  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name);
      setTargetDuration(initialGoal.targetDuration);
    } else {
      setName('');
      setTargetDuration(600);
    }
  }, [initialGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetDuration <= 0) {
      alert('Please provide a valid name and target duration.');
      return;
    }
    onSubmit({ name, targetDuration }, initialGoal?.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6">{initialGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goal-name" className="block text-sm font-medium text-gray-300">Goal Name</label>
            <input
              id="goal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="goal-duration" className="block text-sm font-medium text-gray-300">Target Duration (minutes)</label>
            <input
              id="goal-duration"
              type="number"
              value={targetDuration}
              onChange={(e) => setTargetDuration(Number(e.target.value))}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              min="1"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {initialGoal ? 'Save Changes' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
