import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteField,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebaseconfig";
import type { User, UserRole } from "../types/User";

export const authService = {
  async register(
    email: string,
    password: string,
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const newUser: User = {
        id: user.uid,
        ...userData,
        createdAt: new Timestamp(Date.now() / 1000, 0),
        updatedAt: new Timestamp(Date.now() / 1000, 0),
      };

      await setDoc(doc(db, "users", user.uid), newUser);
      return newUser;
    } catch (error: unknown) {
      console.error("Erro no registro:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      if (errorMessage.includes("email-already-in-use")) {
        throw new Error("Este email já está em uso");
      } else if (errorMessage.includes("weak-password")) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      } else {
        throw new Error("Erro ao criar conta: " + errorMessage);
      }
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      // Tentar fazer login normalmente
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      return userDoc.data() as User;
    } catch (error: unknown) {
      // Verificar se é um zelador pendente para QUALQUER erro de autenticação
      if (error && typeof error === "object" && "code" in error) {
        const errorCode = (error as { code: string }).code;

        // Tentar ativar zelador para qualquer erro de auth
        if (
          errorCode === "auth/user-not-found" ||
          errorCode === "auth/wrong-password" ||
          errorCode === "auth/invalid-credential" ||
          errorCode === "auth/invalid-email"
        ) {
          console.log(
            "🎯 ERRO DE AUTENTICAÇÃO DETECTADO - Tentando ativar zelador pendente..."
          );
          return await this.activateZelador(email, password);
        } else {
          console.log("❌ Erro não é de autenticação, re-throwing...");
        }
      } else {
        console.log("❌ Erro não tem código, re-throwing...");
      }

      // Re-throw outros erros
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
  },

  async activateZelador(email: string, password: string): Promise<User> {
    try {
      // Buscar zelador pendente no Firestore
      const { zeladorService } = await import("./ZeladorService");
      const pendingZelador = await zeladorService.getByEmail(email);

      if (!pendingZelador) {
        throw new Error("Email não encontrado");
      }

      if (!pendingZelador.needsAccountCreation) {
        // Tentar fazer login para ver se a conta realmente existe
        try {
          const testLogin = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

          // Buscar dados do usuário na coleção "users"
          const userDoc = await getDoc(doc(db, "users", testLogin.user.uid));
          if (userDoc.exists()) {
            return userDoc.data() as User;
          } else {
            // Fazer logout da conta que não tem dados
            await signOut(auth);

            // Resetar status do zelador para permitir nova ativação
            await zeladorService.update(pendingZelador.id, {
              needsAccountCreation: true,
              isActive: false,
            });

            // Continuar com a criação da conta
          }
        } catch {
          // Resetar status do zelador para permitir nova ativação
          await zeladorService.update(pendingZelador.id, {
            needsAccountCreation: true,
            isActive: false,
          });

          // Continuar com a criação da conta
        }
      }

      // Se tempPassword não existir (zelador criado antes da correção), usar a senha atual
      const expectedPassword = pendingZelador.tempPassword || password;

      if (expectedPassword !== password) {
        throw new Error("Senha incorreta");
      }

      // Se tempPassword não existir, salvar a senha atual
      if (!pendingZelador.tempPassword) {
        await zeladorService.update(pendingZelador.id, {
          tempPassword: password,
        });
      }

      // Criar conta no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Criar documento na coleção "users" com role ZELADOR
      const newUser: User = {
        id: firebaseUser.uid,
        name: pendingZelador.name,
        email: pendingZelador.email,
        role: "ZELADOR" as UserRole,
        setor: pendingZelador.setor,
        createdAt:
          pendingZelador.createdAt || new Timestamp(Date.now() / 1000, 0),
        updatedAt: new Timestamp(Date.now() / 1000, 0),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);

      // Atualizar zelador no Firestore para marcar como ativo
      const updateData: Record<string, unknown> = {
        needsAccountCreation: false,
        isActive: true,
      };

      // Só remover tempPassword se existir
      if (pendingZelador.tempPassword) {
        updateData.tempPassword = deleteField(); // Remover campo do Firestore
      }

      await zeladorService.update(pendingZelador.id, updateData);

      return newUser;
    } catch (error: unknown) {
      console.error("Erro ao ativar zelador:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      throw new Error("Erro ao ativar conta: " + errorMessage);
    }
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data() as User);
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    );
  },
};
