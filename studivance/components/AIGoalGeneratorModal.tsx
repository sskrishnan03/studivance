import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Modal from './Modal';
import { useData } from '../contexts/DataContext';
import AIIcon from './AIIcon';
import { LightBulbIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const modalInputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const modalPrimaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";

interface AIGoalGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectGoal: (goal: { title: string; description: string; targetDate: string; }) => void;
}

interface GeneratedGoal {
    title: string;
    description: string;
    targetDate: string;
}

const AIGoalGeneratorModal: React.FC<AIGoalGeneratorModalProps> = ({ isOpen, onClose, onSelectGoal }) => {
    const [prompt, setPrompt] = useState('');
    const [suggestions, setSuggestions] = useState<GeneratedGoal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a general goal or objective.");
            return;
        }
        setError('');
        setIsLoading(true);
        setSuggestions([]);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the objective "${prompt}", generate 3 distinct SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goal suggestions for a student. For the targetDate, suggest a realistic date from today in YYYY-MM-DD format.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            goals: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        targetDate: { type: Type.STRING },
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const jsonResponse = JSON.parse(response.text);
            if (jsonResponse.goals) {
                setSuggestions(jsonResponse.goals);
            } else {
                throw new Error("Invalid response format from AI.");
            }

        } catch (e) {
            console.error(e);
            setError("Failed to generate goals. The AI might be busy, or there could be an issue with your API key.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Goals with AI" size="3xl">
            <div className="space-y-4 max-h-[75vh] flex flex-col">
                <div className="flex-shrink-0">
                    <p className="text-text-secondary">Describe a broad objective, and the AI will help you break it down into specific, actionable goals.</p>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="e.g., 'Improve my grades in Physics' or 'Prepare for final exams'"
                        rows={3}
                        className={`${modalInputStyles} mt-4`}
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    
                    <div className="pt-2 flex justify-end mt-2">
                        <button onClick={handleGenerate} className={`${modalPrimaryButtonStyles} flex items-center gap-2`} disabled={isLoading}>
                            <AIIcon className="h-5 w-5" />
                            {isLoading ? 'Generating...' : 'Generate Ideas'}
                        </button>
                    </div>
                </div>

                {isLoading && (
                     <div className="flex flex-col items-center justify-center flex-1 min-h-[250px]">
                        <AIIcon className="h-10 w-10 text-primary animate-pulse" />
                        <p className="mt-4 text-text-secondary">AI is crafting your goals...</p>
                    </div>
                )}
                
                {!isLoading && suggestions.length > 0 && (
                    <div className="space-y-4 pt-4 overflow-y-auto flex-1 pr-2 -mr-2">
                        <h3 className="font-semibold text-text-primary">Here are a few suggestions:</h3>
                        {suggestions.map((goal, index) => (
                            <div key={index} className="p-4 rounded-lg bg-surface-inset border border-border">
                                <p className="font-bold text-lg text-primary flex items-center gap-2">
                                    <LightBulbIcon className="h-6 w-6"/> {goal.title}
                                </p>
                                <p className="text-sm text-text-secondary mt-1">{goal.description}</p>
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                        <CalendarDaysIcon className="h-4 w-4" />
                                        Target: {goal.targetDate}
                                    </p>
                                    <button onClick={() => onSelectGoal(goal)} className="px-4 py-1.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm">
                                        Select Goal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AIGoalGeneratorModal;