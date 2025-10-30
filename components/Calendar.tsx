import React, { useState, useMemo } from 'react';
import type { Task, Client, User } from '../types';
import TaskModal from './TaskModal';
import DayTasksModal from './DayTasksModal';

interface CalendarProps {
  tasks: Task[];
  clients: Client[];
  users: User[];
  onAddTask: (taskData: { clientId: string; title: string; description: string; date: Date }) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);


const Calendar: React.FC<CalendarProps> = ({ tasks, clients, users, onAddTask, onToggleTask, onDeleteTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDayTasksModalOpen, setIsDayTasksModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  const filteredTasksByStatus = useMemo(() => {
    if (completionFilter === 'all') {
      return tasks;
    }
    return tasks.filter(task => completionFilter === 'completed' ? task.completed : !task.completed);
  }, [tasks, completionFilter]);
  
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    filteredTasksByStatus.forEach(task => {
        const dateKey = task.date;
        if (!map.has(dateKey)) {
            map.set(dateKey, []);
        }
        map.get(dateKey)!.push(task);
    });
    return map;
  }, [filteredTasksByStatus]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset, 1);
      return newDate;
    });
  };
  
  const goToToday = () => {
      setCurrentDate(new Date());
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dateKey = day.toISOString().split('T')[0];
    const tasksForDay = tasksByDate.get(dateKey) || [];
    if (tasksForDay.length > 0) {
      setIsDayTasksModalOpen(true);
    } else {
      setIsTaskModalOpen(true);
    }
  };

  const handleAddTask = (task: { clientId: string; title: string; description: string }) => {
    onAddTask({ ...task, date: selectedDate });
    setIsTaskModalOpen(false);
  };
  
  const handleOpenAddTaskModalFromDayView = () => {
    setIsDayTasksModalOpen(false);
    setIsTaskModalOpen(true);
  }

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-slate-800 capitalize">
        {currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
      </h2>
      <div className="flex items-center space-x-4">
        <div className="flex items-center p-1 space-x-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setCompletionFilter('all')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              completionFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tutti
          </button>
          <button
            onClick={() => setCompletionFilter('incomplete')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              completionFilter === 'incomplete' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Da Fare
          </button>
          <button
            onClick={() => setCompletionFilter('completed')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              completionFilter === 'completed' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completati
          </button>
        </div>
        <div className="flex items-center space-x-2">
            <button
            onClick={goToToday}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
            >
            Oggi
            </button>
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <ChevronLeftIcon className="w-5 h-5"/>
            </button>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <ChevronRightIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return (
      <div className="grid grid-cols-7 gap-px">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    const cells = [];
    let day = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
        const d = new Date(day);
        const dateKey = d.toISOString().split('T')[0];
        const tasksForDay = tasksByDate.get(dateKey) || [];
        const allTasksCompleted = tasksForDay.length > 0 && tasksForDay.every(task => task.completed);
        
        const isCurrentMonth = d.getMonth() === currentDate.getMonth();
        const isToday = new Date().toDateString() === d.toDateString();

        cells.push(
            <div
                key={day.toString()}
                className={`relative p-2 h-28 border-t border-l border-slate-200 flex flex-col cursor-pointer transition-colors ${
                    isCurrentMonth ? 'bg-white hover:bg-indigo-50' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
                onClick={() => handleDayClick(d)}
            >
                <span className={`text-sm ${
                    isToday 
                        ? 'font-bold text-indigo-600' 
                        : isCurrentMonth 
                        ? 'text-slate-800' 
                        : 'text-slate-400'
                }`}>
                    {d.getDate()}
                </span>
                {tasksForDay.length > 0 && (
                    <div className={`mt-auto text-xs font-medium rounded px-1.5 py-0.5 self-start ${
                        allTasksCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                        {tasksForDay.length} task{tasksForDay.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>
        );
        day.setDate(day.getDate() + 1);
    }
    return <div className="grid grid-cols-7 gap-px border-r border-b border-slate-200 bg-slate-200">{cells}</div>;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        
        {isTaskModalOpen && <TaskModal
            isOpen={isTaskModalOpen}
            date={selectedDate}
            clients={clients}
            onClose={() => setIsTaskModalOpen(false)}
            onSave={handleAddTask}
        />}
        
        {isDayTasksModalOpen && <DayTasksModal
            isOpen={isDayTasksModalOpen}
            date={selectedDate}
            tasksForDay={tasksByDate.get(selectedDate.toISOString().split('T')[0]) || []}
            clients={clients}
            users={users}
            onClose={() => setIsDayTasksModalOpen(false)}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onAddTask={handleOpenAddTaskModalFromDayView}
        />}
    </div>
  );
};

export default Calendar;