
export enum TaskCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  URGENT = 'Urgent'
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  isFavorite: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FilterType = 'all' | 'favorites' | 'completed' | 'pending';

export interface AppState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: FilterType;
  selectedCategory: TaskCategory | 'All';
  searchQuery: string;
}
