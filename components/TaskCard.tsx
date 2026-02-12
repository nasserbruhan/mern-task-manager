
import React from 'react';
import { Task, TaskCategory } from '../types';
import { Star, Trash2, CheckCircle, Circle, Edit3, MessageSquare } from 'lucide-react';

// Using icons from a common set (Lucide) - assume they are available or mapped to SVG
const LucideIcon = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-block ${className}`}>{children}</span>
);

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAskAI: (task: Task) => void;
}

const categoryColors: Record<TaskCategory, string> = {
  [TaskCategory.WORK]: 'bg-blue-100 text-blue-700 border-blue-200',
  [TaskCategory.PERSONAL]: 'bg-slate-100 text-slate-700 border-slate-200',
  [TaskCategory.SHOPPING]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [TaskCategory.HEALTH]: 'bg-rose-100 text-rose-700 border-rose-200',
  [TaskCategory.URGENT]: 'bg-amber-100 text-amber-700 border-amber-200',
};

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleComplete, 
  onToggleFavorite, 
  onDelete, 
  onEdit,
  onAskAI 
}) => {
  return (
    <div className={`group relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 ${task.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-4">
        <button 
          onClick={() => onToggleComplete(task._id)}
          className={`mt-1 transition-colors ${task.completed ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}
        >
          {task.completed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColors[task.category]}`}>
              {task.category}
            </span>
            {task.isFavorite && (
              <span className="text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </span>
            )}
          </div>
          
          <h3 className={`text-lg font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`mt-1 text-sm line-clamp-2 ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>
              {task.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
             <span className="text-[10px] text-slate-400 font-medium">
               {new Date(task.createdAt).toLocaleDateString()}
             </span>
             
             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                  onClick={() => onAskAI(task)}
                  title="Ask Gemini for Subtasks"
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
               </button>
               <button 
                  onClick={() => onToggleFavorite(task._id)}
                  className={`p-1.5 rounded-lg transition-colors ${task.isFavorite ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`}
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
               </button>
               <button 
                  onClick={() => onEdit(task)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
               </button>
               <button 
                  onClick={() => onDelete(task._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
