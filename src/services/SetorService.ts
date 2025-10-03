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
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { Setor, CreateSetor, UpdateSetor } from "../types/Setor";

export const setorService = {
  async getAll(): Promise<Setor[]> {
    try {
      const setorRef = collection(db, "setores");
      const querySnapshot = await getDocs(setorRef);

      const setores: Setor[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setores.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          location: data.location,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });

      return setores;
    } catch (error) {
      console.error("Erro ao buscar setores:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<Setor | null> {
    try {
      const setorRef = doc(db, "setores", id);
      const setorSnap = await getDoc(setorRef);

      if (!setorSnap.exists()) {
        return null;
      }

      const data = setorSnap.data();
      return {
        id: setorSnap.id,
        name: data.name,
        description: data.description,
        location: data.location,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    } catch (error) {
      console.error("Erro ao buscar setor:", error);
      throw error;
    }
  },

  async create(data: CreateSetor): Promise<Setor> {
    try {
      const existingSetor = await this.getByName(data.name);
      if (existingSetor) {
        throw new Error("Setor já existe");
      }

      const setoresRef = collection(db, "setores");
      const now = Timestamp.now();

      const newSetorData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(setoresRef, newSetorData);

      return {
        id: docRef.id,
        ...data,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
    } catch (error) {
      console.error("Erro ao criar setor:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao criar setor");
    }
  },

  async update(id: string, data: UpdateSetor): Promise<Setor> {
    try {
      const setorRef = doc(db, "setores", id);

      if (data.name) {
        const existingSetor = await this.getByName(data.name);
        if (existingSetor && existingSetor.id !== id) {
          throw new Error("Setor já existe");
        }
      }

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(setorRef, updateData);

      const updatedSetor = await this.getById(id);
      if (!updatedSetor) {
        throw new Error("Setor não encontrado");
      }
      return updatedSetor;
    } catch (error) {
      console.error("Erro ao atualizar setor:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao atualizar setor");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const setorRef = doc(db, "setores", id);
      await deleteDoc(setorRef);
    } catch (error) {
      console.error("Erro ao deletar setor:", error);
      throw new Error("Erro ao deletar setor");
    }
  },

  async getByName(name: string): Promise<Setor | null> {
    try {
      const setoresRef = collection(db, "setores");
      const q = query(setoresRef, where("name", "==", name));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        location: data.location,
        createdAt: data.createdAt.toDate() || new Date(),
        updatedAt: data.updatedAt.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Erro ao buscar setor por nome:", error);
      throw new Error("Erro ao buscar setor por nome");
    }
  },
};
