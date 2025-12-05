
import React, { useState, useEffect, useRef } from 'react';
import { Note, Subject, NoteAttachment } from '../types';
import RichTextEditor, { RichTextEditorRef } from './RichTextEditor';
import Modal from './Modal';
import { PaperClipIcon, XCircleIcon, DocumentIcon, CloudArrowUpIcon, TagIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface NoteEditorProps {
    note: Note | null;
    subjects: Subject[];
    onSave: (data: Omit<Note, 'id' | 'createdAt' | 'lastModified' | 'status' | 'isImportant'>) => void;
    onCancel: () => void;
    initialSubjectId?: string;
}

const inputStyles = "w-full px-4 py-2 bg-surface-inset border border-border rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary transition shadow-sm";
const primaryButtonStyles = "w-full px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButtonStyles = "w-full px-5 py-2.5 bg-surface-inset text-text-primary font-semibold rounded-lg hover:bg-border transition-colors duration-200 text-sm";

const NoteEditor: React.FC<NoteEditorProps> = ({ note, subjects, onSave, onCancel, initialSubjectId }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        title: '',
        subjectId: subjects.length > 0 ? subjects[0].id : '',
        topic: '',
        content: '',
    });
    const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    
    // For DOCX extraction modal
    const [fileToProcess, setFileToProcess] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    
    const [dragActive, setDragActive] = useState(false);
    
    const richTextEditorRef = useRef<RichTextEditorRef>(null);

    useEffect(() => {
        if (note) {
            setFormData({
                title: note.title,
                subjectId: note.subjectId || '',
                topic: note.topic || '',
                content: note.content,
            });
            setTags(note.tags || []);
            // Load attachments, including migration of legacy single file
            const loadedAttachments = note.attachments ? [...note.attachments] : [];
            if (note.fileDataUrl && loadedAttachments.length === 0) {
                loadedAttachments.push({
                    id: 'legacy-' + Date.now(),
                    name: note.fileName || 'Attached File',
                    type: note.fileType || 'application/octet-stream',
                    dataUrl: note.fileDataUrl,
                    size: 0 
                });
            }
            setAttachments(loadedAttachments);
        } else {
            setFormData({
                title: '',
                subjectId: initialSubjectId === '__GENERAL__' ? '' : (initialSubjectId || (subjects.length > 0 ? subjects[0].id : '')),
                topic: '',
                content: '',
            });
            setTags([]);
            setAttachments([]);
        }
    }, [note, initialSubjectId, subjects]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmedTag = tagInput.trim();
            if (trimmedTag && !tags.includes(trimmedTag)) {
                setTags([...tags, trimmedTag]);
                setTagInput('');
            }
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const processFile = async (file: File) => {
        // 200MB limit
        if (file.size > 200 * 1024 * 1024) { 
            alert(`File "${file.name}" is too large. Maximum size is 200MB.`);
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();

        // Check for DOCX extraction request - Special handling via modal
        if (extension === 'docx' && !fileToProcess) {
             setFileToProcess(file);
             return; 
        }

        // Define text/code extensions for automatic extraction
        const textExtensions = [
            'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 
            'py', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'rb', 'go', 'rs', 
            'swift', 'kt', 'sql', 'xml', 'yaml', 'yml', 'sh', 'bat', 
            'ini', 'cfg', 'conf', 'properties', 'gradle', 'lua', 'pl', 'r', 'dart'
        ];
        
        const isTextFile = file.type.startsWith('text/') || (extension && textExtensions.includes(extension));
        const isImage = file.type.startsWith('image/');

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            
            // Always add as attachment first
            const newAttachment: NoteAttachment = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name: file.name,
                type: file.type,
                dataUrl: dataUrl,
                size: file.size
            };
            setAttachments(prev => [...prev, newAttachment]);

            // Automatic Content Extraction Logic
            if (isImage) {
                 const imgTag = `<br/><img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" /><br/>`;
                 setFormData(prev => ({ ...prev, content: prev.content + imgTag }));
            } else if (isTextFile) {
                // Read text content specifically for insertion
                const textReader = new FileReader();
                textReader.onload = (e) => {
                    const text = e.target?.result as string;
                    // Simple escape for HTML display
                    const escapedText = text
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;");
                    
                    const codeBlock = `
                        <br/>
                        <div style="background-color: #1e1e1e; color: #d4d4d4; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 16px 0; font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="color: #9cdcfe; font-size: 0.8rem; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #333; padding-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                                <span style="opacity: 0.7;">📄</span> ${file.name}
                            </div>
                            <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; line-height: 1.6; color: #d4d4d4; background: transparent; border: none; overflow-x: auto; tab-size: 4;">${escapedText}</pre>
                        </div>
                        <br/>
                    `;
                    setFormData(prev => ({ ...prev, content: prev.content + codeBlock }));
                };
                textReader.readAsText(file);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(processFile);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            Array.from(e.dataTransfer.files).forEach(processFile);
        }
    };

    const handleRemoveAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    // DOCX Handling
    const handleAttachOnly = () => {
        if (!fileToProcess) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const newAttachment: NoteAttachment = {
                id: Date.now().toString(),
                name: fileToProcess.name,
                type: fileToProcess.type,
                dataUrl: reader.result as string,
                size: fileToProcess.size
            };
            setAttachments(prev => [...prev, newAttachment]);
            setFileToProcess(null);
        };
        reader.readAsDataURL(fileToProcess);
    };

    const handleExtractAndAttach = async () => {
        if (!fileToProcess) return;
        setIsExtracting(true);
        let extractedHtml = '';
        try {
            const arrayBuffer = await fileToProcess.arrayBuffer();
            if ((window as any).mammoth) {
                const result = await (window as any).mammoth.convertToHtml({ arrayBuffer });
                extractedHtml = result.value;
            } else {
                throw new Error("Mammoth library not loaded");
            }
        } catch (error) {
            console.error("Error extracting DOCX:", error);
            alert("Could not extract text from the document. It will be attached as a file only.");
        } finally {
            const reader = new FileReader();
            reader.onloadend = () => {
                 const newAttachment: NoteAttachment = {
                    id: Date.now().toString(),
                    name: fileToProcess.name,
                    type: fileToProcess.type,
                    dataUrl: reader.result as string,
                    size: fileToProcess.size
                };
                setAttachments(prev => [...prev, newAttachment]);
                setFormData(prev => ({ ...prev, content: prev.content + extractedHtml }));
                setIsExtracting(false);
                setFileToProcess(null);
            };
            reader.readAsDataURL(fileToProcess);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Please provide a title.');
            return;
        }

        // Auto-assign 'General' topic if topic is empty
        const finalTopic = formData.topic.trim() || 'General';

        onSave({
            ...formData,
            topic: finalTopic,
            attachments: attachments,
            tags: tags
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col h-full overflow-hidden">
                <div className="space-y-4 flex-grow flex flex-col overflow-y-auto pr-2">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={t('note_title')}
                        required
                        className={`${inputStyles} text-2xl font-bold !p-2 border-0 focus:ring-0 !bg-surface-inset text-black`}
                    />
                    <div className="flex gap-4">
                        <select name="subjectId" value={formData.subjectId} onChange={handleChange} className={inputStyles}>
                            <option value="">{t('general_note')}</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                        <input
                            type="text"
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            placeholder={`${t('topic')} (Optional)`}
                            className={inputStyles}
                        />
                    </div>
                    
                    {/* Tags Input */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span key={tag} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    {tag}
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-red-500 focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="relative">
                            <TagIcon className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add tags... (Press Enter)"
                                className={`${inputStyles} pl-9`}
                            />
                        </div>
                    </div>

                    <div className="flex-grow min-h-[300px]">
                        <RichTextEditor 
                            ref={richTextEditorRef}
                            value={formData.content} 
                            onChange={handleContentChange} 
                        />
                    </div>

                    {/* Attachments Section */}
                    <div>
                        <h4 className="text-sm font-bold text-text-secondary mb-2 flex items-center gap-2">
                            <PaperClipIcon className="h-4 w-4" /> {t('attachments')}
                        </h4>
                        
                        {/* Drag Drop Zone */}
                        <div 
                            className={`border-2 border-dashed rounded-xl p-4 transition-colors flex flex-col items-center justify-center text-center cursor-pointer ${
                                dragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface-inset'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <label className="w-full h-full cursor-pointer flex flex-col items-center">
                                <CloudArrowUpIcon className="h-8 w-8 text-text-muted mb-2" />
                                <p className="text-sm text-text-secondary font-medium">{t('upload_drag')}</p>
                                <p className="text-xs text-text-muted mt-1">
                                    PDF, Excel, PPT (Attachments) | Images, Code, Word (Extracted & Attached) - Max 200MB
                                </p>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    multiple
                                    // Accepts any file type
                                />
                            </label>
                        </div>

                        {/* Attachments List */}
                        {attachments.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                {attachments.map(att => (
                                    <div key={att.id} className="flex items-center gap-3 p-3 bg-surface-inset rounded-lg border border-border group">
                                        {att.type.startsWith('image/') ? (
                                            <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                                                <img src={att.dataUrl} alt="preview" className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded flex items-center justify-center text-primary">
                                                <DocumentIcon className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-text-primary truncate" title={att.name}>{att.name}</p>
                                            <p className="text-xs text-text-muted">
                                                {(att.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveAttachment(att.id)}
                                            className="text-text-muted hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <XCircleIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 flex justify-end gap-3 border-t border-border flex-shrink-0">
                    <button type="button" onClick={onCancel} className={secondaryButtonStyles}>{t('cancel')}</button>
                    <button type="submit" className={primaryButtonStyles} disabled={!formData.title.trim()}>{t('save_note')}</button>
                </div>
            </form>

            {fileToProcess && (
                <Modal isOpen={!!fileToProcess} onClose={() => setFileToProcess(null)} title="Process Word Document" size="md">
                    <div className="space-y-4">
                        <p className="text-text-secondary">
                            You've selected <strong>{fileToProcess.name}</strong>. You can extract its text content directly into your note.
                        </p>
                        {isExtracting ? (
                            <div className="text-center p-8">
                                <p>Extracting content, please wait...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 pt-2">
                                <button onClick={handleExtractAndAttach} className={primaryButtonStyles}>
                                    Extract Content & Attach File
                                </button>
                                <button onClick={handleAttachOnly} className={secondaryButtonStyles}>
                                    Attach File Only
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default NoteEditor;
