import React from 'react';
import type { Client, User } from '../types';

interface SidebarProps {
  clients: Client[];
  users: User[];
  loggedInUser: User;
  selectedClientId: string | null;
  onSelectClient: (id: string | null) => void;
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onAddUser: () => void;
  onRemoveUser: (id: string) => void;
  onLogout: () => void;
}

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const ArrowRightOnRectangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.718c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const isHexColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);


const Sidebar: React.FC<SidebarProps> = ({ clients, users, loggedInUser, selectedClientId, onSelectClient, onAddClient, onEditClient, onDeleteClient, onAddUser, onRemoveUser, onLogout }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4">
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold text-slate-900">Gestionale</h1>
      </div>
      
      {loggedInUser.role === 'admin' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Utenti</h2>
            <button onClick={onAddUser} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <PlusIcon className="w-5 h-5"/>
            </button>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            {users.map(user => (
              <div key={user.id} className="relative group">
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-white" title={user.name}/>
                <button 
                  onClick={() => onRemoveUser(user.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-slate-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                  aria-label={`Rimuovi ${user.name}`}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Clienti</h2>
          <button onClick={onAddClient} className="text-slate-400 hover:text-indigo-600 transition-colors">
            <PlusIcon className="w-5 h-5"/>
          </button>
        </div>
        
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onSelectClient(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                selectedClientId === null 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400 mr-3"></span>
              Tutti i Clienti
            </button>
          </li>
          {clients.map(client => (
            <li key={client.id} className="group relative">
              <button
                onClick={() => onSelectClient(client.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  selectedClientId === client.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                 <span 
                    className={`w-2 h-2 rounded-full ${isHexColor(client.color) ? '' : `bg-${client.color}-500`} mr-3`}
                    style={isHexColor(client.color) ? { backgroundColor: client.color } : {}}
                ></span>
                {client.name}
              </button>
              {loggedInUser.role === 'admin' && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditClient(client);
                        }}
                        className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full"
                        aria-label={`Modifica ${client.name}`}
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClient(client.id);
                        }}
                        className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded-full"
                        aria-label={`Elimina ${client.name}`}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <img src={loggedInUser.avatarUrl} alt={loggedInUser.name} className="w-8 h-8 rounded-full" />
                <div>
                    <p className="text-sm font-semibold text-slate-800">{loggedInUser.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{loggedInUser.role}</p>
                </div>
            </div>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-600 transition-colors" title="Logout">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;