
export enum SubjectType {
  Theory = 'Theory',
  Practical = 'Practical',
}

export interface Subject {
  id: string;
  title: string;
  type: SubjectType;
  instructor?: string;
  semester?: string;
  progress: number; // 0-100
  color: string;
}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Submitted = 'Submitted',
}

export enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
}

export interface Task {
  id: string;
  subjectId?: string;
  title: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
}

export interface Exam {
    id: string;
    subjectId: string;
    title: string;
    date: string;
    type: SubjectType;
}

export enum NoteStatus {
    ToBeRead = 'To Be Read',
    Read = 'Read',
}

export interface NoteAttachment {
    id: string;
    name: string;
    type: string;
    dataUrl: string;
    size: number;
}

export interface Note {
    id: string;
    subjectId?: string;
    topic?: string;
    title: string;
    content: string;
    createdAt: string;
    lastModified: string;
    status: NoteStatus;
    isImportant: boolean;
    // Legacy single file support (optional/deprecated)
    fileDataUrl?: string;
    fileName?: string;
    fileType?: string;
    // New multiple attachments support
    attachments?: NoteAttachment[];
    // Tagging system
    tags?: string[];
}

export enum GoalStatus {
    NotStarted = 'Not Started',
    InProgress = 'In Progress',
    Completed = 'Completed',
}

export interface Goal {
    id:string;
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
}

export interface TimetableEvent {
    id: string;
    subjectId?: string;
    title: string;
    date: string; // "YYYY-MM-DD"
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    color: string;
}

// --- New Chat Types ---

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: string;
    sources?: { title: string; uri: string }[];
}

export interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: ChatMessage[];
}