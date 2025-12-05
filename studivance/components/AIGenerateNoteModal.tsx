
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';
import { useData } from '../contexts/DataContext';
import { SparklesIcon, ArrowLeftIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import ToggleSwitch from './ToggleSwitch'; // Assuming reuse or implement simple toggle

const modalInputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const modalSelectStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none cursor-pointer";
const modalPrimaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const modalSecondaryButtonStyles = "px-5 py-2.5 bg-surface-inset text-text-primary font-semibold rounded-lg hover:bg-border transition-colors duration-200 text-sm";

const AIGenerateNoteModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { subjects, addNote } = useData();
    const [stage, setStage] = useState<'prompt' | 'review'>('prompt');
    const [prompt, setPrompt] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    useEffect(() => {
        // Set default subject if available and not already set, but allow general note (empty string)
        if (!subjectId && subjects.length > 0) {
             // We don't force a subject, defaults to General (empty) is fine
        }
    }, [subjects]);

    useEffect(() => {
        if (stage === 'review') {
            setEditedTitle(generatedTitle);
            setEditedContent(generatedContent);
        }
    }, [stage, generatedTitle, generatedContent]);

    const handleClose = () => {
        setStage('prompt');
        setPrompt('');
        setGeneratedTitle('');
        setGeneratedContent('');
        setEditedTitle('');
        setEditedContent('');
        setError('');
        setIsLoading(false);
        setUseGoogleSearch(false);
        onClose();
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a topic.");
            return;
        }
        setError('');
        setIsLoading(true);

        const systemInstruction = `Generate a detailed, well-structured study note. Format in HTML (<h1>, <h2>, <ul>, <b>). Start with an <h1> title.`;
        
        try {
            let response;
            
            if (useGoogleSearch) {
                // Use Gemini 2.5 Flash with Search Grounding
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Research and generate a study note about: "${prompt}". Ensure the information is up-to-date.`,
                    config: {
                        tools: [{ googleSearch: {} }],
                        systemInstruction: systemInstruction
                    }
                });
            } else {
                // Use Gemini Flash Lite for fastest response
                response = await ai.models.generateContent({
                    model: 'gemini-flash-lite-latest',
                    contents: `Generate a study note about: "${prompt}".`,
                    config: {
                        systemInstruction: systemInstruction
                    }
                });
            }

            let htmlContent = response.text;
            
            // Handle Grounding Metadata (Citations)
            if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                const chunks = response.candidates[0].groundingMetadata.groundingChunks;
                const sources = chunks
                    .filter((c: any) => c.web?.uri && c.web?.title)
                    .map((c: any) => `<li><a href="${c.web.uri}" target="_blank" rel="noopener noreferrer">${c.web.title}</a></li>`)
                    .join('');
                
                if (sources) {
                    htmlContent += `<br/><h3>Sources</h3><ul>${sources}</ul>`;
                }
            }
            
            const titleMatch = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            let title = prompt;
            let content = htmlContent;

            if (titleMatch && titleMatch[1]) {
                title = titleMatch[1].trim();
                content = htmlContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
            }

            setGeneratedTitle(title);
            setGeneratedContent(content);
            setStage('review');

        } catch (e) {
            console.error(e);
            setError("Failed to generate note. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if (!editedTitle.trim()) return;
        addNote({
            title: editedTitle,
            content: editedContent,
            subjectId: subjectId || undefined, // Ensure empty string becomes undefined for general note
            topic: 'General' // Automatically assign General topic
        });
        handleClose();
    };

    const renderPromptStage = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Topic</label>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Enter a topic, e.g., 'The basics of quantum mechanics' or 'History of the Roman Empire'"
                    rows={4}
                    className={modalInputStyles}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Subject</label>
                    <select
                        value={subjectId}
                        onChange={e => setSubjectId(e.target.value)}
                        className={modalSelectStyles}
                    >
                        <option value="">General Note (No Subject)</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                </div>
                
                <div>
                     <label className="block text-sm font-medium text-text-secondary mb-1.5">Settings</label>
                     <button
                        onClick={() => setUseGoogleSearch(!useGoogleSearch)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all ${useGoogleSearch ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-surface-inset border-border text-text-secondary hover:text-text-primary'}`}
                     >
                        <div className="flex items-center gap-2">
                            <GlobeAltIcon className="h-5 w-5" />
                            <span className="font-medium">Use Google Search</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${useGoogleSearch ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${useGoogleSearch ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                     </button>
                     <p className="text-xs text-text-muted mt-1 ml-1">
                        {useGoogleSearch ? "Generating with real-time web data." : "Fastest generation using internal knowledge."}
                     </p>
                </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
            
            <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-border -mx-6 -mb-6 px-6 pb-6 bg-surface-muted rounded-b-2xl">
                <button type="button" onClick={handleClose} className={modalSecondaryButtonStyles}>Cancel</button>
                <button onClick={handleGenerate} className={`${modalPrimaryButtonStyles} flex items-center gap-2`} disabled={isLoading}>
                    <SparklesIcon className="h-5 w-5" />
                    {isLoading ? 'Generating...' : 'Generate Note'}
                </button>
            </div>
        </div>
    );
    
    const renderReviewStage = () => (
        <div className="space-y-4">
            <input
                type="text"
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                placeholder="Note Title"
                className={modalInputStyles}
            />
            <div className="bg-surface-inset rounded-xl">
                 <RichTextEditor value={editedContent} onChange={setEditedContent} />
            </div>
             <div className="mt-8 pt-4 flex justify-between items-center border-t border-border -mx-6 -mb-6 px-6 pb-6 bg-surface-muted rounded-b-2xl">
                <button type="button" onClick={() => setStage('prompt')} className={`${modalSecondaryButtonStyles} flex items-center gap-2`}>
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                </button>
                <div className="flex gap-3">
                    <button type="button" onClick={handleClose} className={modalSecondaryButtonStyles}>Discard</button>
                    <button onClick={handleSave} className={modalPrimaryButtonStyles}>Save Note</button>
                </div>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={stage === 'prompt' ? "Generate Note with AI" : "Review Generated Note"} size="3xl">
            {isLoading && stage === 'prompt' ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <SparklesIcon className="h-12 w-12 text-primary animate-pulse" />
                    <p className="mt-4 text-text-secondary font-medium">Generating your notes...</p>
                    <p className="text-sm text-text-muted mt-1">{useGoogleSearch ? "Searching web and synthesizing..." : "Drafting content..."}</p>
                </div>
            ) : (
                stage === 'prompt' ? renderPromptStage() : renderReviewStage()
            )}
        </Modal>
    );
};

export default AIGenerateNoteModal;
