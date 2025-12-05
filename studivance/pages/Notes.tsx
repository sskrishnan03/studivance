
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/Card';
import ConfirmationModal from '../components/ConfirmationModal';
import { Note, NoteAttachment, Subject } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, SparklesIcon, MagnifyingGlassIcon, DocumentPlusIcon, BookmarkIcon, ArrowLeftIcon, TagIcon, PaperClipIcon, ArrowDownTrayIcon, FolderIcon } from '@heroicons/react/24/outline';
import NoteEditor from '../components/NoteEditor';
import AIAssistantModal from '../components/AIAssistantModal';
import AIGenerateNoteModal from '../components/AIGenerateNoteModal';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import AIIcon from '../components/AIIcon';
import { useTheme } from '../contexts/ThemeContext';

const pageInputStyles = "w-full p-2.5 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:ring-2 focus:ring-primary focus:border-primary transition";
const pagePrimaryButtonStyles = "w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";

// --- Sub Components ---

const AttachmentPreview: React.FC<{ attachment: NoteAttachment }> = ({ attachment }) => {
    const isImage = attachment.type.startsWith('image/');
    const isPDF = attachment.type === 'application/pdf';

    return (
        <div className="p-4 bg-surface-muted rounded-lg border border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                    <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-primary" />
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" title={attachment.name}>{attachment.name}</p>
                        <p className="text-xs text-text-muted">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
                <a 
                    href={attachment.dataUrl} 
                    download={attachment.name} 
                    className="flex items-center gap-1 text-primary text-xs font-bold hover:underline"
                    title="Download"
                >
                    <ArrowDownTrayIcon className="h-4 w-4" /> Download
                </a>
            </div>
            
            {isImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border bg-black/5">
                    <img src={attachment.dataUrl} alt={attachment.name} className="max-w-full max-h-[400px] object-contain mx-auto" />
                </div>
            )}
            
            {isPDF && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                    <embed src={attachment.dataUrl} type="application/pdf" width="100%" height="500px" />
                </div>
            )}
        </div>
    );
};

