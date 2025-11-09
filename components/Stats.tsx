import React from 'react';
import { BarChartIcon, CheckCircleIcon, ClockIcon, TrophyIcon } from '../constants';

interface CompletedTaskStat {
    id: string;
    title: string;
    completionCount: number;
    totalDuration: number;
}

interface StatsData {
  totalTimeFocused: number; // in minutes
  tasksCompleted: number;
  avgSessionDuration: number; // in minutes
  goalsAchieved: number;
  totalGoals: number;
  completedTasksDetailed: CompletedTaskStat[];
}

interface StatsProps {
  stats: StatsData;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; description: string }> = ({ icon, title, value, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-start animate-fade-in-up">
        <div className="flex items-center justify-center bg-gray-700/50 rounded-full p-3 mb-4">
            {icon}
        </div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
);


const Stats: React.FC<StatsProps> = ({ stats }) => {
    const formatDuration = (minutes: number) => {
        if (minutes === 0) return '0 min';
        if (minutes < 60) {
            return `${Math.round(minutes)} min`;
        }
        return `${(minutes / 60).toFixed(1)} hr`;
    }

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-gray-700 pb-4 gap-4">
                <h2 className="text-2xl font-semibold flex items-center gap-3"><BarChartIcon className="w-7 h-7 text-indigo-400"/> Your Productivity Statistics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    icon={<ClockIcon className="h-6 w-6 text-indigo-400" />}
                    title="Total Time Focused"
                    value={formatDuration(stats.totalTimeFocused)}
                    description="Sum of all completed task durations."
                />
                <StatCard 
                    icon={<CheckCircleIcon className="h-6 w-6 text-green-400" />}
                    title="Tasks Completed"
                    value={String(stats.tasksCompleted)}
                    description="Total number of tasks marked complete."
                />
                 <StatCard 
                    icon={<BarChartIcon className="h-6 w-6 text-yellow-400" />}
                    title="Average Session"
                    value={formatDuration(stats.avgSessionDuration)}
                    description="Average duration of a completed task."
                />
                <StatCard 
                    icon={<TrophyIcon className="h-6 w-6 text-amber-400" />}
                    title="Goals Achieved"
                    value={`${stats.goalsAchieved} / ${stats.totalGoals}`}
                    description="Number of goals that have met their target duration."
                />
            </div>

            {stats.tasksCompleted > 0 && (
                 <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                        Task Completion Details
                    </h3>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {stats.completedTasksDetailed.map(task => (
                            <div key={task.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:bg-gray-700/50 transition-colors">
                                <div>
                                    <p className="font-semibold text-gray-100">{task.title}</p>
                                    <p className="text-sm text-gray-400">{task.completionCount} completion{task.completionCount > 1 ? 's' : ''}</p>
                                </div>
                                <p className="font-semibold text-lg text-indigo-400">{formatDuration(task.totalDuration)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats.tasksCompleted === 0 && (
                 <div className="text-center py-20 px-4">
                    <BarChartIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400">No data to display yet.</h3>
                    <p className="text-gray-500 mt-2">Complete some tasks to see your productivity stats here!</p>
                </div>
            )}
        </div>
    );
};

export default Stats;