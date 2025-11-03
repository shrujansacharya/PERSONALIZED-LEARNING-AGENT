import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { jsPDF } from 'jspdf';
import axios from 'axios';

export interface Subject {
  id: string;
  name: string;
  category: string;
}

export const subjects: Subject[] = [
  { id: "english", name: "English", category: "Academics" },
  { id: "kannada", name: "Kannada", category: "Academics" },
  { id: "mathematics", name: "Mathematics", category: "Academics" },
  { id: "science", name: "Science", category: "Academics" },
  { id: "social_science", name: "Social Studies", category: "Academics" },
  { id: "physics", name: "Physics", category: "Academics" },
  { id: "chemistry", name: "Chemistry", category: "Academics" },
  { id: "biology", name: "Biology", category: "Academics" },
  { id: "history", name: "History", category: "Academics" },
  { id: "python", name: "Python Programming", category: "Programming" },
  { id: "javascript", name: "JavaScript Basics", category: "Programming" },
  { id: "web_dev", name: "Web Development", category: "Programming" },
  { id: "data_science", name: "Data Science", category: "Programming" },
];

export interface RelatedVideo {
  videoUrl: string;
  thumbnailUrl: string;
}

export interface Message {
  id?: string;
  text: string;
  isBot: boolean;
  timestamp: string;
  attachmentUrl?: string;
  videoList?: RelatedVideo[];
  title?: string;
  extractedMath?: string;
  quiz?: { q: string; options: string[]; correct: number }[];
  feedback?: 'good' | 'adjust';
}

export interface ChatSession {
  id: string;
  name: string;
  weekday: string;
  createdAt: string;
  messages: Message[];
}

export type SessionsBySubject = Record<string, ChatSession[]>;

const STORAGE_KEY = "eduChat:sessions:v1";

export const loadSessions = (): SessionsBySubject => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionsBySubject) : {};
  } catch {
    return {};
  }
};

export const saveSessions = (data: SessionsBySubject) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export const newWelcome = (subjectName: string): Message => ({
  id: `welcome-${Date.now()}`,
  text: `Welcome to ${subjectName}! I am your personal AI assistant for this subject. Feel free to ask me anything related to ${subjectName}.`,
  isBot: true,
  timestamp: new Date().toISOString(),
});

export const findInitialSubject = (subjectId: string | undefined): Subject | null => {
  if (subjectId) {
    const normalizedId = subjectId.toLowerCase();
    if (normalizedId === 'math') {
      return subjects.find(s => s.id === 'mathematics') || null;
    }
    return subjects.find(s => s.id === normalizedId) || null;
  }
  return null;
};

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export const fetchYouTubeVideos = async (query: string, maxResults = 1): Promise<RelatedVideo[] | null> => {
  if (!YOUTUBE_API_KEY) {
    console.error("🔴 YouTube API key is not configured in your .env file. Video suggestions are disabled.");
    return null;
  }
  
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=${maxResults}&safeSearch=strict`;
  
  try {
    const response = await axios.get(url);
    if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
      const videoResults: RelatedVideo[] = response.data.items
        .map((item: any) => ({
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        }))
        .filter((v: RelatedVideo) => v.videoUrl && v.thumbnailUrl);
      return videoResults.length > 0 ? videoResults : null;
    }
    return null;
  } catch (error) {
    console.error(`🔴 Failed to fetch YouTube videos for query: "${query}"`);
    if (axios.isAxiosError(error) && error.response) {
      console.error(`YouTube API responded with status ${error.response.status}:`, error.response.data.error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    return null;
  }
};

export const subjectThematicInstructions = {
  // Your thematic instructions...
};

export const performanceInstructions = {
  // Your performance instructions...
};

export const sanitizeContent = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.trim();
};

// --- THIS FUNCTION IS UPDATED ---
export const cleanTextForTTS = (text: string): string => {
  let cleaned = text
    // This new line removes LaTeX equations and replaces them with a placeholder phrase.
    .replace(/\$\$.*?\$\$|\$.*?\$/g, ' an equation ')
    // The rest of the rules remove other markdown.
    .replace(/\*{1,2}/g, '')
    .replace(/#{1,6}/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }
  return cleaned;
};
// ------------------------------------

export const headingRenderer = (props) => {
  const { level, children } = props;
  const Tag = `h${level}`;
  // Removed top margin, and using a minimal bottom margin (mb-1 = 0.25rem).
  return <Tag className="font-bold text-lg mb-1">{children}</Tag>;
};

export const paragraphRenderer = (props: any) => {
  const { children } = props;

  // This check prevents empty lines from creating any space.
  if (React.Children.count(children) === 0 || 
     (Array.isArray(children) && children.every(child => typeof child === 'string' && child.trim() === ''))) {
    return null; 
  }

  // All margins have been removed for the tightest possible spacing.
  return <p className="leading-normal">{children}</p>;
};

export const mathRenderer = (props: any) => {
  const { children } = props;
  if (typeof children !== 'string') return <span>{children}</span>;
  const text = children;
  if (text.startsWith('$') && text.endsWith('$') && text.length > 2) {
    return <InlineMath math={text.slice(1, -1)} />;
  }
  if (text.startsWith('$$') && text.endsWith('$$') && text.length > 4) {
    return <BlockMath math={text.slice(2, -2)} />;
  }
  return <span>{text}</span>;
};

export const codeRenderer = (props: any) => {
  const { children, className } = props;
  const text = children as string;
  if (className === 'language-math' || text.includes('\\') || text.includes('$')) {
    try {
      return <BlockMath math={text} />;
    } catch (error) {
      return <code className={className}>{text}</code>;
    }
  }
  return <code className={className}>{text}</code>;
};

export const generatePDF = async (directAnswerText: string, extractedMath?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let y = margin;

  const addPageIfNeeded = (lineHeight: number) => {
    if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  if (directAnswerText && directAnswerText.trim()) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(directAnswerText, pageWidth - margin * 2);
    notesLines.forEach((line: string) => {
      addPageIfNeeded(7);
      doc.text(line, margin, y);
      y += 7;
    });
  }

  if (extractedMath && extractedMath.trim()) {
    y += 10;
    addPageIfNeeded(10);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Mathematical Content:", margin, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const mathLines = doc.splitTextToSize(extractedMath, pageWidth - margin * 2);
    mathLines.forEach((line: string) => {
      addPageIfNeeded(7);
      doc.text(line, margin, y);
      y += 7;
    });
  }
  
  doc.save("chat_notes.pdf");
};

export const updateProgress = (concept: string, delta: number, subject?: string) => {
  const key = `eduChat:progress:${subject || 'general'}:${concept}`;
  const prog = JSON.parse(localStorage.getItem('eduChat:progress') || '{}');
  prog[key] = Math.max(0, Math.min(1, (prog[key] || 0) + delta));
  localStorage.setItem('eduChat:progress', JSON.stringify(prog));
};