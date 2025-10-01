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
  User,
  UserFilters,
  CreateUserData,
  UpdateUserData,
} from "../types/User";
import { UserRole } from "../types/User";

export const userService = {
  // Listar todos os usuários (com filtros opcionais)
  async getAll(filters?: UserFilters): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");
      let q = query(usersRef, orderBy("createdAt", "desc"));

      // Aplicar filtros
      if (filters?.role) {
        q = query(q, where("role", "==", filters.role));
      }
      if (filters?.setor) {
        q = query(q, where("setor", "==", filters.setor));
      }

      const querySnapshot = await getDocs(q);

      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const user = this.convertFirestoreToUser(doc.id, data as User);

        // Aplicar filtro de busca (se especificado)
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          const matchesName = user.name.toLowerCase().includes(searchTerm);
          const matchesEmail = user.email.toLowerCase().includes(searchTerm);

          if (!matchesName && !matchesEmail) {
            return;
          }
        }

        users.push(user);
      });

      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw new Error("Erro ao carregar usuários");
    }
  },

  // Buscar usuário por ID
  async getById(id: string): Promise<User | null> {
    try {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      return this.convertFirestoreToUser(userSnap.id, userSnap.data() as User);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw new Error("Erro ao carregar usuário");
    }
  },

  // Buscar usuário por email
  async getByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return this.convertFirestoreToUser(doc.id, doc.data() as User);
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      return null;
    }
  },

  // Criar novo usuário
  async create(data: CreateUserData): Promise<User> {
    try {
      // Verificar se já existe um usuário com o mesmo email
      const existingUser = await this.getByEmail(data.email);
      if (existingUser) {
        throw new Error("Já existe um usuário com este email");
      }

      const usersRef = collection(db, "users");
      const now = Timestamp.now();

      const newUserData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(usersRef, newUserData);

      return {
        id: docRef.id,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao criar usuário");
    }
  },

  // Atualizar usuário existente
  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      const userRef = doc(db, "users", id);

      // Se estiver atualizando o email, verificar se não existe duplicata
      if (data.email) {
        const existingUser = await this.getByEmail(data.email);
        if (existingUser && existingUser.id !== id) {
          throw new Error("Já existe um usuário com este email");
        }
      }

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(userRef, updateData);

      // Retornar o usuário atualizado
      const updatedUser = await this.getById(id);
      if (!updatedUser) {
        throw new Error("Usuário não encontrado após atualização");
      }

      return updatedUser;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao atualizar usuário");
    }
  },

  // Deletar usuário
  async delete(id: string): Promise<void> {
    try {
      const userRef = doc(db, "users", id);
      await deleteDoc(userRef);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw new Error("Erro ao deletar usuário");
    }
  },

  // Buscar usuários por setor
  async getBySetor(setor: string): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("setor", "==", setor),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const users: User[] = [];

      querySnapshot.forEach((doc) => {
        users.push(this.convertFirestoreToUser(doc.id, doc.data() as User));
      });

      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários do setor:", error);
      throw new Error("Erro ao carregar usuários do setor");
    }
  },

  // Buscar usuários por role
  async getByRole(role: UserRole): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("role", "==", role),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const users: User[] = [];

      querySnapshot.forEach((doc) => {
        users.push(this.convertFirestoreToUser(doc.id, doc.data() as User));
      });

      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários por role:", error);
      throw new Error("Erro ao carregar usuários por role");
    }
  },

  // Buscar zeladores (usuários com role ZELADOR)
  async getZeladores(): Promise<User[]> {
    return this.getByRole(UserRole.ZELADOR);
  },

  // Buscar gerentes (usuários com role GERENTE)
  async getGerentes(): Promise<User[]> {
    return this.getByRole(UserRole.GERENTE);
  },

  // Buscar admins (usuários com role ADMIN)
  async getAdmins(): Promise<User[]> {
    return this.getByRole(UserRole.ADMIN);
  },

  // Atualizar setor do usuário
  async updateSetor(id: string, setor: string): Promise<User> {
    return this.update(id, { setor });
  },

  // Remover setor do usuário
  async removeSetor(id: string): Promise<User> {
    return this.update(id, { setor: undefined });
  },

  // Função auxiliar para converter dados do Firestore para User
  convertFirestoreToUser(id: string, data: User): User {
    return {
      id,
      name: data.name,
      email: data.email,
      role: data.role,
      setor: data.setor,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    };
  },
};
