import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, FileText, Calendar, BrainCircuit, Sparkles, Download, RefreshCw, Maximize, X, Plus, Book, GraduationCap, Clock, Target, Lightbulb, CheckCircle, AlertCircle, UploadCloud, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Premium AI Study Planner (single-file React + Tailwind + Framer Motion)
// - Drag & drop file inputs
// - Improved layout, glassmorphism, gradients, micro-interactions
// - Small in-component toast for feedback (no external toast lib required)
// - Preserves original functionality: POST to backend, PDF export, user profile fetch

type UserProfile = { class: string; learningStyle: string; subject: string };

const TinyToast: React.FC<{ id: number; text: string; type?: 'success' | 'error' | 'info' }> = ({ text, type = 'info' }) => {
  const bg = type === 'success' ? 'bg-emerald-800/80' : type === 'error' ? 'bg-rose-800/80' : 'bg-sky-800/80';
  return (
    <div className={`px-6 py-3 rounded-xl text-base ${bg} text-white shadow-lg border border-white/5`}>{text}</div>
  );
};

const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { title?: string }> = ({ children, title, ...props }) => (
  <button {...props} title={title} className="p-3 rounded-2xl hover:bg-white/5 transition-all border border-gray-700/30">{children}</button>
);

const useToasts = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; type?: any }>>([]);
  const push = (text: string, type: any = 'info', ttl = 3500) => {
    const id = Date.now() + Math.floor(Math.random() * 999);
    setToasts((s) => [...s, { id, text, type }]);
    setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), ttl);
  };
  return { toasts, push };
};

