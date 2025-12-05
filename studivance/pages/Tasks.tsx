
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Task, TaskStatus, Priority } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, FireIcon, CalendarDaysIcon, XCircleIcon, BookOpenIcon, TagIcon } from '@heroicons/react/24/outline';
import { AITaskGeneratorModal } from '../components/AIGenerators';
import AIIcon from '../components/AIIcon';

const inputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset text-text-primary font-semibold rounded-lg hover:bg-border transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
const filterInputStyles = "w-full py-2 px-3 bg-surface-inset border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-sm text-black";

const TaskForm: React.FC<{ task?: Task | null, onSave: (task: any) => void, onCancel: () => void }> = ({ task, onSave, onCancel }) => {
    const { subjects } = useData();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        title: task?.title || '',
        subjectId: task?.subjectId || '',
        deadline: task?.deadline || '',
        priority: task?.priority || Priority.Medium,
        status: task?.status || TaskStatus.Pending,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...task, ...formData, subjectId: formData.subjectId || undefined });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('task_title')}</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Complete Assignment 1" required className={inputStyles} />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('subject')}</label>
                    <select name="subjectId" value={formData.subjectId} onChange={handleChange} className={inputStyles}>
                        <option value="">{t('general_task')}</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('deadline')}</label>
                        <div className="relative">
                            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className={`${inputStyles} pr-10`} />
                            <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('priority')}</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className={inputStyles}>
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                     <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('status')}</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border -mx-6 -mb-6 px-6 pb-6 bg-surface-muted rounded-b-2xl">
                <button type="button" onClick={onCancel} className={secondaryButtonStyles}>{t('cancel')}</button>
                <button type="submit" className={primaryButtonStyles}>{t('save')}</button>
            </div>
        </form>
    );
};


const TaskCard: React.FC<{ 
    task: Task; 
    onEdit: (task: Task) => void; 
    onDelete: (task: Task) => void; 
    onDragStart: (taskId: string) => void;
}> = ({ task, onEdit, onDelete, onDragStart }) => {
    const { getSubjectById } = useData();
    const { t } = useLanguage();

    const priorityInfo = {
        [Priority.High]: { icon: <FireIcon className="h-4 w-4 text-red-500" />, text: 'High', classes: 'border-red-500' },
        [Priority.Medium]: { icon: null, text: 'Medium', classes: 'border-yellow-500' },
        [Priority.Low]: { icon: null, text: 'Low', classes: 'border-accent' },
    };

    return (
        <div 
            className={`bg-surface rounded-lg border border-border mb-3 p-3.5 border-l-4 ${priorityInfo[task.priority].classes} cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all duration-200`}
            draggable="true"
            onDragStart={() => onDragStart(task.id)}
        >
            <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-text-primary text-sm leading-tight">{task.title}</h4>
                <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => onEdit(task)} className="p-1 text-text-muted hover:bg-surface-inset rounded-md transition-colors"><PencilIcon className="h-3.5 w-3.5"/></button>
                    <button onClick={() => onDelete(task)} className="p-1 text-text-muted hover:bg-red-100 hover:text-red-500 rounded-md transition-colors"><TrashIcon className="h-3.5 w-3.5"/></button>
                </div>
            </div>
            <p className="text-xs text-text-secondary mt-1.5">{getSubjectById(task.subjectId || '')?.title || t('general_task')}</p>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/50">
                <p className="text-[10px] text-black flex items-center gap-1 font-medium">
                    <CalendarDaysIcon className="h-3 w-3 text-black" />
                    {new Date(task.deadline).toLocaleDateString()}
                </p>
                 {priorityInfo[task.priority].icon && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                        {priorityInfo[task.priority].icon}
                        {priorityInfo[task.priority].text}
                    </span>
                 )}
            </div>
        </div>
    )
};


