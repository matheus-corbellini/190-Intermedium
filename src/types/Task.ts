import type { Timestamp } from "firebase/firestore";

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  OVERDUE = "OVERDUE",
}

export enum ChecklistItemStatus {
  OK = "OK",
  NOT_COMPLIANT = "NOT_COMPLIANT",
  PENDING = "PENDING",
}

export interface ChecklistItem {
  id: string;
  question: string;
  status: ChecklistItemStatus;
  observation?: string;
  photos?: string[];
  isEquipment?: boolean;
  equipmentName?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  setor: string;
  status: TaskStatus;
  scheduledTime: string;
  estimatedDuration: number;
  checklist: ChecklistItem[];
  assignedTo: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  priority: "low" | "medium" | "high";
  updatedAt?: Timestamp;
}

export interface CreateTaskData {
  title: string;
  description: string;
  setor: string;
  scheduledTime: string;
  estimatedDuration: number;
  checklist: Omit<ChecklistItem, "id">[];
  assignedTo: string;
  priority: "low" | "medium" | "high";
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  setor?: string;
  status?: TaskStatus;
  scheduledTime?: string;
  estimatedDuration?: number;
  checklist?: ChecklistItem[];
  assignedTo?: string;
  priority?: "low" | "medium" | "high";
  completedAt?: Timestamp;
}

export interface TaskFilters {
  setor?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: "low" | "medium" | "high";
  dateFrom?: Timestamp;
  dateTo?: Timestamp;
}
