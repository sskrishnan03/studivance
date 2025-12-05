
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TimetableEvent } from '../types';
import { PlusIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/24/outline';
import { AITimetableGeneratorModal } from '../components/AIGenerators';
import AIIcon from '../components/AIIcon';

const inputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset text-text-primary font-semibold rounded-lg hover:bg-border transition-colors duration-200 text-sm";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
const dangerButtonStyles = "px-5 py-2.5 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm";

// Date utility functions
const toYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};
const isSameDate = (date1: Date, date2str: string) => toYYYYMMDD(date1) === date2str;


const EventForm: React.FC<{ 
    event?: TimetableEvent | null; 
    onSave: (event: any) => void; 
    onCancel: () => void; 
    onDelete?: (event: TimetableEvent) => void; 
}> = ({ event, onSave, onCancel, onDelete }) => {
    const { subjects } = useData();
    const { t } = useLanguage();
    const [eventType, setEventType] = useState<'subject' | 'custom'>(event?.subjectId ? 'subject' : 'custom');
    
    const [formData, setFormData] = useState({
        title: event?.title || '',
        date: event?.date || toYYYYMMDD(new Date()),
        startTime: event?.startTime || '09:00',
        endTime: event?.endTime || '10:00',
        color: event?.color || '#8B1E1E', // Updated default
        subjectId: event?.subjectId || (subjects.length > 0 ? subjects[0].id : undefined)
    });
    
    useEffect(() => {
        if (eventType === 'subject') {
            const subject = subjects.find(s => s.id === formData.subjectId);

            if (!subject && subjects.length > 0) {
                const firstSubject = subjects[0];
                setFormData(prev => ({
                    ...prev,
                    title: firstSubject.title,
                    color: firstSubject.color,
                    subjectId: firstSubject.id,
                }));
            } 
            else if (subject && (formData.title !== subject.title || formData.color !== subject.color)) {
                setFormData(prev => ({
                    ...prev,
                    title: subject.title,
                    color: subject.color,
                }));
            }
        } else { // eventType is 'custom'
            if (formData.subjectId !== undefined) {
                 setFormData(prev => ({ 
                     ...prev, 
                     subjectId: undefined,
                     // Don't reset color if editing an existing custom event
                     color: event?.color && !event.subjectId ? event.color : '#8B1E1E',
                     title: event?.subjectId ? '' : (event?.title || '')
                }));
            }
        }
    }, [eventType, formData.subjectId, subjects, event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...event, ...formData });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-5">
                {/* Event Type Toggle */}
                <div className="flex p-1 bg-surface-inset rounded-lg border border-border">
                    <button
                        type="button"
                        onClick={() => setEventType('subject')}
                        disabled={subjects.length === 0}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${eventType === 'subject' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        {t('from_subject')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setEventType('custom')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${eventType === 'custom' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        {t('custom_event')}
                    </button>
                </div>

                {/* Title / Subject Selection */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        {eventType === 'subject' ? t('select_subject') : t('event_title')}
                    </label>
                    {eventType === 'subject' ? (
                        <select name="subjectId" value={formData.subjectId || ''} onChange={handleChange} className={inputStyles} disabled={subjects.length === 0}>
                            {subjects.length > 0 ? (
                            subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                            ) : (
                            <option>Please create a subject first</option>
                            )}
                        </select>
                    ) : (
                        <div className="relative">
                            <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Group Study, Gym, Meeting" required className={`${inputStyles} pl-10`} />
                        </div>
                    )}
                </div>
                
                {/* Date Input */}
                <div>
                     <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('date')}</label>
                    <div className="relative">
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className={`${inputStyles} pr-10`} required />
                        <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                    </div>
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('start_time')}</label>
                        <div className="relative">
                            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={inputStyles} required />
                            <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('end_time')}</label>
                        <div className="relative">
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={inputStyles} required />
                            <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Color Picker (Only for Custom Events) */}
                {eventType === 'custom' && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('event_color')}</label>
                        <div className="flex items-center gap-3">
                             <input type="color" name="color" value={formData.color} onChange={handleChange} className="h-10 w-20 p-1 bg-surface border border-border rounded-lg cursor-pointer" />
                             <span className="text-sm text-text-muted">{formData.color}</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer Actions */}
            <div className="mt-8 pt-4 flex justify-between items-center border-t border-border -mx-6 -mb-6 px-6 pb-6 bg-surface-muted rounded-b-2xl">
                <div>
                     {event && onDelete && (
                        <button type="button" onClick={() => onDelete(event)} className={dangerButtonStyles}>{t('delete')}</button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onCancel} className={secondaryButtonStyles}>{t('cancel')}</button>
                    <button type="submit" className={primaryButtonStyles} disabled={eventType==='subject' && subjects.length === 0}>{t('save')}</button>
                </div>
            </div>
        </form>
    );
};

