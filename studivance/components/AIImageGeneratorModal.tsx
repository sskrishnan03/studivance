import React, { useState, useMemo, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from './Modal';
import { PhotoIcon, SparklesIcon, ArrowPathIcon, CheckIcon, ArrowsPointingOutIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

interface AIImageGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsertImage: (base64Image: string) => void;
}

const inputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";
const selectStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none cursor-pointer";
const primaryButtonStyles = "px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";
const secondaryButtonStyles = "px-5 py-2.5 bg-surface-inset text-text-primary font-semibold rounded-lg hover:bg-border transition-colors duration-200 text-sm";

type ImageSize = '25%' | '50%' | '75%' | '100%';
type ImageAlign = 'left' | 'center' | 'right';

const AIImageGeneratorModal: React.FC<AIImageGeneratorModalProps> = ({ isOpen, onClose, onInsertImage }) => {
    const [prompt, setPrompt] = useState('');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Image Adjustment State
    const [size, setSize] = useState<ImageSize>('100%');
    const [alignment, setAlignment] = useState<ImageAlign>('center');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage(reader.result as string);
                setGeneratedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a description for the image.");
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const model = 'gemini-2.5-flash-image';
            let contents: any = { parts: [] };

            if (referenceImage) {
                 const base64Data = referenceImage.split(',')[1];
                 const mimeType = referenceImage.match(/:(.*?);/)?.[1] || 'image/png';
                 
                 contents.parts.push({
                     inlineData: {
                         mimeType: mimeType,
                         data: base64Data
                     }
                 });
            }

            contents.parts.push({ text: prompt });

            const response = await ai.models.generateContent({
                model: model,
                contents: contents,
            });

            let foundImage = false;
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                         const base64String = part.inlineData.data;
                         const mimeType = part.inlineData.mimeType || 'image/png';
                         setGeneratedImage(`data:${mimeType};base64,${base64String}`);
                         foundImage = true;
                         break;
                    }
                }
            }

            if (!foundImage) {
                const textPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
                if (textPart) {
                    setError(`Model response: ${textPart.text}`);
                } else {
                    setError("No image was generated. Please try a different prompt.");
                }
            }

        } catch (e: any) {
            console.error("Image generation error:", e);
            setError(`Generation failed: ${e.message || "Unknown error"}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsert = () => {
        if (generatedImage) {
            // Construct the HTML tag with styles based on user selection
            let style = `width: ${size}; max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px; margin-bottom: 10px;`;
            
            if (alignment === 'center') {
                style += ` display: block; margin-left: auto; margin-right: auto;`;
            } else if (alignment === 'left') {
                style += ` float: left; margin-right: 15px;`;
            } else if (alignment === 'right') {
                style += ` float: right; margin-left: 15px;`;
            }

            const imgTag = `<img src="${generatedImage}" alt="AI Generated Image" style="${style}" />`;
            
            // If floating, we might want a clear fix, but RichTextEditor usually handles it.
            // Appending a break or space can help.
            onInsertImage(imgTag + (alignment !== 'center' ? '<br style="clear:both;" />' : ''));
            handleClose();
        }
    };

    const handleClose = () => {
        setPrompt('');
        setReferenceImage(null);
        setGeneratedImage(null);
        setError('');
        setIsLoading(false);
        setSize('100%');
        setAlignment('center');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nano Banana Image Studio" size="2xl">
            <div className="flex flex-col gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Prompt
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={referenceImage ? "Describe the edits (e.g., 'Add a retro filter', 'Make it cybernetic')" : "Describe the image to create..."}
                            rows={3}
                            className={inputStyles}
                        />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Reference Image (Optional)
                        </label>
                        <div 
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${referenceImage ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-surface-inset'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                             {referenceImage ? (
                                 <div className="relative w-full flex justify-center group">
                                     <img src={referenceImage} alt="Reference" className="max-h-48 rounded-lg shadow-sm object-contain" />
                                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                         <p className="text-white font-medium">Click to replace</p>
                                     </div>
                                 </div>
                             ) : (
                                 <>
                                    <PhotoIcon className="h-10 w-10 text-text-muted mb-2" />
                                    <p className="text-sm text-text-secondary font-medium">Upload image to edit</p>
                                    <p className="text-xs text-text-muted mt-1">JPG, PNG supported</p>
                                 </>
                             )}
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                             />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || !prompt.trim()} 
                            className={primaryButtonStyles}
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            ) : (
                                <SparklesIcon className="h-5 w-5" />
                            )}
                            {isLoading ? 'Processing...' : (referenceImage ? 'Edit Image' : 'Generate')}
                        </button>
                    </div>
                </div>

                {(generatedImage || isLoading) && (
                    <div className="border-t border-border pt-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-text-primary mb-4">Result & Adjustment</h3>
                        
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Image Preview */}
                            <div className="flex-1 bg-surface-inset rounded-xl p-4 flex items-center justify-center min-h-[300px] border border-border">
                                {isLoading ? (
                                    <div className="text-center">
                                        <div className="inline-block relative w-16 h-16 mb-4">
                                             <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/30 rounded-full animate-ping"></div>
                                             <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full animate-pulse"></div>
                                        </div>
                                        <p className="text-text-primary font-medium">Applying creativity...</p>
                                    </div>
                                ) : generatedImage ? (
                                    <img 
                                        src={generatedImage} 
                                        alt="Generated result" 
                                        className="max-h-[300px] w-auto rounded-lg shadow-lg transition-all duration-300"
                                        style={{ 
                                            maxWidth: size,
                                            // Note: These styles are just for preview in the modal, actual insertion uses the HTML tag logic
                                        }}
                                    />
                                ) : null}
                            </div>

                            {/* Adjustment Controls */}
                            {generatedImage && !isLoading && (
                                <div className="w-full md:w-64 flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <ArrowsPointingOutIcon className="h-4 w-4"/> Size
                                        </label>
                                        <select 
                                            value={size} 
                                            onChange={(e) => setSize(e.target.value as ImageSize)}
                                            className={selectStyles}
                                        >
                                            <option value="25%">Small (25%)</option>
                                            <option value="50%">Medium (50%)</option>
                                            <option value="75%">Large (75%)</option>
                                            <option value="100%">Full Width (100%)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <ArrowsRightLeftIcon className="h-4 w-4"/> Alignment
                                        </label>
                                        <div className="flex bg-surface-inset rounded-lg p-1 border border-border">
                                            {(['left', 'center', 'right'] as ImageAlign[]).map((align) => (
                                                <button
                                                    key={align}
                                                    onClick={() => setAlignment(align)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-all ${alignment === align ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                                                >
                                                    {align}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 flex flex-col gap-2">
                                        <button onClick={handleInsert} className={primaryButtonStyles}>
                                            <CheckIcon className="h-5 w-5" />
                                            Insert Image
                                        </button>
                                        <button onClick={handleClose} className={secondaryButtonStyles}>
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AIImageGeneratorModal;