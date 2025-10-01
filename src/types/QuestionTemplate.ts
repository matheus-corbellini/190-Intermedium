import type { Timestamp } from "firebase/firestore";

export interface QuestionTemplate {
  id: string;
  question: string;
  isEquipment: boolean;
  equipmentName?: string;
  isRequired: boolean;
  category: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number;
  priority: "low" | "medium" | "high";
  questions: QuestionTemplate[];
  setorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
export interface CreateTaskTemplateData {
  title: string;
  description: string;
  estimatedDuration: number;
  priority: "low" | "medium" | "high";
  questions: Omit<QuestionTemplate, "id">[];
  setorId: string;
}

export interface UpdateTaskTemplateData {
  title?: string;
  description?: string;
  estimatedDuration?: number;
  priority?: "low" | "medium" | "high";
  questions?: QuestionTemplate[];
  setorId?: string;
}
export interface TaskTemplateFilters {
  setorId?: string;
  priority?: "low" | "medium" | "high";
  category?: string;
}
