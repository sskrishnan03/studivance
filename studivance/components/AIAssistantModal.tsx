import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Modal from './Modal';
import { SparklesIcon, DocumentTextIcon, QuestionMarkCircleIcon, LightBulbIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const actionButtonClass = "w-full text-left flex items-center gap-3 p-3 rounded-lg bg-surface-inset hover:bg-border transition-colors text-text-primary";

type AIAction = 'summarize' | 'quiz' | 'explain';

interface QuizQuestion {
    question: string;
    questionType: 'multiple-choice' | 'true-false';
    options: string[]; // For true-false, this will be ['True', 'False']
    answer: string;
    explanation: string;
}

interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    noteContent: string;
    subjectTitle: string;
}

const QuizView: React.FC<{ quiz: QuizQuestion[] }> = ({ quiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = quiz[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    const isAnswerRevealed = selectedAnswer !== null;

    const handleAnswerSelect = (option: string) => {
        if (isAnswerRevealed) return;
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = option;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleRetake = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers(Array(quiz.length).fill(null));
        setIsFinished(false);
    };

    const score = selectedAnswers.reduce((count, answer, index) => {
        return answer === quiz[index].answer ? count + 1 : count;
    }, 0);

    if (isFinished) {
        return (
            <div className="text-center p-8 flex flex-col items-center justify-center animate-fade-in h-full">
                <h3 className="text-2xl font-bold text-text-primary">Quiz Complete!</h3>
                <p className="text-lg text-text-secondary mt-2">Your Score:</p>
                <p className="text-5xl font-bold text-primary my-4">{score} / {quiz.length}</p>
                <button
                    onClick={handleRetake}
                    className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                    Retake Quiz
                </button>
            </div>
        );
    }
    
    return (
        <div className="py-4 flex flex-col h-full w-full">
            {/* Progress Bar */}
            <div className="mb-4">
                <p className="text-sm font-semibold text-text-secondary mb-1">Question {currentQuestionIndex + 1} of {quiz.length}</p>
                <div className="w-full bg-surface rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center w-full">
                <p className="text-xl font-semibold text-left text-text-primary mb-6 animate-fade-in break-words">
                    {currentQuestion.question}
                </p>

                <div className={`mt-4 grid grid-cols-1 ${currentQuestion.questionType === 'multiple-choice' ? 'sm:grid-cols-2' : 'max-w-xs mx-auto w-full'} gap-4 w-full`}>
                    {currentQuestion.options.map(option => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQuestion.answer;
                        
                        let optionClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-inset whitespace-normal break-words ";
                        
                        if (isAnswerRevealed) {
                            if (isCorrect) {
                                optionClass += "bg-green-100 border-green-500 text-green-800 shadow-sm";
                            } else if (isSelected) {
                                optionClass += "bg-red-100 border-red-500 text-red-800";
                            } else {
                                optionClass += "bg-surface-muted border-border text-text-secondary opacity-60";
                            }
                        } else {
                            optionClass += "bg-surface border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
                        }
                        
                        return (
                            <button key={option} onClick={() => handleAnswerSelect(option)} className={optionClass} disabled={isAnswerRevealed}>
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            {isAnswerRevealed && (
                <div className="mt-6 animate-fade-in w-full">
                    <div className="p-4 rounded-lg bg-surface border border-border">
                        <div className="flex items-start gap-3">
                            {selectedAnswer === currentQuestion.answer ? (
                                <CheckCircleIcon className="h-8 w-8 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                                <XCircleIcon className="h-8 w-8 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h4 className="font-bold text-text-primary">
                                    {selectedAnswer === currentQuestion.answer ? "Correct!" : "Incorrect"}
                                </h4>
                                <p className="text-sm text-text-secondary break-words mt-1">{currentQuestion.explanation}</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleNext} 
                        className="w-full mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-lg shadow-sm hover:shadow-md"
                    >
                        {currentQuestionIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                </div>
            )}
        </div>
    );
};


const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, noteContent, subjectTitle }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState('');
    const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
    const [currentAction, setCurrentAction] = useState<AIAction | null>(null);
    
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    useEffect(() => {
        if (!isOpen) {
            setIsLoading(false);
            setAiResponse('');
            setError('');
            setQuizData(null);
            setCurrentAction(null);
        }
    }, [isOpen]);

    const resetState = () => {
        setIsLoading(true);
        setAiResponse('');
        setError('');
        setQuizData(null);
    };

    const handleAction = async (action: AIAction) => {
        resetState();
        setCurrentAction(action);

        const plainTextContent = noteContent.replace(/<[^>]*>?/gm, '');

        if (!plainTextContent.trim()) {
            setAiResponse('This note appears to be empty and cannot be processed.');
            setIsLoading(false);
            return;
        }

        try {
            if (action === 'quiz') {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Based on the following note content from the subject "${subjectTitle}", generate a short quiz with 3-4 questions. Include a mix of multiple-choice and true/false questions. For each question, provide the question itself, its type, 4 options for multiple-choice (or 'True' and 'False' for true/false), the correct answer, and a brief explanation for why the answer is correct.`,
                    config: {
                         responseMimeType: "application/json",
                         responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                quiz: {
                                    type: Type.ARRAY,
                                    description: "An array of 3-4 quiz questions of varying types.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            question: { type: Type.STRING },
                                            questionType: { type: Type.STRING, enum: ['multiple-choice', 'true-false'] },
                                            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 possible answers for multiple-choice, or ['True', 'False'] for true-false." },
                                            answer: { type: Type.STRING, description: "The correct answer, which must be one of the provided options." },
                                            explanation: { type: Type.STRING, description: "A brief explanation for the correct answer." }
                                        },
                                        required: ['question', 'questionType', 'options', 'answer', 'explanation']
                                    }
                                }
                            }
                        }
                    }
                });
                const parsed = JSON.parse(response.text);
                if (parsed.quiz) {
                    setQuizData(parsed.quiz);
                } else {
                     throw new Error("AI response did not contain quiz data.");
                }

            } else { // Summarize or Explain
                const prompts: Record<'summarize' | 'explain', string> = {
                    summarize: `Please summarize the following note content from the subject "${subjectTitle}":\n\n${plainTextContent}`,
                    explain: `Please explain the core concepts from the following note content from the subject "${subjectTitle}" in a simple way:\n\n${plainTextContent}`,
                };
                const systemInstructions: Record<'summarize' | 'explain', string> = {
                    summarize: "You are an expert academic assistant. Your task is to summarize the provided text accurately and concisely into a few key bullet points. The summary must be based ONLY on the provided text. Do not add any information not present in the text. Format your response in HTML using <ul> and <li> tags.",
                    explain: "You are a helpful tutor. Explain the core concepts from the provided text in a simple and easy-to-understand way, as if you were explaining it to a beginner. Your explanation must be based ONLY on the provided text. Format your response in HTML with clear paragraphs.",
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-flash-lite-latest',
                    contents: prompts[action],
                    config: { systemInstruction: systemInstructions[action] }
                });
                setAiResponse(response.text.replace(/\n/g, '<br />'));
            }

        } catch (e) {
            console.error(e);
            setError('An error occurred while communicating with the AI. Please check your API key and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Study Assistant" size="3xl">
            <div className="flex flex-col md:flex-row gap-6 max-h-[75vh]">
                <div className="md:w-1/3 lg:w-1/4 flex flex-col gap-2 flex-shrink-0">
                    <h4 className="font-semibold text-text-secondary mb-1">What do you need?</h4>
                    <button onClick={() => handleAction('summarize')} className={actionButtonClass}>
                        <DocumentTextIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <span>Summarize Note</span>
                    </button>
                    <button onClick={() => handleAction('quiz')} className={actionButtonClass}>
                        <QuestionMarkCircleIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <span>Create a Quiz</span>
                    </button>
                    <button onClick={() => handleAction('explain')} className={actionButtonClass}>
                        <LightBulbIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <span>Explain Concepts</span>
                    </button>
                </div>
                <div className="md:w-2/3 lg:w-3/4 md:border-l md:border-border md:pl-6 bg-surface-inset p-4 rounded-lg flex flex-col min-h-[500px]">
                    <div className="flex-1 overflow-y-auto pr-1">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <SparklesIcon className="h-12 w-12 text-primary animate-pulse" />
                                <p className="mt-4 text-text-secondary">AI is thinking...</p>
                            </div>
                        ) : error ? (
                             <div className="text-red-500">{error}</div>
                        ) : currentAction === 'quiz' && quizData ? (
                            <QuizView quiz={quizData} />
                        ) : currentAction !== 'quiz' && aiResponse ? (
                            <div className="prose max-w-none break-words" dangerouslySetInnerHTML={{ __html: aiResponse }} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
                                <SparklesIcon className="h-10 w-10 text-text-muted mb-2" />
                                <p>Select an action to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AIAssistantModal;