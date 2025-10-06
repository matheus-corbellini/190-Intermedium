import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Task,
  ChecklistItem,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
} from "../types/Task";
import { TaskStatus } from "../types/Task";
export const taskService = {
  // Listar todas as tarefas (com filtros opcionais)
  async getAll(filters?: TaskFilters): Promise<Task[]> {
    try {
      const tasksRef = collection(db, "tasks");
      let q = query(tasksRef, orderBy("createdAt", "desc"));

      // Aplicar filtros
      if (filters?.setor) {
        q = query(q, where("setor", "==", filters.setor));
      }
      if (filters?.assignedTo) {
        q = query(q, where("assignedTo", "==", filters.assignedTo));
      }
      if (filters?.status) {
        q = query(q, where("status", "==", filters.status));
      }
      if (filters?.priority) {
        q = query(q, where("priority", "==", filters.priority));
      }

      const querySnapshot = await getDocs(q);

      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const task = this.convertFirestoreToTask(doc.id, data);

        // Aplicar filtros de data (se especificados)
        if (filters?.dateFrom && task.createdAt < filters.dateFrom) {
          return;
        }
        if (filters?.dateTo) {
          const dateTo = new Date(filters.dateTo.toDate());
          dateTo.setHours(23, 59, 59, 999);
          if (task.createdAt.toDate() > dateTo) {
            return;
          }
        }

        tasks.push(task);
      });

      return tasks;
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      throw new Error("Erro ao carregar tarefas");
    }
  },

  // Buscar tarefa por ID
  async getById(id: string): Promise<Task | null> {
    try {
      const taskRef = doc(db, "tasks", id);
      const taskSnap = await getDoc(taskRef);

      if (!taskSnap.exists()) {
        return null;
      }

      return this.convertFirestoreToTask(taskSnap.id, taskSnap.data() as Task);
    } catch (error) {
      console.error("Erro ao buscar tarefa:", error);
      throw new Error("Erro ao carregar tarefa");
    }
  },

  // Criar nova tarefa
  async create(data: CreateTaskData): Promise<Task> {
    try {
      const tasksRef = collection(db, "tasks");
      const now = Timestamp.now();

      // Gerar IDs únicos para os itens do checklist
      const checklistWithIds = data.checklist.map((item, index) => ({
        ...item,
        id: `${Date.now()}-${index}`,
      }));

      const newTaskData = {
        ...data,
        checklist: checklistWithIds,
        status: TaskStatus.PENDING,
        createdAt: now,
      };

      const docRef = await addDoc(tasksRef, newTaskData);

      return {
        id: docRef.id,
        ...data,
        checklist: checklistWithIds,
        status: TaskStatus.PENDING,
        createdAt: now,
      };
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      throw new Error("Erro ao criar tarefa");
    }
  },

  // Atualizar tarefa existente
  async update(id: string, data: UpdateTaskData): Promise<Task> {
    try {
      const taskRef = doc(db, "tasks", id);

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      // Se estiver marcando como concluída, adicionar completedAt
      if (data.status === TaskStatus.COMPLETED && !data.completedAt) {
        updateData.completedAt = Timestamp.now();
      }

      await updateDoc(taskRef, updateData);

      // Retornar a tarefa atualizada
      const updatedTask = await this.getById(id);
      if (!updatedTask) {
        throw new Error("Tarefa não encontrada após atualização");
      }

      return updatedTask;
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      throw new Error("Erro ao atualizar tarefa");
    }
  },

  // Deletar tarefa
  async delete(id: string): Promise<void> {
    try {
      const taskRef = doc(db, "tasks", id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      throw new Error("Erro ao deletar tarefa");
    }
  },

  // Buscar tarefas por zelador (por email)
  async getByZelador(zeladorEmail: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, "tasks");
      const q = query(
        tasksRef,
        where("assignedTo", "==", zeladorEmail),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        tasks.push(this.convertFirestoreToTask(doc.id, doc.data() as Task));
      });

      return tasks;
    } catch (error) {
      console.error("Erro ao buscar tarefas do zelador:", error);
      throw new Error("Erro ao carregar tarefas do zelador");
    }
  },

  // Buscar tarefas por setor
  async getBySetor(setor: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, "tasks");
      const q = query(
        tasksRef,
        where("setor", "==", setor),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        tasks.push(this.convertFirestoreToTask(doc.id, doc.data() as Task));
      });

      return tasks;
    } catch (error) {
      console.error("Erro ao buscar tarefas do setor:", error);
      throw new Error("Erro ao carregar tarefas do setor");
    }
  },

  // Atualizar status de um item do checklist
  async updateChecklistItem(
    taskId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ): Promise<Task> {
    try {
      const task = await this.getById(taskId);
      if (!task) {
        throw new Error("Tarefa não encontrada");
      }

      const updatedChecklist = task.checklist.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      return await this.update(taskId, { checklist: updatedChecklist });
    } catch (error) {
      console.error("Erro ao atualizar item do checklist:", error);
      throw new Error("Erro ao atualizar item do checklist");
    }
  },

  // Marcar tarefa como concluída
  async markAsCompleted(id: string): Promise<Task> {
    return this.update(id, {
      status: TaskStatus.COMPLETED,
      completedAt: Timestamp.now(),
    });
  },

  async getUnassigned(): Promise<Task[]> {
    try {
      const tasksRef = collection(db, "tasks");
      const querySnapshot = await getDocs(tasksRef);
      const tasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Incluir tarefas sem assignedTo ou com assignedTo null/undefined/vazio
        if (
          !data.assignedTo ||
          data.assignedTo === null ||
          data.assignedTo === ""
        ) {
          tasks.push(this.convertFirestoreToTask(doc.id, data as Task));
        }
      });

      return tasks;
    } catch (error) {
      console.error("Erro ao buscar tarefas não atribuídas:", error);
      throw new Error("Erro ao carregar tarefas não atribuídas");
    }
  },

  async assignTask(taskId: string, zeladorId: string): Promise<Task> {
    try {
      const { zeladorService } = await import("../services/ZeladorService");
      const zelador = await zeladorService.getById(zeladorId);
      if (!zelador) {
        throw new Error("Zelador não encontrado");
      }

      return await this.update(taskId, { assignedTo: zelador.email });
    } catch (error) {
      console.error("Erro ao atribuir tarefa:", error);
      throw new Error("Erro ao atribuir tarefa");
    }
  },

  // Marcar tarefa como em andamento
  async markAsInProgress(id: string): Promise<Task> {
    return this.update(id, { status: TaskStatus.IN_PROGRESS });
  },

  // Marcar tarefa como em atraso
  async markAsOverdue(id: string): Promise<Task> {
    return this.update(id, { status: TaskStatus.OVERDUE });
  },

  // Função auxiliar para converter dados do Firestore para Task
  convertFirestoreToTask(id: string, data: any): Task {
    return {
      id,
      title: data.title,
      description: data.description,
      setor: data.setor,
      status: data.status,
      scheduledTime: data.scheduledTime,
      estimatedDuration: data.estimatedDuration,
      checklist: data.checklist || [],
      assignedTo: data.assignedTo,
      createdAt: data.createdAt || Timestamp.now(),
      completedAt: data.completedAt,
      priority: data.priority,
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  },
};
