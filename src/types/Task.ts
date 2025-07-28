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
  createdAt: Date;
  completedAt?: Date;
  priority: "low" | "medium" | "high";
}
