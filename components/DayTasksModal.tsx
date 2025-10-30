import React, { useState } from 'react';
import type { Client, Task, User } from '../types';

interface DayTasksModalProps {
  isOpen: boolean;
  date: Date;
  tasksForDay: Task[];
  clients: Client[];
  users: User[];
  onClose: () => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
}

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.718c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const LinkifyText = ({ text }: { text: string }) => {
  const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part && part.match(urlRegex)) {
          const url = part.startsWith('www.') ? `https://${part}` : part;
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};

const isHexColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);


const DayTasksModal: React.FC<DayTasksModalProps> = ({ isOpen, date, tasksForDay, clients, users, onClose, onToggleTask, onDeleteTask, onAddTask }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    
  if (!isOpen) return null;

  const clientMap = new Map<string, Client>(clients.map(c => [c.id, c]));
  const userMap = new Map<string, User>(users.map(u => [u.id, u]));

  const formattedDate = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sortedTasks = [...tasksForDay].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1; // false (incomplete) comes first
  });
  
  const handleToggleExpand = (taskId: string) => {
    setExpandedTaskId(prev => (prev === taskId ? null : taskId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-slate-900">Task del Giorno</h3>
                <p className="text-sm text-slate-500">{formattedDate}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {sortedTasks.length > 0 ? (
            <ul className="space-y-3">
              {sortedTasks.map(task => {
                const client = clientMap.get(task.clientId);
                const creator = userMap.get(task.createdBy);
                const isExpanded = expandedTaskId === task.id;
                
                return (
                  <li key={task.id} className={`p-3 bg-slate-50 rounded-md group transition-all duration-200 ${task.completed ? 'bg-opacity-70' : ''}`}>
                     <div className="flex items-start justify-between cursor-pointer" onClick={() => handleToggleExpand(task.id)}>
                        <div className="flex items-start flex-1 min-w-0">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onToggleTask(task.id);
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-3 mt-1 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium text-slate-800 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                                    {task.title}
                                </p>
                                {!isExpanded && client && (
                                    <div className="flex items-center mt-1">
                                        <span 
                                            className={`w-2 h-2 rounded-full ${isHexColor(client.color) ? '' : `bg-${client.color}-500`} mr-2 flex-shrink-0`}
                                            style={isHexColor(client.color) ? { backgroundColor: client.color } : {}}
                                        ></span>
                                        <p className="text-xs text-slate-500 truncate">{client.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} 
                                className="ml-4 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Elimina task"
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                            <ChevronDownIcon className={`w-5 h-5 ml-2 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                    
                    {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 pl-8 space-y-3">
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                                <LinkifyText text={task.description} />
                            </p>
                            {client && (
                                <div className="flex items-center">
                                    <span 
                                        className={`w-2 h-2 rounded-full ${isHexColor(client.color) ? '' : `bg-${client.color}-500`} mr-2 flex-shrink-0`}
                                        style={isHexColor(client.color) ? { backgroundColor: client.color } : {}}
                                    ></span>
                                    <p className="text-xs text-slate-600 truncate">{client.name}</p>
                                </div>
                            )}
                            {creator && (
                                <div className="flex items-center">
                                    <p className="text-xs text-slate-500 mr-2">Creato da:</p>
                                    <img src={creator.avatarUrl} alt={creator.name} className="w-5 h-5 rounded-full mr-1.5"/>
                                    <p className="text-xs font-medium text-slate-700">{creator.name}</p>
                                </div>
                            )}
                        </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Nessun task per questo giorno.</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-slate-50 rounded-b-lg flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Chiudi
          </button>
          <button
            onClick={onAddTask}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Aggiungi Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayTasksModal;