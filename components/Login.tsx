import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const ADMIN_NAME = 'Admin-HV';
const ADMIN_PASSWORD = 'admin123';
// L'email viene derivata dall'username per l'autenticazione
const ADMIN_EMAIL = `${ADMIN_NAME.toLowerCase()}@gestionale.hv`;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
        setError("Per favore, inserisci un username.");
        return;
    }
    
    const email = `${username.toLowerCase()}@gestionale.hv`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // Gestisce 'auth/invalid-credential' che può significare utente non trovato O password errata.
      if (err.code === 'auth/invalid-credential') {
        // Se le credenziali corrispondono all'admin iniziale, assumiamo che sia la prima configurazione.
        if (username === ADMIN_NAME && password === ADMIN_PASSWORD) {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            const user = userCredential.user;
            // Crea il documento dell'utente admin in Firestore
            await setDoc(doc(db, 'users', user.uid), {
              name: ADMIN_NAME,
              role: 'admin',
              avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`
            });
            // Firebase autentica automaticamente il nuovo utente dopo la creazione.
          } catch (creationError: any) {
            // Questo gestore di errori è cruciale. Se la creazione dell'utente fallisce perché
            // l'email esiste già, implica che il tentativo di accesso originale è fallito a causa di una password errata.
            if (creationError.code === 'auth/email-already-in-use') {
              setError("La password non è corretta.");
            } else {
              console.error("Creazione admin fallita:", creationError);
              setError("Errore durante la configurazione iniziale dell'admin.");
            }
          }
        } else {
          // Per qualsiasi altro utente, o se l'admin fornisce la password sbagliata.
          setError("Username o password non validi.");
        }
      } else {
        // Gestisce altri potenziali errori (rete, ecc.)
        console.error("Login fallito:", err);
        setError("Si è verificato un errore. Riprova.");
      }
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Gestionale Clienti</h1>
          <p className="mt-2 text-sm text-slate-600">
            Accedi al tuo account
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Es: Admin-HV"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {error && (
            <p className="text-xs text-red-600 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Accedi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;