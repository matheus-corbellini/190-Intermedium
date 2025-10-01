export interface Setor {
  id: string;
  name: string;
  description: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSetor {
  name: string;
  description: string;
  location: string;
}

export interface UpdateSetor {
  name?: string;
  description?: string;
  location?: string;
}
