import { Timestamp } from "firebase/firestore";

export enum UserRole {
  ADMIN = "ADMIN",
  GERENTE = "GERENTE",
  ZELADOR = "ZELADOR",
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  setor?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  setor?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  setor?: string;
}

export interface UserFilters {
  role?: UserRole;
  setor?: string;
  search?: string;
}
