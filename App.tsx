import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import Login from './components/Login';
import AddClientModal from './components/AddClientModal';
import EditClientModal from './components/EditClientModal';
import ConfirmationModal from './components/ConfirmationModal';
import AddUserModal from './components/AddUserModal';
import { User, Client, Task } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where, getDocs, writeBatch, setDoc } from 'firebase/firestore';
import { COLORS } from './constants';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isConfirmDeleteClientOpen, setIsConfirmDeleteClientOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const dataUnsubscribeRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous user snapshot listener on auth state change
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
      
      setFirebaseUser(user);
      if (user && db) {
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeUserDoc = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setLoggedInUser({ id: doc.id, ...doc.data() } as User);
          } else {
            // User exists in Auth but not in Firestore, sign them out.
            auth.signOut();
          }
          setAuthLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            auth.signOut();
            setAuthLoading(false);
        });
      } else {
        setLoggedInUser(null);
        setAuthLoading(false);
      }
    });

    // Cleanup on component unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
    };
  }, []);

  useEffect(() => {
    // If user logs out, clear data. The cleanup function will also run.
    if (!loggedInUser || !db) {
        setClients([]);
        setTasks([]);
        setUsers([]);
        return;
    }

    // Set up real-time listeners for data
    const unsubscribeClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsData);
    });

    const unsubscribeTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    });
    
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    });
    
    const unsubscribeAll = () => {
        unsubscribeClients();
        unsubscribeTasks();
        unsubscribeUsers();
    }
    
    // Store the cleanup function in the ref
    dataUnsubscribeRef.current = unsubscribeAll;

    // Return the cleanup function to be run when loggedInUser changes or component unmounts
    return () => {
      unsubscribeAll();
      dataUnsubscribeRef.current = () => {};
    };
  }, [loggedInUser]);

  const handleLogout = () => {
    if (!auth) return;
    // Unsubscribe from all data listeners BEFORE signing out to prevent permission errors.
    dataUnsubscribeRef.current();
    auth.signOut();
    setSelectedClientId(null);
  };

  const handleAddClient = async (name: string, color: string) => {
    if (!db) return;
    try {
      await addDoc(collection(db, 'clients'), { name, color });
      setIsAddClientModalOpen(false);
    } catch (error) {
      console.error("Error adding client: ", error);
      alert("Si è verificato un errore. Riprova.");
    }
  };
  
  const handleOpenEditClient = (client: Client) => {
      setClientToEdit(client);
      setIsEditClientModalOpen(true);
  }

  const handleEditClient = async (id: string, name: string, color: string) => {
    if (!db) return;
    const clientDocRef = doc(db, 'clients', id);
    try {
      await updateDoc(clientDocRef, { name, color });
      setIsEditClientModalOpen(false);
      setClientToEdit(null);
    } catch (error) {
      console.error("Error updating client: ", error);
      alert("Si è verificato un errore. Riprova.");
    }
  };

  const handleDeleteClient = (clientId: string) => {
    setClientToDelete(clientId);
    setIsConfirmDeleteClientOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete || !db) return;
    
    try {
      // Find all tasks associated with the client and delete them in a batch
      const tasksQuery = query(collection(db, 'tasks'), where('clientId', '==', clientToDelete));
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const batch = writeBatch(db);
      
      tasksSnapshot.forEach(doc => {
          batch.delete(doc.ref);
      });

      const clientRef = doc(db, 'clients', clientToDelete);
      batch.delete(clientRef);
      
      await batch.commit();

      if (selectedClientId === clientToDelete) {
          setSelectedClientId(null);
      }
    } catch (error) {
      console.error("Error deleting client and tasks: ", error);
      alert("Si è verificato un errore. Riprova.");
    }
    
    setIsConfirmDeleteClientOpen(false);
    setClientToDelete(null);
  };
  
  const handleAddUser = async (name: string, password: string) => {
    if (!db || !auth) return;
  
    try {
      const email = `${name.toLowerCase()}@gestionale.hv`;
    
      // Crea il nuovo utente (questo ti logga automaticamente come nuovo utente)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Salva i dati nel database mentre sei loggato come nuovo utente
      await setDoc(doc(db, 'users', newUser.uid), {
        name: name,
        role: 'user',
        avatarUrl: `https://i.pravatar.cc/150?u=${newUser.uid}`
      });

      // Fai logout per permettere all'admin di rifare il login
      await auth.signOut();
    
      alert("Utente creato con successo! Effettua nuovamente il login.");
      setIsAddUserModalOpen(false);
    
    } catch (error: any) {
      console.error("Error adding user: ", error);
      if (error.code === 'auth/email-already-in-use') {
        alert("Un utente con questo nome esiste già.");
      } else if (error.code === 'auth/weak-password') {
        alert("La password è troppo debole. Deve essere di almeno 6 caratteri.");
      } else {
        alert("Si è verificato un errore durante la creazione dell'utente. Riprova.");
      }
    }
  };

  const handleRemoveUser = async (id: string) => {
    if (!db) return;
    if (users.length <= 1) {
        alert("Non puoi rimuovere l'ultimo utente.");
        return;
    }
    if (id === loggedInUser?.id) {
        alert("Non puoi rimuovere te stesso.");
        return;
    }
    // Note: This only removes user from Firestore collection, not from Firebase Auth.
    // Deleting from Auth is a protected admin action.
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      console.error("Error removing user: ", error);
      alert("Si è verificato un errore. Riprova.");
    }
  };

  const handleAddTask = async (taskData: { clientId: string; title: string; description: string; date: Date }) => {
    if (!loggedInUser || !db) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        date: taskData.date.toISOString().split('T')[0],
        title: taskData.title,
        description: taskData.description,
        clientId: taskData.clientId,
        completed: false,
        createdBy: loggedInUser.id,
      });
    } catch (error) {
      console.error("Error adding task: ", error);
      alert("Si è verificato un errore. Riprova.");
    }
  };
  
  const handleToggleTask = async (taskId: string) => {
    if (!db) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const taskDocRef = doc(db, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, { completed: !task.completed });
    } catch (error) {
      console.error("Error toggling task: ", error);
      alert("Si è verificato un errore. Riprova.");
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
     if (!db) return;
     try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error("Error deleting task: ", error);
      alert("Si è verificato un errore. Riprova.");
    }
  };

  const filteredTasks = useMemo(() => {
    if (!selectedClientId) return tasks;
    return tasks.filter(task => task.clientId === selectedClientId);
  }, [tasks, selectedClientId]);

  if (authLoading) {
      return <div className="flex h-screen items-center justify-center">Caricamento...</div>;
  }

  if (!loggedInUser) {
    return <Login />;
  }

  const nextDefaultColor = COLORS[clients.length % COLORS.length];

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased">
      <Sidebar
        clients={clients}
        users={users}
        loggedInUser={loggedInUser}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        onAddClient={() => setIsAddClientModalOpen(true)}
        onEditClient={handleOpenEditClient}
        onDeleteClient={handleDeleteClient}
        onAddUser={() => setIsAddUserModalOpen(true)}
        onRemoveUser={handleRemoveUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <Calendar 
            tasks={filteredTasks} 
            clients={clients}
            users={users}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
        />
      </main>
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSave={handleAddClient}
        defaultColor={nextDefaultColor}
      />
      {clientToEdit && (
        <EditClientModal
            isOpen={isEditClientModalOpen}
            onClose={() => setIsEditClientModalOpen(false)}
            onSave={handleEditClient}
            client={clientToEdit}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmDeleteClientOpen}
        title="Elimina Cliente"
        message="Sei sicuro di voler eliminare questo cliente? Questa azione è irreversibile e cancellerà anche tutti i task associati."
        onConfirm={confirmDeleteClient}
        onCancel={() => setIsConfirmDeleteClientOpen(false)}
        confirmText="Elimina"
      />
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSave={handleAddUser}
      />
    </div>
  );
}

export default App;