
import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Modal from './Modal';
import { useData } from '../contexts/DataContext';
import AIIcon from './AIIcon';
import { BookOpenIcon, CheckCircleIcon, AcademicCapIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const modalInputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const modalPrimaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";

interface BaseGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- Subject Generator ---
interface AISubjectGeneratorModalProps extends BaseGeneratorProps {
    onGenerate: (subjects: { title: string; type: 'Theory' | 'Practical'; semester?: string }[]) => void;
}

export const AISubjectGeneratorModal: React.FC<AISubjectGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a list of 5-8 typical academic subjects for a student in: "${prompt}". Return JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subjects: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        type: { type: Type.STRING, enum: ['Theory', 'Practical'] },
                                        semester: { type: Type.STRING, nullable: true }
                                    },
                                    required: ['title', 'type']
                                }
                            }
                        }
                    }
                }
            });
            const data = JSON.parse(response.text);
            if (data.subjects) onGenerate(data.subjects);
        } catch (e) { console.error(e); alert("Failed to generate subjects."); } 
        finally { setIsLoading(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Subjects with AI" size="lg">
            <div className="space-y-4">
                <p className="text-text-secondary">Enter your grade, major, or course (e.g., "Grade 10 Science" or "Computer Science Sem 4").</p>
                <input value={prompt} onChange={e => setPrompt(e.target.value)} className={modalInputStyles} placeholder="e.g. Mechanical Engineering Year 2" />
                <div className="flex justify-end">
                    <button onClick={handleGenerate} disabled={isLoading} className={`${modalPrimaryButtonStyles} flex items-center gap-2`}>
                        <AIIcon className="h-5 w-5" /> {isLoading ? 'Generating...' : 'Generate Subjects'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- Task Generator ---
interface AITaskGeneratorModalProps extends BaseGeneratorProps {
    onGenerate: (tasks: { title: string; priority: 'High' | 'Medium' | 'Low' }[]) => void;
}

export const AITaskGeneratorModal: React.FC<AITaskGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a checklist of 5-10 actionable tasks to achieve this goal: "${prompt}". Return JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            tasks: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                                    },
                                    required: ['title', 'priority']
                                }
                            }
                        }
                    }
                }
            });
            const data = JSON.parse(response.text);
            if (data.tasks) onGenerate(data.tasks);
        } catch (e) { console.error(e); alert("Failed to generate tasks."); } 
        finally { setIsLoading(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Tasks with AI" size="lg">
            <div className="space-y-4">
                <p className="text-text-secondary">Describe a project or goal you need to complete (e.g., "Prepare for Physics Final" or "Organize a College Fest").</p>
                <input value={prompt} onChange={e => setPrompt(e.target.value)} className={modalInputStyles} placeholder="e.g. Complete Biology Assignment" />
                <div className="flex justify-end">
                    <button onClick={handleGenerate} disabled={isLoading} className={`${modalPrimaryButtonStyles} flex items-center gap-2`}>
                        <AIIcon className="h-5 w-5" /> {isLoading ? 'Generating...' : 'Generate Tasks'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- Exam Generator ---
interface AIExamGeneratorModalProps extends BaseGeneratorProps {
    onGenerate: (exams: { title: string; type: 'Theory' | 'Practical' }[]) => void;
}

export const AIExamGeneratorModal: React.FC<AIExamGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a list of likely exams (Midterms, Finals, Practicals) for a student in: "${prompt}". Return JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            exams: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        type: { type: Type.STRING, enum: ['Theory', 'Practical'] }
                                    },
                                    required: ['title', 'type']
                                }
                            }
                        }
                    }
                }
            });
            const data = JSON.parse(response.text);
            if (data.exams) onGenerate(data.exams);
        } catch (e) { console.error(e); alert("Failed to generate exams."); } 
        finally { setIsLoading(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Exams with AI" size="lg">
            <div className="space-y-4">
                <p className="text-text-secondary">Enter your course or curriculum to suggest standard exams (e.g., "IB Diploma Year 1" or "MBA Semester 1").</p>
                <input value={prompt} onChange={e => setPrompt(e.target.value)} className={modalInputStyles} placeholder="e.g. High School Finals" />
                <div className="flex justify-end">
                    <button onClick={handleGenerate} disabled={isLoading} className={`${modalPrimaryButtonStyles} flex items-center gap-2`}>
                        <AIIcon className="h-5 w-5" /> {isLoading ? 'Generating...' : 'Generate Exam List'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- Timetable Generator ---
interface AITimetableGeneratorModalProps extends BaseGeneratorProps {
    onGenerate: (events: { title: string; dayOfWeek: number; startTime: string; endTime: string }[]) => void;
}

export const AITimetableGeneratorModal: React.FC<AITimetableGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a weekly study timetable based on: "${prompt}". Return JSON with a list of events. dayOfWeek should be 0 for Sunday, 1 for Monday, etc. Times in HH:MM 24h format.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            events: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        dayOfWeek: { type: Type.INTEGER, description: "0=Sunday, 1=Monday... 6=Saturday" },
                                        startTime: { type: Type.STRING, description: "HH:MM format" },
                                        endTime: { type: Type.STRING, description: "HH:MM format" }
                                    },
                                    required: ['title', 'dayOfWeek', 'startTime', 'endTime']
                                }
                            }
                        }
                    }
                }
            });
            const data = JSON.parse(response.text);
            if (data.events) onGenerate(data.events);
        } catch (e) { console.error(e); alert("Failed to generate timetable."); } 
        finally { setIsLoading(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Timetable with AI" size="lg">
            <div className="space-y-4">
                <p className="text-text-secondary">Describe your availability and what you want to study (e.g., "I want to study Math and Physics on Mon/Wed evenings and History on weekends").</p>
                <textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} className={modalInputStyles} placeholder="Describe your schedule needs..." />
                <div className="flex justify-end">
                    <button onClick={handleGenerate} disabled={isLoading} className={`${modalPrimaryButtonStyles} flex items-center gap-2`}>
                        <AIIcon className="h-5 w-5" /> {isLoading ? 'Generating...' : 'Generate Schedule'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
