import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebaseconfig";
import type { User } from "../types/User";

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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), newUser);
      console.log("Usuário criado no Firebase Auth:", newUser);
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
  },

  async logout() {
    await signOut(auth);
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
