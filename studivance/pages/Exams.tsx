
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Exam, SubjectType } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, AcademicCapIcon, CalendarDaysIcon, FunnelIcon, BookOpenIcon, TagIcon } from '@heroicons/react/24/outline';
import AIStudyGuideModal from '../components/AIStudyGuideModal';
import { AIExamGeneratorModal } from '../components/AIGenerators';
import AIIcon from '../components/AIIcon';

const inputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset text-text-primary font-semibold rounded-lg hover:bg-border transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
const filterInputStyles = "w-full py-2 px-3 bg-surface-inset border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-sm text-black";

const ExamForm: React.FC<{ exam?: Exam | null, onSave: (exam: any) => void, onCancel: () => void }> = ({ exam, onSave, onCancel }) => {
    const { subjects } = useData();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        title: exam?.title || '',
        subjectId: exam?.subjectId || (subjects.length > 0 ? subjects[0].id : ''),
        date: exam?.date || '',
        type: exam?.type || SubjectType.Theory
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.subjectId) {
            alert("Please create a subject first.");
            return;
        }
        onSave({ ...exam, ...formData });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('exam_title')}</label>
                    <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g. Midterm, Final" required className={inputStyles} />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('subject')}</label>
                    <select name="subjectId" value={formData.subjectId} onChange={handleChange} required className={inputStyles}>
                        <option value="" disabled>{t('select_subject')}</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('date')}</label>
                        <div className="relative">
                            <input name="date" type="date" value={formData.date} onChange={handleChange} required className={`${inputStyles} pr-10`} />
                            <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('type')}</label>
                        <select name="type" value={formData.type} onChange={handleChange} className={inputStyles}>
                            {Object.values(SubjectType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border -mx-6 -mb-6 px-6 pb-6 bg-surface-muted rounded-b-2xl">
                <button type="button" onClick={onCancel} className={secondaryButtonStyles}>{t('cancel')}</button>
                <button type="submit" className={primaryButtonStyles} disabled={subjects.length === 0}>{t('save')}</button>
            </div>
        </form>
    );
};


