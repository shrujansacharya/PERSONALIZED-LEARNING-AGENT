import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Search,
  History as HistoryIcon,
  Pencil,
  ArrowLeft,
  ChevronsLeft,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  category: string;
}

interface ChatSession {
  id: string;
  name: string;
  weekday: string;
  createdAt: string;
  messages: any[];
}

interface UserData {
  profileImage?: string;
  name?: string;
  email?: string;
  learningStyle?: string;
  interests?: string;
  performanceLevels?: Record<string, string>;
}

interface SidebarProps {
  selectedSubject: Subject | null;
  setSelectedSubject: (subject: Subject | null) => void;
  sessionsBySubject: Record<string, ChatSession[]>;
  setSessionsBySubject: (sessions: Record<string, ChatSession[]>) => void;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  loadSession: (session: ChatSession) => void;
  startNewChatSameSubject: () => void;
  userData: UserData | null;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onBackButtonClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedSubject,
  setSelectedSubject,
  sessionsBySubject,
  setSessionsBySubject,
  currentSessionId,
  setCurrentSessionId,
  loadSession,
  startNewChatSameSubject,
  userData,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onBackButtonClick,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [sidebarView, setSidebarView] = useState<'main' | 'account'>('main');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  const groupedByWeekday = Object.entries(sessionsBySubject).reduce((acc, [subjectId, sessions]) => {
    sessions.forEach(session => {
      if (!acc[session.weekday]) {
        acc[session.weekday] = [];
      }
      acc[session.weekday].push(session);
    });
    return acc;
  }, {} as Record<string, ChatSession[]>);

