import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Configuração do Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
    privateKey: import.meta.env.VITE_FIREBASE_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    ),
  }),
};

// Inicializar apenas se não estiver inicializado
const adminApp =
  getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

export const adminAuth = getAuth(adminApp);
