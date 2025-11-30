// src/components/CodingHub.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import codingAcademyData, { ModuleData, Step } from "./codingData";
import { Award, CheckCircle, ArrowLeft, Zap } from "lucide-react"; 
import { useThemeStore } from '../store/theme'; 
import { motion } from 'framer-motion'; 

/* -------------------------
   LocalStorage helpers (Unchanged)
   ------------------------- */
const STORAGE_KEY = "codinghub_final_progress_v1";

type ProgressStore = {
  xp: number;
  streak: number;
  lastDay?: string;
  completed: { [moduleId: string]: string[] };
  botChats?: { [key: string]: string[] };
};

function loadProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init: ProgressStore = { xp: 0, streak: 0, completed: {}, botChats: {} };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.completed) parsed.completed = {}; 
    return parsed;
  } catch {
    const init: ProgressStore = { xp: 0, streak: 0, completed: {}, botChats: {} };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
    return init;
  }
}

function saveProgress(store: ProgressStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/* -------------------------
   Small UI pieces (UPDATED: Added a glow for a neon look)
   ------------------------- */
const BadgeSmall: React.FC<{ text: string }> = ({ text }) => (
  <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-400/50 px-3 py-1 rounded-full text-xs font-semibold text-white/90 shadow-md shadow-indigo-500/30">
    <Award size={14} className="text-yellow-300" /> <span>{text}</span>
  </div>
);

/* =========================
   Judge0 Executor (Unchanged)
   ========================= */

type ExecResult = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  status?: { id: number; description?: string };
};

const JUDGE0_HOST = (process.env.VITE_JUDGE0_HOST || "").trim();
const JUDGE0_KEY = (process.env.VITE_JUDGE0_KEY || "").trim();

const languageToJudge0Id: { [k: string]: number } = {
  python: 71,     
  javascript: 63, 
  html: 63,       
  sql: 60,        
  cpp: 54,        
  java: 62,       
  scratch: 71     
};

async function runWithJudge0(languageId: string, source: string): Promise<ExecResult> {
  const isJudge0Configured = JUDGE0_HOST && JUDGE0_KEY;

  if (!isJudge0Configured) { 
    await new Promise((r) => setTimeout(r, 400)); 
    const lower = source.toLowerCase();
    
    let simulatedOutput = "Simulated run (Demo Mode). Output:\n";
    let status = { id: 3, description: "Simulated Success" };

    if (!source.trim().replace(/#.*|\/\/.*|\/\*[\s\S]*?\*\//g, '').length) {
        return { stdout: "Please write some code to execute.", status: { id: 1, description: "Empty Code" } };
    }


    if (lower.includes("print(") || lower.includes("console.log") || lower.includes("cout") || lower.includes("system.out.println") || lower.includes("document.write")) {
        const match = source.match(/(print\(["'])([^"']*)(["']\))|(console\.log\(["'])([^"']*)(["']\))/);
        simulatedOutput += match ? (match[2] || match[5] || "Program ran") : "Program ran (no simple string output found)";
    } else {
        simulatedOutput += "No standard output detected (code ran silently)";
        if (lower.includes("error") || lower.includes("fail")) { 
             simulatedOutput = "Simulated Error: Check your syntax (demo mode)";
             status = { id: 11, description: "Simulated Error" };
        }
    }

    return { stdout: simulatedOutput, status };
  }

  const languageNum = languageToJudge0Id[languageId] || 71;
  try {
    const createUrl = `${JUDGE0_HOST}/submissions?base64_encoded=false&wait=false`;
    const headers: any = { 
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_KEY,
        "X-RapidAPI-Host": JUDGE0_HOST.replace('https://', '').replace('http://', '') 
    };
    
    const body = JSON.stringify({
      source_code: source,
      language_id: languageNum,
      stdin: ""
    });

    const resp = await fetch(createUrl, { method: "POST", headers, body });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Judge0 create failed: ${resp.status}. Response: ${txt.slice(0, 100)}...`);
    }
    const json = await resp.json();
    const token = json.token;
    const resultUrl = `${JUDGE0_HOST}/submissions/${token}?base64_encoded=false`;
    for (let i = 0; i < 30; i++) {
      const r = await fetch(resultUrl, { headers: { "X-RapidAPI-Key": JUDGE0_KEY } }); 
      const resJson = await r.json();
      if (resJson.status && resJson.status.id >= 3) {
        return {
          stdout: resJson.stdout,
          stderr: resJson.stderr,
          compile_output: resJson.compile_output,
          status: resJson.status
        };
      }
      await new Promise((s) => setTimeout(s, 700));
    }
    return { stderr: "Timed out waiting for Judge0 response." };
  } catch (err: any) {
    return { stderr: String(err.message || err) };
  }
}

/* =========================
   CodeBuddy (UPDATED: Glassmorphic and Neon Look)
   ========================= */

const CodeBuddy: React.FC<{ moduleId?: string; topicId?: string; currentCode: string }> = ({ moduleId, topicId, currentCode }) => {
  const key = `${moduleId || "global"}::${topicId || "general"}`;
  const [messages, setMessages] = useState<string[]>(() => {
    const p = loadProgress();
    return (p.botChats && p.botChats[key]) ? p.botChats[key] : ["🤖 Hi! I'm Code Buddy. Ask me for a hint on the lesson or if you're stuck on a practice problem. (AI Mode)"];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const module = codingAcademyData.find((m) => m.id === moduleId);
  const lesson = module?.topics.find((t) => t.id === topicId) || null;

  useEffect(() => {
    const p = loadProgress();
    p.botChats = p.botChats || {};
    p.botChats[key] = messages;
    saveProgress(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);


  async function getGeminiHint(q: string) {
    const BACKEND_URL = '/api/gemini-chat'; 
    
    if (!lesson) {
        return "Error: Cannot load lesson context for AI chat.";
    }

    try {
      const promptContext = `The user is learning ${module?.name} on topic: "${lesson?.title}" (Analogy: ${lesson?.analogy}). The current code they are running is: \`\`\`${currentCode}\`\`\`. They asked: "${q}". Provide a kid-friendly, concise hint or explanation. If the question is about an error, analyze the code and suggest a fix.`;

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptContext, 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.answer) {
          return data.answer;
      } else {
          console.error("AI Backend Error:", data);
          return `🤖 Sorry, I hit an error from the AI server. Response status: ${response.status}. Please check your Node.js backend logs and ensure your VITE_GEMINI_API_KEY is correct.`;
      }

    } catch (error) {
      console.error("Gemini API call failed:", error);
      return "Error: Could not connect to the Code Buddy AI service. Is your Node.js server running and correctly configured to handle /api/gemini-chat?";
    }
  }

  async function reply(question: string) {
    if (!question.trim() || isLoading) return;

    setMessages((m) => [...m, `You: ${question}`, `🤖 Code Buddy is thinking...`]); 
    setInput("");
    setIsLoading(true);

    const ans = await getGeminiHint(question);
    
    setMessages((m) => {
        const newMessages = m.slice(0, m.length - 1); 
        return [...newMessages, `🤖 ${ans}`];
    });
    setIsLoading(false);
  }

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-xl border border-indigo-500/30 h-56 flex flex-col text-white transform transition hover:scale-[1.01] hover:shadow-indigo-500/40">
      <div className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">🤖 Code Buddy <Zap size={16} className="text-yellow-400" /></div>
      <div className="flex-1 overflow-y-auto text-sm space-y-2 mb-2 bg-black/50 p-2 rounded-lg border border-gray-700/50">
        {messages.map((m, i) => (
          <div key={i} className={m.startsWith("You:") ? "text-right text-gray-100" : "text-left text-cyan-200"}>
            {m}
          </div>
        ))}
        {isLoading && <div className="text-left text-cyan-200">🤖 ...</div>}
      </div>
      <div className="flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => { 
            if (e.key === "Enter" && input.trim() && !isLoading) { 
              reply(input); 
            } 
          }} 
          placeholder="Ask about the concept or errors..." 
          className="flex-1 rounded-lg px-3 py-1 text-sm bg-gray-900/80 text-white border border-indigo-600/50 placeholder-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" 
          disabled={isLoading}
        />
        <button 
          onClick={() => { if (input.trim() && !isLoading) { reply(input); } }} 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg font-semibold shadow-md shadow-indigo-600/50 transition transform hover:scale-[1.05]"
          disabled={isLoading}
        >
          {isLoading ? "Wait..." : "Ask"}
        </button>
      </div>
    </div>
  );
};