const AIStudyPlannerPremium: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile>({ class: 'Not set', learningStyle: 'Not set', subject: '' });
  const [days, setDays] = useState<number | ''>(7);
  const [studyMaterialFile, setStudyMaterialFile] = useState<File | null>(null);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState('');
  const [answers, setAnswers] = useState('');
  const [error, setError] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'answers'>('plan');
  const planRef = useRef<HTMLDivElement | null>(null);
  const answersRef = useRef<HTMLDivElement | null>(null);
  const { toasts, push } = useToasts();

  // small accessibility: file input refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const qFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${currentUser.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUser({ class: data.class || 'Not Set', learningStyle: data.learningStyle || 'Not Set', subject: data.subject || '' });
          } else {
            console.warn('Profile fetch failed', response.status);
            push('Could not fetch profile — using defaults', 'info');
          }
        } catch (err) {
          console.error(err);
          push('Failed to load profile data', 'error');
        }
      }
    };
    fetchUserData();
  }, []);

  const handleDrop = (fileSetter: (f: File | null) => void) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) fileSetter(f);
  };

  const handleGenerate = async () => {
    setError('');
    if (!studyMaterialFile || !days || !user.class || !user.learningStyle || !user.subject) {
      setError('Please upload study material, set days, and ensure your profile is complete.');
      push('Please fill required fields', 'error');
      return;
    }

    setIsLoading(true);
    setStudyPlan('');
    setAnswers('');
    setActiveTab('plan');

    const formData = new FormData();
    formData.append('studyMaterial', studyMaterialFile);
    if (questionFile) formData.append('questionPaper', questionFile);
    formData.append('days', String(days));
    formData.append('learningStyle', user.learningStyle);
    formData.append('classStandard', user.class);
    formData.append('subject', user.subject);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate-full-plan`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Server error while generating plan.');
      setStudyPlan(result.plan || '');
      setAnswers(result.answers || '');
      setIsGenerated(true);
      push('Study plan generated successfully', 'success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unknown error');
      push(err.message || 'Failed to generate', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPlan = () => {
    setIsGenerated(false);
    setStudyPlan('');
    setAnswers('');
    setError('');
    setStudyMaterialFile(null);
    setQuestionFile(null);
    setDays(7);
    setActiveTab('plan');
    push('Ready for a new plan', 'info');
  };

  const handleDownloadPdf = async () => {
    const inputRef = activeTab === 'plan' ? planRef : answersRef;
    const input = inputRef.current;
    if (!input) {
      push('Nothing to export', 'error');
      return;
    }
    push('Preparing PDF...', 'info');

    try {
      const canvas = await html2canvas(input, { scale: 2, backgroundColor: '#0B0B14' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = activeTab === 'plan' ? 'Study_Plan.pdf' : 'Question_Answers.pdf';
      pdf.save(fileName);
      push('PDF downloaded', 'success');
    } catch (err) {
      console.error(err);
      push('Failed to export PDF', 'error');
    }
  };

  // Small drag-drop input component (keeps UI inside file)
  const FileDrop: React.FC<{
    icon: React.ReactNode;
    label: string;
    file: File | null;
    setFile: (f: File | null) => void;
    accept?: string;
    required?: boolean;
    inputRef?: React.RefObject<HTMLInputElement>;
  }> = ({ icon, label, file, setFile, accept = '.pdf,.docx,.txt,.png,.jpg', required = false, inputRef }) => {
    const [isHover, setIsHover] = useState(false);
    return (
      <label
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsHover(true)}
        onDragLeave={() => setIsHover(false)}
        onDrop={handleDrop(setFile)}
        className={`group relative flex flex-col items-center justify-center min-h-[200px] rounded-3xl border-2 transition-all p-6 cursor-pointer select-none ${
          isHover ? 'border-indigo-400 bg-white/3 shadow-[0_8px_30px_rgba(99,102,241,0.08)]' : 'border-gray-700/40 bg-gradient-to-b from-white/2 to-transparent'
        }`}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <motion.div whileHover={{ scale: 1.06 }} className="p-4 rounded-3xl bg-gradient-to-br from-gray-800/70 to-gray-700/70 shadow-md">
            {icon}
          </motion.div>
          <div className="text-base font-medium text-gray-200">{label} {required && <span className="text-rose-400">*</span>}</div>
          <div className="text-sm text-gray-400 max-w-[280px] text-center truncate">{file ? file.name : 'Drop file or click to upload (PDF, DOCX, PNG, JPG)'}</div>
          {file && (
            <div className="flex gap-3 mt-4">
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="px-4 py-2 text-sm rounded-xl bg-white/5">Remove</button>
              <button
                onClick={(e) => { e.stopPropagation(); const url = URL.createObjectURL(file); window.open(url); }}
                className="px-4 py-2 text-sm rounded-xl bg-white/5"
              >
                Preview
              </button>
            </div>
          )}
        </div>
      </label>
    );
  };

  const PlanDisplay: React.FC<{ contentRef: React.RefObject<HTMLDivElement> }> = ({ contentRef }) => (
    <div ref={contentRef} className="w-full h-full rounded-3xl p-8 overflow-auto bg-gradient-to-br from-[#071224]/60 to-[#091028]/60 border border-white/5 shadow-inner">
      {studyPlan ? (
        <article className="prose prose-invert prose-xl max-w-none leading-relaxed">
          <ReactMarkdown>{studyPlan}</ReactMarkdown>
        </article>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
          <Sparkles size={64} className="mb-6 text-yellow-400" />
          <h3 className="text-2xl font-semibold text-gray-100">Your generated schedule will appear here</h3>
          <p className="text-base mt-3">Click <span className="font-medium text-indigo-300">Create Schedule</span> to start.</p>
        </div>
      )}
    </div>
  );

  const AnswersDisplay: React.FC<{ contentRef: React.RefObject<HTMLDivElement> }> = ({ contentRef }) => {
    const answersError = answers === 'Unable to generate answers' || !answers;
    return (
      <div ref={contentRef} className="w-full h-full rounded-3xl p-8 overflow-auto bg-gradient-to-br from-[#04121a]/60 to-[#051226]/60 border border-white/5 shadow-inner">
        {answersError ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-rose-200 bg-rose-900/10 border border-rose-700/20 p-8 rounded-xl">
            <AlertCircle size={64} className="mb-4" />
            <h3 className="text-xl font-semibold">Unable to generate answers</h3>
            <p className="text-base text-rose-200/80 mt-3 max-w-lg">The question paper may not have been processed correctly. Try another format or upload without questions.</p>
          </div>
        ) : (
          <article className="prose prose-invert prose-xl max-w-none leading-relaxed">
            <ReactMarkdown>{answers}</ReactMarkdown>
          </article>
        )}
      </div>
    );
  };

  // Small helpful header with CTA
  if (!isGenerated) {
    return (
      <div className="min-h-screen bg-[#0B0B14] text-white flex items-center justify-center p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none absolute -left-28 -top-32 w-[640px] h-[640px] rounded-full bg-gradient-to-br from-indigo-700/20 to-purple-500/12 blur-3xl transform rotate-12" />
          <div className="pointer-events-none absolute -right-32 -bottom-24 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-pink-600/12 to-indigo-600/10 blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-7xl">
          <header className="flex items-center gap-6 mb-8">
            <button onClick={() => navigate(-1)} className="p-3 rounded-xl bg-white/3 hover:bg-white/6 transition">
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-pink-400">AI Study Planner</h1>
              <p className="text-base text-gray-400">Premium design · Faster study plans · Clean exports</p>
            </div>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <section className="col-span-2 rounded-4xl p-8 bg-gradient-to-br from-white/3 to-transparent border border-white/5 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Customize your plan</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="rounded-2xl border border-white/5 p-6 bg-black/20">
                  <div className="flex items-center gap-4 mb-4">
                    <GraduationCap size={24} />
                    <div>
                      <div className="text-sm text-gray-300">Grade Level</div>
                      <div className="font-semibold text-base">{user.class}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <BrainCircuit size={24} />
                    <div>
                      <div className="text-sm text-gray-300">Learning Style</div>
                      <div className="font-semibold text-base">{user.learningStyle}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 p-6 bg-black/20 flex flex-col gap-4">
                  <label className="text-sm text-gray-300">Days to Exam</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input value={days} onChange={(e) => setDays(e.target.value === '' ? '' : parseInt(e.target.value, 10))} type="number" min={1} placeholder="7" className="w-full bg-transparent pl-12 pr-4 py-3 rounded-xl border border-white/5 text-base" />
                  </div>

                  <label className="text-sm text-gray-300 mt-3">Subject</label>
                  <div className="relative">
                    <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input value={user.subject} onChange={(e) => setUser({ ...user, subject: e.target.value })} placeholder="e.g., Mathematics" className="w-full bg-transparent pl-12 pr-4 py-3 rounded-xl border border-white/5 text-base" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileDrop icon={<BookOpen size={36} />} label="Study Materials" file={studyMaterialFile} setFile={setStudyMaterialFile} required inputRef={fileInputRef} />
                <FileDrop icon={<FileText size={36} />} label="Questions (optional)" file={questionFile} setFile={setQuestionFile} inputRef={qFileInputRef} />
              </div>

              <div className="mt-8 flex items-center gap-6">
                <motion.button onClick={handleGenerate} disabled={isLoading || !studyMaterialFile || !user.subject} whileTap={{ scale: 0.98 }} className="flex items-center gap-4 px-8 py-4 rounded-3xl bg-gradient-to-r from-indigo-500 to-pink-500 shadow-[0_10px_30px_rgba(99,102,241,0.12)] disabled:opacity-50 text-base">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Lightbulb size={20} />}
                  <span className="font-semibold">{isLoading ? 'Creating...' : 'Create Schedule'}</span>
                </motion.button>

                <button onClick={handleNewPlan} className="px-6 py-3 rounded-xl border border-white/5 text-base">Reset</button>

                <div className="ml-auto text-base text-gray-400">Tip: Drag & drop your materials</div>
              </div>

              {error && <div className="mt-6 text-rose-300 bg-rose-900/10 p-4 rounded-xl border border-rose-700/20 text-base">{error}</div>}
            </section>

            <aside className="rounded-4xl p-8 bg-gradient-to-br from-white/2 to-transparent border border-white/5 shadow-lg flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Preview</div>
                  <div className="font-semibold text-base">What to expect</div>
                </div>
                <Sparkles size={20} />
              </div>

              <div className="text-base text-gray-300">A clear day-by-day study schedule, prioritized topics, quick quizzes, and optional answers generated from your question paper.</div>

              <div className="mt-auto flex gap-3">
                <IconButton onClick={() => push('Saved to your account (demo)', 'success')} title="Save sample">
                  <CheckCircle size={20} />
                </IconButton>
                <IconButton onClick={() => push('Shared (demo)', 'info')} title="Share">
                  <Download size={20} />
                </IconButton>
                <IconButton onClick={() => push('Fullscreen (not implemented)', 'info')} title="Fullscreen">
                  <Maximize size={20} />
                </IconButton>
              </div>
            </aside>
          </main>

          {/* Toasts */}
          <div className="fixed right-8 bottom-8 flex flex-col gap-4 z-50">
            {toasts.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TinyToast text={t.text} type={t.type} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Render after generation
  return (
    <div className="min-h-screen bg-[#06101a] text-white p-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-indigo-700/20 to-purple-600/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-3 rounded-xl bg-white/3 hover:bg-white/6 transition">
              <ArrowLeft />
            </button>
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-pink-400">Your Schedule</h2>
              <div className="text-base text-gray-400">Auto-generated — refine or export</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleNewPlan} className="bg-emerald-600 px-6 py-3 rounded-2xl text-base">New</button>
            <button onClick={handleDownloadPdf} className="p-3 rounded-2xl border border-white/5"> <Download size={20} /> </button>
            <button onClick={() => push('Fullscreen not implemented', 'info')} className="p-3 rounded-2xl border border-white/5"> <Maximize size={20} /> </button>
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-white/3 px-2 py-2 border border-white/5">
            <div className="flex items-center rounded-full overflow-hidden">
              <button onClick={() => setActiveTab('plan')} className={`px-8 py-3 ${activeTab === 'plan' ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white' : 'text-gray-300 hover:bg-white/3'}`}>Schedule</button>
              <button onClick={() => setActiveTab('answers')} className={`px-8 py-3 ${activeTab === 'answers' ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white' : 'text-gray-300 hover:bg-white/3'}`}>Answers</button>
            </div>
          </div>
        </div>

        <div className="rounded-4xl p-8 bg-gradient-to-br from-[#051020]/60 to-[#04101a]/60 border border-white/5 shadow-lg">
          {activeTab === 'plan' ? <PlanDisplay contentRef={planRef} /> : <AnswersDisplay contentRef={answersRef} />}
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={() => setIsGenerated(false)} className="bg-gradient-to-r from-indigo-500 to-pink-500 px-8 py-4 rounded-3xl text-base"> <RefreshCw className="inline mr-3" size={20} /> Edit & Update</button>
        </div>

        <div className="fixed right-8 bottom-8 z-50">
          {toasts.map((t) => (
            <div key={t.id} className="mb-4">
              <TinyToast text={t.text} type={t.type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIStudyPlannerPremium;