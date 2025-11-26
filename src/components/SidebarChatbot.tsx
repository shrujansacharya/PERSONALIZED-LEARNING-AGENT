// Sidebar.tsx - FINAL CODE (Slide-in/out overlay)
import React, { useState, useEffect, useMemo } from 'react';
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
  Trash2,
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
  sessionsBySubject: Record<string, ChatSession[]>;
  setSessionsBySubject: (sessions: Record<string, ChatSession[]>) => void;
  loadSession: (session: ChatSession) => void;
  startNewChatSameSubject: () => void;
  userData: UserData | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onBackButtonClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedSubject,
  sessionsBySubject,
  setSessionsBySubject,
  loadSession,
  startNewChatSameSubject,
  userData,
  isSidebarOpen,
  setIsSidebarOpen,
  onBackButtonClick,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [sidebarView, setSidebarView] = useState<'main' | 'account'>('main');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const groupedByWeekday = useMemo(() => {
    if (!selectedSubject || !sessionsBySubject[selectedSubject.id]) {
      return {};
    }
    return (sessionsBySubject[selectedSubject.id] || []).reduce((acc, session) => {
      if (!acc[session.weekday]) {
        acc[session.weekday] = [];
      }
      acc[session.weekday].push(session);
      return acc;
    }, {} as Record<string, ChatSession[]>);
  }, [sessionsBySubject, selectedSubject]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return groupedByWeekday;
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = { ...groupedByWeekday };
    Object.keys(filtered).forEach(day => {
      filtered[day] = filtered[day].filter(session => 
        session.name.toLowerCase().includes(lowerQuery)
      );
      if (filtered[day].length === 0) delete filtered[day];
    });
    return filtered;
  }, [groupedByWeekday, searchQuery]);

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

  const handleClearHistory = () => {
    // We should use a custom modal here instead of window.confirm
    // For now, keeping the logic
    if (confirm('Clear all history for this subject? This cannot be undone.')) {
      if(selectedSubject) {
        const newSessionsBySubject = { ...sessionsBySubject };
        delete newSessionsBySubject[selectedSubject.id]; // Clears history for the current subject
        setSessionsBySubject(newSessionsBySubject);
        localStorage.setItem("eduChat:sessions:v1", JSON.stringify(newSessionsBySubject));
      }
    }
  };

  const unifiedActionButtonClass = `flex items-center w-full p-3.5 rounded-xl bg-black/50 hover:bg-gray-800/70 transition-all duration-200 text-gray-300 hover:text-white font-medium shadow-sm hover:shadow-glow focus-visible:ring-2 focus-visible:ring-indigo-500/50 gap-3`;

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: isSidebarOpen ? "0%" : "-100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 bottom-0 flex w-72 flex-col bg-black border-r border-gray-800/50 backdrop-blur-xl shadow-2xl z-40"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800/30">
        <button
          onClick={onBackButtonClick} // This now also closes the sidebar via Chatbot.tsx
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 
                     bg-gray-900/50 hover:bg-gray-800/70 mb-4 shadow-glow hover:shadow-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          aria-label="Back to Subjects"
          title="Back to Subjects"
        >
          <div className="absolute inset-0 rounded-xl z-10 
                         bg-gradient-to-br from-purple-600/30 to-indigo-600/30
                         group-hover:from-purple-500/40 group-hover:to-indigo-500/40
                         transition-all duration-300 transform group-hover:scale-105"></div>
          <ArrowLeft
            size={20}
            className="relative z-20 text-gray-300 group-hover:text-white transition-colors shrink-0"
            style={{
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))'
            }}
          />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 relative flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-glow-lg shrink-0">
            <div
              className={`absolute inset-0 bg-no-repeat bg-contain opacity-95`}
              style={{ backgroundImage: `url('/src/styles/chatbotimage.png')` }}
            />
          </div>
          <span
            className="text-lg font-bold whitespace-nowrap"
            style={{
              background: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Learny
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col space-y-2 flex-1 overflow-y-auto px-3 py-3">
        {sidebarView === 'main' ? (
          <>
            {/* Action Buttons - Unified Style */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startNewChatSameSubject}
              className={unifiedActionButtonClass}
              aria-label="Start New Chat"
              title="New Chat"
            >
              <PlusCircle size={18} className="shrink-0 text-indigo-400 group-hover:text-indigo-300" />
              <span>
                New Chat
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={unifiedActionButtonClass}
              aria-label="Search Chats"
              title="Search"
            >
              <Search size={18} className="shrink-0 text-indigo-400 group-hover:text-indigo-300" />
              <span>
                Search
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHistory(!showHistory)}
              className={`${unifiedActionButtonClass.replace('justify-between', 'justify-between w-full')} focus-visible:ring-2 focus-visible:ring-indigo-500/50`}
              aria-expanded={showHistory}
              aria-label="Toggle History"
              title="History"
            >
              <div className={`flex items-center gap-3`}>
                <HistoryIcon size={18} className="shrink-0 text-indigo-400 group-hover:text-indigo-300" />
                <span>
                  History
                </span>
              </div>
              <ChevronRight size={18} className={`transition-transform duration-200 shrink-0 text-indigo-400 ${showHistory ? 'rotate-90' : ''}`} />
            </motion.button>

            {/* History Section */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 overflow-y-auto max-h-64"
                >
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-black/60 border border-gray-700/50 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
                      aria-label="Search history"
                    />
                  </div>

                  {/* Clear History Button */}
                  {Object.keys(filteredSessions).length > 0 && (
                    <motion.button
                      whileHover={{ scale: 0.98 }}
                      onClick={handleClearHistory}
                      className="flex items-center gap-2 w-full p-2 text-xs text-red-400 hover:text-red-300 bg-black/60 hover:bg-red-900/20 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500/50"
                      aria-label="Clear All History"
                      title="Clear History"
                    >
                      <Trash2 size={14} />
                      Clear History
                    </motion.button>
                  )}

                  {Object.entries(filteredSessions).map(([day, sessions]) => (
                    <div key={day} className="mb-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 pl-2 font-semibold border-l-2 border-indigo-500/30">
                        {day}
                      </p>
                      <div className="space-y-1.5 divide-y divide-gray-700/30">
                        {sessions.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map((s, index) => (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            // Note: You'll need to pass currentSessionId prop to highlight the active chat
                            className={`group relative p-3 rounded-xl bg-black/30 hover:bg-gray-800/40 transition-all duration-200 border border-transparent`}
                          >
                            {renamingId === s.id ? (
                              <input
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && commitRename(s)}
                                onBlur={() => commitRename(s)}
                                className="w-full bg-transparent text-sm text-indigo-200 outline-none border-b border-indigo-500/50 focus:border-indigo-400/70 transition-colors"
                                aria-label={`Rename session: ${s.name}`}
                              />
                            ) : (
                              <button
                                onClick={() => {
                                  loadSession(s);
                                  setIsSidebarOpen(false); // Close sidebar on selection
                                }}
                                className="w-full text-left text-sm text-white truncate font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                                aria-label={`Load session: ${s.name}`}
                                title={s.name}
                              >
                                {s.name}
                              </button>
                            )}
                            {renamingId !== s.id && (
                              <button
                                onClick={() => {
                                  setRenamingId(s.id);
                                  setRenameValue(s.name);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-2 right-2 text-xs text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50 focus-visible:ring-2 focus-visible:ring-gray-500/50"
                                aria-label="Rename chat"
                                title="Rename chat"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(filteredSessions).length === 0 && searchQuery && (
                    <p className="text-center text-sm text-gray-500 py-4">No chats found.</p>
                  )}
                  {Object.keys(groupedByWeekday).length === 0 && !searchQuery && (
                     <p className="text-center text-sm text-gray-500 py-4">No chat history yet.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            {/* Account View */}
            <div className="flex items-center gap-2 p-2 mb-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <button
                onClick={() => setSidebarView('main')}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition text-gray-400 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                aria-label="Back to menu"
                title="Back to menu"
              >
                <ChevronsLeft size={18} className="shrink-0" />
              </button>
              <h3 className="font-bold text-base text-white">My Account</h3>
            </div>
            
            <div className="flex flex-col items-center p-4 text-center mb-4 rounded-xl bg-black/60 border border-gray-700/30 backdrop-blur-sm shadow-glow">
              {userData?.profileImage ? (
                <img
                  // UPDATED: Use the profileImage data URL directly
                  src={userData.profileImage}
                  alt="Profile"
                  loading="lazy"
                  className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-purple-500/40 shadow-glow-lg shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-3 border-2 border-purple-500/40 shadow-glow-lg shrink-0">
                  <User size={32} className="text-white shrink-0" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-base w-full truncate text-white">{userData?.name || 'Explorer'}</h3>
                <p className="text-xs text-gray-400 w-full truncate">{userData?.email}</p>
              </div>
            </div>

            <div className="space-y-3 p-2">
              <div className="p-3.5 bg-black/60 rounded-xl border border-gray-700/30 backdrop-blur-sm shadow-inner">
                <label className="text-xs text-gray-500 font-medium block mb-1">Learning Style</label>
                <p className="font-semibold text-white">{userData?.learningStyle || 'Not set'}</p>
              </div>
              <div className="p-3.5 bg-black/60 rounded-xl border border-gray-700/30 backdrop-blur-sm shadow-inner">
                <label className="text-xs text-gray-500 font-medium block mb-1">Interests</label>
                <p className="font-semibold text-white">{userData?.interests || 'Not set'}</p>
              </div>
              <div className="p-3.5 bg-black/60 rounded-xl border border-gray-700/30 backdrop-blur-sm shadow-inner">
                <label className="text-xs text-gray-500 font-medium block mb-1">Performance Level</label>
                <p className="font-semibold text-white">
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

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-800/30 px-3 pb-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSidebarView('account')}
          className={`flex items-center justify-center rounded-xl hover:bg-gray-800/70 transition-all duration-200 text-gray-300 hover:text-white mb-2 shadow-glow focus-visible:ring-2 focus-visible:ring-indigo-500/50 w-full p-3.5 gap-3`}
          aria-label="View Account"
          title="My Account"
        >
          {userData?.profileImage ? (
            <img
              // UPDATED: Use the profileImage data URL directly
              src={userData.profileImage}
              alt="Profile"
              loading="lazy"
              className="w-6 h-6 rounded-full object-cover shrink-0 border border-gray-600/40"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {userData ? (userData.name || userData.email)?.charAt(0).toUpperCase() : <User size={12} />}
            </div>
          )}
          <span className="text-sm font-medium whitespace-nowrap truncate">
            {userData ? userData.name || userData.email : "Loading..."}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;