/* =========================
   Module Dashboard (UPDATED: Glassmorphic and Neon Look)
   ========================= */

const ModuleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<ProgressStore>(loadProgress());

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (!store.lastDay) {
      const s = { ...store, lastDay: today, streak: Math.max(1, store.streak || 1) };
      setStore(s);
      saveProgress(s);
    } else if (store.lastDay !== today) {
      const prev = new Date(store.lastDay);
      const diff = (new Date(today).getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      const newStreak = diff === 1 ? (store.streak || 0) + 1 : 1;
      const s = { ...store, lastDay: today, streak: newStreak };
      setStore(s);
      saveProgress(s);
    }
  }, []);

  const xp = store.xp || 0;
  const level = Math.floor(xp / 100) + 1;

  // New Card Style: Glassmorphic, neon border, glowing shadow
  const StatCard: React.FC<{ color: string; title: string; value: string; sub: string }> = ({ color, title, value, sub }) => (
    <div className={`bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-xl border-l-4 border-${color}-400 shadow-${color}-600/30 transition transform hover:scale-[1.03] cursor-default`}>
        <div className={`text-2xl font-extrabold text-${color}-300 drop-shadow-lg`}>{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );


  return (
    <div className="min-h-screen p-6 md:p-10 text-white">
      <div className="relative mb-6 flex items-center justify-center">
        <button
          onClick={() => navigate('/explore-menu')} 
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-200 hover:text-cyan-400 transition-colors bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50 hover:border-cyan-400/50"
          title="Back to Explore Menu"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-4xl font-extrabold text-center text-cyan-300 drop-shadow-lg">Code Adventure — Final</h1>
      </div>

      <p className="text-center text-gray-300 mb-8 drop-shadow-sm">Playful lessons, detailed explanations, real execution, and an interactive Code Buddy.</p>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard color="yellow" title={`Level ${level}`} value={`${xp} XP`} sub="Unlock new ranks and features!" />
        <StatCard color="pink" title="Keep coding every day!" value={`🔥 ${store.streak || 1} Day Streak`} sub="Your cosmic coding journey continues." />
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-xl border-l-4 border-purple-400 shadow-purple-600/30 flex items-center justify-between transition transform hover:scale-[1.03]">
          <div>
            <div className="text-sm text-gray-400">Badges</div>
            <div className="font-semibold text-purple-300">Starter Explorer</div>
          </div>
          <BadgeSmall text="First Steps" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {codingAcademyData.map((mod) => {
          const completedCount = (loadProgress().completed[mod.id] || []).length;
          const percent = Math.round((completedCount / mod.topics.length) * 100);
          return (
            // Module Card: Glassmorphism, subtle 3D lift, neon glow on hover
            <motion.div 
              key={mod.id} 
              onClick={() => navigate(`./${mod.id}`)} 
              className="bg-black/40 backdrop-blur-md rounded-2xl p-6 cursor-pointer shadow-xl border border-indigo-600/50 hover:border-cyan-400 transition transform hover:scale-[1.02] hover:shadow-cyan-500/40"
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="rounded-full p-3 bg-gradient-to-r from-indigo-700 to-cyan-700 text-white text-xl shadow-lg shadow-indigo-500/50" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>{mod.logo}</div>
                <div>
                  <div className="text-xl font-bold text-white">{mod.name}</div>
                  <div className="text-xs text-gray-400">{mod.badge} • <span className="text-yellow-400">{mod.difficulty}</span></div>
                </div>
              </div>
              <div className="text-sm text-gray-300 mb-3">{mod.topics.length} lessons • deep kid-friendly explanations & many problems</div>
              <div className="w-full bg-gray-800 h-2 rounded-full">
                <div className="bg-cyan-500 h-2 rounded-full shadow-lg shadow-cyan-500/50" style={{ width: `${percent}%` }} />
              </div>
              <div className="text-xs text-gray-400 mt-2">{percent}% completed • {completedCount} / {mod.topics.length}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================
   Topic List (UPDATED: Glassmorphic and Neon Look)
   ========================= */
const TopicList: React.FC = () => {
  const { languageId } = useParams<{ languageId: string }>();
  const navigate = useNavigate();
  const module = codingAcademyData.find((m) => m.id === languageId);
  
  const completedTopics = loadProgress().completed[languageId || ''] || [];

  if (!module) return <div className="text-center mt-20 text-red-400">Module not found</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 text-white">
      {/* --- UPDATED HEADER --- */}
      <div className="relative mb-8 flex items-center justify-center">
        <button
          onClick={() => navigate('/codinghub')} 
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-200 hover:text-cyan-400 transition-colors bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50 hover:border-cyan-400/50"
          title="Back to Code Adventure"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        {/* Centered Title */}
        <div className="flex items-center gap-4">
          <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="rounded-full bg-indigo-800 text-3xl shadow-lg shadow-indigo-500/50">{module.logo}</div>
          <div>
            <h1 className="text-3xl font-extrabold text-cyan-300 drop-shadow-lg">{module.name} Lessons</h1>
            <div className="text-sm text-gray-400">{module.badge} • <span className="text-yellow-400">{module.difficulty}</span></div>
          </div>
        </div>
      </div>
      {/* --- END HEADER --- */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {module.topics.map((t, i) => {
          const isCompleted = completedTopics.includes(t.id);
          const baseClasses = "bg-black/40 backdrop-blur-md p-5 rounded-xl shadow-xl hover:shadow-cyan-500/40 cursor-pointer transition transform hover:scale-[1.02] border";
          const borderClasses = isCompleted ? 'border-green-500/50 shadow-green-500/20' : 'border-indigo-600/50 hover:border-cyan-400/50';

          return (
            <motion.div 
              key={t.id} 
              onClick={() => navigate(t.id)} 
              className={`${baseClasses} ${borderClasses}`}
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-white drop-shadow-md">{t.title}</div>
                  {isCompleted && <CheckCircle size={20} className="text-green-400 drop-shadow-lg" />}
                </div>
                <div className="text-sm text-gray-400 font-mono">L{i + 1}</div>
              </div>
              <div className="text-xs text-cyan-400 mb-2 italic">"{t.analogy}"</div>
              <div className="text-sm text-gray-300 mt-2">
                {t.instructions.slice(0, 140)}{t.instructions.length > 140 ? "..." : ""}
              </div>
              <div className="flex justify-between items-center mt-4 text-xs text-gray-400 border-t border-gray-700/50 pt-2">
                <div>Examples: <span className="font-semibold text-white">{t.examples.length}</span></div>
                <div>Problems: <span className="font-semibold text-white">{t.problems.length}</span></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================
   Lesson page (UPDATED: Glassmorphic and Neon Look)
   ========================= */
const LessonPage: React.FC = () => {
  const { languageId, topicId } = useParams<{ languageId: string; topicId: string }>();
  const navigate = useNavigate();

  const module = codingAcademyData.find((m) => m.id === languageId);
  const lesson = module?.topics.find((t) => t.id === topicId) || null;

  const [code, setCode] = useState<string>(lesson?.starterCode || "");
  const [tab, setTab] = useState<"Examples" | "Challenge" | "Ask">("Challenge"); // Default to Challenge
  const [terminal, setTerminal] = useState<string>("Ready. Press RUN to execute your code.");
  const [goalMet, setGoalMet] = useState<boolean>(false);
  const [progressStore, setProgressStore] = useState<ProgressStore>(loadProgress());
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!lesson) return;

    setCode(lesson.starterCode || "");
    setGoalMet(false);
    setTerminal("Ready. Press RUN to execute your code.");
    setProgressStore(loadProgress());
  }, [languageId, topicId, lesson]); 

  if (!module || !lesson) return <div className="p-10 text-center text-red-400">Loading lesson... or Lesson not found. Please check data files.</div>;

  async function runCode() {
    setIsRunning(true);
    setTerminal("Running...");
    setGoalMet(false);

    const judgeResult = await runWithJudge0(module.id, code);
    setIsRunning(false);

    const out = (judgeResult.stdout ?? judgeResult.compile_output ?? "").trim();
    const statusDesc = judgeResult.status?.description ?? "";
    const runStatus = judgeResult.stderr ? "Error" : statusDesc || (out ? "Finished" : "No Output");
    
    if (judgeResult.stderr) {
      setTerminal(`[Runtime Error] ${judgeResult.stderr}`);
      setGoalMet(false);
      return;
    }

    const lowered = (out + " " + code).toLowerCase();
    const keywordMatch = lesson.goalKeywords.some(k => k && lowered.includes(k.toLowerCase()));
    const outputMatch = lesson.expectedOutput && lowered.includes(lesson.expectedOutput.toLowerCase().slice(0, 20));

    const isSimulatedSuccessPlaceholder = out.includes("Program ran (no simple string output found)") || out.includes("Simulated run (Demo Mode). Output:");


    if (!isSimulatedSuccessPlaceholder && (keywordMatch || outputMatch)) {
      setTerminal(`[SUCCESS! 🎉] ${runStatus}\n\nOutput:\n${out}`);
      setGoalMet(true);
      
      const s = loadProgress();
      s.xp = (s.xp || 0) + 15; 
      s.completed = s.completed || {};
      s.completed[module.id] = Array.from(new Set([...(s.completed[module.id] || []), lesson.id]));
      saveProgress(s);
      setProgressStore(s);
    } else if (isSimulatedSuccessPlaceholder && out.includes("Please write some code to execute.")) {
        setTerminal(`[EMPTY CODE] Please write code in the editor and press RUN.`);
        setGoalMet(false);
    } else {
      setTerminal(`[${runStatus}] Output:\n${out}\n\nTip: The output didn't match the expected result. Try the examples or ask Code Buddy for a hint!`);
      setGoalMet(false);
    }
  }

  function goNext() {
    const idx = module.topics.findIndex(t => t.id === lesson.id);
    if (idx < module.topics.length - 1) {
      const nextId = module.topics[idx + 1].id;
      navigate(`../${nextId}`, { relative: "path" }); 
    } else {
      alert(`🎉 Congratulations! You finished ${module.name}!`);
      navigate(`/codinghub`);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate(`/codinghub/${languageId}`)} className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg mr-3 shadow-md shadow-indigo-600/50 transition transform hover:scale-[1.05]">← Back to Lessons</button>
          <span className="text-xl font-bold text-cyan-300">{module.name} • </span>
          <span className="text-lg text-white ml-2">{lesson.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-300 font-semibold">XP: <span className="text-yellow-400">{(progressStore.xp || 0)}</span></div>
          <BadgeSmall text={`${(progressStore.completed[module.id] || []).length} done`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: explanation, examples, CodeBuddy */}
        <div className="lg:col-span-1 space-y-4">
          {/* Explanation Card */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-xl border border-indigo-500/30 transform transition hover:scale-[1.01] hover:shadow-indigo-500/40">
            <h2 className="font-bold text-xl text-yellow-300 mb-2">{lesson.title}</h2>
            <p className="text-gray-300 mb-3">{lesson.explanation}</p> 
            <div className="bg-indigo-950/70 p-3 rounded-lg text-sm border border-indigo-700/50">
              <strong className="text-indigo-300">How to think about this:</strong>
              <div className="mt-1 text-gray-200">{lesson.analogy}</div>
            </div>
          </div>

          {/* Examples Card */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 shadow-xl border border-indigo-500/30 space-y-3 transform transition hover:scale-[1.01] hover:shadow-indigo-500/40">
            <div className="font-semibold text-sm text-cyan-400 border-b border-gray-700/50 pb-2">Examples (copy to IDE)</div>
            {lesson.examples.map((ex) => (
              <div key={ex.id} className="text-sm border rounded-lg p-3 bg-gray-900/50 border-gray-700/50">
                <div className="font-semibold text-white">{ex.title}</div>
                <pre className="text-sm font-mono text-green-300 whitespace-pre-wrap bg-gray-950/80 p-2 rounded mt-1 border border-green-600/30">{ex.code}</pre>
                <div className="text-xs text-gray-400 mt-2">{ex.explanation}</div>
                <button onClick={() => setCode(ex.code)} className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg transition">Copy to IDE</button>
              </div>
            ))}
          </div>
          
          <CodeBuddy moduleId={module.id} topicId={lesson.id} currentCode={code} />
        </div>

        {/* Right column: IDE and terminal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs and Expected Output */}
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl shadow-xl flex items-center justify-between border border-pink-600/30">
            <div className="flex gap-2">
              <button onClick={() => setTab("Examples")} className={`px-4 py-2 rounded-lg font-semibold transition ${tab === "Examples" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/50" : "text-gray-300 hover:text-cyan-400"}`}>Examples</button>
              <button onClick={() => setTab("Challenge")} className={`px-4 py-2 rounded-lg font-semibold transition ${tab === "Challenge" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/50" : "text-gray-300 hover:text-cyan-400"}`}>Challenge</button>
              <button onClick={() => setTab("Ask")} className={`px-4 py-2 rounded-lg font-semibold transition ${tab === "Ask" ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/50" : "text-gray-300 hover:text-cyan-400"}`}>Ask Buddy</button>
            </div>
            <div className="text-sm text-gray-400">Expected: <span className="font-mono text-pink-300 ml-2">{lesson.expectedOutput}</span></div>
          </div>

          {/* Code Editor */}
          <div className="bg-gray-950 rounded-xl p-4 shadow-2xl shadow-pink-600/40 border-2 border-pink-600/70">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              // Enhanced Code Editor Look
              className="w-full h-64 bg-transparent text-green-300 p-3 rounded-lg font-mono text-base leading-relaxed resize-none focus:outline-none border-0 caret-green-400"
            />
            <div className="flex items-center justify-between mt-3 border-t border-gray-800 pt-3">
              <div className="flex gap-3">
                <button onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-green-600/50 transition transform hover:scale-[1.05]">
                  {isRunning ? "Running..." : "▶ RUN CODE"}
                </button>
                <button onClick={() => setCode(lesson.starterCode)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition">Reset</button>
                <button onClick={() => { navigator.clipboard?.writeText(code); alert("Copied to clipboard"); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition">Copy</button>
              </div>
              <div>
                <button onClick={() => {
                  if (!JUDGE0_HOST || !JUDGE0_KEY) alert("Judge0 not fully configured. Running in fast simulation mode.");
                  else alert("Real execution enabled via Judge0.");
                }} className="text-xs text-gray-500 hover:text-white transition">Run mode</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {/* Terminal */}
              <div className="bg-black/50 backdrop-blur-sm p-4 rounded-xl shadow-xl min-h-[160px] border border-cyan-500/30">
                <div className="font-semibold text-sm text-cyan-400 mb-2 border-b border-gray-700/50 pb-1">Terminal / Output</div>
                <pre className="font-mono text-sm whitespace-pre-wrap text-gray-200">{terminal}</pre>
              </div>

              {/* Practice Problems */}
              <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl shadow-xl mt-4 border border-indigo-500/30">
                <div className="font-semibold text-sm text-purple-400 mb-2 border-b border-gray-700/50 pb-1">Practice Problems</div>
                <ol className="list-decimal ml-5 text-sm space-y-2 text-gray-300">
                  {lesson.problems.slice(0, 8).map((p, idx) => <li key={idx}>{p}</li>)}
                </ol>
                <div className="text-xs text-gray-400 mt-3 border-t border-gray-800 pt-2">Type your solution in the editor, press RUN, and ask Code Buddy if you get stuck.</div>
              </div>
            </div>

            {/* Challenge Status / Next Button */}
            <div>
              <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl shadow-xl border border-yellow-500/30 min-h-[160px] flex flex-col justify-between transform transition hover:scale-[1.01] hover:shadow-yellow-500/40">
                <div>
                    <div className="font-semibold text-sm text-yellow-400 mb-2 border-b border-gray-700/50 pb-1">Challenge Status</div>
                    <div className="text-sm text-gray-300">{lesson.instructions}</div>
                    <div className="mt-3 text-xs text-gray-400">Hint: achieve the expected output *and* use the required keywords.</div>
                </div>
                
                <div className="mt-4">
                  <button onClick={() => { if (goalMet) goNext(); else alert("Complete the challenge first (pass the run check)."); }} className={`w-full px-4 py-2 rounded-lg font-bold transition transform hover:scale-[1.03] ${goalMet ? "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/50" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}>
                    {goalMet ? "Next Lesson →" : "Complete Challenge First"}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* =========================
   Main CodingHub routes (No change needed here, styles are applied via child components)
   ========================= */
const CodingHub: React.FC = () => {
  // --- START: Theme Background Logic ---
  const theme = useThemeStore((state) => state.getThemeStyles());
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  // 🔥 PRELOAD ALL BACKGROUND IMAGES — FIXES THE FLICKER (Copied from ExploreMenu)
  useEffect(() => {
    if (theme.backgrounds) {
      theme.backgrounds.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [theme.backgrounds]);

  // 🎯 CAROUSEL INTERVAL - 20 SECONDS (Matching ExploreMenu)
  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 20000); // 20 SECONDS
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || '';
  // --- END: Theme Background Logic ---

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* 🔥 SEAMLESS CROSSFADE - NO BLACK SCREEN (Copied logic from ExploreMenu) */}
      <div className="absolute inset-0 overflow-hidden">
        {theme.backgrounds?.map((bg, index) => (
          <div
            key={bg}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${bg})`,
              zIndex: index === currentBackgroundIndex ? 10 : 0, 
              opacity: index === currentBackgroundIndex ? 1 : 0, 
              transition: 'opacity 1.2s ease-in-out', 
              backgroundAttachment: 'fixed', 
            }}
          />
        ))}
      </div>
      
      {/* Black overlay - z-20 to stay above backgrounds (UPDATED: Deeper, cosmic gradient overlay) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-sm z-20"></div>
      
      <div className="relative z-30 min-h-screen">
        <Routes>
          <Route path="/" element={<ModuleDashboard />} /> 
          <Route path=":languageId" element={<TopicList />} />
          <Route path=":languageId/:topicId" element={<LessonPage />} />
          <Route path="*" element={<div className="p-6 text-center text-2xl text-red-600">404: Hub Content Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default CodingHub;