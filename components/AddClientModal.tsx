import React, { useState } from 'react';
import ColorPicker from './ColorPicker';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  defaultColor: string;
}

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSave, defaultColor }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(defaultColor);

  React.useEffect(() => {
    if (isOpen) {
        setName('');
        setColor(defaultColor);
    }
  }, [isOpen, defaultColor]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Per favore, inserisci un nome per il cliente.");
      return;
    }
    onSave(name, color);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Aggiungi Nuovo Cliente</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="client-name" className="block text-sm font-medium text-slate-700 mb-1">
                Nome Cliente
              </label>
              <input
                id="client-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Es: Mario Rossi S.R.L."
                autoFocus
              />
            </div>
            <ColorPicker selectedColor={color} onChange={setColor} />
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
              Salva Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;