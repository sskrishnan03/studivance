import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from './Modal';
import { useData } from '../contexts/DataContext';
import AIIcon from './AIIcon';
import { 
    PaperAirplaneIcon, 
    GlobeAltIcon, 
    LinkIcon, 
    PlusIcon, 
    TrashIcon, 
    PencilSquareIcon, 
    MagnifyingGlassIcon, 
    ChatBubbleLeftEllipsisIcon,
    DocumentDuplicateIcon,
    StopIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { ChatMessage, ChatSession } from '../types';
import ConfirmationModal from './ConfirmationModal';

// Declare marked global from the script tag in index.html
declare const marked: any;

interface ChatbotModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
    const { chats, createNewChat, saveChat, deleteChat } = useData();
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Renaming State
    const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
    const [renameTitle, setRenameTitle] = useState('');

    const abortControllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const isInitializingRef = useRef(false);
    
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    // Reset state when modal closes to ensure a fresh start next time
    useEffect(() => {
        if (!isOpen) {
            setCurrentChatId(null);
            setInput('');
            setIsSearchMode(false);
            setChatToDelete(null);
            setRenamingChatId(null);
            setIsGenerating(false);
            setSearchTerm('');
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            isInitializingRef.current = false;
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && !currentChatId && !isInitializingRef.current) {
            const initChat = async () => {
                isInitializingRef.current = true;
                if (chats.length > 0) {
                    // Chats are sorted by updatedAt desc in context
                    const mostRecent = chats[0];
                    // If the most recent chat is empty, reuse it to prevent clutter
                    if (mostRecent.messages.length === 0) {
                        setCurrentChatId(mostRecent.id);
                    } else {
                        // Otherwise create a new one for a fresh start
                        const newChat = await createNewChat();
                        setCurrentChatId(newChat.id);
                    }
                } else {
                    const newChat = await createNewChat();
                    setCurrentChatId(newChat.id);
                }
                isInitializingRef.current = false;
            };
            
            initChat();
        }
    }, [isOpen, chats, currentChatId, createNewChat]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentChatId, chats]);

    useEffect(() => {
        if (currentChatId && !isGenerating) {
            inputRef.current?.focus();
        }
    }, [currentChatId, isGenerating]);

    const activeChat = useMemo(() => chats.find(c => c.id === currentChatId), [chats, currentChatId]);

    const filteredChats = useMemo(() => {
        if (!searchTerm) return chats;
        const term = searchTerm.toLowerCase();
        return chats.filter(chat => 
            chat.title.toLowerCase().includes(term) || 
            chat.messages.some(m => m.text.toLowerCase().includes(term))
        );
    }, [chats, searchTerm]);

    const handleNewChat = async () => {
        if (activeChat && activeChat.messages.length === 0) {
            return; 
        }
        const newChat = await createNewChat();
        setCurrentChatId(newChat.id);
        setInput('');
        setIsSearchMode(false);
    };

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsGenerating(false);
        }
    };

    const handleSendMessage = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isGenerating || !activeChat) return;

        const newUserMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: textToSend,
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...activeChat.messages, newUserMsg];
        const updatedChat = { 
            ...activeChat, 
            messages: updatedMessages,
            title: activeChat.messages.length === 0 ? textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '') : activeChat.title
        };
        await saveChat(updatedChat);

        setInput('');
        setIsGenerating(true);

        const tempAiMsgId = (Date.now() + 1).toString();
        const placeholderAiMsg: ChatMessage = {
            id: tempAiMsgId,
            role: 'model',
            text: '',
            timestamp: new Date().toISOString()
        };
        
        let streamingMessages = [...updatedMessages, placeholderAiMsg];
        await saveChat({ ...updatedChat, messages: streamingMessages });

        abortControllerRef.current = new AbortController();

        try {
            let fullResponseText = '';
            let sources: { title: string; uri: string }[] = [];

            // Filter out empty messages to prevent API errors
            const history = activeChat.messages
                .filter(m => m.text && m.text.trim() !== '')
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            // Comprehensive system instruction for structured, step-by-step answers
            const systemInstruction = `You are Doubtrium, a highly intelligent and structured AI study assistant. Your goal is to provide answers that are as clean, organized, and helpful as possible, similar to top-tier AI models like ChatGPT and Gemini.

**MANDATORY RESPONSE FORMATTING:**
1.  **Step-by-Step Logic:** Always break down explanations, solutions, or guides into clear, numbered steps or bullet points.
2.  **Visual Structure:** Use **Markdown** aggressively to structure your text.
    *   Use **Headings** (###) to separate different parts of the answer.
    *   Use **Bold Text** for keywords, important terms, and emphasis.
    *   Use code blocks for any code snippets.
3.  **Clarity:** Avoid long paragraphs. Keep sentences concise.
4.  **Web Search:** When using search tools, synthesize the information into a single, cohesive, step-by-step narrative. Do not just list URLs; explain the content found.
5.  **Persona:** Act like an expert tutor or a knowledge engine like Jeopardy/Gemini—authoritative yet accessible.

**Example Style:**
### Concept
Definition...

### How it works
1.  **First Step:** Detail here.
2.  **Second Step:** Detail here.

### Summary
Key takeaway.

Always prioritize readability, visibility, and structure.`;

            if (isSearchMode) {
                const result = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: [
                        ...history,
                        { role: 'user', parts: [{ text: textToSend }]}
                    ],
                    config: {
                        tools: [{ googleSearch: {} }],
                        systemInstruction: systemInstruction
                    }
                });

                if (result) {
                    for await (const chunk of result) {
                        if (abortControllerRef.current?.signal.aborted) break;

                        const chunkText = chunk.text;
                        if (chunkText) {
                            fullResponseText += chunkText;
                            streamingMessages = streamingMessages.map(m => 
                                m.id === tempAiMsgId ? { ...m, text: fullResponseText } : m
                            );
                            await saveChat({ ...updatedChat, messages: streamingMessages });
                        }
                        
                        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                             const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
                             const newSources = chunks
                                .filter((c: any) => c.web?.uri && c.web?.title)
                                .map((c: any) => ({
                                    title: c.web.title,
                                    uri: c.web.uri
                                }));
                             if(newSources.length > 0) sources = newSources;
                        }
                    }
                }

            } else {
                // Using gemini-2.5-flash for standard chat as well to ensure high quality reasoning and formatting
                const result = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: [
                        ...history,
                        { role: 'user', parts: [{ text: textToSend }]}
                    ],
                    config: {
                        systemInstruction: systemInstruction
                    }
                });

                if (result) {
                    for await (const chunk of result) {
                        if (abortControllerRef.current?.signal.aborted) break;
                        const chunkText = chunk.text;
                        if (chunkText) {
                            fullResponseText += chunkText;
                            streamingMessages = streamingMessages.map(m => 
                                m.id === tempAiMsgId ? { ...m, text: fullResponseText } : m
                            );
                            await saveChat({ ...updatedChat, messages: streamingMessages });
                        }
                    }
                }
            }

            const finalAiMsg: ChatMessage = {
                id: tempAiMsgId,
                role: 'model',
                text: fullResponseText,
                timestamp: new Date().toISOString(),
                sources: sources.length > 0 ? sources : undefined
            };

            await saveChat({
                ...updatedChat,
                messages: [...updatedMessages, finalAiMsg]
            });

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Generation error:", error);
                const errorMsg: ChatMessage = {
                    id: (Date.now() + 2).toString(),
                    role: 'model',
                    text: "Sorry, something went wrong or the connection was interrupted.",
                    timestamp: new Date().toISOString()
                };
                await saveChat({ ...updatedChat, messages: [...updatedMessages, errorMsg] });
            }
        } finally {
            setIsGenerating(false);
            abortControllerRef.current = null;
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleEditMessage = (msg: ChatMessage) => {
        if (!activeChat) return;
        const index = activeChat.messages.findIndex(m => m.id === msg.id);
        if (index === -1) return;
        const previousMessages = activeChat.messages.slice(0, index);
        const rewindChat = { ...activeChat, messages: previousMessages };
        saveChat(rewindChat);
        setInput(msg.text);
        inputRef.current?.focus();
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setChatToDelete(id);
    };

    const confirmDelete = async () => {
        if (chatToDelete) {
            await deleteChat(chatToDelete);
            if (currentChatId === chatToDelete) {
                const remaining = chats.filter(c => c.id !== chatToDelete);
                if (remaining.length > 0) {
                    setCurrentChatId(remaining[0].id);
                } else {
                    const newChat = await createNewChat();
                    setCurrentChatId(newChat.id);
                }
            }
            setChatToDelete(null);
        }
    };

    const startRenaming = (chat: ChatSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setRenamingChatId(chat.id);
        setRenameTitle(chat.title);
    };

    const saveRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (renamingChatId) {
            const chat = chats.find(c => c.id === renamingChatId);
            if (chat) {
                await saveChat({ ...chat, title: renameTitle });
            }
            setRenamingChatId(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Doubtrium" size="4xl" disableDefaultPadding>
            <div className="flex h-[80vh] overflow-hidden rounded-b-2xl">
                
                {/* --- Sidebar (White/Light Theme) --- */}
                <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                    <div className="p-4 space-y-3">
                        <button 
                            onClick={handleNewChat}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-600 transition-all shadow-md shadow-black/10"
                        >
                            <PlusIcon className="h-4 w-4" />
                            New Chat
                        </button>
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search chats..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-100 border-transparent rounded-lg text-sm text-black focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                        {filteredChats.map(chat => (
                            <div 
                                key={chat.id}
                                onClick={() => setCurrentChatId(chat.id)}
                                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                                    currentChatId === chat.id 
                                    ? 'bg-gray-100 text-black shadow-sm' 
                                    : 'hover:bg-gray-50 text-gray-600 hover:text-black'
                                }`}
                            >
                                <ChatBubbleLeftEllipsisIcon className={`h-5 w-5 flex-shrink-0 ${currentChatId === chat.id ? 'text-primary' : 'text-gray-400'}`} />
                                
                                {renamingChatId === chat.id ? (
                                    <form onSubmit={saveRename} className="flex-1 min-w-0 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                        <input 
                                            autoFocus
                                            value={renameTitle}
                                            onChange={e => setRenameTitle(e.target.value)}
                                            onBlur={() => setRenamingChatId(null)}
                                            className="w-full bg-white border border-primary px-2 py-1 text-sm rounded focus:outline-none text-black"
                                        />
                                        <button type="submit" className="text-green-500"><CheckIcon className="h-4 w-4"/></button>
                                    </form>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${currentChatId === chat.id ? 'font-bold' : 'font-medium'}`}>
                                            {chat.title || 'New Chat'}
                                        </p>
                                        <p className={`text-xs truncate mt-0.5 ${currentChatId === chat.id ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {new Date(chat.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${renamingChatId === chat.id ? 'hidden' : ''}`}>
                                    <button 
                                        onClick={(e) => startRenaming(chat, e)}
                                        className={`p-1.5 rounded-lg transition-colors hover:bg-gray-200 text-gray-500 hover:text-black`}
                                        title="Rename"
                                    >
                                        <PencilSquareIcon className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteClick(chat.id, e)}
                                        className={`p-1.5 rounded-lg transition-colors hover:bg-red-100 text-gray-500 hover:text-red-600`}
                                        title="Delete"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Main Chat Area (Beige) --- */}
                <div className="flex-1 flex flex-col bg-background relative min-w-0">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 px-6 border-b border-primary/10 flex items-center justify-between bg-background z-10 flex-shrink-0">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <h2 className="font-bold text-lg text-primary truncate">{activeChat.title}</h2>
                                    <span className="text-primary/20">|</span>
                                    <button 
                                        onClick={() => setIsSearchMode(!isSearchMode)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            isSearchMode 
                                            ? 'bg-primary text-accent border-primary' 
                                            : 'bg-surface text-primary border-primary/20 hover:border-primary'
                                        }`}
                                    >
                                        {isSearchMode ? <GlobeAltIcon className="h-3.5 w-3.5" /> : <AIIcon className="h-3.5 w-3.5" />}
                                        {isSearchMode ? 'Web Search Active' : 'Standard Chat'}
                                    </button>
                                </div>
                            </div>

                            {/* Chat Messages (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {activeChat.messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                                            <AIIcon className="h-8 w-8 text-accent" />
                                        </div>
                                        <h3 className="text-xl font-bold text-primary">How can I help you today?</h3>
                                        <p className="text-text-secondary mt-2 max-w-sm">Ask me anything about your studies, tasks, or general knowledge.</p>
                                    </div>
                                )}

                                {activeChat.messages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up max-w-4xl mx-auto w-full group`}>
                                        
                                        <div className={`relative px-5 py-4 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-2xl rounded-tr-sm chat-user-message' 
                                            : 'bg-white text-primary border border-primary/5 rounded-2xl rounded-tl-sm'
                                        }`}>
                                            {/* Markdown Rendered Content */}
                                            <div 
                                                className={`
                                                    prose prose-sm max-w-none 
                                                    ${msg.role === 'user' 
                                                        ? 'prose-invert !text-white [&_*]:!text-white' 
                                                        : 'text-primary prose-headings:text-primary prose-strong:text-primary prose-code:text-primary'}
                                                    prose-p:leading-relaxed prose-pre:bg-black/5 prose-pre:text-primary
                                                `}
                                                dangerouslySetInnerHTML={{ __html: typeof marked !== 'undefined' ? marked.parse(msg.text) : msg.text }}
                                            />

                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className={`mt-3 pt-2 border-t ${msg.role === 'user' ? 'border-white/20' : 'border-primary/10'}`}>
                                                    <p className={`text-[10px] font-bold opacity-60 mb-1.5 uppercase flex items-center gap-1 ${msg.role === 'user' ? '!text-white' : 'text-primary'}`}>
                                                        <GlobeAltIcon className="h-3 w-3" /> Sources
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.sources.map((src, i) => (
                                                            <a 
                                                                key={i} 
                                                                href={src.uri} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] hover:underline truncate max-w-[150px] ${
                                                                    msg.role === 'user' 
                                                                    ? 'bg-white/10 text-white border border-white/10' 
                                                                    : 'bg-black/5 text-primary border border-black/5'
                                                                }`}
                                                            >
                                                                <LinkIcon className="h-2.5 w-2.5" />
                                                                {src.title}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Actions */}
                                        <div className={`flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'pr-1' : 'pl-1'}`}>
                                            <button 
                                                onClick={() => handleCopy(msg.text, msg.id)}
                                                className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5"
                                                title="Copy"
                                            >
                                                {copiedId === msg.id ? <CheckIcon className="h-3.5 w-3.5 text-green-600"/> : <DocumentDuplicateIcon className="h-3.5 w-3.5" />}
                                                <span className="font-medium">Copy</span>
                                            </button>
                                            
                                            {msg.role === 'user' && (
                                                <button 
                                                    onClick={() => handleEditMessage(msg)}
                                                    className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                                    <span className="font-medium">Edit</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area (Beige) */}
                            <div className="p-4 bg-background border-t border-primary/5 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-white rounded-[2rem] px-5 py-3 border border-primary/20 focus-within:border-primary focus-within:shadow-md transition-all flex items-center">
                                        <textarea
                                            ref={inputRef}
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            disabled={isGenerating}
                                            placeholder={isGenerating ? "Thinking..." : "Type a message..."}
                                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-sm text-primary placeholder:text-text-muted p-0 leading-relaxed custom-scrollbar"
                                            rows={1}
                                            style={{ minHeight: '24px', maxHeight: '120px' }}
                                        />
                                    </div>
                                    
                                    <div className="flex-shrink-0">
                                        {isGenerating ? (
                                            <button
                                                onClick={handleStopGeneration}
                                                className="w-11 h-11 rounded-full bg-primary text-accent hover:bg-primary-600 transition-colors flex items-center justify-center shadow-lg shadow-primary/20"
                                                title="Stop"
                                            >
                                                <StopIcon className="h-5 w-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSendMessage()}
                                                disabled={!input.trim()}
                                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                                    !input.trim() 
                                                    ? 'bg-surface-inset text-text-muted border border-border' 
                                                    : 'bg-primary text-accent hover:bg-primary-600 shadow-lg shadow-primary/20 transform hover:scale-105'
                                                }`}
                                            >
                                                <PaperAirplaneIcon className="h-5 w-5 ml-0.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50">
                            <ChatBubbleLeftEllipsisIcon className="h-20 w-20 mb-4" />
                            <p className="text-lg font-medium">Select a chat to start</p>
                        </div>
                    )}
                </div>
            </div>

            {chatToDelete && (
                <ConfirmationModal
                    isOpen={!!chatToDelete}
                    onClose={() => setChatToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Chat"
                    message="Delete this conversation permanently?"
                    confirmButtonText="Delete"
                />
            )}
        </Modal>
    );
};

export default ChatbotModal;