  const weekdayOfNow = () => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  };

  const commitRename = (session: ChatSession) => {
    if (!selectedSubject || !renameValue.trim()) {
      setRenamingId(null);
      setRenameValue("");
      return;
    }

    const sessions = sessionsBySubject[selectedSubject.id] || [];
    const updatedSessions = sessions.map(s =>
      s.id === session.id ? { ...s, name: renameValue.trim() } : s
    );

    const newSessionsBySubject = {
      ...sessionsBySubject,
      [selectedSubject.id]: updatedSessions,
    };

    setSessionsBySubject(newSessionsBySubject);
    try {
      localStorage.setItem("eduChat:sessions:v1", JSON.stringify(newSessionsBySubject));
    } catch {}
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <motion.div
      initial={{ width: 250 }}
      animate={{ width: isSidebarCollapsed ? 100 : 250 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 bottom-0 flex flex-col bg-black/70 border-r border-white/20 p-4 shrink-0"
    >
      <button
        onClick={onBackButtonClick}
        className="group relative w-12 h-12 flex items-center justify-center p-2 rounded-full transition-all duration-200 
                   bg-black/50 hover:bg-black/80 mb-4"
        title="Back to Subjects"
      >
        <div className="absolute inset-0 rounded-full z-10 
                       bg-gradient-to-br from-purple-600 to-indigo-800
                       group-hover:from-purple-500 group-hover:to-indigo-700
                       transition-all duration-300 transform group-hover:scale-110"></div>
        <ArrowLeft
          size={24}
          className="relative z-20 text-white"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
          }}
        />
      </button>

      <div className="flex items-center gap-2 pb-4 mb-4">
        <div className="h-10 w-10 relative flex items-center justify-center">
          <div
            className={`absolute inset-0 bg-no-repeat bg-contain`}
            style={{ backgroundImage: `url('/src/styles/chatbotimage.png')` }}
          />
        </div>
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold text-white whitespace-nowrap"
              style={{
                background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Learny
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex flex-col space-y-2 flex-1 overflow-y-auto">
        {sidebarView === 'main' ? (
          <>
            <button
              onClick={startNewChatSameSubject}
              className="flex items-center gap-3 w-full p-3 rounded-md bg-blue-600 hover:bg-blue-500 transition text-white font-semibold"
            >
              <PlusCircle size={20} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    New Chat
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-white/20 transition text-blue-300 font-semibold"
            >
              <Search size={20} />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Search
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full p-3 rounded-md hover:bg-white/20 transition text-blue-300 font-semibold"
            >
              <div className="flex items-center gap-3">
                <HistoryIcon size={20} />
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      History
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>
            <AnimatePresence>
              {showHistory && !isSidebarCollapsed && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  {Object.keys(groupedByWeekday).length === 0 && (
                    <p className="text-[11px] text-gray-400 p-2">No saved chats.</p>
                  )}
                  {Object.entries(groupedByWeekday).map(([day, sessions]) => (
                    <div key={day} className="mb-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1 pl-2">{day}</p>
                      <div className="space-y-1.5">
                        {sessions.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map((s) => (
                          <div key={s.id} className={`group p-2 rounded-md ${currentSessionId === s.id ? "bg-blue-600" : "bg-black/40 hover:bg-black/30 transition"}`}>
                            {renamingId === s.id ? (
                              <input
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && commitRename(s)}
                                onBlur={() => commitRename(s)}
                                className="w-full bg-transparent text-xs text-blue-200 outline-none border-b border-blue-700/60"
                              />
                            ) : (
                              <button
                                onClick={() => loadSession(s)}
                                className="w-full text-left text-xs text-white truncate"
                                title={s.name}
                              >
                                {s.name}
                              </button>
                            )}
                            {renamingId !== s.id && (
                              <button
                                onClick={() => setRenamingId(s.id)}
                                className="opacity-0 group-hover:opacity-100 transition text-[10px] text-gray-400 mt-1 flex items-center gap-1"
                                title="Rename chat"
                              >
                                <Pencil size={12} /> rename
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 p-1 mb-2">
              <button
                onClick={() => setSidebarView('main')}
                className="p-2 rounded-md hover:bg-white/20 transition text-white"
                title="Back to menu"
              >
                <ChevronsLeft size={22} />
              </button>
              {!isSidebarCollapsed && (
                <h3 className="font-bold text-lg text-white">
                  My Account
                </h3>
              )}
            </div>
            
            <div className="flex flex-col items-center p-2 text-center">
              {userData?.profileImage ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${userData.profileImage}`}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-purple-400"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center mb-3 border-2 border-purple-400">
                  <User size={40} />
                </div>
              )}
              <h3 className="font-bold text-lg w-full truncate text-white">{userData?.name || 'Explorer'}</h3>
              <p className="text-xs text-gray-400 w-full truncate">{userData?.email}</p>
            </div>

            <div className="space-y-2 p-2 mt-4">
              <div className="p-3 bg-black/40 rounded-lg">
                <label className="text-xs text-gray-400">Learning Style</label>
                <p className="font-medium text-white">{userData?.learningStyle || 'Not set'}</p>
              </div>
              <div className="p-3 bg-black/40 rounded-lg">
                <label className="text-xs text-gray-400">Interests</label>
                <p className="font-medium text-white">{userData?.interests || 'Not set'}</p>
              </div>
              <div className="p-3 bg-black/40 rounded-lg">
                <label className="text-xs text-gray-400">Performance Level</label>
                <p className="font-medium text-white">
                  {(() => {
                    if (!userData?.performanceLevels || !selectedSubject) return 'Not set';
                    const level = userData.performanceLevels[selectedSubject.name];
                    return level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Not set';
                  })()}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-white/20 flex items-center justify-between">
        <button
          onClick={() => setSidebarView('account')}
          className="flex items-center gap-2 p-3 rounded-md hover:bg-white/20 transition w-full text-left"
        >
          {userData?.profileImage ? (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${userData.profileImage}`}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-sm font-semibold text-white shrink-0">
              {userData ? (userData.name || userData.email)?.charAt(0).toUpperCase() : <User size={16} />}
            </div>
          )}
          {!isSidebarCollapsed && (
            <span
              className="text-sm font-semibold text-white whitespace-nowrap truncate"
              title={userData?.email}
            >
              {userData ? userData.name || userData.email : "Loading..."}
            </span>
          )}
        </button>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 text-white hover:text-white transition z-10 shrink-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isSidebarCollapsed ? "open" : "close"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;