const KanbanColumn: React.FC<{ 
    title: string; 
    tasks: Task[]; 
    onEdit: (task: Task) => void; 
    onDelete: (task: Task) => void; 
    status: TaskStatus;
    onDragStart: (taskId: string) => void;
    onDrop: (status: TaskStatus) => void;
}> = ({ title, tasks, onEdit, onDelete, status, onDragStart, onDrop }) => {
    const [isOver, setIsOver] = useState(false);
    const { t } = useLanguage();
    
    const statusColors = {
        [TaskStatus.Pending]: 'border-yellow-500 text-yellow-600 bg-yellow-50',
        [TaskStatus.InProgress]: 'border-blue-500 text-blue-600 bg-blue-50',
        [TaskStatus.Submitted]: 'border-green-500 text-green-600 bg-green-50',
    };
    
    const headerClasses = {
        [TaskStatus.Pending]: 'bg-yellow-50 border-b-yellow-200 text-yellow-700',
        [TaskStatus.InProgress]: 'bg-blue-50 border-b-blue-200 text-blue-700',
        [TaskStatus.Submitted]: 'bg-green-50 border-b-green-200 text-green-700',
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(status);
    };

    return (
        <div 
            className={`bg-surface-inset rounded-xl w-full transition-colors border-2 h-full flex flex-col ${isOver ? 'border-primary bg-primary/5' : 'border-transparent'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className={`p-3 rounded-t-xl border-b border-border flex justify-between items-center ${headerClasses[status]}`}>
                 <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
                 <span className="text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full shadow-sm">{tasks.length}</span>
            </div>
            
            <div className="p-3 flex-grow overflow-y-auto min-h-[150px]">
                {tasks.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onDragStart={onDragStart} />)}
                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-text-muted/50 border-2 border-dashed border-border/50 rounded-lg p-4">
                        <span className="text-sm">{t('drop_items')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};


const Tasks: React.FC = () => {
    const { tasks, subjects, addTask, updateTask, deleteTask } = useData();
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const [filterSubjectId, setFilterSubjectId] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const handleAdd = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };
    
    const handleDelete = (task: Task) => {
        setDeletingTask(task);
    };

    const handleConfirmDelete = () => {
        if (deletingTask) {
            deleteTask(deletingTask.id);
        }
        setDeletingTask(null);
    };

    const handleSave = (task: Task) => {
        if(task.id) {
            updateTask(task);
        } else {
            addTask(task);
        }
        setIsModalOpen(false);
    };

    const handleAIGeneratedTasks = (generated: { title: string; priority: 'High' | 'Medium' | 'Low' }[]) => {
        generated.forEach(t => {
            addTask({
                title: t.title,
                priority: t.priority as Priority,
                status: TaskStatus.Pending,
                deadline: new Date().toISOString().split('T')[0], // Default to today
                subjectId: undefined
            });
        });
        setIsAIGeneratorOpen(false);
    };
    
    const handleDrop = (newStatus: TaskStatus) => {
        if(!draggedTaskId) return;
        const taskToMove = tasks.find(t => t.id === draggedTaskId);
        if (taskToMove && taskToMove.status !== newStatus) {
            updateTask({ ...taskToMove, status: newStatus });
        }
        setDraggedTaskId(null);
    };
    
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const subjectMatch = filterSubjectId === 'all' || task.subjectId === filterSubjectId;
            const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
            const startMatch = !filterStartDate || task.deadline >= filterStartDate;
            const endMatch = !filterEndDate || task.deadline <= filterEndDate;
            return subjectMatch && priorityMatch && startMatch && endMatch;
        });
    }, [tasks, filterSubjectId, filterPriority, filterStartDate, filterEndDate]);

    const categorizedTasks = useMemo(() => {
        return filteredTasks.reduce((acc, task) => {
            if (!acc[task.status]) acc[task.status] = [];
            acc[task.status].push(task);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [filteredTasks]);

    const handleResetFilters = () => {
        setFilterSubjectId('all');
        setFilterPriority('all');
        setFilterStartDate('');
        setFilterEndDate('');
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">{t('task_board')}</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button onClick={() => setIsAIGeneratorOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all duration-300 w-full sm:w-auto">
                        <AIIcon className="h-5 w-5" />
                        <span>{t('generate_ai')}</span>
                    </button>
                    <button onClick={handleAdd} className={`${pagePrimaryButtonStyles} flex items-center gap-2 justify-center w-full sm:w-auto`}>
                        <PlusIcon className="h-5 w-5" />
                        {t('add')}
                    </button>
                </div>
            </div>
            
            {/* Filter Bar */}
            <div className="mb-6 p-3 bg-surface rounded-xl border border-border shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="lg:col-span-1">
                        <div className="relative">
                            <BookOpenIcon className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <select value={filterSubjectId} onChange={e => setFilterSubjectId(e.target.value)} className={`${filterInputStyles} pl-9`}>
                                <option value="all">{t('all_subjects')}</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                         <div className="relative">
                            <TagIcon className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={`${filterInputStyles} pl-9`}>
                                <option value="all">{t('all_priorities')}</option>
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="relative">
                            <CalendarDaysIcon className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-black pointer-events-none" />
                            <input type="date" placeholder="Start" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className={`${filterInputStyles} pl-9`} />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                         <div className="relative">
                            <CalendarDaysIcon className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-black pointer-events-none" />
                            <input type="date" placeholder="End" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className={`${filterInputStyles} pl-9`} />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button onClick={handleResetFilters} className="w-full py-2 px-4 text-sm font-medium bg-surface-inset text-text-secondary rounded-lg hover:bg-border hover:text-text-primary transition-colors">
                            {t('reset')} {t('filter')}
                        </button>
                    </div>
                </div>
            </div>

            {tasks.length > 0 ? (
                filteredTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                        {(Object.keys(TaskStatus) as Array<keyof typeof TaskStatus>).map(key => (
                            <KanbanColumn 
                                key={TaskStatus[key]}
                                title={t(TaskStatus[key].toLowerCase().replace(' ', '_'))} // Use translation key based on enum value
                                tasks={(categorizedTasks[TaskStatus[key]] || []).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete}
                                status={TaskStatus[key]}
                                onDragStart={setDraggedTaskId}
                                onDrop={handleDrop}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-surface">
                         <XCircleIcon className="h-12 w-12 mx-auto text-text-muted" />
                        <h3 className="text-xl font-semibold mt-4 text-text-primary">{t('no_tasks')}</h3>
                        <p className="text-text-secondary mt-2">No tasks match your current filters. Try adjusting your search.</p>
                        <button onClick={handleResetFilters} className={`${pagePrimaryButtonStyles} mt-6`}>Clear Filters</button>
                    </div>
                )
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-surface">
                     <CheckCircleIcon className="h-12 w-12 mx-auto text-text-muted" />
                    <h3 className="text-xl font-semibold mt-4 text-text-primary">{t('caught_up')}</h3>
                    <p className="text-text-secondary mt-2">{t('create_task_start')}</p>
                    <div className="flex gap-4 justify-center mt-6">
                        <button onClick={() => setIsAIGeneratorOpen(true)} className="px-5 py-2.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all">
                            {t('generate_ai')}
                        </button>
                        <button onClick={handleAdd} className={`${pagePrimaryButtonStyles}`}>{t('add')} Task</button>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? `${t('edit')} Task` : `${t('add')} Task`}>
                <TaskForm task={editingTask} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            
            <AITaskGeneratorModal 
                isOpen={isAIGeneratorOpen} 
                onClose={() => setIsAIGeneratorOpen(false)} 
                onGenerate={handleAIGeneratedTasks} 
            />

            {deletingTask && (
                <ConfirmationModal
                    isOpen={!!deletingTask}
                    onClose={() => setDeletingTask(null)}
                    onConfirm={handleConfirmDelete}
                    title={`${t('delete')} Task`}
                    message={<>Are you sure you want to delete the task <strong>{deletingTask.title}</strong>? This action cannot be undone.</>}
                />
            )}
        </div>
    );
};

export default Tasks;
