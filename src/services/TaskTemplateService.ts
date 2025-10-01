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
  TaskTemplate,
  TaskTemplateFilters,
  CreateTaskTemplateData,
  UpdateTaskTemplateData,
} from "../types/QuestionTemplate";

export const taskTemplateService = {
  // Listar todos os templates (com filtros opcionais)
  async getAll(filters?: TaskTemplateFilters): Promise<TaskTemplate[]> {
    try {
      console.log("Buscando templates...");
      const templatesRef = collection(db, "taskTemplates");
      let q = query(templatesRef, orderBy("createdAt", "desc"));

      // Aplicar filtros
      if (filters?.setorId) {
        q = query(q, where("setorId", "==", filters.setorId));
      }
      if (filters?.priority) {
        q = query(q, where("priority", "==", filters.priority));
      }

      const querySnapshot = await getDocs(q);
      console.log(`Encontrados ${querySnapshot.size} documentos`);

      const templates: TaskTemplate[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Documento encontrado:", doc.id, data);
        const template = this.convertFirestoreToTaskTemplate(doc.id, data);

        // Aplicar filtro de categoria (se especificado)
        if (filters?.category) {
          const hasCategory = template.questions.some(
            (q) => q.category === filters.category
          );
          if (!hasCategory) {
            return;
          }
        }

        templates.push(template);
      });

      console.log(`Retornando ${templates.length} templates`);
      return templates;
    } catch (error) {
      console.error("Erro ao buscar templates:", error);
      throw new Error("Erro ao carregar templates");
    }
  },

  // Buscar template por ID
  async getById(id: string): Promise<TaskTemplate | null> {
    try {
      const templateRef = doc(db, "taskTemplates", id);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return null;
      }

      return this.convertFirestoreToTaskTemplate(
        templateSnap.id,
        templateSnap.data() as TaskTemplate
      );
    } catch (error) {
      console.error("Erro ao buscar template:", error);
      throw new Error("Erro ao carregar template");
    }
  },

  // Criar novo template
  async create(data: CreateTaskTemplateData): Promise<TaskTemplate> {
    try {
      console.log("Criando template com dados:", data);
      const templatesRef = collection(db, "taskTemplates");
      const now = Timestamp.now();

      // Gerar IDs únicos para as questões
      const questionsWithIds = data.questions.map((question, index) => ({
        ...question,
        id: `q-${Date.now()}-${index}`,
      }));

      const newTemplateData = {
        ...data,
        questions: questionsWithIds,
        createdAt: now,
        updatedAt: now,
      };

      console.log("Dados a serem salvos:", newTemplateData);
      const docRef = await addDoc(templatesRef, newTemplateData);
      console.log("Template criado com ID:", docRef.id);

      return {
        id: docRef.id,
        ...data,
        questions: questionsWithIds,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error("Erro ao criar template:", error);
      throw new Error("Erro ao criar template");
    }
  },

  // Atualizar template existente
  async update(
    id: string,
    data: UpdateTaskTemplateData
  ): Promise<TaskTemplate> {
    try {
      const templateRef = doc(db, "taskTemplates", id);

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(templateRef, updateData);

      // Retornar o template atualizado
      const updatedTemplate = await this.getById(id);
      if (!updatedTemplate) {
        throw new Error("Template não encontrado após atualização");
      }

      return updatedTemplate;
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
      throw new Error("Erro ao atualizar template");
    }
  },

  // Deletar template
  async delete(id: string): Promise<void> {
    try {
      const templateRef = doc(db, "taskTemplates", id);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error("Erro ao deletar template:", error);
      throw new Error("Erro ao deletar template");
    }
  },

  // Buscar templates por setor
  async getBySetor(setorId: string): Promise<TaskTemplate[]> {
    try {
      const templatesRef = collection(db, "taskTemplates");
      const q = query(
        templatesRef,
        where("setorId", "==", setorId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const templates: TaskTemplate[] = [];

      querySnapshot.forEach((doc) => {
        templates.push(
          this.convertFirestoreToTaskTemplate(
            doc.id,
            doc.data() as TaskTemplate
          )
        );
      });

      return templates;
    } catch (error) {
      console.error("Erro ao buscar templates do setor:", error);
      throw new Error("Erro ao carregar templates do setor");
    }
  },

  // Buscar templates por prioridade
  async getByPriority(
    priority: "low" | "medium" | "high"
  ): Promise<TaskTemplate[]> {
    try {
      const templatesRef = collection(db, "taskTemplates");
      const q = query(
        templatesRef,
        where("priority", "==", priority),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const templates: TaskTemplate[] = [];

      querySnapshot.forEach((doc) => {
        templates.push(
          this.convertFirestoreToTaskTemplate(
            doc.id,
            doc.data() as TaskTemplate
          )
        );
      });

      return templates;
    } catch (error) {
      console.error("Erro ao buscar templates por prioridade:", error);
      throw new Error("Erro ao carregar templates por prioridade");
    }
  },

  // Buscar templates por categoria
  async getByCategory(category: string): Promise<TaskTemplate[]> {
    try {
      const templatesRef = collection(db, "taskTemplates");
      const q = query(templatesRef, orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const templates: TaskTemplate[] = [];

      querySnapshot.forEach((doc) => {
        const template = this.convertFirestoreToTaskTemplate(
          doc.id,
          doc.data() as TaskTemplate
        );

        // Filtrar por categoria
        const hasCategory = template.questions.some(
          (q) => q.category === category
        );

        if (hasCategory) {
          templates.push(template);
        }
      });

      return templates;
    } catch (error) {
      console.error("Erro ao buscar templates por categoria:", error);
      throw new Error("Erro ao carregar templates por categoria");
    }
  },

  // Duplicar template
  async duplicate(id: string, newTitle?: string): Promise<TaskTemplate> {
    try {
      const originalTemplate = await this.getById(id);
      if (!originalTemplate) {
        throw new Error("Template não encontrado");
      }

      const duplicateData: CreateTaskTemplateData = {
        title: newTitle || `${originalTemplate.title} (Cópia)`,
        description: originalTemplate.description,
        estimatedDuration: originalTemplate.estimatedDuration,
        priority: originalTemplate.priority,
        setorId: originalTemplate.setorId,
        questions: originalTemplate.questions.map((q) => ({
          question: q.question,
          isEquipment: q.isEquipment,
          equipmentName: q.equipmentName,
          isRequired: q.isRequired,
          category: q.category,
        })),
      };

      return await this.create(duplicateData);
    } catch (error) {
      console.error("Erro ao duplicar template:", error);
      throw new Error("Erro ao duplicar template");
    }
  },

  // Função auxiliar para converter dados do Firestore para TaskTemplate
  convertFirestoreToTaskTemplate(id: string, data: any): TaskTemplate {
    return {
      id,
      title: data.title,
      description: data.description,
      estimatedDuration: data.estimatedDuration,
      priority: data.priority,
      questions: data.questions || [],
      setorId: data.setorId,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  },
};
