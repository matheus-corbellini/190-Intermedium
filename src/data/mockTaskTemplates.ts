import type { TaskTemplate, QuestionTemplate } from "../types/QuestionTemplate";

export const mockQuestionTemplates: QuestionTemplate[] = [
  {
    id: "q1",
    question: "Verificar disponibilidade de papel higiênico",
    isEquipment: false,
    isRequired: true,
    category: "Suprimentos",
  },
  {
    id: "q2",
    question: "Limpar e desinfetar vasos sanitários",
    isEquipment: false,
    isRequired: true,
    category: "Limpeza",
  },
  {
    id: "q3",
    question: "Verificar funcionamento das torneiras",
    isEquipment: true,
    equipmentName: "Torneiras",
    isRequired: true,
    category: "Equipamentos",
  },
  {
    id: "q4",
    question: "Reabastecer sabonete líquido",
    isEquipment: false,
    isRequired: true,
    category: "Suprimentos",
  },
];

export const mockTaskTemplates: TaskTemplate[] = [
  {
    id: "t1",
    title: "Limpeza Banheiros",
    description: "Limpeza completa dos banheiros",
    estimatedDuration: 45,
    priority: "high",
    setorId: "1",
    questions: mockQuestionTemplates,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
