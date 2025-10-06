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
import { taskService } from "./TaskService";
import type {
  CreateZeladorData,
  UpdateZeladorData,
  Zelador,
} from "../types/Zelador";
// Removido adminAuth - usando solução alternativa
import { TaskStatus, type Task } from "../types/Task";

export const zeladorService = {
  async getAll(): Promise<Zelador[]> {
    try {
      const zeladoresRef = collection(db, "zeladores");
      const querySnapshot = await getDocs(zeladoresRef);

      const zeladores: Zelador[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();

        const tasks = await taskService.getByZelador(data.email);

        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(
          (task) => task.status === TaskStatus.PENDING
        ).length;
        const completedTasks = tasks.filter(
          (task) => task.status === TaskStatus.COMPLETED
        ).length;
        const overdueTasks = tasks.filter(
          (task) => task.status === TaskStatus.OVERDUE
        ).length;

        const zelador: Zelador = {
          id: doc.id,
          name: data.name,
          email: data.email,
          setor: data.setor,
          role: "ZELADOR" as const,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          // Campos de ativação
          needsAccountCreation: data.needsAccountCreation,
          isActive: data.isActive,
          tempPassword: data.tempPassword,
          // Estatísticas de tarefas
          totalTasks,
          pendingTasks,
          completedTasks,
          overdueTasks,
        };

        zeladores.push(zelador);
      }

      return zeladores;
    } catch (error) {
      console.error("Erro ao buscar zeladores:", error);
      throw new Error("Erro ao carregar zeladores");
    }
  },

  async getById(id: string): Promise<Zelador | null> {
    try {
      const zeladorRef = doc(db, "zeladores", id);
      const zeladorSnap = await getDoc(zeladorRef);

      if (!zeladorSnap.exists()) {
        return null;
      }

      const data = zeladorSnap.data();
      const tasks = await taskService.getByZelador(id);

      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(
        (task) => task.status === TaskStatus.PENDING
      ).length;
      const completedTasks = tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      ).length;
      const overdueTasks = tasks.filter(
        (task) => task.status === TaskStatus.OVERDUE
      ).length;

      return {
        id: zeladorSnap.id,
        name: data.name,
        email: data.email,
        setor: data.setor,
        role: "ZELADOR" as const,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        // Campos de ativação
        needsAccountCreation: data.needsAccountCreation,
        isActive: data.isActive,
        tempPassword: data.tempPassword,
        // Estatísticas de tarefas
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      };
    } catch (error) {
      console.error("Erro ao buscar zelador:", error);
      throw new Error("Erro ao carregar zelador");
    }
  },

  async create(data: CreateZeladorData): Promise<Zelador> {
    try {
      // Validar dados antes de criar
      if (!data.name || !data.email || !data.password) {
        throw new Error("Nome, email e senha são obrigatórios");
      }

      if (data.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      // Verificar se email já existe
      const existingZelador = await this.getByEmail(data.email);
      if (existingZelador) {
        throw new Error("Este email já está sendo usado");
      }

      const now = Timestamp.now();
      const zeladorData = {
        name: data.name,
        email: data.email,
        setor: data.setor,
        role: "ZELADOR",
        createdAt: now,
        updatedAt: now,
        // Campos para ativação manual
        needsAccountCreation: true,
        tempPassword: data.password, // Será removido após primeiro login
        isActive: false, // Só fica ativo após primeiro login
      };

      const zeladoresRef = collection(db, "zeladores");
      const docRef = await addDoc(zeladoresRef, zeladorData);

      return {
        id: docRef.id,
        name: data.name,
        email: data.email,
        setor: data.setor,
        role: "ZELADOR" as const,
        createdAt: now,
        updatedAt: now,
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
      };
    } catch (error) {
      console.error("Erro ao criar zelador:", error);

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error("Erro ao criar zelador");
    }
  },

  async update(id: string, data: UpdateZeladorData): Promise<Zelador> {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      const zeladorRef = doc(db, "zeladores", id);

      await updateDoc(zeladorRef, updateData);

      const tasks = await taskService.getByZelador(id);
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(
        (task) => task.status === TaskStatus.PENDING
      ).length;
      const completedTasks = tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      ).length;
      const overdueTasks = tasks.filter(
        (task) => task.status === TaskStatus.OVERDUE
      ).length;

      const updatedZeladorSnap = await getDoc(zeladorRef);
      const zeladorData = updatedZeladorSnap.data()!;

      return {
        id: updatedZeladorSnap.id,
        name: zeladorData.name,
        email: zeladorData.email,
        setor: zeladorData.setor,
        role: "ZELADOR" as const,
        createdAt: zeladorData.createdAt,
        updatedAt: zeladorData.updatedAt,
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      };
    } catch (error) {
      console.error("Erro ao atualizar zelador:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao atualizar zelador");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const tasks = await taskService.getByZelador(id);

      if (tasks.length > 0) {
        const pendingTasks = tasks.filter(
          (task) =>
            task.status === TaskStatus.PENDING ||
            task.status === TaskStatus.IN_PROGRESS
        );

        if (pendingTasks.length > 0) {
          throw new Error(
            `Este zelador possui ${pendingTasks.length} tarefa(s) pendente(s).` +
              `Reatribua ou conclua as tarefas antes de deletar o zelador.`
          );
        }
      }
      const zeladorRef = doc(db, "zeladores", id);
      await deleteDoc(zeladorRef);
    } catch (error) {
      console.error("Erro ao deletar zelador:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao deletar zelador");
    }
  },

  async getTasks(zeladorId: string): Promise<Task[]> {
    try {
      return await taskService.getByZelador(zeladorId);
    } catch (error) {
      console.error("Erro ao buscar tarefas do zelador:", error);
      throw new Error("Erro ao carregar tarefas do zelador");
    }
  },

  async getBySetor(setor: string): Promise<Zelador[]> {
    try {
      // 1. Buscar zeladores do setor
      const zeladoresRef = collection(db, "zeladores");
      const q = query(
        zeladoresRef,
        where("setor", "==", setor),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const zeladores: Zelador[] = [];

      // 2. Para cada zelador, calcular estatísticas
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const tasks = await taskService.getByZelador(data.email);

        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(
          (task) => task.status === TaskStatus.PENDING
        ).length;
        const completedTasks = tasks.filter(
          (task) => task.status === TaskStatus.COMPLETED
        ).length;
        const overdueTasks = tasks.filter(
          (task) => task.status === TaskStatus.OVERDUE
        ).length;

        zeladores.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          setor: data.setor,
          role: "ZELADOR" as const,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          totalTasks,
          pendingTasks,
          completedTasks,
          overdueTasks,
        });
      }

      return zeladores;
    } catch (error) {
      console.error("Erro ao buscar zeladores do setor:", error);
      throw new Error("Erro ao carregar zeladores do setor");
    }
  },

  async fixZeladorStatus(zeladorId: string): Promise<void> {
    try {
      // Verificar se o zelador existe no Firebase Auth
      const zeladorDoc = await getDoc(doc(db, "zeladores", zeladorId));
      if (!zeladorDoc.exists()) {
        throw new Error("Zelador não encontrado");
      }

      const zeladorData = zeladorDoc.data();

      // Verificar se existe na coleção 'users'
      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", zeladorData.email)
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        // Atualizar status para ativo
        await updateDoc(doc(db, "zeladores", zeladorId), {
          needsAccountCreation: false,
          isActive: true,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Erro ao corrigir status do zelador:", error);
      throw error;
    }
  },

  async getByEmail(email: string): Promise<Zelador | null> {
    try {
      const zeladoresRef = collection(db, "zeladores");
      const q = query(zeladoresRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const zeladorId = doc.id;

      // Buscar tarefas do zelador
      const tasks = await taskService.getByZelador(zeladorId);

      // Calcular estatísticas
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(
        (task) => task.status === TaskStatus.PENDING
      ).length;
      const completedTasks = tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      ).length;
      const overdueTasks = tasks.filter(
        (task) => task.status === TaskStatus.OVERDUE
      ).length;

      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        setor: data.setor,
        role: "ZELADOR" as const,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        // Campos de ativação
        needsAccountCreation: data.needsAccountCreation,
        isActive: data.isActive,
        tempPassword: data.tempPassword,
        // Estatísticas de tarefas
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      };
    } catch (error) {
      console.error("Erro ao buscar zelador por email:", error);
      throw new Error("Erro ao verificar email");
    }
  },
};
