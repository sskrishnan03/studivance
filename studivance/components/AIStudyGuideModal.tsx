import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Modal from './Modal';
import { useData } from '../contexts/DataContext';
import AIIcon from './AIIcon';
import { Exam } from '../types';
import { BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface AIStudyGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam: Exam;
}

interface StudyGuide {
    keyConcepts: string[];
    studyQuestions: string[];
}

const AIStudyGuideModal: React.FC<AIStudyGuideModalProps> = ({ isOpen, onClose, exam }) => {
    const { getSubjectById } = useData();
    const [isLoading, setIsLoading] = useState(true);
    const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
    const [error, setError] = useState('');

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    useEffect(() => {
        if (isOpen) {
            const generateGuide = async () => {
                setIsLoading(true);
                setError('');
                setStudyGuide(null);

                const subject = getSubjectById(exam.subjectId);
                if (!subject) {
                    setError("Could not find the subject associated with this exam.");
                    setIsLoading(false);
                    return;
                }

                try {
                    const prompt = `Generate a list of key concepts and a list of potential study questions for an upcoming "${exam.title}" exam in the subject "${subject.title}".`;
                    
                    const responseSchema = {
                        type: Type.OBJECT,
                        properties: {
                            keyConcepts: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: 'A list of 5-7 key concepts or topics to study.'
                            },
                            studyQuestions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: 'A list of 5-7 potential study questions to help prepare.'
                            }
                        },
                        required: ['keyConcepts', 'studyQuestions']
                    };

                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema,
                        },
                    });
                    
                    const parsedResponse = JSON.parse(response.text);
                    setStudyGuide(parsedResponse);

                } catch (e) {
                    console.error("AI Study Guide Error:", e);
                    setError("Sorry, I couldn't generate a study guide right now. Please check your API key or try again later.");
                } finally {
                    setIsLoading(false);
                }
            };
            generateGuide();
        }
    }, [isOpen, exam]);

    const subject = getSubjectById(exam.subjectId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`AI Study Guide for ${exam.title}`} size="xl">
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <AIIcon className="h-12 w-12 text-primary animate-pulse" />
                        <p className="mt-4 text-text-secondary">Generating study materials for <span className="font-semibold text-text-primary">{subject?.title}</span>...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-700 bg-red-100 p-4 rounded-lg">
                        <h3 className="font-bold">Error</h3>
                        <p>{error}</p>
                    </div>
                ) : studyGuide ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text-primary">
                                <BookOpenIcon className="h-6 w-6 text-primary" />
                                Key Concepts to Review
                            </h3>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-text-secondary">
                                {studyGuide.keyConcepts.map((concept, index) => (
                                    <li key={index}>{concept}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text-primary">
                                <QuestionMarkCircleIcon className="h-6 w-6 text-primary" />
                                Potential Study Questions
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 pl-2 text-text-secondary">
                                {studyGuide.studyQuestions.map((question, index) => (
                                    <li key={index}>{question}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ) : null}
            </div>
        </Modal>
    );
};

export default AIStudyGuideModal;