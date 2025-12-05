
import React, { useState, useEffect, useRef } from 'react';
import { useTheme, FontFamily } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import SegmentedControl from '../components/SegmentedControl';
import * as db from '../db';
import { 
    ArrowDownTrayIcon, 
    ArrowUpTrayIcon, 
    BookOpenIcon,
    CheckCircleIcon, 
    AcademicCapIcon,
    TrophyIcon,
    CalendarDaysIcon,
    PencilSquareIcon,
    DocumentArrowDownIcon,
    DocumentArrowUpIcon,
    Cog6ToothIcon,
    ComputerDesktopIcon,
    CircleStackIcon,
    GlobeAltIcon,
    SwatchIcon
} from '@heroicons/react/24/outline';
import { Subject, Task, Exam, Note, Goal, TimetableEvent, NoteStatus } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

type SettingsTab = 'general' | 'data' | 'system';

const DataRow = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border last:border-0 bg-surface gap-4 hover:bg-surface-inset transition-colors">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary text-accent rounded-xl shadow-sm">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-bold text-text-primary text-base">{title}</h3>
                <p className="text-xs text-text-muted font-medium">CSV Data</p>
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {children}
        </div>
    </div>
);

const ActionButton = ({ onClick, icon: Icon, label, primary = false }: { onClick: () => void, icon: any, label: string, primary?: boolean }) => (
    <button 
        onClick={onClick}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm flex-grow sm:flex-grow-0 ${
            primary 
            ? 'bg-primary text-accent hover:bg-primary-800' 
            : 'bg-surface-inset border border-border text-text-primary hover:bg-surface hover:border-primary/20'
        }`}
    >
        <Icon className="h-4 w-4" />
        {label}
    </button>
);

const APP_FONTS: { name: FontFamily; label: string }[] = [
    { name: 'Inter', label: 'Inter' },
    { name: 'Poppins', label: 'Poppins' },
    { name: 'Roboto', label: 'Roboto' },
    { name: 'Nunito', label: 'Nunito' },
    { name: 'SF Pro', label: 'SF Pro' },
    { name: 'Jumble', label: 'Jumble' },
];

const Settings: React.FC = () => {
  const { fontSize, setFontSize, fontFamily, setFontFamily } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [restoreFileData, setRestoreFileData] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'subjects' | 'tasks' | 'exams' | 'goals' | 'events' | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const docxImportInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
        try {
            const subs = await db.getAll<Subject>('subjects');
            setSubjects(subs.sort((a, b) => a.title.localeCompare(b.title)));
        } catch (error) {
            console.error("Failed to fetch subjects for settings page:", error);
        }
    };
    fetchSubjects();
  }, []);

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: Record<string, any>[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const rows = data.map(item =>
        headers.map(header => {
            let cell = item[header] === undefined || item[header] === null ? '' : String(item[header]);
            cell = cell.includes(',') || cell.includes('"') || cell.includes('\n') ? `"${cell.replace(/"/g, '""')}"` : cell;
            return cell;
        }).join(',')
    );
    return [headerRow, ...rows].join('\n');
  };
  
  const parseCSV = (str: string) => {
    const arr: string[][] = [];
    let quote = false;
    let col = 0, row = 0;

    for (let c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc === '"' && quote && nc === '"') { 
             arr[row][col] += cc; ++c;
        }
        else if (cc === '"') {
             quote = !quote;
        }
        else if (cc === ',' && !quote) {
             ++col;
        }
        else if (cc === '\r' && nc === '\n' && !quote) {
             ++row; col = 0; ++c;
        }
        else if (cc === '\n' && !quote) {
             ++row; col = 0;
        }
        else if (cc === '\r' && !quote) {
             ++row; col = 0;
        }
        else {
             arr[row][col] += cc;
        }
    }
    if (arr[arr.length - 1] && arr[arr.length - 1].length === 1 && arr[arr.length - 1][0] === '') {
        arr.pop();
    }
    return arr;
  };

  const handleExportCsv = async (storeName: 'subjects' | 'tasks' | 'exams' | 'goals' | 'events') => {
    const subjectsData = await db.getAll<Subject>('subjects');
    const subjectMap = new Map(subjectsData.map(s => [s.id, s.title]));

    let dataForCsv: Record<string, any>[] = [];
    let fileName = `${storeName}.csv`;

    switch (storeName) {
        case 'subjects':
            dataForCsv = subjectsData.map(({ id, ...rest }) => rest);
            break;
        case 'tasks':
            const tasks = await db.getAll<Task>('tasks');
            dataForCsv = tasks.map(t => ({
                Title: t.title,
                Subject: t.subjectId ? subjectMap.get(t.subjectId) || 'Unknown' : 'General',
                Deadline: t.deadline,
                Priority: t.priority,
                Status: t.status,
            }));
            break;
        case 'exams':
            const exams = await db.getAll<Exam>('exams');
            dataForCsv = exams.map(e => ({
                Title: e.title,
                Subject: subjectMap.get(e.subjectId) || 'Unknown',
                Date: e.date,
                Type: e.type,
            }));
            break;
        case 'goals':
            const goals = await db.getAll<Goal>('goals');
            dataForCsv = goals.map(g => ({
                Title: g.title,
                Description: g.description,
                TargetDate: g.targetDate,
                Status: g.status,
            }));
            break;
        case 'events':
            const events = await db.getAll<TimetableEvent>('events');
            dataForCsv = events.map(ev => ({
                Title: ev.title,
                Subject: ev.subjectId ? subjectMap.get(ev.subjectId) || 'Unknown' : 'Custom Event',
                Date: ev.date,
                StartTime: ev.startTime,
                EndTime: ev.endTime,
            }));
            fileName = 'timetable.csv';
            break;
        default:
            return;
    }
    
    const csvContent = convertToCSV(dataForCsv);
    downloadFile(fileName, csvContent, 'text/csv;charset=utf-8;');
  };
  
  const handleImportClick = (type: 'subjects' | 'tasks' | 'exams' | 'goals' | 'events') => {
      setImportType(type);
      importInputRef.current?.click();
  };

   const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !importType) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target?.result as string;
          if (!text) return;

          try {
              const parsedData = parseCSV(text);
              if (parsedData.length < 2) {
                  alert("File appears to be empty or invalid CSV.");
                  return;
              }

              const headers = parsedData[0].map(h => h.trim().replace(/^[\uFEFF\uFFFE]/, ''));
              const rows = parsedData.slice(1);
              
              const getValue = (row: string[], headerName: string) => {
                  const index = headers.findIndex(h => h.toLowerCase() === headerName.toLowerCase());
                  return index !== -1 ? row[index] : undefined;
              };

              const currentSubjects = await db.getAll<Subject>('subjects');
              const subjectMap = new Map(currentSubjects.map(s => [s.title.toLowerCase(), s.id]));

              let importCount = 0;
              let timestamp = Date.now();

              for (const row of rows) {
                  if (row.length < headers.length / 2) continue; 

                  const id = (timestamp++).toString();
                  
                  if (importType === 'subjects') {
                       const title = getValue(row, 'title');
                       if (!title) continue;
                       const subject: Subject = {
                           id,
                           title,
                           type: (getValue(row, 'type') as any) || 'Theory',
                           instructor: getValue(row, 'instructor') || '',
                           semester: getValue(row, 'semester') || '',
                           progress: parseInt(getValue(row, 'progress') || '0', 10),
                           color: getValue(row, 'color') || '#1C1C1C'
                       };
                       await db.add('subjects', subject);
                  } else if (importType === 'tasks') {
                       const title = getValue(row, 'Title');
                       if (!title) continue;
                       const subjectName = getValue(row, 'Subject');
                       const task: Task = {
                           id,
                           title,
                           subjectId: subjectName ? subjectMap.get(subjectName.toLowerCase()) : undefined,
                           deadline: getValue(row, 'Deadline') || new Date().toISOString().split('T')[0],
                           priority: (getValue(row, 'Priority') as any) || 'Medium',
                           status: (getValue(row, 'Status') as any) || 'Pending'
                       };
                       await db.add('tasks', task);
                  } else if (importType === 'exams') {
                      const title = getValue(row, 'Title');
                      if (!title) continue;
                       const subjectName = getValue(row, 'Subject');
                       const exam: Exam = {
                           id,
                           title,
                           subjectId: (subjectName ? subjectMap.get(subjectName.toLowerCase()) : '') || '',
                           date: getValue(row, 'Date') || new Date().toISOString().split('T')[0],
                           type: (getValue(row, 'Type') as any) || 'Theory'
                       };
                       await db.add('exams', exam);
                  } else if (importType === 'goals') {
                      const title = getValue(row, 'Title');
                      if(!title) continue;
                      const goal: Goal = {
                          id,
                          title,
                          description: getValue(row, 'Description') || '',
                          targetDate: getValue(row, 'TargetDate') || new Date().toISOString().split('T')[0],
                          status: (getValue(row, 'Status') as any) || 'Not Started'
                      };
                      await db.add('goals', goal);
                  } else if (importType === 'events') {
                       const title = getValue(row, 'Title');
                       if (!title) continue;
                       const subjectName = getValue(row, 'Subject');
                       const evt: TimetableEvent = {
                           id,
                           title,
                           subjectId: subjectName ? subjectMap.get(subjectName.toLowerCase()) : undefined,
                           date: getValue(row, 'Date') || new Date().toISOString().split('T')[0],
                           startTime: getValue(row, 'StartTime') || '09:00',
                           endTime: getValue(row, 'EndTime') || '10:00',
                           color: '#1C1C1C' 
                       };
                       if(evt.subjectId) {
                           const subj = currentSubjects.find(s => s.id === evt.subjectId);
                           if(subj) evt.color = subj.color;
                       }
                       await db.add('events', evt);
                  }
                  importCount++;
              }

              alert(`Successfully imported ${importCount} items. The page will reload to reflect changes.`);
              window.location.reload();

          } catch (error) {
              console.error("Import failed:", error);
              alert("Failed to parse or import CSV file. Please ensure it matches the export format.");
          } finally {
              if (importInputRef.current) importInputRef.current.value = '';
              setImportType(null);
          }
      };
      reader.readAsText(file);
  };

  const handleImportDocxClick = () => {
      docxImportInputRef.current?.click();
  };

  const handleImportDocxFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
       const files = event.target.files;
      if (!files || files.length === 0) return;

      if (typeof (window as any).mammoth === 'undefined') {
          alert("Document converter is not loaded. Please check your internet connection.");
          return;
      }

      let importedCount = 0;
      try {
          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const arrayBuffer = await file.arrayBuffer();
              const result = await (window as any).mammoth.convertToHtml({ arrayBuffer });
              const content = result.value;
              
              const newNote: Note = {
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  title: file.name.replace(/\.docx$/i, ''),
                  content: content,
                  createdAt: new Date().toISOString(),
                  lastModified: new Date().toISOString(),
                  status: NoteStatus.ToBeRead,
                  isImportant: false,
                  subjectId: undefined 
              };
              
              await db.add('notes', newNote);
              importedCount++;
          }
          
          setTimeout(() => {
               alert(`Successfully imported ${importedCount} note(s).`);
               window.location.reload();
          }, 500);
          
      } catch (error) {
          console.error("Failed to import DOCX:", error);
          alert("Failed to import one or more DOCX files. Please ensure they are valid Word documents.");
      } finally {
          if (docxImportInputRef.current) docxImportInputRef.current.value = '';
      }
  };
  
  const generateNotesHtml = (notesToExport: Note[], subjectMap: Map<string, string>, title: string): string => {
    const styles = `
        @page {
            size: 8.5in 11in;
            margin: 1in;
        }
        body {
            font-family: 'Inter', sans-serif !important;
            font-size: 16px;
            line-height: 1.6;
            color: #1C1C1C;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Inter', sans-serif !important;
            color: #1C1C1C;
        }
        h1 { font-size: 2.5em; border-bottom: 2px solid #E0E0D0; padding-bottom: 0.3em; }
        h2 { font-size: 2em; margin-top: 1em; }
        .note-container {
            margin-bottom: 40px;
            padding-top: 20px;
            border-top: 1px solid #E0E0D0;
            page-break-inside: avoid;
        }
        .note-metadata {
            font-family: 'Inter', sans-serif !important;
            font-size: 0.9em;
            color: #4A4A4A;
            margin-bottom: 1em;
            background-color: #F9F9F0;
            padding: 10px;
            border-left: 4px solid #1C1C1C;
        }
        .note-content {
            font-family: 'Inter', sans-serif !important;
        }
    `;

    let bodyContent = `<h1>${title}</h1><p><em>Exported on: ${new Date().toLocaleString()}</em></p><hr />`;

    notesToExport.forEach(note => {
        bodyContent += `
            <div class="note-container">
                <h2>${note.title}</h2>
                <div class="note-metadata">
                    <strong>Subject:</strong> ${subjectMap.get(note.subjectId || '') || 'General'}<br />
                    ${note.topic ? `<strong>Topic:</strong> ${note.topic}<br />` : ''}
                    <strong>Last Modified:</strong> ${new Date(note.lastModified).toLocaleString()}
                </div>
                <div class="note-content">
                    ${note.content}
                </div>
            </div>
        `;
    });
    
    return `
        <!DOCTYPE html>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Exported Notes</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
            <style>${styles}</style>
        </head>
        <body>${bodyContent}</body>
        </html>
    `;
  };

  const handleExportAllNotesDocx = async () => {
      const notes = await db.getAll<Note>('notes');
      if (notes.length === 0) {
          alert('There are no notes to export.');
          return;
      }
      const subjectMap = new Map<string, string>(subjects.map(s => [s.id, s.title]));
      const htmlContent = generateNotesHtml(notes, subjectMap, 'All Study Notes');
      downloadFile('all-notes.doc', htmlContent, 'application/msword');
  };

  const handleExportGeneralNotesDocx = async () => {
       const allNotes = await db.getAll<Note>('notes');
      const generalNotes = allNotes.filter(n => !n.subjectId);
      
      if (generalNotes.length === 0) {
          alert('There are no general notes to export.');
          return;
      }
      
      const subjectMap = new Map<string, string>();
      const htmlContent = generateNotesHtml(generalNotes, subjectMap, 'General Notes');
      downloadFile('general-notes.doc', htmlContent, 'application/msword');
  }

  const handleExportSubjectNotesDocx = async () => {
       if (!selectedSubjectId) {
          alert('Please select a subject to export.');
          return;
      }
      const allNotes = await db.getAll<Note>('notes');
      let subjectNotes: Note[];
      let subjectTitle: string;

      if (selectedSubjectId === '__GENERAL__') {
          subjectNotes = allNotes.filter(n => !n.subjectId);
          subjectTitle = 'General Notes';
      } else {
          subjectNotes = allNotes.filter(n => n.subjectId === selectedSubjectId);
          const subjectMap = new Map<string, string>(subjects.map(s => [s.id, s.title]));
          subjectTitle = subjectMap.get(selectedSubjectId) || 'Subject';
      }

      if (subjectNotes.length === 0) {
          alert('There are no notes for the selected category.');
          return;
      }

      const subjectMap = new Map<string, string>(subjects.map(s => [s.id, s.title]));
      const fileName = `${String(subjectTitle).replace(/[^a-zA-Z0-9]/g, '_')}-notes.doc`;
      
      const htmlContent = generateNotesHtml(subjectNotes, subjectMap, `Notes: ${subjectTitle}`);
      downloadFile(fileName, htmlContent, 'application/msword');
  };

  const handleBackup = async () => {
     try {
      const backupData: Record<string, any> = {};
      const stores = ['subjects', 'tasks', 'exams', 'notes', 'goals', 'events'];
      for (const storeName of stores) {
        backupData[storeName] = await db.getAll(storeName);
      }
      const jsonString = JSON.stringify(backupData, null, 2);
      const date = new Date().toISOString().split('T')[0];
      downloadFile(`studivance-backup-${date}.json`, jsonString, 'application/json');
    } catch (error) {
      console.error("Failed to create backup:", error);
      alert("Could not create backup. Please try again.");
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRestoreFileData(text);
      setIsRestoreConfirmOpen(true);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmRestore = async () => {
       if (!restoreFileData) return;

    try {
      const backupData = JSON.parse(restoreFileData);
      const stores = ['subjects', 'tasks', 'exams', 'notes', 'goals', 'events'];
      for (const storeName of stores) {
        await db.clearStore(storeName);
        for (const item of backupData[storeName]) {
          await db.add(storeName, item);
        }
      }
      alert("Restore successful! The application will now reload.");
      window.location.reload();
    } catch (error) {
      console.error("Restore failed:", error);
      alert(`Restore failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRestoreConfirmOpen(false);
      setRestoreFileData(null);
    }
  };

  const tabs = [
      { id: 'general', label: t('appearance'), icon: Cog6ToothIcon },
      { id: 'data', label: t('data_management'), icon: CircleStackIcon },
      { id: 'system', label: t('system'), icon: ComputerDesktopIcon },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'Hindi' },
    { id: 'ta', label: 'Tamil' },
    { id: 'kn', label: 'Kannada' },
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-32">
        <h1 className="text-4xl font-extrabold tracking-tight text-text-primary mb-6">{t('settings')}</h1>
        
        {/* Top Tabs Navigation */}
        <div className="mb-8 overflow-x-auto">
            <div className="bg-surface-inset p-1.5 rounded-xl inline-flex min-w-full sm:min-w-0 border border-border">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-primary text-accent shadow-md' 
                            : 'text-text-primary hover:text-text-primary hover:bg-black/5'
                        }`}
                    >
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-8 min-h-[400px]">
            {activeTab === 'general' && (
                <div className="animate-slide-up space-y-6">
                    
                    {/* Typography Settings */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                             <SwatchIcon className="h-6 w-6 text-primary" />
                             <h2 className="text-xl font-bold text-text-primary">Typography</h2>
                        </div>
                        <p className="text-sm text-text-secondary mb-4">Choose the primary typeface for the application.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {APP_FONTS.map(font => (
                                <button
                                    key={font.name}
                                    onClick={() => setFontFamily(font.name)}
                                    className={`
                                        p-4 rounded-xl border-2 text-left transition-all duration-200 group
                                        ${fontFamily === font.name 
                                            ? 'border-primary bg-primary text-accent shadow-md transform scale-[1.02]' 
                                            : 'border-border bg-surface-inset text-text-primary hover:border-primary/50'
                                        }
                                    `}
                                >
                                    <span 
                                        className="block text-lg font-bold mb-1" 
                                        style={{ 
                                            fontFamily: font.name === 'SF Pro' ? '-apple-system, BlinkMacSystemFont, sans-serif' : font.name === 'Jumble' ? "'Jura', sans-serif" : font.name,
                                            WebkitTextStroke: font.name === 'Jumble' ? '0.7px' : '0px'
                                        }}
                                    >
                                        {font.label}
                                    </span>
                                    <span className={`text-xs block opacity-80 ${fontFamily === font.name ? 'text-accent/80' : 'text-text-muted'}`}>
                                        The quick brown fox jumps over the lazy dog.
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language Selector */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <GlobeAltIcon className="h-6 w-6 text-primary" />
                            <h2 className="text-xl font-bold text-text-primary">{t('select_language')}</h2>
                        </div>
                        <p className="text-sm text-text-secondary mb-4">{t('choose_language')}</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {languages.map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => setLanguage(lang.id)}
                                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 ${
                                        language === lang.id
                                        ? 'border-primary bg-primary text-accent shadow-md'
                                        : 'border-border bg-surface-inset text-text-primary hover:border-primary/30 hover:bg-surface'
                                    }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Appearance */}
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-text-primary mb-4">{t('appearance')}</h2>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="font-bold text-text-primary">{t('font_size')}</p>
                            </div>
                            <SegmentedControl
                                options={[
                                    { label: 'Small', value: 'sm' },
                                    { label: 'Medium', value: 'base' },
                                    { label: 'Large', value: 'lg' }
                                ]}
                                value={fontSize}
                                onChange={(value) => setFontSize(value as 'sm' | 'base' | 'lg')}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'data' && (
                <div className="animate-slide-up space-y-8">
                    {/* CSV Import/Export */}
                    <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-surface-inset/50">
                            <h2 className="text-xl font-bold text-text-primary">{t('data_management')} (CSV)</h2>
                            <p className="text-sm text-text-secondary mt-1">Import and export your data in CSV format.</p>
                        </div>
                        <div className="divide-y divide-border-muted">
                            <DataRow title={t('subjects')} icon={BookOpenIcon}>
                                <ActionButton onClick={() => handleImportClick('subjects')} icon={ArrowDownTrayIcon} label={t('import')} />
                                <ActionButton onClick={() => handleExportCsv('subjects')} icon={ArrowUpTrayIcon} label={t('export')} />
                            </DataRow>

                            <DataRow title={t('tasks')} icon={CheckCircleIcon}>
                                <ActionButton onClick={() => handleImportClick('tasks')} icon={ArrowDownTrayIcon} label={t('import')} />
                                <ActionButton onClick={() => handleExportCsv('tasks')} icon={ArrowUpTrayIcon} label={t('export')} />
                            </DataRow>

                            <DataRow title={t('exams')} icon={AcademicCapIcon}>
                                <ActionButton onClick={() => handleImportClick('exams')} icon={ArrowDownTrayIcon} label={t('import')} />
                                <ActionButton onClick={() => handleExportCsv('exams')} icon={ArrowUpTrayIcon} label={t('export')} />
                            </DataRow>

                                <DataRow title={t('goals')} icon={TrophyIcon}>
                                <ActionButton onClick={() => handleImportClick('goals')} icon={ArrowDownTrayIcon} label={t('import')} />
                                <ActionButton onClick={() => handleExportCsv('goals')} icon={ArrowUpTrayIcon} label={t('export')} />
                            </DataRow>
                            
                                <DataRow title={t('timetable')} icon={CalendarDaysIcon}>
                                <ActionButton onClick={() => handleImportClick('events')} icon={ArrowDownTrayIcon} label={t('import')} />
                                <ActionButton onClick={() => handleExportCsv('events')} icon={ArrowUpTrayIcon} label={t('export')} />
                            </DataRow>
                        </div>
                    </div>

                    {/* Notes Management Panel (DOCX) */}
                    <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-border bg-surface-inset/50 flex items-center gap-3">
                            <div className="p-2 bg-primary text-accent rounded-lg"><PencilSquareIcon className="h-6 w-6"/></div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">{t('notes')} {t('data_management')} (DOCX)</h2>
                            </div>
                            </div>
                            
                            <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* General Notes */}
                                <div className="p-5 bg-surface-inset rounded-2xl border border-border">
                                    <h5 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">{t('general_notes')}</h5>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ActionButton onClick={handleImportDocxClick} icon={DocumentArrowDownIcon} label={t('import')} />
                                        <ActionButton onClick={handleExportGeneralNotesDocx} icon={DocumentArrowUpIcon} label={t('export')} />
                                    </div>
                                </div>

                                {/* All Notes */}
                                <div className="p-5 bg-surface-inset rounded-2xl border border-border">
                                    <h5 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">{t('all_notes')}</h5>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ActionButton onClick={handleImportDocxClick} icon={DocumentArrowDownIcon} label={t('import')} />
                                        <ActionButton onClick={handleExportAllNotesDocx} icon={DocumentArrowUpIcon} label={`${t('export')} All`} primary />
                                    </div>
                                </div>
                            </div>

                            {/* Subject Specific Export */}
                            <div className="p-5 bg-surface-inset rounded-2xl border border-border">
                                <h5 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">{t('export_by_subject')}</h5>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-grow">
                                        <select 
                                            value={selectedSubjectId} 
                                            onChange={e => setSelectedSubjectId(e.target.value)} 
                                            className="w-full appearance-none bg-surface border border-border text-text-primary font-medium py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        >
                                            <option value="">{t('select')} {t('subject')}...</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleExportSubjectNotesDocx} 
                                        disabled={!selectedSubjectId} 
                                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-accent font-bold rounded-xl hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ArrowUpTrayIcon className="h-5 w-5" />
                                        {t('export')}
                                    </button>
                                </div>
                            </div>
                            </div>
                    </div>
                </div>
            )}

            {activeTab === 'system' && (
                <div className="animate-slide-up space-y-6">
                    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div>
                            <h2 className="text-xl font-bold text-text-primary">{t('system_backup')}</h2>
                            <p className="text-sm text-text-secondary mt-1">Download a full backup of your study plan.</p>
                        </div>
                        <button onClick={handleBackup} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-accent font-bold rounded-xl hover:bg-primary-800 transition-all shadow-lg shadow-black/10">
                            <ArrowUpTrayIcon className="h-5 w-5"/> Backup Now
                        </button>
                    </div>

                    <div className="bg-surface border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div>
                            <h2 className="text-xl font-bold text-text-primary">{t('system_restore')}</h2>
                            <p className="text-sm text-text-secondary mt-1">Restore from a backup file. <span className="text-red-600 font-bold">Overwrites current data.</span></p>
                        </div>
                         <button onClick={handleRestoreClick} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition-all">
                            <ArrowDownTrayIcon className="h-5 w-5"/> Restore Data
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".json" className="hidden" />
        <input type="file" ref={importInputRef} onChange={handleImportFile} accept=".csv" className="hidden" />
        <input type="file" ref={docxImportInputRef} onChange={handleImportDocxFile} accept=".docx" className="hidden" multiple />

        {isRestoreConfirmOpen && (
            <ConfirmationModal
                isOpen={isRestoreConfirmOpen}
                onClose={() => { setIsRestoreConfirmOpen(false); setRestoreFileData(null); }}
                onConfirm={handleConfirmRestore}
                title="Confirm System Restore"
                message={
                    <>
                        Are you sure you want to restore data from this file? 
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-3 text-red-800 text-sm font-medium">
                            Warning: This will permanently delete all your current study data including subjects, notes, and tasks. This action cannot be undone.
                        </div>
                    </>
                }
                confirmButtonText="Restore & Overwrite"
                confirmButtonClass="w-full px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-200 text-sm shadow-lg shadow-red-500/30"
            />
        )}
    </div>
  );
};

export default Settings;
