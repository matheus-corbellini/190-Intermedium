import type { Setor } from "../types/Setor";

export const mockSetores: Setor[] = [
  {
    id: "1",
    name: "Terminal 1",
    description: "Terminal principal de passageiros",
    location: "Área Norte",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Terminal 2",
    description: "Terminal secundário de passageiros",
    location: "Área Sul",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Área de Embarque",
    description: "Área de espera para embarque",
    location: "Central",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Estacionamento",
    description: "Área de estacionamento externo",
    location: "Externa",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
