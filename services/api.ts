
import { Task, TaskCategory } from '../types';

// Simulating a real MERN backend using localStorage for the demo environment
const STORAGE_KEY = 'taskmaster_pro_tasks';

const getStoredTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

// Seed data
if (getStoredTasks().length === 0) {
  const seed: Task[] = [
    {
      _id: '1',
      title: 'Design UI for TaskMaster',
      description: 'Create a modern, responsive layout using Tailwind CSS.',
      category: TaskCategory.WORK,
      isFavorite: true,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Buy Groceries',
      description: 'Milk, eggs, and sourdough bread.',
      category: TaskCategory.SHOPPING,
      isFavorite: false,
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  setStoredTasks(seed);
}

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getStoredTasks()), 500);
    });
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    return new Promise((resolve) => {
      const newTask: Task = {
        ...task,
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: task.completed ?? false,
        isFavorite: task.isFavorite ?? false,
        category: task.category ?? TaskCategory.PERSONAL,
        title: task.title ?? 'Untitled Task'
      } as Task;
      
      const tasks = getStoredTasks();
      const updated = [...tasks, newTask];
      setStoredTasks(updated);
      setTimeout(() => resolve(newTask), 300);
    });
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    return new Promise((resolve, reject) => {
      const tasks = getStoredTasks();
      const index = tasks.findIndex(t => t._id === id);
      if (index === -1) return reject('Task not found');
      
      const updatedTask = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
      tasks[index] = updatedTask;
      setStoredTasks(tasks);
      setTimeout(() => resolve(updatedTask), 300);
    });
  },

  deleteTask: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const tasks = getStoredTasks();
      const updated = tasks.filter(t => t._id !== id);
      setStoredTasks(updated);
      setTimeout(() => resolve(), 300);
    });
  },

  toggleFavorite: async (id: string): Promise<Task> => {
    const tasks = getStoredTasks();
    const task = tasks.find(t => t._id === id);
    if (!task) throw new Error('Not found');
    return taskApi.updateTask(id, { isFavorite: !task.isFavorite });
  }
};
