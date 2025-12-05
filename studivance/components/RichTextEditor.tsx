
import React, { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { TrashIcon, ArrowsPointingOutIcon, ArrowsRightLeftIcon, ClipboardDocumentIcon, LinkIcon } from '@heroicons/react/24/outline';

const TEXT_STYLES = [
    { label: 'Title', value: 'h1', className: 'text-3xl font-bold' },
    { label: 'Subtitle', value: 'h2', className: 'text-2xl font-bold text-gray-700' },
    { label: 'Heading', value: 'h3', className: 'text-xl font-bold' },
    { label: 'Subheading', value: 'h4', className: 'text-lg font-bold text-gray-600' },
    { label: 'Section', value: 'h5', className: 'text-base font-bold uppercase tracking-wide' },
    { label: 'Subsection', value: 'h6', className: 'text-sm font-bold text-gray-500' },
    { label: 'Body', value: 'p', className: 'text-base font-normal' },
];

const CASE_OPTIONS = [
    { label: 'Sentence case', value: 'sentence' },
    { label: 'lowercase', value: 'lower' },
    { label: 'UPPERCASE', value: 'upper' },
    { label: 'Capitalize Each Word', value: 'title' },
    { label: 'tOGGLE cASE', value: 'toggle' },
];

const HIGHLIGHT_COLORS = [
    { label: 'Light Yellow', value: '#ffff99', border: '#e6e600' },
    { label: 'Light Green', value: '#ccffcc', border: '#00cc00' },
    { label: 'Light Red', value: '#ffcccc', border: '#ff0000' },
];

// Icons
const BoldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10V6.5M15.6,10.79C16.57,10.11 17.25,9 17.25,8A3.25,3.25 0 0,0 14,4.75H8V17.25H14.5A3.25,3.25 0 0,0 17.75,14C17.75,12.5 16.89,11.26 15.6,10.79Z" /></svg>;
const ItalicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" /></svg>;
const UnderlineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z" /></svg>;
const BulletListIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const NumberListIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4l2-2h-2v-2"></path></svg>;
const AlignLeftIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>;
const AlignCenterIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>;
const AlignRightIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>;
const StrikethroughIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.81,6.5L11.41,8.25L10,6.5H8L11.5,11L8,15.5H10L11.41,13.75L12.81,15.5H14.81L11.31,11L14.81,6.5H12.81M3,11H21V13H3V11Z" /></svg>;
const CaseIcon = () => <span className="font-serif font-bold text-sm">Aa</span>;

const HighlighterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" fillOpacity="0" /> 
        <path d="M16.5 6a3 3 0 00-3-3H6a3 3 0 00-3 3v7.5a3 3 0 003 3v-6h4.5v6h6v-7.5zm-4.5 9h-6v3.75a3 3 0 003 3h0a3 3 0 003-3V15z" />
    </svg>
);


const IncreaseFontSizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M5.12 14 7.5 7.67 9.87 14M6.5 5 1 19h2.25l1.12-3h6.25l1.12 3H14L8.5 5h-2z" />
    <path d="M18 6l-4 4h3v6h2v-6h3l-4-4z" />
  </svg>
);

const DecreaseFontSizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M5.12 14 7.5 7.67 9.87 14M6.5 5 1 19h2.25l1.12-3h6.25l1.12 3H14L8.5 5h-2z" />
    <path d="M18 18l4-4h-3V8h-2v6h-3l4 4z" />
  </svg>
);

