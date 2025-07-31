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
  createdAt: Date;
  updatedAt: Date;
}
