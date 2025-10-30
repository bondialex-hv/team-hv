import React, { useState } from 'react';
import type { Client } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  date: Date;
  clients: Client[];
  onClose: () => void;
  onSave: (task: { clientId: string; title: string; description: string }) => void;
}

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, date, clients, onClose, onSave }) => {
  const [clientId, setClientId] = useState<string>(clients[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title.trim() || !description.trim()) {
      alert("Per favore, compila tutti i campi: cliente, titolo e descrizione.");
      return;
    }
    onSave({ clientId, title, description });
  };

  const formattedDate = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-slate-900">Aggiungi Task</h3>
                <p className="text-sm text-slate-500">{formattedDate}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-slate-700 mb-1">
                Cliente
              </label>
              <select
                id="client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="" disabled>Seleziona un cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Titolo Task
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Es: Meeting di revisione"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                Descrizione Dettagliata
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Es: Discutere i progressi del progetto e pianificare i prossimi passi..."
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 rounded-b-lg flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Salva Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;