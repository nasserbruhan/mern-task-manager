
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskCategory, FilterType } from './types';
import { taskApi } from './services/api';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { generateTaskSubtasks } from './services/geminiService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // AI related states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{title: string, subtasks: string[]} | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesFilter = 
        filter === 'all' ? true :
        filter === 'favorites' ? task.isFavorite :
        filter === 'completed' ? task.completed :
        filter === 'pending' ? !task.completed : true;

      const matchesCategory = selectedCategory === 'All' ? true : task.category === selectedCategory;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesCategory && matchesSearch;
    });
  }, [tasks, filter, selectedCategory, searchQuery]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    favorites: tasks.filter(t => t.isFavorite).length
  }), [tasks]);

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      const newTask = await taskApi.createTask(data);
      setTasks(prev => [newTask, ...prev]);
      setIsFormOpen(false);
    } catch (err) {
      alert('Error creating task');
    }
  };

  const handleUpdateTask = async (data: Partial<Task>) => {
    if (!editingTask) return;
    try {
      const updated = await taskApi.updateTask(editingTask._id, data);
      setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
      setEditingTask(null);
    } catch (err) {
      alert('Error updating task');
    }
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    try {
      // Optimistic Update
      setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: !t.completed } : t));
      await taskApi.updateTask(id, { completed: !task.completed });
    } catch (err) {
      fetchTasks(); // Rollback
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await taskApi.toggleFavorite(id);
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    } catch (err) {
      alert('Error updating favorite');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const handleAskAI = async (task: Task) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const subtasks = await generateTaskSubtasks(task.title);
      setAiResult({ title: task.title, subtasks });
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Navigation */}
      <aside className="w-full md:w-72 bg-white border-b md:border-r border-slate-200 flex flex-col p-6 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">TaskMaster<span className="text-indigo-600 font-black">AI</span></h1>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setFilter('all')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                All Tasks
              </span>
              <span className="text-[11px] font-bold opacity-60">{stats.total}</span>
            </button>
            <button 
              onClick={() => setFilter('favorites')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === 'favorites' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Favorites
              </span>
              <span className="text-[11px] font-bold opacity-60">{stats.favorites}</span>
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Completed
              </span>
              <span className="text-[11px] font-bold opacity-60">{stats.completed}</span>
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Pending
              </span>
              <span className="text-[11px] font-bold opacity-60">{stats.total - stats.completed}</span>
            </button>
          </nav>
        </div>

        <div>
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Categories</h2>
          <div className="space-y-1">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'All' ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              All
            </button>
            {Object.values(TaskCategory).map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                Unlock smart insights with <span className="font-bold">Gemini AI</span>. Generate subtasks automatically!
              </p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 md:p-10 max-h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Tasks</h1>
            <p className="text-sm text-slate-500">Stay organized and productive.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Task
            </button>
          </div>
        </header>

        {/* Task Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white border border-slate-100 border-dashed rounded-3xl">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No tasks found</h3>
            <p className="text-slate-500 max-w-xs mt-1">
              {searchQuery ? `No tasks matching "${searchQuery}" in this view.` : "Start by creating your first task using the button above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onToggleComplete={handleToggleComplete}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteTask}
                onEdit={setEditingTask}
                onAskAI={handleAskAI}
              />
            ))}
          </div>
        )}

        {/* AI Result View Overlay */}
        {aiLoading && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
             <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                <div className="mb-4 flex justify-center">
                   <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                      <div className="relative bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg">
                        <svg className="animate-pulse" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </div>
                   </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Gemini is thinking...</h3>
                <p className="text-slate-500 mt-2">Generating smart subtasks for your project.</p>
             </div>
          </div>
        )}

        {aiResult && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-indigo-100">
                <div className="bg-indigo-600 p-6 text-white">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M12 20v2"/><path d="m17.66 17.66 1.41 1.41"/><path d="M20 12h2"/><path d="m17.66 6.34 1.41-1.41"/></svg>
                    AI Suggested Subtasks
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1 opacity-90">For: {aiResult.title}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {aiResult.subtasks.map((sub, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                        <div className="mt-1 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-400">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{sub}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setAiResult(null)}
                    className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    Got it!
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* Form Modals */}
        {(isFormOpen || editingTask) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <TaskForm 
              initialData={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTask(null);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
