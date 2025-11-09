import React from 'react';
import { Task } from '../types';
import { XIcon, TrashIcon } from '../constants';

interface DeleteConfirmationDialogProps {
  task: Task | null;
  selectedDate: Date;
  onClose: () => void;
  onDeleteToday: () => void;
  onDeleteAll: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ task, selectedDate, onClose, onDeleteToday, onDeleteAll }) => {
  if (!task) return null;

  const isRepeating = task.repeatDays.length > 0;
  const formattedDate = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center mb-4">
            <div className="bg-red-500/10 p-3 rounded-full mr-4">
                <TrashIcon className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold">Delete Task</h2>
        </div>
        <p className="text-gray-300 mb-6">
          You are about to delete "<span className="font-semibold text-white">{task.title}</span>".
          {isRepeating && " This is a repeating task."}
        </p>

        <div className="space-y-3">
             {isRepeating && (
                <button
                    onClick={onDeleteToday}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-left"
                >
                    <p className="font-semibold">Delete for Today Only</p>
                    <p className="text-sm text-indigo-200">Remove this task just for {formattedDate}.</p>
                </button>
             )}
             <button
                onClick={onDeleteAll}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-left"
            >
                <p className="font-semibold">{isRepeating ? 'Delete All Occurrences' : 'Confirm Delete'}</p>
                <p className="text-sm text-red-200">{isRepeating ? 'Permanently remove this task from all days.' : 'This action cannot be undone.'}</p>
            </button>
        </div>
        
        <div className="flex justify-end mt-6">
             <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
            >
              Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;