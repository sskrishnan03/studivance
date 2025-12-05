import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { Subject, Task, Exam, Note, Goal, TimetableEvent, ChatSession, NoteStatus } from '../types';
import * as db from '../db';

interface DataContextType {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'progress'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  getSubjectById: (id: string) => Subject | undefined;
  
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;

  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;

  notes: Note[];
  getNotesBySubject: (subjectId: string) => Note[];
  getNoteById: (id: string) => Note | undefined;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'lastModified' | 'status' | 'isImportant'>) => Promise<Note>;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

  events: TimetableEvent[];
  addEvent: (event: Omit<TimetableEvent, 'id'>) => void;
  updateEvent: (event: TimetableEvent) => void;
  deleteEvent: (id: string) => void;

  chats: ChatSession[];
  createNewChat: () => Promise<ChatSession>;
  saveChat: (chat: ChatSession) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const initialized = await db.initDB();
        if (initialized) {
          const [s, t, e, n, g, ev, c] = await Promise.all([
            db.getAll<Subject>('subjects'),
            db.getAll<Task>('tasks'),
            db.getAll<Exam>('exams'),
            db.getAll<Note>('notes'),
            db.getAll<Goal>('goals'),
            db.getAll<TimetableEvent>('events'),
            db.getAll<ChatSession>('chats')
          ]);
          setSubjects(s);
          setTasks(t);
          setExams(e);
          setNotes(n);
          setGoals(g);
          setEvents(ev);
          setChats(c.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
          setIsDbInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };
    loadData();
  }, []);
  
  const refreshData = async (storeName: string) => {
    switch(storeName) {
      case 'subjects': setSubjects(await db.getAll('subjects')); break;
      case 'tasks': setTasks(await db.getAll('tasks')); break;
      case 'exams': setExams(await db.getAll('exams')); break;
      case 'notes': setNotes(await db.getAll('notes')); break;
      case 'goals': setGoals(await db.getAll('goals')); break;
      case 'events': setEvents(await db.getAll('events')); break;
      case 'chats': 
          const c = await db.getAll<ChatSession>('chats');
          setChats(c.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
          break;
    }
  };

  // Helper to generate unique IDs
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Subjects
  const addSubject = async (subject: Omit<Subject, 'id' | 'progress'>) => {
    const newSubject = { ...subject, id: generateId(), progress: 0 };
    await db.add('subjects', newSubject);
    await refreshData('subjects');
  };
  const updateSubject = async (updated: Subject) => {
    await db.put('subjects', updated);
    await refreshData('subjects');
  };
  const deleteSubject = async (id: string) => {
    await db.remove('subjects', id);
    const tasksToDelete = tasks.filter(t => t.subjectId === id);
    const examsToDelete = exams.filter(e => e.subjectId === id);
    const notesToDelete = notes.filter(n => n.subjectId === id);
    await Promise.all([
      ...tasksToDelete.map(t => db.remove('tasks', t.id)),
      ...examsToDelete.map(e => db.remove('exams', e.id)),
      ...notesToDelete.map(n => db.remove('notes', n.id))
    ]);
    await Promise.all([refreshData('subjects'), refreshData('tasks'), refreshData('exams'), refreshData('notes')]);
  };
  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  // Tasks
  const addTask = async (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: generateId() };
    await db.add('tasks', newTask);
    await refreshData('tasks');
  };
  const updateTask = async (updated: Task) => {
    await db.put('tasks', updated);
    await refreshData('tasks');
  };
  const deleteTask = async (id: string) => {
    await db.remove('tasks', id);
    await refreshData('tasks');
  };

  // Exams
  const addExam = async (exam: Omit<Exam, 'id'>) => {
    const newExam = { ...exam, id: generateId() };
    await db.add('exams', newExam);
    await refreshData('exams');
  };
  const updateExam = async (updated: Exam) => {
    await db.put('exams', updated);
    await refreshData('exams');
  };
  const deleteExam = async (id: string) => {
    await db.remove('exams', id);
    await refreshData('exams');
  };
  
  // Notes
  const getNotesBySubject = (subjectId: string) => notes.filter(n => n.subjectId === subjectId);
  const getNoteById = (id: string) => notes.find(n => n.id === id);
  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'lastModified' | 'status' | 'isImportant'>): Promise<Note> => {
    const now = new Date().toISOString();
    const newNote: Note = { 
        ...note, 
        id: generateId(), 
        createdAt: now, 
        lastModified: now,
        status: NoteStatus.ToBeRead,
        isImportant: false,
        subjectId: note.subjectId || undefined,
    };
    await db.add('notes', newNote);
    await refreshData('notes');
    return newNote;
  };
  const updateNote = async (updated: Note) => {
    const now = new Date().toISOString();
    await db.put('notes', { ...updated, lastModified: now });
    await refreshData('notes');
  };
  const deleteNote = async (id: string) => {
    await db.remove('notes', id);
    await refreshData('notes');
  };
  
  // Goals
  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    const newGoal = { ...goal, id: generateId() };
    await db.add('goals', newGoal);
    await refreshData('goals');
  };
  const updateGoal = async (updated: Goal) => {
    await db.put('goals', updated);
    await refreshData('goals');
  };
  const deleteGoal = async (id: string) => {
    await db.remove('goals', id);
    await refreshData('goals');
  };
  
  // Events
  const addEvent = async (event: Omit<TimetableEvent, 'id'>) => {
    const newEvent = { ...event, id: generateId() };
    await db.add('events', newEvent);
    await refreshData('events');
  };
  const updateEvent = async (updated: TimetableEvent) => {
    await db.put('events', updated);
    await refreshData('events');
  };
  const deleteEvent = async (id: string) => {
    await db.remove('events', id);
    await refreshData('events');
  };

  // Chats
  const createNewChat = async (): Promise<ChatSession> => {
      const newChat: ChatSession = {
          id: generateId(),
          title: 'New Chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
      };
      await db.add('chats', newChat);
      await refreshData('chats');
      return newChat;
  };

  const saveChat = async (chat: ChatSession) => {
      await db.put('chats', { ...chat, updatedAt: new Date().toISOString() });
      await refreshData('chats');
  };

  const deleteChat = async (id: string) => {
      await db.remove('chats', id);
      await refreshData('chats');
  };

  const contextValue = { 
      subjects, addSubject, updateSubject, deleteSubject, getSubjectById,
      tasks, addTask, updateTask, deleteTask,
      exams, addExam, updateExam, deleteExam,
      notes, getNotesBySubject, getNoteById, addNote, updateNote, deleteNote,
      goals, addGoal, updateGoal, deleteGoal,
      events, addEvent, updateEvent, deleteEvent,
      chats, createNewChat, saveChat, deleteChat
  };

  return (
    <DataContext.Provider value={contextValue}>
      {isDbInitialized ? children : (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary">
          <p>Loading study plan...</p>
        </div>
      )}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};