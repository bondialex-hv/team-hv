export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  avatarUrl: string;
}

export interface Client {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  description: string;
  clientId: string;
  completed: boolean;
  createdBy: string; // ID of the user who created the task
}