export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "create" | "move" | "edit" | "comment" | "assign";
  userId: string;
  timestamp: string;
  details: {
    from?: string;
    to?: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate?: string;
  priority: Priority;
  assignees: string[];
  labels: string[];
  comments: Comment[];
  activity: Activity[];
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}

export interface FilterOptions {
  labelIds: string[];
  priority: Priority | null;
  dueDateFilter: "overdue" | "today" | "thisWeek" | "future" | null;
}

export interface KanbanData {
  boards: Board[];
  activeBoard: string;
  users?: User[];
  labels?: Label[];
  filters?: Record<string, FilterOptions>;
}
