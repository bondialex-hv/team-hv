
// Fix: Manually define types for Vite's `import.meta.env` to resolve TypeScript errors.
// This serves as a workaround for configuration issues where the `/// <reference types="vite/client" />`
// directive fails to load the necessary type definitions.
interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Le configurazioni di Firebase vengono ora caricate in modo sicuro dalle variabili d'ambiente di Vite.
// Questo è fondamentale per la sicurezza quando si effettua il deploy del codice su piattaforme come Vercel/GitHub.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  // Controlla che le variabili d'ambiente siano definite prima di inizializzare
  if (!firebaseConfig.apiKey) {
    throw new Error("Variabili d'ambiente di Firebase non configurate. Assicurati di aver creato un file .env e di aver impostato le variabili su Vercel.");
  }
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Errore durante l'inizializzazione di Firebase:", error);
  // In un'app reale, potresti voler mostrare un messaggio di errore all'utente.
}

// Esporta le istanze dei servizi Firebase per utilizzarle nell'app
export { db, auth };