const NoteListItem: React.FC<{ note: Note; isSelected: boolean; onSelect: (id: string) => void }> = ({ note, isSelected, onSelect }) => (
    <div 
        onClick={() => onSelect(note.id)}
        className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${isSelected ? 'bg-primary/10 border-primary' : 'border-transparent hover:bg-black/5'}`}
    >
        <div className="flex justify-between items-start">
            <h3 className="font-semibold text-text-primary truncate pr-2">{note.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
                {(note.fileDataUrl || (note.attachments && note.attachments.length > 0)) && <PaperClipIcon className="h-4 w-4 text-text-muted" />}
            </div>
        </div>
        
        {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
                {note.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-surface-inset border border-border rounded-full text-text-secondary truncate max-w-[80px]">
                        {tag}
                    </span>
                ))}
                {note.tags.length > 3 && <span className="text-[10px] text-text-muted">+{note.tags.length - 3}</span>}
            </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-text-muted mt-1">
          <span>{new Date(note.lastModified).toLocaleDateString()}</span>
        </div>
    </div>
);

const NotePlaceholder: React.FC<{ view: string; onCreateNew: () => void }> = ({ view, onCreateNew }) => {
    const { t } = useLanguage();
    let message = "Select a note from the left to view its content, or create a new one.";
    let title = t('select_note');
    let icon = <DocumentPlusIcon className="h-16 w-16 text-text-muted" />;
    
    if (view === 'subjects') {
        title = t('select_subject');
        message = "Choose a subject from the list to view and manage your notes.";
        icon = <BookmarkIcon className="h-16 w-16 text-text-muted" />;
    } else if (view === 'topics') {
        title = t('select_topic');
        message = "Choose a topic to see notes, or select a note directly.";
    }

    return (
        <div className="h-full flex flex-col items-center justify-center text-center bg-surface-muted rounded-2xl border-2 border-dashed border-border min-h-[50vh]">
            {icon}
            <h3 className="text-xl font-semibold mt-4 text-text-primary">{title}</h3>
            <p className="text-text-secondary mt-1">{message}</p>
             <button onClick={onCreateNew} className={`${pagePrimaryButtonStyles} mt-6 flex items-center gap-2`}>
                <PlusIcon className="h-5 w-5" />
                {t('create_new_note')}
            </button>
        </div>
    );
};

const NoteDetailView: React.FC<{ 
    note: Note; 
    subjects: Subject[];
    onSave: (data: any) => void;
    onCancel: () => void;
    onDelete: () => void;
    onEdit: () => void;
    onSummarize: () => void;
    onAIAssistant: () => void;
    isEditing: boolean;
    noteFontSize: number;
    summary: string;
    isSummaryLoading: boolean;
    getSubjectById: (id: string | undefined) => Subject | undefined;
    newNoteSubjectId?: string;
}> = ({ note, subjects, onSave, onCancel, onDelete, onEdit, onSummarize, onAIAssistant, isEditing, noteFontSize, summary, isSummaryLoading, getSubjectById, newNoteSubjectId }) => {
    
    const hasAttachments = (note.attachments && note.attachments.length > 0) || note.fileDataUrl;
    
    // Prepare legacy file as attachment object if needed for display uniformity
    const displayAttachments: NoteAttachment[] = note.attachments ? [...note.attachments] : [];
    if (note.fileDataUrl && displayAttachments.length === 0) {
        displayAttachments.push({
            id: 'legacy',
            name: note.fileName || 'Attached File',
            type: note.fileType || 'application/octet-stream',
            dataUrl: note.fileDataUrl,
            size: 0
        });
    }

    if (isEditing) {
        return (
            <Card className="flex flex-col p-0">
                 <NoteEditor 
                    note={note.id === 'new' ? null : note} // Pass null if it's a temp new note
                    subjects={subjects}
                    onSave={onSave}
                    onCancel={onCancel}
                    initialSubjectId={newNoteSubjectId}
                 />
            </Card>
        );
    }

    return (
        <Card className="flex flex-col p-0">
             <style>
            {`
                .note-content-display.prose h1 { font-size: ${noteFontSize * 2}px !important; line-height: 1.2 !important; }
                .note-content-display.prose h2 { font-size: ${noteFontSize * 1.5}px !important; line-height: 1.3 !important; }
                .note-content-display.prose h3 { font-size: ${noteFontSize * 1.25}px !important; line-height: 1.4 !important; }
                .note-content-display.prose p,
                .note-content-display.prose li,
                .note-content-display.prose blockquote { font-size: ${noteFontSize}px !important; line-height: 1.7 !important; }
            `}
            </style>
            <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-surface/80 backdrop-blur-sm z-10 flex-wrap gap-2">
                <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2 text-sm text-text-secondary flex-wrap">
                        <span className="flex items-center gap-2"><BookmarkIcon className="h-4 w-4"/> {note.subjectId ? (getSubjectById(note.subjectId)?.title || 'Unknown Subject') : 'General'}</span>
                        {note.topic && <><span>&middot;</span><span className="flex items-center gap-2"><FolderIcon className="h-4 w-4"/> {note.topic}</span></>}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                             {note.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 text-xs bg-surface-inset px-2 py-0.5 rounded-full border border-border text-text-secondary">
                                    <TagIcon className="h-3 w-3" /> {tag}
                                </span>
                             ))}
                        </div>
                    )}
                </div>
                
                <div className="flex gap-1 items-center">
                    <button onClick={onSummarize} className="p-2 rounded-lg hover:bg-surface-inset" title="Summarize with AI"><AIIcon className="h-5 w-5 text-primary"/></button>
                    <button onClick={onAIAssistant} className="p-2 rounded-lg hover:bg-surface-inset" title="AI Assistant"><SparklesIcon className="h-5 w-5 text-purple-500"/></button>
                    <button onClick={onEdit} className="p-2 rounded-lg hover:bg-surface-inset" title="Edit Note"><PencilIcon className="h-5 w-5"/></button>
                    <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-100 hover:text-red-500" title="Delete Note"><TrashIcon className="h-5 w-5"/></button>
                </div>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
                 <h1 className="text-3xl font-bold mb-4 text-text-primary">{note.title}</h1>
                 <div className="prose prose-lg max-w-none note-content-display text-black" dangerouslySetInnerHTML={{ __html: note.content }} />
                 
                 {hasAttachments && (
                    <div className="mt-8 pt-6 border-t border-border">
                        <h2 className="text-xl font-bold mb-4 text-text-primary flex items-center gap-2">
                            <PaperClipIcon className="h-6 w-6" /> Attachments
                        </h2>
                        <div className="space-y-4">
                            {displayAttachments.map((att, idx) => (
                                <AttachmentPreview key={att.id || idx} attachment={att} />
                            ))}
                        </div>
                    </div>
                )}
                 
                 {(isSummaryLoading || summary) && (
                    <div className="mt-8 pt-6 border-t border-border animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 text-text-primary flex items-center gap-2">
                            <AIIcon className="h-6 w-6 text-primary" />
                            AI Summary
                        </h2>
                        {isSummaryLoading ? (
                            <div className="space-y-3">
                                <div className="h-4 bg-surface-inset rounded w-5/6 animate-pulse"></div>
                                <div className="h-4 bg-surface-inset rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-surface-inset rounded w-3/4 animate-pulse"></div>
                            </div>
                        ) : (
                            <div className="prose prose-lg max-w-none text-black" dangerouslySetInnerHTML={{ __html: summary }}></div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

// --- Main Page Component ---

const Notes: React.FC = () => {
    const { notes, subjects, addNote, updateNote, deleteNote, getSubjectById, getNotesBySubject } = useData();
    const { noteFontSize } = useTheme();
    const { t } = useLanguage();
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newNoteSubjectId, setNewNoteSubjectId] = useState<string | undefined>(undefined);
    
    const [deletingNote, setDeletingNote] = useState<Note | null>(null);
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
    const [filterTopic, setFilterTopic] = useState<string>('all');
    const [filterTag, setFilterTag] = useState<string>('all'); // New tag filter state
    const [view, setView] = useState<'notes' | 'topics' | 'subjects'>('subjects');
    
    const [summary, setSummary] = useState<string>('');
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

    const location = useLocation();

    // Create a temporary note object for editing when "New Note" is clicked
    const tempNewNote: Note = useMemo(() => ({
        id: 'new',
        title: '',
        content: '',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'To Be Read' as any,
        isImportant: false,
        subjectId: newNoteSubjectId,
        tags: []
    }), [newNoteSubjectId]);

    const selectedNote = useMemo(() => {
        if (isEditing && selectedNoteId === 'new') return tempNewNote;
        return notes.find(n => n.id === selectedNoteId) || null;
    }, [selectedNoteId, notes, isEditing, tempNewNote]);
    
    const topicsForSelectedSubject = useMemo(() => {
        if (filterSubjectId === 'all' || filterSubjectId === '__GENERAL__') return { topics: [], hasUncategorized: false };
        const subjectNotes = notes.filter(note => note.subjectId === filterSubjectId);
        const topics = new Set(subjectNotes.map(note => note.topic).filter(Boolean));
        const hasUncategorized = subjectNotes.some(note => !note.topic);
        return { topics: Array.from(topics).sort(), hasUncategorized };
    }, [notes, filterSubjectId]);
    
    // Collect all available tags from notes in the current context (subject/topic)
    const availableTags = useMemo(() => {
        let relevantNotes = notes;
        if (filterSubjectId !== 'all') {
             relevantNotes = relevantNotes.filter(n => 
                filterSubjectId === '__GENERAL__' ? !n.subjectId : n.subjectId === filterSubjectId
             );
        }
        if (filterTopic !== 'all') {
             relevantNotes = relevantNotes.filter(n => 
                filterTopic === '__UNCATEGORIZED__' ? !n.topic : n.topic === filterTopic
             );
        }
        
        const tags = new Set<string>();
        relevantNotes.forEach(note => {
            if (note.tags) note.tags.forEach(t => tags.add(t));
        });
        return Array.from(tags).sort();
    }, [notes, filterSubjectId, filterTopic]);

    const filteredNotes = useMemo(() => {
        if (!filterSubjectId && filterSubjectId !== '') return [];
        return notes
            .filter(note => {
                const subjectMatch = filterSubjectId === 'all' || 
                                    (filterSubjectId === '__GENERAL__' ? !note.subjectId : note.subjectId === filterSubjectId);
                const topicMatch = filterTopic === 'all' || (filterTopic === '__UNCATEGORIZED__' ? !note.topic : note.topic === filterTopic);
                const tagMatch = filterTag === 'all' || (note.tags && note.tags.includes(filterTag));
                const searchMatch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.replace(/<[^>]*>?/gm, '').toLowerCase().includes(searchTerm.toLowerCase());
                return subjectMatch && topicMatch && searchMatch && tagMatch;
            })
            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    }, [notes, filterSubjectId, filterTopic, filterTag, searchTerm]);
    
    useEffect(() => {
        if (location.state?.filterSubjectId) {
            setFilterSubjectId(location.state.filterSubjectId);
            if (location.state.action === 'new') {
                handleNewNote(location.state.filterSubjectId);
            }
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);
    
    useEffect(() => {
        if (filterSubjectId === 'all') {
            setView('subjects');
            setFilterTopic('all');
            setFilterTag('all');
            setSelectedNoteId(null);
        } else if (filterSubjectId === '__GENERAL__') {
            setView('notes');
            setFilterTopic('all');
            setFilterTag('all');
             if (!selectedNoteId && !isEditing) setSelectedNoteId(null);
        } else if (filterSubjectId) {
            setView('topics');
            setFilterTopic('all');
            setFilterTag('all');
             if (!selectedNoteId && !isEditing) setSelectedNoteId(null);
        }
    }, [filterSubjectId]);

    useEffect(() => {
        if (selectedNoteId && selectedNoteId !== 'new' && !filteredNotes.find(n => n.id === selectedNoteId) && view === 'notes') {
             // If selected note is no longer in the filtered list, deselect it
            setSelectedNoteId(null);
            setIsEditing(false);
            setSummary('');
            setIsSummaryLoading(false);
        } 
    }, [filteredNotes, selectedNoteId, isEditing, view, filterSubjectId]);

    const handleNewNote = (subjectId?: string) => {
        if (isEditing && !window.confirm("You have unsaved changes. Are you sure you want to discard them and start a new note?")) {
            return;
        }
        const defaultSubjectId = subjectId || (filterSubjectId !== 'all' && filterSubjectId !== '__GENERAL__' ? filterSubjectId : undefined);
        setNewNoteSubjectId(defaultSubjectId);
        
        setIsEditing(true);
        setSelectedNoteId('new');
        setSummary('');
    };

    const handleSelectNote = (noteId: string) => {
        if (isEditing && !window.confirm("You have unsaved changes. Are you sure you want to switch notes?")) {
            return;
        }
        setIsEditing(false);
        setSelectedNoteId(noteId);
        setSummary('');
        setIsSummaryLoading(false);
    };
    
    const handleEdit = () => {
        if (selectedNote) setIsEditing(true);
    };

    const handleSave = async (data: Omit<Note, 'id' | 'createdAt' | 'lastModified' | 'status' | 'isImportant'>) => {
        if (selectedNoteId && selectedNoteId !== 'new' && selectedNote) {
            updateNote({ ...selectedNote, ...data });
        } else {
            const newNote = await addNote(data);
            setSelectedNoteId(newNote.id);
        }
        setIsEditing(false);
        setSummary('');
        
        if(filterSubjectId !== 'all' && filterSubjectId !== '__GENERAL__' && filterSubjectId !== data.subjectId){
            // If we created a note for a different subject than currently viewed, switch view
             if(data.subjectId) {
                setFilterSubjectId(data.subjectId);
                setView('notes'); // Or topics
             } else {
                 setFilterSubjectId('__GENERAL__');
             }
        }
         // If general note created while in 'All' (Subjects) view
        if(filterSubjectId === 'all' && !data.subjectId) {
             setFilterSubjectId('__GENERAL__');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (selectedNoteId === 'new') {
            setSelectedNoteId(null);
        }
    };

    const handleDelete = () => {
        if (!selectedNote || selectedNoteId === 'new') return;
        setDeletingNote(selectedNote);
    };

    const handleConfirmDelete = () => {
        if (deletingNote) {
            deleteNote(deletingNote.id);
            setDeletingNote(null);
            setSelectedNoteId(null);
            setIsEditing(false);
        }
    };
    
    const handleSummarize = async () => {
        if (!selectedNote) return;

        setIsSummaryLoading(true);
        setSummary('');
        try {
            const plainTextContent = selectedNote.content.replace(/<[^>]*>?/gm, '');
            if (!plainTextContent.trim()) {
                setSummary("This note is empty and cannot be summarized.");
                setIsSummaryLoading(false);
                return;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-flash-lite-latest',
                contents: `Please summarize the following note content:\n\n${plainTextContent}`,
                config: {
                    systemInstruction: "You are an expert academic assistant. Your task is to summarize the provided text accurately and concisely. The summary must be based ONLY on the provided text. Format your response in HTML using <ul> and <li> tags for the bullet points.",
                }
            });

            setSummary(response.text);

        } catch (error) {
            console.error("Failed to summarize note:", error);
            setSummary("<p class='text-red-500'>Sorry, I couldn't generate a summary at this time. Please try again later.</p>");
        } finally {
            setIsSummaryLoading(false);
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">{t('my_notes')}</h1>
                <div className="flex flex-col sm:flex-row gap-2 items-center w-full md:w-auto">
                    <button onClick={() => setIsAIGenerateModalOpen(true)} className="px-4 py-2.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors duration-200 flex items-center justify-center gap-2 text-sm flex-grow sm:flex-grow-0 w-full sm:w-auto">
                        <SparklesIcon className="h-5 w-5" />
                        <span>{t('generate_ai')}</span>
                    </button>
                    <button onClick={() => handleNewNote()} className={`${pagePrimaryButtonStyles} flex items-center justify-center gap-2 flex-grow sm:flex-grow-0 w-full sm:w-auto`}>
                        <PlusIcon className="h-5 w-5" />
                        <span>{t('new_note')}</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left Column: Note List */}
                <div className="w-full md:w-1/3 lg:w-1/4 md:sticky md:top-6">
                    <div className="flex flex-col gap-4">
                        <Card className="p-4">
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 absolute top-1/2 left-3 -translate-y-1/2 text-text-muted pointer-events-none" />
                                <input 
                                    type="text" 
                                    placeholder={t('search')} 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className={`${pageInputStyles} pl-10 !bg-surface-inset`} 
                                />
                            </div>
                        </Card>
                        <Card className="p-4">
                             <label htmlFor="subject-filter" className="block text-sm font-semibold text-text-secondary mb-2">{t('filter')}</label>
                            <select 
                                id="subject-filter"
                                value={filterSubjectId} 
                                onChange={e => setFilterSubjectId(e.target.value)} 
                                className={`${pageInputStyles} !bg-surface-inset`}
                            >
                                <option value="all">{t('all_subjects')}</option>
                                <option value="__GENERAL__">{t('general_note')}s</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </Card>
                        
                        {/* Tag Filter - Only visible when we are viewing notes and there are tags available */}
                        {view === 'notes' && availableTags.length > 0 && (
                            <Card className="p-4">
                                <label htmlFor="tag-filter" className="block text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                                    <TagIcon className="h-4 w-4" /> {t('filter_by_tag')}
                                </label>
                                <select 
                                    id="tag-filter"
                                    value={filterTag} 
                                    onChange={e => setFilterTag(e.target.value)} 
                                    className={`${pageInputStyles} !bg-surface-inset`}
                                >
                                    <option value="all">{t('all_tags')}</option>
                                    {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                </select>
                            </Card>
                        )}
                         
                        <Card 
                            className="p-0 flex flex-col max-h-[500px] overflow-y-auto notes-scroll-view"
                            style={{ 
                                scrollbarWidth: 'none', 
                                msOverflowStyle: 'none'
                            }}
                        >
                            <style>{`
                                .notes-scroll-view::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                           <div className="min-h-0">
                               {view === 'subjects' && (
                                   <div className="p-2 space-y-1">
                                        <div className="font-semibold text-text-secondary px-2 pb-2 mb-1 border-b border-border">
                                           Your {t('subjects')}
                                       </div>
                                        {subjects.map(subject => (
                                            <button
                                               key={subject.id}
                                               onClick={() => setFilterSubjectId(subject.id)}
                                               className="w-full text-left p-3 rounded-lg hover:bg-black/5 transition-colors font-medium flex justify-between items-center group"
                                            >
                                               <span className="truncate text-text-primary group-hover:text-primary transition-colors">{subject.title}</span>
                                               <span className="text-xs bg-surface-inset px-2 py-1 rounded-full text-text-muted group-hover:bg-white group-hover:shadow-sm transition-all">
                                                   {getNotesBySubject(subject.id).length}
                                               </span>
                                            </button>
                                        ))}
                                        {subjects.length === 0 && (
                                            <div className="text-center p-4 text-text-muted text-sm">{t('no_subjects_found')}</div>
                                        )}
                                         <div className="pt-2 mt-2 border-t border-border">
                                             <button
                                               onClick={() => setFilterSubjectId('__GENERAL__')}
                                               className="w-full text-left p-3 rounded-lg hover:bg-black/5 transition-colors font-medium flex justify-between items-center group"
                                            >
                                               <span className="truncate text-text-primary group-hover:text-primary transition-colors flex items-center gap-2">
                                                   <FolderIcon className="h-4 w-4"/> {t('general_note')}s
                                               </span>
                                               <span className="text-xs bg-surface-inset px-2 py-1 rounded-full text-text-muted group-hover:bg-white group-hover:shadow-sm transition-all">
                                                   {notes.filter(n => !n.subjectId).length}
                                               </span>
                                            </button>
                                        </div>
                                   </div>
                               )}
                               
                               {view === 'topics' && (
                                   <div className="p-2">
                                        <button onClick={() => setFilterSubjectId('all')} className="flex items-center gap-2 text-sm font-semibold p-2 mb-2 text-text-secondary hover:text-text-primary transition-colors w-full text-left rounded-lg hover:bg-black/5">
                                           <ArrowLeftIcon className="h-4 w-4" />
                                           {t('back_to_subjects')}
                                       </button>
                                       <div className="font-semibold text-text-secondary px-2 pb-2 mb-1 border-b border-border">
                                           Topics for {getSubjectById(filterSubjectId)?.title}
                                       </div>
                                       <div className="space-y-1">
                                           <button onClick={() => { setFilterTopic('all'); setView('notes'); }} className="w-full text-left p-3 rounded-lg hover:bg-black/5 transition-colors font-semibold">
                                               {t('all_notes')}
                                           </button>
                                           {topicsForSelectedSubject.topics.map(topic => (
                                               <button key={topic} onClick={() => { setFilterTopic(topic); setView('notes'); }} className="w-full text-left p-3 rounded-lg hover:bg-black/5 transition-colors">
                                                   {topic}
                                               </button>
                                           ))}
                                           {topicsForSelectedSubject.hasUncategorized && (
                                               <button onClick={() => { setFilterTopic('__UNCATEGORIZED__'); setView('notes'); }} className="w-full text-left p-3 rounded-lg hover:bg-black/5 transition-colors">
                                                   {t('uncategorized')}
                                               </button>
                                           )}
                                       </div>
                                   </div>
                               )}
                               
                               {view === 'notes' && (
                                    <div className="p-2 h-full flex flex-col">
                                       {filterSubjectId === '__GENERAL__' ? (
                                            <button onClick={() => setFilterSubjectId('all')} className="flex items-center gap-2 text-sm font-semibold p-2 mb-2 text-text-secondary hover:text-text-primary transition-colors w-full text-left rounded-lg hover:bg-black/5">
                                               <ArrowLeftIcon className="h-4 w-4" />
                                               {t('back_to_subjects')}
                                           </button>
                                       ) : (
                                           <button onClick={() => setView('topics')} className="flex items-center gap-2 text-sm font-semibold p-2 mb-2 text-text-secondary hover:text-text-primary transition-colors w-full text-left rounded-lg hover:bg-black/5">
                                               <ArrowLeftIcon className="h-4 w-4" />
                                               {t('back_to_topics')}
                                           </button>
                                       )}
                                       <div>
                                           {filteredNotes.length > 0 ? (
                                               <div className="space-y-1">
                                                   {filteredNotes.map((note: Note) => (
                                                       <NoteListItem 
                                                           key={note.id} 
                                                           note={note} 
                                                           isSelected={selectedNoteId === note.id}
                                                           onSelect={handleSelectNote}
                                                       />
                                                   ))}
                                               </div>
                                           ) : (
                                               <div className="text-center p-8 text-text-secondary h-full flex flex-col justify-center items-center">
                                                   <MagnifyingGlassIcon className="h-10 w-10 mx-auto text-text-muted mb-2" />
                                                   <p className="font-semibold">{t('no_notes_found')}</p>
                                                   <p className="text-sm">Try adjusting your filters or create a new note.</p>
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               )}
                           </div>
                        </Card>
                    </div>
                </div>
                {/* Right Column: Notepad View */}
                <div className="w-full md:w-2/3 lg:w-3/4">
                    {(selectedNote || isEditing) ? (
                        <NoteDetailView 
                            note={selectedNote || tempNewNote}
                            subjects={subjects}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onSummarize={handleSummarize}
                            onAIAssistant={() => setIsAIAssistantOpen(true)}
                            isEditing={isEditing}
                            noteFontSize={noteFontSize}
                            summary={summary}
                            isSummaryLoading={isSummaryLoading}
                            getSubjectById={getSubjectById}
                            newNoteSubjectId={newNoteSubjectId}
                        />
                    ) : (
                        <NotePlaceholder view={view} onCreateNew={() => handleNewNote()} />
                    )}
                </div>
            </div>
            
            {isAIGenerateModalOpen && <AIGenerateNoteModal isOpen={isAIGenerateModalOpen} onClose={() => setIsAIGenerateModalOpen(false)} />}
            {isAIAssistantOpen && selectedNote && <AIAssistantModal isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} noteContent={selectedNote.content} subjectTitle={selectedNote.subjectId ? (getSubjectById(selectedNote.subjectId)?.title || 'General') : 'General'} />}
            {deletingNote && (
                <ConfirmationModal
                    isOpen={!!deletingNote}
                    onClose={() => setDeletingNote(null)}
                    onConfirm={handleConfirmDelete}
                    title={`${t('delete')} Note`}
                    message={<>Are you sure you want to delete the note <strong>{deletingNote.title}</strong>? This action cannot be undone.</>}
                />
            )}
        </div>
    );
};

export default Notes;
