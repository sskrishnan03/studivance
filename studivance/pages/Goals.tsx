
import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Goal, GoalStatus } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, TrophyIcon, CalendarDaysIcon, FunnelIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import AIGoalGeneratorModal from '../components/AIGoalGeneratorModal';
import AIIcon from '../components/AIIcon';

const inputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset text-text-primary font-semibold rounded-lg hover:bg-border transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
const filterInputStyles = "w-full py-2 px-3 bg-surface-inset border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-sm text-black";

type GoalFormData = {
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
}

const GoalForm: React.FC<{ goal?: Goal | null, onSave: (goal: any) => void, onCancel: () => void, initialData?: Partial<GoalFormData> }> = ({ goal, onSave, onCancel, initialData }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<GoalFormData>({
        title: goal?.title || initialData?.title || '',
        description: goal?.description || initialData?.description || '',
        targetDate: goal?.targetDate || initialData?.targetDate || '',
        status: goal?.status || initialData?.status || GoalStatus.NotStarted
    });
    
    React.useEffect(() => {
        if(initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({...goal, ...formData});
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('goal_title')}</label>
                    <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g. Get an A in Calculus" required className={inputStyles} />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('description')}</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your goal and motivation" rows={4} className={inputStyles}></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('target_date')}</label>
                        <div className="relative">
                            <input name="targetDate" type="date" value={formData.targetDate} onChange={handleChange} required className={`${inputStyles} pr-10`} />
                            <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('status')}</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                            {Object.values(GoalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>
             <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border -mx-6 -mb-6 px-6 pb-6 bg-surface-muted rounded-b-2xl">
                <button type="button" onClick={onCancel} className={secondaryButtonStyles}>{t('cancel')}</button>
                <button type="submit" className={primaryButtonStyles}>{t('save')}</button>
            </div>
        </form>
    )
}

const Goals: React.FC = () => {
    const { goals, addGoal, updateGoal, deleteGoal } = useData();
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
    const [prefilledData, setPrefilledData] = useState<Partial<GoalFormData> | undefined>(undefined);
    const [filterStatus, setFilterStatus] = useState('all');


    const handleSave = (goal: Goal) => {
        if(goal.id) {
            updateGoal(goal);
        } else {
            addGoal(goal);
        }
        setIsModalOpen(false);
        setPrefilledData(undefined);
    };

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setPrefilledData(undefined);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingGoal(null);
        setPrefilledData(undefined);
        setIsModalOpen(true);
    }
    
    const handleDelete = (goal: Goal) => {
        setDeletingGoal(goal);
    };
    
    const handleConfirmDelete = () => {
        if (deletingGoal) {
            deleteGoal(deletingGoal.id);
        }
        setDeletingGoal(null);
    }
    
    const handleAIGenerate = (data: Partial<GoalFormData>) => {
        setPrefilledData(data);
        setIsAIGeneratorOpen(false);
        setEditingGoal(null);
        setIsModalOpen(true);
    }

    const getStatusClasses = (status: GoalStatus) => {
       switch(status) {
           case GoalStatus.Completed: return 'bg-teal-100 text-teal-800';
           case GoalStatus.InProgress: return 'bg-blue-100 text-blue-800';
           case GoalStatus.NotStarted: return 'bg-gray-100 text-gray-800';
       }
    };

    const filteredGoals = useMemo(() => {
        return goals.filter(goal => {
            return filterStatus === 'all' || goal.status === filterStatus;
        });
    }, [goals, filterStatus]);

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">{t('my_goals')}</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                     <button onClick={() => setIsAIGeneratorOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all duration-300 w-full sm:w-auto">
                        <AIIcon className="h-5 w-5" />
                        <span>{t('generate_ai')}</span>
                    </button>
                    <button onClick={handleAddNew} className={`${pagePrimaryButtonStyles} flex items-center justify-center gap-2 w-full sm:w-auto`}>
                        <PlusIcon className="h-5 w-5" />
                        {t('set_goal')}
                    </button>
                </div>
            </div>

             {/* Filter Bar */}
            <div className="mb-6 p-3 bg-surface rounded-xl border border-border shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-1">
                        <div className="relative">
                            <CheckCircleIcon className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted pointer-events-none" />
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${filterInputStyles} pl-9`}>
                                <option value="all">{t('all')} {t('status')}</option>
                                {Object.values(GoalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="lg:col-span-3 flex items-center">
                         <button onClick={() => setFilterStatus('all')} className="py-2 px-4 text-sm font-medium bg-surface-inset text-text-secondary rounded-lg hover:bg-border hover:text-text-primary transition-colors">
                            {t('reset')} {t('filter')}
                        </button>
                    </div>
                </div>
            </div>

            {goals.length > 0 ? (
                filteredGoals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGoals.map(goal => (
                            <Card key={goal.id} className="flex flex-col group hover:border-primary/30 transition-colors">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-text-primary line-clamp-2">{goal.title}</h3>
                                        <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusClasses(goal.status)}`}>{goal.status}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-2 line-clamp-3 min-h-[3em]">{goal.description}</p>
                                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-text-muted">
                                        <CalendarDaysIcon className="h-4 w-4" />
                                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border -mb-2">
                                    <button onClick={() => handleEdit(goal)} className="p-2 text-text-muted hover:bg-surface-inset hover:text-text-primary rounded-lg transition-colors"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDelete(goal)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-surface">
                        <FunnelIcon className="h-12 w-12 mx-auto text-text-muted" />
                        <h3 className="text-xl font-semibold mt-4 text-text-primary">{t('no_goals_found')}</h3>
                        <p className="text-text-secondary mt-2">No goals match your current filter.</p>
                        <button onClick={() => setFilterStatus('all')} className={`${pagePrimaryButtonStyles} mt-6`}>{t('reset')} {t('filter')}</button>
                    </div>
                )
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-surface">
                    <TrophyIcon className="h-12 w-12 mx-auto text-text-muted" />
                    <h3 className="text-xl font-semibold mt-4 text-text-primary">{t('no_goals_set')}</h3>
                    <p className="text-text-secondary mt-1">Set a new goal to start tracking your ambitions.</p>
                    <button onClick={handleAddNew} className={`${pagePrimaryButtonStyles} mt-6`}>{t('set_goal')}</button>
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setPrefilledData(undefined); }} title={editingGoal ? `${t('edit')} Goal` : `${t('add')} Goal`}>
                <GoalForm goal={editingGoal} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setPrefilledData(undefined); }} initialData={prefilledData} />
            </Modal>
            <AIGoalGeneratorModal 
                isOpen={isAIGeneratorOpen} 
                onClose={() => setIsAIGeneratorOpen(false)}
                onSelectGoal={handleAIGenerate}
            />
            {deletingGoal && (
                <ConfirmationModal
                    isOpen={!!deletingGoal}
                    onClose={() => setDeletingGoal(null)}
                    onConfirm={handleConfirmDelete}
                    title={`${t('delete')} Goal`}
                    message={<>Are you sure you want to delete the goal <strong>{deletingGoal.title}</strong>? This action cannot be undone.</>}
                />
            )}
        </div>
    );
};

export default Goals;