const useClickOutside = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export interface RichTextEditorRef {
    insertHTML: (html: string) => void;
}

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({ value, onChange }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [activeStyles, setActiveStyles] = useState<Record<string, boolean | string>>({});
    
    // Stats State
    const [stats, setStats] = useState({ line: 1, col: 1, chars: 0, totalLines: 1 });
    
    // Image selection state
    const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
    const [imageSizeInput, setImageSizeInput] = useState('100');

    // Link modal state
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({ text: '', url: '' });
    const [savedRange, setSavedRange] = useState<Range | null>(null);

    useClickOutside(toolbarRef, () => {
        setOpenDropdown(null);
    });
    
    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        insertHTML: (html: string) => {
            if (editorRef.current) {
                editorRef.current.focus();
                const success = document.execCommand('insertHTML', false, html);
                if (!success) {
                    // Fallback if execCommand fails
                     const range = document.getSelection()?.getRangeAt(0);
                     if (range) {
                         const fragment = range.createContextualFragment(html);
                         range.deleteContents();
                         range.insertNode(fragment);
                     } else {
                         editorRef.current.innerHTML += html;
                     }
                }
                handleInput();
                updateActiveStyles();
            }
        }
    }));

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
             if (Math.abs(editorRef.current.innerHTML.length - value.length) > 5 || !editorRef.current.innerHTML) {
                editorRef.current.innerHTML = value;
                calculateStats(); // Recalculate on external update
             }
        }
    }, [value]);

    const calculateStats = useCallback(() => {
        if (!editorRef.current) return;
        
        const textContent = editorRef.current.innerText || '';
        const chars = textContent.replace(/[\n\r]+$/, '').length;
        // Approximation of visual lines based on newline characters
        const totalLines = textContent.split('\n').length || 1;

        let line = 1;
        let col = 1;

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
            // Find current line element
            let currentNode = selection.anchorNode;
            
            // Traverse up to find the direct child of the editor div (which represents a line block)
            while (currentNode && currentNode.parentElement !== editorRef.current && currentNode !== editorRef.current) {
                currentNode = currentNode.parentElement;
            }

            if (currentNode && currentNode !== editorRef.current) {
                // Count preceding siblings to get line number
                let sibling = currentNode.previousSibling;
                while (sibling) {
                    line++;
                    sibling = sibling.previousSibling;
                }
                
                // Calculate column within this line block
                // We create a range from the start of the block to the cursor position
                try {
                    const range = document.createRange();
                    range.setStart(currentNode, 0);
                    range.setEnd(selection.anchorNode!, selection.anchorOffset);
                    col = range.toString().length + 1;
                } catch (e) {
                    // Fallback if range creation fails (e.g. invalid offsets)
                    col = 1;
                }
            } else {
                 // Cursor is in the root editor div (Line 1) or inside a text node that is a direct child
                 line = 1;
                 try {
                     const range = document.createRange();
                     range.setStart(editorRef.current, 0);
                     range.setEnd(selection.anchorNode!, selection.anchorOffset);
                     col = range.toString().length + 1;
                 } catch(e) {
                     col = 1;
                 }
            }
        }
        
        setStats({ line, col, chars, totalLines });
    }, []);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            calculateStats();
        }
    }, [onChange, calculateStats]);

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            const imgHtml = `<img src="${base64}" style="max-width: 100%; height: auto; display: block; margin: 10px auto;" />`;
                            if (document.execCommand('insertHTML', false, imgHtml)) {
                                handleInput();
                            } else {
                                // Fallback
                                editorRef.current!.innerHTML += imgHtml;
                                handleInput();
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                    return; // Handled image paste
                }
            }
        }
        // Let standard text paste handle normally
        setTimeout(calculateStats, 0);
    };

    const execCmd = (command: string, arg?: string) => {
        editorRef.current?.focus();
        document.execCommand('styleWithCSS', false, true as any);
        document.execCommand(command, false, arg);
        updateActiveStyles();
        handleInput();
    };

    const applyHighlight = (color: string) => {
        execCmd('hiliteColor', color);
        setOpenDropdown(null);
    };

    const adjustSelectionFontSize = (adjustment: number) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        // Ensure selection is within editor
        if (editorRef.current && !editorRef.current.contains(selection.anchorNode)) return;

        editorRef.current?.focus();
        
        // We use a temporary marker strategy
        const uuid = "fs-" + Date.now();
        document.execCommand('styleWithCSS', false, true as any);
        document.execCommand('fontName', false, uuid);

        const editor = editorRef.current;
        if (!editor) return;

        // Process elements with marker font family
        const spans = editor.querySelectorAll('span');
        let modified = false;

        spans.forEach(span => {
            if (span.style.fontFamily.includes(uuid)) {
                // Determine current size
                const computed = window.getComputedStyle(span);
                let currentSize = parseFloat(computed.fontSize);
                
                // Fallback if we can't get computed size correctly (should generally work in modern browsers)
                if (isNaN(currentSize)) currentSize = 16;
                
                let newSize = currentSize + adjustment;
                if (newSize < 1) newSize = 1; // Limit minimum size
                
                span.style.fontSize = `${newSize}px`;
                span.style.fontFamily = ''; // Remove marker
                
                // Cleanup empty style
                if (span.getAttribute('style') === '') {
                    span.removeAttribute('style');
                }
                modified = true;
            }
        });
        
        // Cleanup <font> tags if any created by execCommand fallback
        const fonts = editor.querySelectorAll(`font[face*="${uuid}"]`);
        fonts.forEach(font => {
             const element = font as HTMLElement;
             const computed = window.getComputedStyle(element);
             let currentSize = parseFloat(computed.fontSize);
             if (isNaN(currentSize)) currentSize = 16;
             
             let newSize = currentSize + adjustment;
             if (newSize < 1) newSize = 1;

             const span = document.createElement('span');
             span.innerHTML = element.innerHTML;
             span.style.fontSize = `${newSize}px`;
             
             element.parentNode?.replaceChild(span, element);
             modified = true;
        });

        if (modified) {
            handleInput();
        }
    };
    
    // Change Case Logic
    const changeCase = (type: string) => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const content = range.toString();
        
        let newContent = content;
        
        switch (type) {
            case 'upper':
                newContent = content.toUpperCase();
                break;
            case 'lower':
                newContent = content.toLowerCase();
                break;
            case 'title':
                newContent = content.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                break;
            case 'sentence':
                newContent = content.charAt(0).toUpperCase() + content.slice(1).toLowerCase();
                break;
            case 'toggle':
                newContent = content.split('').map(c => 
                    c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
                ).join('');
                break;
        }

        document.execCommand('insertText', false, newContent);
        setOpenDropdown(null);
        handleInput();
    };

    const updateActiveStyles = useCallback(() => {
        if (!editorRef.current) return;
        const styles: Record<string, boolean | string> = {};
        const commands = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight'];
        commands.forEach(cmd => {
            try {
                if (document.queryCommandState(cmd)) styles[cmd] = true;
            } catch (e) { console.error(`Error querying command state for ${cmd}`, e); }
        });

        // Check block format
        try {
            const format = document.queryCommandValue('formatBlock');
            if (format) styles.block = format.toLowerCase();
        } catch (e) {}

        // Check Highlight
        try {
            const hilite = document.queryCommandValue('hiliteColor');
            if (hilite && hilite !== 'transparent' && hilite !== 'rgba(0, 0, 0, 0)') styles['hiliteColor'] = true;
        } catch(e) {}

        setActiveStyles(styles);
        calculateStats(); // Also update stats on style change as cursor might move
    }, [calculateStats]);

    // Image Selection & Manipulation
    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');

        if (target.tagName === 'IMG') {
            const img = target as HTMLImageElement;
            setSelectedImg(img);
            let width = img.style.width || '100%';
            if (width.includes('%')) {
                width = width.replace('%', '');
            } else if (width.includes('px')) {
                width = '100'; // Default to 100 for non-percentage
            }
            setImageSizeInput(width);
        } else if (anchor && anchor.href) {
            window.open(anchor.href, '_blank');
            setSelectedImg(null);
        } else {
            setSelectedImg(null);
        }
        updateActiveStyles();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (selectedImg && (e.key === 'Delete' || e.key === 'Backspace')) {
            e.preventDefault();
            deleteImage();
        }
        updateActiveStyles();
    };
    
    // Update stats on cursor movement
    const handleKeyUp = (e: React.KeyboardEvent) => {
        updateActiveStyles();
        calculateStats();
    }

    const deleteImage = () => {
        if (selectedImg) {
            selectedImg.remove();
            setSelectedImg(null);
            handleInput();
        }
    };

    const copyImage = async () => {
        if (selectedImg && selectedImg.src) {
            try {
                const response = await fetch(selectedImg.src);
                const blob = await response.blob();
                const item = new ClipboardItem({ [blob.type]: blob });
                await navigator.clipboard.write([item]);
            } catch (err) {
                console.error('Failed to copy image:', err);
                alert('Could not copy image to clipboard.');
            }
        }
    };

    const alignImage = (align: 'left' | 'center' | 'right') => {
        if (selectedImg) {
            selectedImg.style.display = 'block';
            selectedImg.style.marginLeft = align === 'left' ? '0' : (align === 'center' ? 'auto' : 'auto');
            selectedImg.style.marginRight = align === 'right' ? '0' : (align === 'center' ? 'auto' : 'auto');
            selectedImg.style.float = align === 'left' ? 'left' : (align === 'right' ? 'right' : 'none');
            if (align === 'center') selectedImg.style.clear = 'both';
            handleInput();
        }
    };

    const resizeImage = (percentage: string) => {
        setImageSizeInput(percentage.replace('%', ''));
        if (selectedImg) {
            selectedImg.style.width = percentage;
            selectedImg.style.height = 'auto';
            handleInput();
        }
    };

    const handleManualResize = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setImageSizeInput(val);
        if (selectedImg) {
            selectedImg.style.width = `${val}%`;
            selectedImg.style.height = 'auto';
            handleInput();
        }
    };

    // --- Link Modal Logic ---
    const openLinkModal = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
                let text = range.toString();
                let url = '';
                
                let node: Node | null = range.commonAncestorContainer;
                if (node.nodeType === 3) node = node.parentNode;
                while (node && node !== editorRef.current) {
                    if (node.nodeName === 'A') {
                        url = (node as HTMLElement).getAttribute('href') || '';
                        text = node.textContent || text;
                        const linkRange = document.createRange();
                        linkRange.selectNode(node);
                        selection.removeAllRanges();
                        selection.addRange(linkRange);
                        setSavedRange(linkRange);
                        break;
                    }
                    node = node.parentNode;
                }
                
                if (!savedRange && selection.rangeCount > 0) {
                    setSavedRange(range.cloneRange());
                }

                setLinkData({ text, url });
                setIsLinkModalOpen(true);
            } else {
                 editorRef.current?.focus();
                 setLinkData({ text: '', url: '' });
                 setIsLinkModalOpen(true);
            }
        } else {
             editorRef.current?.focus();
             setIsLinkModalOpen(true);
        }
    };

    const handleLinkSubmit = () => {
        if (!linkData.url) {
            setIsLinkModalOpen(false);
            return;
        }

        let urlToUse = linkData.url.trim();
        if (!/^https?:\/\//i.test(urlToUse) && !/^mailto:/i.test(urlToUse)) {
            urlToUse = 'https://' + urlToUse;
        }

        editorRef.current?.focus();
        const selection = window.getSelection();
        if (selection) {
            if (savedRange) {
                selection.removeAllRanges();
                selection.addRange(savedRange);
                document.execCommand('delete');
            }
        }

        const html = `<div>${linkData.text}</div><div><a href="${urlToUse}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline" style="text-decoration: underline; color: #2563EB; cursor: pointer;">${urlToUse}</a></div><br/>`;
        
        document.execCommand('insertHTML', false, html);
        handleInput();
        updateActiveStyles();
        setIsLinkModalOpen(false);
        setLinkData({ text: '', url: '' });
        setSavedRange(null);
    };

    const ToolbarButton: React.FC<{ command: string; title: string; children: React.ReactNode }> = ({ command, title, children }) => (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd(command); }} title={title} className={`p-2 rounded transition-colors text-text-secondary w-9 h-9 flex items-center justify-center ${activeStyles[command] ? 'bg-black/10' : 'hover:bg-black/5'}`}>
            {children}
        </button>
    );

    const formatBlock = (tag: string) => {
        execCmd('formatBlock', tag);
        setOpenDropdown(null);
    };

    const getBlockLabel = () => {
        const currentBlock = activeStyles.block as string;
        if (!currentBlock) return 'Body';
        const style = TEXT_STYLES.find(s => s.value === currentBlock);
        return style ? style.label : 'Body';
    };

    return (
        <div className="border border-border rounded-lg flex flex-col bg-transparent relative">
            <div ref={toolbarRef} className="flex items-center gap-1 p-1.5 border-b border-border bg-surface-muted rounded-t-lg flex-shrink-0 flex-wrap">
                
                {/* Text Style Dropdown */}
                <div className="relative">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); setOpenDropdown(openDropdown === 'style' ? null : 'style'); }} className="bg-surface-inset p-1.5 rounded hover:bg-black/5 focus:outline-none text-sm h-9 w-28 text-left text-black truncate border border-transparent focus:border-primary flex items-center justify-between">
                        <span className="font-semibold truncate">{getBlockLabel()}</span>
                        <span className="text-[10px] opacity-60 ml-1">▼</span>
                    </button>
                    {openDropdown === 'style' && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-surface shadow-xl rounded-lg border border-border w-56 max-h-80 overflow-y-auto flex flex-col p-2 animate-scale-in">
                             <div className="text-xs font-semibold text-gray-500 uppercase px-2 py-1 mb-1">Text Style</div>
                             {TEXT_STYLES.map(style => (
                                 <button key={style.value} onMouseDown={(e) => { e.preventDefault(); formatBlock(style.value); }} className={`text-left px-3 py-2 hover:bg-black/5 text-black rounded mb-1 last:mb-0 ${style.className}`}>
                                     {style.label}
                                 </button>
                             ))}
                        </div>
                    )}
                </div>
                
                <div className="w-px h-5 bg-border self-center mx-1"></div>

                <div className="flex gap-0.5">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); adjustSelectionFontSize(2); }} title="Increase Font Size" className="p-2 rounded transition-colors text-text-secondary w-9 h-9 flex items-center justify-center hover:bg-black/5">
                        <IncreaseFontSizeIcon />
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); adjustSelectionFontSize(-2); }} title="Decrease Font Size" className="p-2 rounded transition-colors text-text-secondary w-9 h-9 flex items-center justify-center hover:bg-black/5">
                        <DecreaseFontSizeIcon />
                    </button>
                </div>

                 {/* Change Case Dropdown */}
                <div className="relative">
                    <button 
                        type="button" 
                        onMouseDown={(e) => { e.preventDefault(); setOpenDropdown(openDropdown === 'case' ? null : 'case'); }} 
                        className="p-1.5 rounded transition-colors text-text-secondary h-9 w-9 flex items-center justify-center hover:bg-black/5"
                        title="Change Case"
                    >
                        <CaseIcon />
                    </button>
                    {openDropdown === 'case' && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-surface shadow-xl rounded-lg border border-border w-48 overflow-hidden flex flex-col p-1 animate-scale-in">
                            {CASE_OPTIONS.map(opt => (
                                <button key={opt.value} onMouseDown={(e) => { e.preventDefault(); changeCase(opt.value); }} className="text-left px-3 py-2 hover:bg-black/5 text-black rounded mb-1 last:mb-0 text-sm">
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-border self-center mx-1"></div>

                <ToolbarButton command="bold" title="Bold"><BoldIcon /></ToolbarButton>
                <ToolbarButton command="italic" title="Italic"><ItalicIcon /></ToolbarButton>
                <ToolbarButton command="underline" title="Underline"><UnderlineIcon /></ToolbarButton>
                <ToolbarButton command="strikeThrough" title="Strikethrough"><StrikethroughIcon /></ToolbarButton>

                {/* Highlight Dropdown */}
                <div className="relative">
                    <button 
                        type="button" 
                        onMouseDown={(e) => { e.preventDefault(); setOpenDropdown(openDropdown === 'highlight' ? null : 'highlight'); }} 
                        className={`p-1.5 rounded transition-colors text-text-secondary h-9 flex items-center justify-center gap-1 ${activeStyles['hiliteColor'] ? 'bg-black/10 text-primary' : 'hover:bg-black/5'}`}
                        title="Highlight Color"
                    >
                        <HighlighterIcon />
                        <span className="text-[10px] opacity-60">▼</span>
                    </button>
                    {openDropdown === 'highlight' && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-surface shadow-xl rounded-lg border border-border w-40 overflow-hidden flex flex-col p-1 animate-scale-in">
                             {HIGHLIGHT_COLORS.map(color => (
                                <button key={color.value} onMouseDown={(e) => { e.preventDefault(); applyHighlight(color.value); }} className="flex items-center gap-2 p-2 rounded text-left text-sm text-text-primary hover:bg-black/5 mb-1">
                                    <div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color.value, borderColor: color.border }}></div>
                                    {color.label}
                                </button>
                             ))}
                             <button onMouseDown={(e) => { e.preventDefault(); applyHighlight('transparent'); }} className="flex items-center gap-2 p-2 rounded text-left text-sm text-text-primary hover:bg-black/5 border-t border-border mt-1 pt-2">
                                <div className="w-4 h-4 rounded-full border border-gray-300 bg-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-red-500 rotate-45 transform origin-center w-[1px] left-1/2"></div>
                                </div>
                                No Color
                             </button>
                        </div>
                    )}
                </div>
                
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); openLinkModal(); }} 
                    title="Insert Link" 
                    className="p-2 rounded transition-colors text-text-secondary w-9 h-9 flex items-center justify-center hover:bg-black/5"
                >
                    <LinkIcon className="h-5 w-5" />
                </button>

                <div className="w-px h-5 bg-border self-center mx-1"></div>
                
                {/* Lists Dropdown */}
                <div className="relative">
                    <button 
                        type="button" 
                        onMouseDown={(e) => { e.preventDefault(); setOpenDropdown(openDropdown === 'lists' ? null : 'lists'); }} 
                        className={`p-1.5 rounded transition-colors text-text-secondary h-9 flex items-center justify-center gap-1 ${activeStyles['insertUnorderedList'] || activeStyles['insertOrderedList'] ? 'bg-black/10 text-primary' : 'hover:bg-black/5'}`}
                        title="Lists"
                    >
                        {activeStyles['insertOrderedList'] ? <NumberListIcon /> : <BulletListIcon />}
                        <span className="text-[10px] opacity-60">▼</span>
                    </button>
                    {openDropdown === 'lists' && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-surface shadow-xl rounded-lg border border-border w-48 overflow-hidden flex flex-col p-1 animate-scale-in">
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); setOpenDropdown(null); }} className={`flex items-center gap-3 p-2 rounded text-left text-sm text-text-primary transition-colors ${activeStyles['insertUnorderedList'] ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-black/5'}`}>
                                <div className="p-1 bg-surface-inset rounded border border-border text-black"><BulletListIcon /></div>
                                Bulleted list
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); setOpenDropdown(null); }} className={`flex items-center gap-3 p-2 rounded text-left text-sm text-text-primary transition-colors ${activeStyles['insertOrderedList'] ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-black/5'}`}>
                                <div className="p-1 bg-surface-inset rounded border border-border text-black"><NumberListIcon /></div>
                                Numbered list
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-border self-center mx-1"></div>

                {/* Alignment Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setOpenDropdown(openDropdown === 'align' ? null : 'align'); }}
                        className={`p-1.5 rounded transition-colors text-text-secondary h-9 flex items-center justify-center gap-1 ${activeStyles['justifyLeft'] || activeStyles['justifyCenter'] || activeStyles['justifyRight'] ? 'bg-black/10 text-primary' : 'hover:bg-black/5'}`}
                        title="Alignment"
                    >
                        {activeStyles['justifyCenter'] ? <AlignCenterIcon /> : activeStyles['justifyRight'] ? <AlignRightIcon /> : <AlignLeftIcon />}
                        <span className="text-[10px] opacity-60">▼</span>
                    </button>
                    {openDropdown === 'align' && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-surface shadow-xl rounded-lg border border-border w-40 overflow-hidden flex flex-col p-1 animate-scale-in">
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('justifyLeft'); setOpenDropdown(null); }} className={`flex items-center gap-3 p-2 rounded text-left text-sm text-text-primary transition-colors ${activeStyles['justifyLeft'] ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-black/5'}`}>
                                <div className="p-1 bg-surface-inset rounded border border-border text-black"><AlignLeftIcon /></div>
                                Align Left
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('justifyCenter'); setOpenDropdown(null); }} className={`flex items-center gap-3 p-2 rounded text-left text-sm text-text-primary transition-colors ${activeStyles['justifyCenter'] ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-black/5'}`}>
                                <div className="p-1 bg-surface-inset rounded border border-border text-black"><AlignCenterIcon /></div>
                                Align Center
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('justifyRight'); setOpenDropdown(null); }} className={`flex items-center gap-3 p-2 rounded text-left text-sm text-text-primary transition-colors ${activeStyles['justifyRight'] ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-black/5'}`}>
                                <div className="p-1 bg-surface-inset rounded border border-border text-black"><AlignRightIcon /></div>
                                Align Right
                            </button>
                        </div>
                    )}
                </div>
                 <div className="w-px h-5 bg-border self-center mx-1"></div>
                <ToolbarButton command="removeFormat" title="Clear Formatting"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6.5,18.5L9.25,15.75L12,18.5L14.75,15.75L17.5,18.5L19,17L16.25,14.25L19,11.5L17.5,10L14.75,12.75L12,10L9.25,12.75L6.5,10L5,11.5L7.75,14.25L5,17L6.5,18.5M15.5,3L20.5,8H17.5V14H15.5V8H12.5L15.5,3M3,3V5H10V3H3Z" /></svg></ToolbarButton>
            </div>
            
            <div className="relative">
                {isLinkModalOpen && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-white p-5 rounded-xl shadow-2xl border border-gray-200 w-80 animate-scale-in text-left">
                        <h3 className="text-black font-bold mb-4 text-lg border-b border-gray-100 pb-2">Link</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Display text</label>
                                <input 
                                    type="text" 
                                    value={linkData.text} 
                                    onChange={e => setLinkData({...linkData, text: e.target.value})}
                                    className="w-full bg-surface-inset border border-border rounded-lg p-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Text to display"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
                                <input 
                                    type="text" 
                                    value={linkData.url} 
                                    onChange={e => setLinkData({...linkData, url: e.target.value})}
                                    placeholder="https://example.com"
                                    className="w-full bg-surface-inset border border-border rounded-lg p-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-2 pt-2">
                                 <button onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-semibold transition-colors">Cancel</button>
                                 <button onClick={handleLinkSubmit} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-600 shadow-sm transition-all">Insert</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {selectedImg && (
                    <div className="absolute z-10 top-2 left-1/2 transform -translate-x-1/2 bg-white shadow-xl border border-gray-200 rounded-lg p-2 flex items-center gap-2 animate-scale-in">
                        <button onClick={() => alignImage('left')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Align Left"><AlignLeftIcon /></button>
                        <button onClick={() => alignImage('center')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Align Center"><AlignCenterIcon /></button>
                        <button onClick={() => alignImage('right')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Align Right"><AlignRightIcon /></button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={() => resizeImage('25%')} className="px-2 py-1 text-xs font-bold hover:bg-gray-100 rounded text-gray-600">25%</button>
                        <button onClick={() => resizeImage('50%')} className="px-2 py-1 text-xs font-bold hover:bg-gray-100 rounded text-gray-600">50%</button>
                        <button onClick={() => resizeImage('100%')} className="px-2 py-1 text-xs font-bold hover:bg-gray-100 rounded text-gray-600">100%</button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <div className="flex items-center bg-gray-100 rounded px-2 py-1">
                            <input 
                                type="number" 
                                min="1" 
                                max="100" 
                                value={imageSizeInput} 
                                onChange={handleManualResize} 
                                className="w-12 bg-transparent text-xs font-bold text-center focus:outline-none text-gray-700" 
                            />
                            <span className="text-xs text-gray-500">%</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={copyImage} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded" title="Copy Image">
                            <ClipboardDocumentIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={deleteImage} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Delete Image">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )}
                <div
                    ref={editorRef}
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onMouseUp={handleEditorClick}
                    onKeyUp={handleKeyUp}
                    onKeyDown={handleKeyDown}
                    onClick={handleEditorClick}
                    contentEditable={true}
                    className="p-4 bg-transparent focus:outline-none rounded-b-lg prose max-w-none prose-sm min-h-[250px] max-h-[50vh] overflow-y-auto text-black relative"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                />
            </div>
            
            <div className="border-t border-border bg-surface-muted/30 px-3 py-1 text-[10px] flex justify-end gap-4 font-mono select-none">
               <span style={{ color: '#666666' }}>Ln {stats.line}, Col {stats.col}</span>
               <span style={{ color: '#888888' }}>{stats.totalLines} lines</span>
               <span style={{ color: '#888888' }}>{stats.chars} characters</span>
            </div>
        </div>
    );
});

export default RichTextEditor;
