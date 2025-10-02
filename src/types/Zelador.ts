import type { Timestamp } from "firebase/firestore";

export type Zelador = {
  id: string;
  name: string;
  email: string;
  setor?: string;
  role: "ZELADOR";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Campos para ativação manual
  needsAccountCreation?: boolean;
  tempPassword?: string;
  isActive?: boolean;
  // Estatísticas de tarefas
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  overdueTasks?: number;
};

export interface CreateZeladorData {
  name: string;
  email: string;
  password: string;
  setor?: string;
}

export interface UpdateZeladorData {
  name?: string;
  email?: string;
  setor?: string;
  needsAccountCreation?: boolean;
  isActive?: boolean;
  tempPassword?: string;
}