const Timetable: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useData();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<TimetableEvent | null>(null);
  const [currentView, setCurrentView] = useState<'week' | 'month' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleSave = (event: TimetableEvent) => {
    if(event.id) {
        updateEvent(event);
    } else {
        addEvent(event);
    }
    setIsModalOpen(false);
  };

  const handleAIGeneratedTimetable = (generated: { title: string; dayOfWeek: number; startTime: string; endTime: string }[]) => {
      // Calculate start of current week (Sunday)
      const curr = new Date(); // get current date
      const first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
      
      generated.forEach(evt => {
          const eventDate = new Date(curr.setDate(first + evt.dayOfWeek));
          addEvent({
              title: evt.title,
              date: toYYYYMMDD(eventDate),
              startTime: evt.startTime,
              endTime: evt.endTime,
              color: '#4B5563', // Default color
              subjectId: undefined
          });
      });
      setIsAIGeneratorOpen(false);
  };
  
  const handleEdit = (event: TimetableEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };
  
  const handleDelete = (event: TimetableEvent) => {
    setIsModalOpen(false);
    setDeletingEvent(event);
  };

  const handleConfirmDelete = () => {
    if (deletingEvent) {
      deleteEvent(deletingEvent.id);
    }
    setDeletingEvent(null);
  }

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'week') newDate.setDate(currentDate.getDate() - 7);
    else if (currentView === 'month') newDate.setMonth(currentDate.getMonth() - 1);
    else if (currentView === 'day') newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'week') newDate.setDate(currentDate.getDate() + 7);
    else if (currentView === 'month') newDate.setMonth(currentDate.getMonth() + 1);
    else if (currentView === 'day') newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => setCurrentDate(new Date());
  
  const getHeaderTitle = () => {
    if (currentView === 'week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (currentView === 'month') return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  const hours = Array.from({length: 15}, (_, i) => `${String(i + 7).padStart(2, '0')}:00`); // 7am to 9pm
  const getEventPosition = (event: TimetableEvent) => {
      const start = (parseInt(event.startTime.split(':')[0]) - 7) * 60 + parseInt(event.startTime.split(':')[1]);
      const end = (parseInt(event.endTime.split(':')[0]) - 7) * 60 + parseInt(event.endTime.split(':')[1]);
      const top = Math.max(0, (start / (15 * 60)) * 100);
      const height = Math.max(0, ((end - start) / (15 * 60)) * 100);
      return { top: `${top}%`, height: `${height}%` };
  }

  const renderWeeklyView = () => {
    const today = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDates = Array.from({length: 7}, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
    });

    return (
        <Card>
            <div className="grid grid-cols-[auto_repeat(7,1fr)]">
                <div className="text-center font-semibold"></div>
                {weekDates.map(date => (
                    <div key={date.toString()} className="text-center font-semibold pb-2 border-b-2 border-border text-text-primary">
                        <span className="text-sm">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                        <div className={`mt-1 text-lg ${isSameDate(date, toYYYYMMDD(today)) ? 'bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center mx-auto' : ''}`}>{date.getDate()}</div>
                    </div>
                ))}

                <div className="col-start-1 pr-2">
                    {hours.map(hour => <div key={hour} className="h-20 text-right text-sm text-text-muted border-t border-border-muted mt-[-1px] pt-1">{hour}</div>)}
                </div>

                <div className="col-start-2 col-span-7 grid grid-cols-7 relative">
                    {weekDates.map((date, dayIndex) => (
                        <div key={dayIndex} className="border-l border-border-muted relative">
                            {hours.map((_, hourIndex) => <div key={hourIndex} className="h-20 border-t border-border-muted"></div>)}
                            {events.filter(e => isSameDate(date, e.date)).map(event => (
                                 <div key={event.id} className={`absolute text-white p-2 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow border border-white/20 w-[95%] left-[2.5%] z-10`} style={{...getEventPosition(event), backgroundColor: event.color}} onClick={() => handleEdit(event)}>
                                    <p className="font-bold text-sm leading-tight">{event.title}</p>
                                    <p className="text-xs opacity-90">{event.startTime} - {event.endTime}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
  };
  
  const renderMonthlyView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(year, month, i));
    
    const today = new Date();
    
    return (
        <Card>
            <div className="grid grid-cols-7 text-center font-semibold text-text-secondary border-b border-border pb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-5">
                {calendarDays.map((day, index) => (
                    <div key={index} className="h-32 border-b border-r border-border-muted p-2 overflow-hidden flex flex-col cursor-pointer hover:bg-surface-muted transition-colors" onClick={() => day && (setCurrentDate(day), setCurrentView('day'))}>
                        {day && (
                            <>
                                <span className={`font-semibold text-sm ${isSameDate(day, toYYYYMMDD(today)) ? 'bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>{day.getDate()}</span>
                                <div className="mt-1 space-y-1 overflow-y-auto custom-scrollbar">
                                {events.filter(e => isSameDate(day, e.date)).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(event => (
                                    <div key={event.id} className="text-white text-xs p-1 rounded overflow-hidden truncate shadow-sm" style={{ backgroundColor: event.color }} onClick={(e) => { e.stopPropagation(); handleEdit(event); }}>
                                    {event.title}
                                    </div>
                                ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
  };
  
  const renderDailyView = () => {
    const dayEvents = events.filter(e => isSameDate(currentDate, e.date)).sort((a,b) => a.startTime.localeCompare(b.startTime));
    return (
        <Card>
            <div className="grid grid-cols-[auto_1fr]">
                 <div className="col-start-1 pr-2">
                    {hours.map(hour => <div key={hour} className="h-20 text-right text-sm text-text-muted border-t border-border-muted mt-[-1px] pt-1">{hour}</div>)}
                </div>
                <div className="relative">
                    {hours.map((_, hourIndex) => <div key={hourIndex} className="h-20 border-t border-border-muted"></div>)}
                    {dayEvents.map(event => (
                        <div key={event.id} className={`absolute text-white p-3 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow border border-white/20 w-full z-10`} style={{...getEventPosition(event), backgroundColor: event.color}} onClick={() => handleEdit(event)}>
                            <div className="flex justify-between items-start">
                                <p className="font-bold text-base leading-tight">{event.title}</p>
                                <p className="text-sm opacity-90 font-medium">{event.startTime} - {event.endTime}</p>
                            </div>
                        </div>
                    ))}
                    {dayEvents.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-text-muted pointer-events-none">
                            <p>No events scheduled for today</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
  };

  return (
    <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                 <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary whitespace-nowrap">
                    {getHeaderTitle()}
                 </h1>
                <div className="flex items-center gap-1 bg-surface-inset p-1 rounded-lg border border-border self-start sm:self-auto">
                    <button onClick={handlePrev} className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary hover:shadow-sm transition-all"><ChevronLeftIcon className="h-5 w-5" /></button>
                    <button onClick={handleToday} className="px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-surface text-text-secondary hover:text-text-primary hover:shadow-sm transition-all">{t('today')}</button>
                    <button onClick={handleNext} className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary hover:shadow-sm transition-all"><ChevronRightIcon className="h-5 w-5" /></button>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button onClick={() => setIsAIGeneratorOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all duration-300 w-full sm:w-auto">
                    <AIIcon className="h-5 w-5" />
                    <span>{t('generate_ai')}</span>
                </button>
                <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className={`${pagePrimaryButtonStyles} flex items-center gap-2 w-full sm:w-auto justify-center`}>
                    <PlusIcon className="h-5 w-5" />
                    <span>{t('add')} Event</span>
                </button>
            </div>
        </div>

        <div className="mb-6">
            <div className="inline-flex rounded-lg bg-surface-inset p-1 border border-border w-full sm:w-auto">
                <button 
                    onClick={() => setCurrentView('month')} 
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${currentView === 'month' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >{t('month')}</button>
                <button 
                    onClick={() => setCurrentView('week')} 
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${currentView === 'week' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >{t('week')}</button>
                <button 
                    onClick={() => setCurrentView('day')} 
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${currentView === 'day' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >{t('day')}</button>
            </div>
        </div>

        {currentView === 'week' && renderWeeklyView()}
        {currentView === 'month' && renderMonthlyView()}
        {currentView === 'day' && renderDailyView()}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? `${t('edit')} Event` : `${t('add')} Event`}>
            <EventForm event={editingEvent} onSave={handleSave} onCancel={() => setIsModalOpen(false)} onDelete={handleDelete} />
        </Modal>
        
        <AITimetableGeneratorModal 
            isOpen={isAIGeneratorOpen} 
            onClose={() => setIsAIGeneratorOpen(false)} 
            onGenerate={handleAIGeneratedTimetable} 
        />

        {deletingEvent && (
            <ConfirmationModal
                isOpen={!!deletingEvent}
                onClose={() => setDeletingEvent(null)}
                onConfirm={handleConfirmDelete}
                title={`${t('delete')} Event`}
                message={<>Are you sure you want to delete the event <strong>{deletingEvent.title}</strong>? This action cannot be undone.</>}
            />
        )}
    </div>
  );
};

export default Timetable;