const Countdown: React.FC<{ date: string, color: string }> = ({ date, color }) => {
    const { t } = useLanguage();
    const calculateTimeLeft = () => {
        const difference = +new Date(date) - +new Date();
        let timeLeft: { days?: number, hours?: number, minutes?: number, seconds?: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [date]);

    if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && timeLeft.days !== 0) {
        return <div className="text-center p-4 rounded-lg mt-4 bg-surface-inset"><span className="font-bold text-red-500">Exam day is here or has passed!</span></div>;
    }

    const timeParts = [
        { label: t('days'), value: timeLeft.days },
        { label: t('hours'), value: timeLeft.hours },
        { label: t('minutes'), value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    return (
        <div className="grid grid-cols-4 gap-2 text-center mt-4">
            {timeParts.map(part => (
                <div key={part.label} className="p-2 bg-surface-inset rounded-lg border border-border/50">
                    <p className="text-2xl font-bold" style={{ color: color }}>{String(part.value || 0).padStart(2, '0')}</p>
                    <p className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">{part.label}</p>
                </div>
            ))}
        </div>
    );
};


const Exams: React.FC = () => {
  const { exams, subjects, addExam, updateExam, deleteExam, getSubjectById } = useData();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
  const [studyGuideExam, setStudyGuideExam] = useState<Exam | null>(null);

  const [filterSubjectId, setFilterSubjectId] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const handleSave = (exam: Exam) => {
      if(exam.id) {
          updateExam(exam);
      } else {
          addExam(exam);
      }
      setIsModalOpen(false);
  };
  
  const handleAIGeneratedExams = (generated: { title: string; type: 'Theory' | 'Practical' }[]) => {
      generated.forEach(e => {
          addExam({
              title: e.title,
              type: e.type as SubjectType,
              date: new Date().toISOString().split('T')[0], // Default to today, user edits later
              subjectId: subjects.length > 0 ? subjects[0].id : ''
          });
      });
      setIsAIGeneratorOpen(false);
      alert("Exams added. Please edit them to set correct dates and subjects.");
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };
  
  const handleDelete = (exam: Exam) => {
      setDeletingExam(exam);
  };

  const handleConfirmDelete = () => {
    if (deletingExam) {
      deleteExam(deletingExam.id);
    }
    setDeletingExam(null);
  }

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
        const subjectMatch = filterSubjectId === 'all' || exam.subjectId === filterSubjectId;
        const typeMatch = filterType === 'all' || exam.type === filterType;
        return subjectMatch && typeMatch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams, filterSubjectId, filterType]);

  const handleResetFilters = () => {
    setFilterSubjectId('all');
    setFilterType('all');
  }

  return (
    <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">{t('exam_schedule')}</h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button onClick={() => setIsAIGeneratorOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all duration-300 w-full sm:w-auto">
                    <AIIcon className="h-5 w-5" />
                    <span>{t('generate_ai')}</span>
                </button>
                <button onClick={() => { setEditingExam(null); setIsModalOpen(true); }} className={`${pagePrimaryButtonStyles} flex items-center gap-2 justify-center w-full sm:w-auto`}>
                    <PlusIcon className="h-5 w-5" />
                    {t('add')} Exam
                </button>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 p-3 bg-surface rounded-xl border border-border shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={`${filterInputStyles} pl-9`}>
                            <option value="all">{t('all_types')}</option>
                            {Object.values(SubjectType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div className="lg:col-span-2 flex items-center">
                    <button onClick={handleResetFilters} className="py-2 px-4 text-sm font-medium bg-surface-inset text-text-secondary rounded-lg hover:bg-border hover:text-text-primary transition-colors">
                        {t('reset')} {t('filter')}
                    </button>
                </div>
            </div>
        </div>

        {exams.length > 0 ? (
            filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredExams.map(exam => {
                        const subject = getSubjectById(exam.subjectId);
                        const subjectColor = subject?.color || '#EF4444';
                        return (
                            <Card key={exam.id} className="border-t-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: subjectColor }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-xl font-bold text-text-primary">{exam.title}</h3>
                                        {subject && (
                                            <span 
                                                className="px-2.5 py-1 text-xs font-semibold rounded-full inline-block mt-2" 
                                                style={{ backgroundColor: `${subjectColor}20`, color: subjectColor }}
                                            >
                                                {subject.title}
                                            </span>
                                        )}
                                        <p className="text-sm font-semibold mt-2 flex items-center gap-2" style={{ color: subjectColor }}>
                                            <CalendarDaysIcon className="h-4 w-4" />
                                            {new Date(exam.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                     <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => setStudyGuideExam(exam)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="AI Study Guide">
                                          <AIIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleEdit(exam)} className="p-2 text-text-muted hover:bg-surface-inset hover:text-text-primary rounded-lg transition-colors"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(exam)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </div>
                                <Countdown date={exam.date} color={subjectColor} />
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-surface">
                    <FunnelIcon className="h-12 w-12 mx-auto text-text-muted" />
                    <h3 className="text-xl font-semibold mt-4 text-text-primary">{t('no_exams')}</h3>
                    <p className="text-text-secondary mt-2">No exams match your current filters.</p>
                    <button onClick={handleResetFilters} className={`${pagePrimaryButtonStyles} mt-6`}>{t('reset')} {t('filter')}</button>
                </div>
            )
        ) : (
             <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-surface">
                <AcademicCapIcon className="h-12 w-12 mx-auto text-text-muted" />
                <h3 className="text-xl font-semibold mt-4 text-text-primary">{t('no_exams_scheduled')}</h3>
                <p className="text-text-secondary mt-2">Stay ahead of the game. Add your upcoming exams to start the countdown.</p>
                <div className="flex gap-4 justify-center mt-6">
                    <button onClick={() => setIsAIGeneratorOpen(true)} className="px-5 py-2.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all">
                        {t('generate_ai')}
                    </button>
                    <button onClick={() => { setEditingExam(null); setIsModalOpen(true); }} className={`${pagePrimaryButtonStyles}`}>{t('schedule_exam')}</button>
                </div>
            </div>
        )}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExam ? `${t('edit')} Exam` : `${t('add')} Exam`}>
            <ExamForm exam={editingExam} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
        </Modal>
        
        <AIExamGeneratorModal 
            isOpen={isAIGeneratorOpen} 
            onClose={() => setIsAIGeneratorOpen(false)} 
            onGenerate={handleAIGeneratedExams} 
        />

        {deletingExam && (
            <ConfirmationModal
                isOpen={!!deletingExam}
                onClose={() => setDeletingExam(null)}
                onConfirm={handleConfirmDelete}
                title={`${t('delete')} Exam`}
                message={<>Are you sure you want to delete the <strong>{deletingExam.title}</strong> exam for <strong>{getSubjectById(deletingExam.subjectId)?.title}</strong>? This action cannot be undone.</>}
            />
        )}
        {studyGuideExam && (
            <AIStudyGuideModal
                isOpen={!!studyGuideExam}
                onClose={() => setStudyGuideExam(null)}
                exam={studyGuideExam}
            />
        )}
    </div>
  );
};

export default Exams;
