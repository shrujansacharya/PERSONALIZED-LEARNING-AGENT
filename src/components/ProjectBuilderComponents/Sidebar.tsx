import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, History, Video, Save, X, Maximize2, Minimize2, Folder, Lightbulb, Code, FileText, Calendar, PanelLeft, PanelRight } from 'lucide-react';
import { ChatMessage } from './types';

interface SidebarProps {
  sidebarTab: 'chat' | 'history' | 'files' | 'video' | 'ideas' | 'code' | 'notes' | 'planner';
  setSidebarTab: (tab: 'chat' | 'history' | 'files' | 'video' | 'ideas' | 'code' | 'notes' | 'planner') => void;
  chatMessages: ChatMessage[];
  chatbotLoading: boolean;
  handleChatSubmit: (e?: React.FormEvent) => Promise<void>;
  chatInput: string;
  setChatInput: (input: string) => void;
  saveChatToHistory: (clearCurrent?: boolean) => void;
  chatHistory: ChatMessage[][];
  loadChatFromHistory: (index: number) => void;
  deleteChatFromHistory: (index: number) => void;
  handleWatchVideos: () => Promise<void>;
  ideasInput: string;
  setIdeasInput: (input: string) => void;
  generateAiFeature: (feature: 'ideas' | 'code' | 'notes' | 'plan', input?: string) => Promise<void>;
  aiLoading: boolean;
  projectIdeas: string[];
  codeInput: string;
  setCodeInput: (input: string) => void;
  codeSnippet: string;
  notesInput: string;
  setNotesInput: (input: string) => void;
  projectNotes: string;
  setShowShareModal: (show: boolean) => void;
  planInput: string;
  setPlanInput: (input: string) => void;
  projectPlan: string[];
  videos?: any[];
  videosLoading?: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarTab,
  setSidebarTab,
  chatMessages,
  chatbotLoading,
  handleChatSubmit,
  chatInput,
  setChatInput,
  saveChatToHistory,
  chatHistory,
  loadChatFromHistory,
  deleteChatFromHistory,
  handleWatchVideos,
  ideasInput,
  setIdeasInput,
  generateAiFeature,
  aiLoading,
  projectIdeas,
  codeInput,
  setCodeInput,
  codeSnippet,
  notesInput,
  setNotesInput,
  projectNotes,
  setShowShareModal,
  planInput,
  setPlanInput,
  projectPlan,
  videos,
  videosLoading,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [videoPosition, setVideoPosition] = useState({ x: 100, y: 100 });
  const [videoSize, setVideoSize] = useState({ width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    if (action === 'drag') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - videoPosition.x, y: e.clientY - videoPosition.y });
    } else if (action === 'resize') {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setVideoPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isResizing) {
      const newWidth = Math.max(200, videoSize.width + (e.clientX - dragStart.x));
      const newHeight = Math.max(150, videoSize.height + (e.clientY - dragStart.y));
      setVideoSize({ width: newWidth, height: newHeight });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const sidebarItems = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'files', icon: Folder, label: 'Files' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
    { id: 'code', icon: Code, label: 'Code' },
    { id: 'notes', icon: FileText, label: 'Notes' },
    { id: 'planner', icon: Calendar, label: 'Planner' },
  ] as const;

  const currentTool = sidebarItems.find(item => item.id === sidebarTab);

  return (
    <div
      className="h-full bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl flex border border-white/20 text-white"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Vertical Sidebar */}
      <div className={`bg-transparent p-3 flex flex-col items-center space-y-4 border-r border-white/20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-24'}`}>
        <button onClick={toggleSidebar} className="p-4 rounded-xl transition-all duration-200 w-full text-gray-300 hover:bg-white/20">
          {isSidebarOpen ? <PanelLeft size={28} className="mx-auto" /> : <PanelRight size={28} className="mx-auto" />}
        </button>
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSidebarTab(item.id)}
            className={`p-4 rounded-xl transition-all duration-200 w-full relative group flex items-center gap-4 ${sidebarTab === item.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-white/20'
              }`}
          >
            <item.icon size={28} />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {sidebarTab === item.id && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-400 rounded-r-full"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'calc(100% - 256px)', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <header className="p-4 flex items-center justify-between border-b border-white/20">
              <h2 className="text-xl font-bold text-white">{currentTool?.label}</h2>
            </header>
            <div className="flex-1 overflow-y-auto">
              {sidebarTab === 'chat' && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/10">
                    {chatMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-white/20 text-white rounded-bl-none'
                            }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-60 mt-2 text-right">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {chatbotLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/20 px-4 py-3 rounded-2xl rounded-bl-none">
                          <motion.div className="flex space-x-2">
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full"></motion.div>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/20 bg-transparent">
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your question here..."
                        className="flex-1 px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder:text-gray-300 transition-all"
                        disabled={chatbotLoading}
                      />
                      <button
                        type="submit"
                        disabled={chatbotLoading || !chatInput.trim()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Send
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => saveChatToHistory(false)}
                        disabled={chatMessages.length <= 1}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                        title="Save current chat to history"
                      >
                        <Save size={16} />
                        Save Chat
                      </button>
                      <div className="text-xs text-gray-300">
                        {chatMessages.length - 1} messages • Auto-saves every 4 exchanges
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {sidebarTab === 'history' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">Chat History</h3>
                  {chatHistory.length === 0 ? (
                    <p className="text-gray-300">No chat history yet</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {chatHistory.map((chat, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <div className="flex-1 min-w-0 pr-2">
                            <p
                              className="text-sm text-white line-clamp-2 break-words"
                              title={chat[0]?.content || 'Empty chat'}
                            >
                              {chat[0]?.content || 'Empty chat'}
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                              {chat.length} messages • {chat[chat.length - 1]?.timestamp ? new Date(chat[chat.length - 1].timestamp).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => loadChatFromHistory(index)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                              title="Load this chat"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deleteChatFromHistory(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              title="Delete this chat"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === 'files' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">Files</h3>
                  <p className="text-gray-300">File management is not yet implemented.</p>
                </div>
              )}

              {sidebarTab === 'video' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">Video Tutorials</h3>
                  <button
                    onClick={handleWatchVideos}
                    className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 mb-4"
                  >
                    Watch Tutorials
                  </button>

                  {/* Video Player Modal */}
                  {playingVideo && !isVideoFullscreen && (
                    <div
                      ref={videoRef}
                      className="fixed bg-black rounded-lg overflow-hidden shadow-2xl z-50 cursor-move select-none"
                      style={{
                        left: `${videoPosition.x}px`,
                        top: `${videoPosition.y}px`,
                        width: `${videoSize.width}px`,
                        height: `${videoSize.height}px`,
                      }}
                    >
                      {/* Drag Handle */}
                      <div
                        className="absolute top-0 left-0 right-0 h-8 bg-black bg-opacity-50 flex items-center justify-between px-2 cursor-move"
                        onMouseDown={(e) => handleMouseDown(e, 'drag')}
                      >
                        <span className="text-white text-xs font-medium">YouTube Player</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setIsVideoFullscreen(true)}
                            className="text-white hover:text-gray-300 p-1"
                            title="Fullscreen"
                          >
                            <Maximize2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setPlayingVideo(null);
                              setIsVideoFullscreen(false);
                            }}
                            className="text-white hover:text-gray-300 p-1"
                            title="Close"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Video Content */}
                      <iframe
                        src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
                        className="w-full h-full pt-8"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video player"
                      />

                      {/* Resize Handle */}
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-white bg-opacity-20 cursor-se-resize"
                        onMouseDown={(e) => handleMouseDown(e, 'resize')}
                      >
                        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white"></div>
                      </div>
                    </div>
                  )}

                  {/* Fullscreen Video Player */}
                  {playingVideo && isVideoFullscreen && (
                    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                      <div className="w-full h-full bg-black relative">
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                          <button
                            onClick={() => setIsVideoFullscreen(false)}
                            className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75 transition-colors"
                          >
                            <Minimize2 size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setPlayingVideo(null);
                              setIsVideoFullscreen(false);
                            }}
                            className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <iframe
                          src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube video player"
                        />
                      </div>
                    </div>
                  )}

                  {videos && videos.length > 0 && (
                    <div className="space-y-3">
                      {videos.map((video, index) => (
                        <div key={index} className="bg-white/10 rounded-lg p-3">
                          <h4 className="font-semibold text-white mb-2">{video.snippet.title}</h4>
                          <p className="text-sm text-gray-300 mb-2">{video.snippet.description.substring(0, 100)}...</p>
                          <div className="flex items-center gap-2">
                            <img
                              src={video.snippet.thumbnails.medium.url}
                              alt={video.snippet.title}
                              className="w-16 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setPlayingVideo(video.id.videoId)}
                            />
                            <div className="flex-1">
                              <p className="text-xs text-gray-400">{video.snippet.channelTitle}</p>
                              <button
                                onClick={() => setPlayingVideo(video.id.videoId)}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                              >
                                ▶️ Play Video
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {videosLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                      <p className="text-sm text-gray-300 mt-2">Loading videos...</p>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === 'ideas' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">AI Project Ideas</h3>
                  <input
                    type="text"
                    value={ideasInput}
                    onChange={(e) => setIdeasInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAiFeature('ideas')}
                    placeholder="Describe your interests... (Press Enter to generate)"
                    className="w-full px-4 py-3 border border-white/20 rounded-xl mb-4 bg-white/10 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => generateAiFeature('ideas')}
                    disabled={aiLoading || !ideasInput.trim()}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {aiLoading ? 'Generating...' : 'Generate Ideas'}
                  </button>
                  <div className="mt-4 space-y-2">
                    {projectIdeas.map((idea, index) => (
                      <div key={index} className="p-3 bg-white/10 rounded-lg">
                        <p className="text-sm text-white whitespace-pre-wrap">{idea}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sidebarTab === 'code' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">Code Helper</h3>
                  <textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAiFeature('code')}
                    placeholder="Describe what you need help with..."
                    className="w-full px-4 py-3 border border-white/20 rounded-xl mb-4 bg-white/10 text-white placeholder:text-gray-300 h-32 resize-none"
                  />
                  <button
                    onClick={() => generateAiFeature('code')}
                    disabled={aiLoading || !codeInput.trim()}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {aiLoading ? 'Generating...' : 'Get Help'}
                  </button>
                  <div className="mt-4">
                    <pre className="p-3 bg-white/10 rounded-lg text-sm text-white whitespace-pre-wrap overflow-x-auto">
                      {codeSnippet}
                    </pre>
                  </div>
                </div>
              )}

              {sidebarTab === 'notes' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">📒 AI Notes Organizer</h3>

                  {/* Input Section */}
                  <div className="bg-black/10 p-4 rounded-lg mb-4">
                    <textarea
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAiFeature('notes')}
                      placeholder="Paste your project notes, research, or any content you want to organize..."
                      className="w-full px-4 py-3 border border-white/20 rounded-xl mb-4 bg-white/10 text-white placeholder:text-gray-300 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => generateAiFeature('notes')}
                      disabled={aiLoading || !notesInput.trim()}
                      className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {aiLoading ? '🧠 Analyzing & Organizing...' : '📝 Organize Notes'}
                    </button>
                  </div>

                  {/* Organized Notes Display */}
                  {projectNotes && (
                    <div className="bg-white/10 rounded-lg border border-white/20 overflow-hidden">
                      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-white/20 to-white/10">
                        <h4 className="text-lg font-bold text-white mb-2">📋 Organized Study Notes</h4>
                        <p className="text-sm text-gray-300">
                          AI has analyzed and structured your content for better learning
                        </p>
                      </div>

                      <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm prose-invert max-w-none">
                          <div
                            className="text-white leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html:
                                projectNotes
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-blue-100">$1</h3>')
                                  .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-purple-100">$1</h2>')
                                  .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-white">$1</h1>')
                                  .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
                                  .replace(/^(\d+)\. (.*$)/gim, '<div class="ml-4">$1. $2</div>')
                                  .replace(/\n\n/g, '</p><p class="mb-3">')
                                  .replace(/\n/g, '<br/>')
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 border-t border-white/20 bg-black/10">
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(projectNotes);
                              // Note: Toast functionality not implemented yet
                              alert('Notes copied to clipboard!');
                            }}
                            className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            📋 Copy Notes
                          </button>
                          <button
                            onClick={() => generateAiFeature('notes')}
                            disabled={aiLoading}
                            className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm"
                          >
                            🔄 Reorganize
                          </button>
                          <button
                            onClick={() => setShowShareModal(true)}
                            className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                          >
                            💾 Share Notes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!projectNotes && !aiLoading && (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">📝</div>
                      <h4 className="text-lg font-semibold text-white mb-2">Ready to Organize Your Notes?</h4>
                      <p className="text-gray-300 mb-4">
                        Paste your project notes, research, or any content above and let AI organize it into structured, easy-to-study format.
                      </p>
                      <div className="text-sm text-gray-400">
                        ✨ AI will create sections for key concepts, learning objectives, study tips, and more!
                      </div>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === 'planner' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">📅 AI Project Planner</h3>

                  {/* Input Section */}
                  <div className="bg-black/10 p-4 rounded-lg mb-4">
                    <textarea
                      value={planInput}
                      onChange={(e) => setPlanInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAiFeature('plan')}
                      placeholder="Describe your project idea, goals, and any specific requirements..."
                      className="w-full px-4 py-3 border border-white/20 rounded-xl mb-4 bg-white/10 text-white placeholder:text-gray-300 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => generateAiFeature('plan')}
                      disabled={aiLoading || !planInput.trim()}
                      className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {aiLoading ? '🎯 Creating Detailed Plan...' : '🚀 Generate Project Plan'}
                    </button>
                  </div>

                  {/* Project Plan Display */}
                  {projectPlan.length > 0 && (
                    <div className="bg-white/10 rounded-lg border border-white/20 overflow-hidden">
                      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-white/20 to-white/10">
                        <h4 className="text-lg font-bold text-white mb-2">🎯 Your Project Plan</h4>
                        <p className="text-sm text-gray-300">
                          AI-generated comprehensive project roadmap with timelines and resources
                        </p>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {/* Project Steps */}
                        <div className="p-4 border-b border-white/20">
                          <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                            📋 Detailed Steps
                          </h5>
                          <div className="space-y-3">
                            {projectPlan.map((step, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-white font-medium">{step}</p>
                                </div>
                                <div className="flex-shrink-0">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    title="Mark as completed"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Progress Tracking */}
                        <div className="p-4 border-b border-white/20">
                          <h5 className="font-semibold text-white mb-3">📊 Progress Tracking</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-300">
                              <span>Completed Steps</span>
                              <span>0 / {projectPlan.length}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `0%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4">
                          <h5 className="font-semibold text-white mb-3">⚡ Quick Actions</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 bg-white/10 text-blue-300 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium">
                              📝 Edit Plan
                            </button>
                            <button className="p-3 bg-white/10 text-green-300 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium">
                              ✅ Mark Complete
                            </button>
                            <button className="p-3 bg-white/10 text-purple-300 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium">
                              📤 Share Plan
                            </button>
                            <button
                              onClick={() => generateAiFeature('plan')}
                              disabled={aiLoading}
                              className="p-3 bg-white/10 text-orange-300 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              🔄 Regenerate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {projectPlan.length === 0 && !aiLoading && (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">🎯</div>
                      <h4 className="text-lg font-semibold text-white mb-2">Ready to Plan Your Project?</h4>
                      <p className="text-gray-300 mb-4">
                        Describe your project idea above and let AI create a comprehensive, step-by-step plan with timelines, materials, and milestones.
                      </p>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>✨ Detailed step-by-step instructions</div>
                        <div>🛠️ Material lists and resource requirements</div>
                        <div>⏰ Time estimates and scheduling</div>
                        <div>🎯 Learning objectives and success criteria</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;