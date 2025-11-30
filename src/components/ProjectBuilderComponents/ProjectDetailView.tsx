import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertCircle, Star } from 'lucide-react';
import { ProjectTemplate, ChatMessage } from './types';
import Sidebar from './Sidebar'; 
import { useThemeStore } from '../../store/theme'; 

interface ProjectDetailViewProps {
  selectedProject: ProjectTemplate | null;
  previousView: 'landing' | 'software' | 'science';
  setView: (view: 'landing' | 'software' | 'science') => void;
  isFavourite: (projectId: string) => boolean;
  handleBackNavigation: () => void;
  handleComponentClick: (componentName: string) => void;
  isLoadingStores: boolean;
  showStoreModal: boolean;
  setShowStoreModal: (show: boolean) => void;
  storeSearchResults: any[];
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
  videos: any[];
  videosLoading: boolean;
  setVideos: React.Dispatch<React.SetStateAction<any[]>>;
  setVideosLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  selectedProject,
  previousView,
  setView,
  isFavourite,
  handleBackNavigation,
  handleComponentClick,
  isLoadingStores,
  showStoreModal,
  setShowStoreModal,
  storeSearchResults,
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
  setVideos,
  setVideosLoading,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const theme = useThemeStore((state) => state.getThemeStyles());
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  useEffect(() => {
    const backgrounds = theme.backgrounds;
    if (backgrounds && backgrounds.length > 1) {
      // UPDATED: Adjusted interval for a slower cosmic feel (10 seconds)
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || '';

  if (!selectedProject) {
    return (
      <div 
        className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1.2s ease-in-out', // UPDATED
        }}
      >
        {/* Background Overlay (UPDATED: Deeper, cosmic gradient overlay + blur) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-0"></div>
        <div 
          // UPDATED: Glassmorphism, neon border, and glowing shadow
          className="relative z-10 text-center bg-black/40 backdrop-blur-xl p-10 rounded-2xl border border-pink-500/50 shadow-2xl shadow-pink-500/20"
        >
          <AlertCircle className="mx-auto mb-4 text-pink-400 drop-shadow-lg" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">No project selected</h2>
          <p className="text-gray-200 mb-4">Please select a project to view its details.</p>
          <motion.button
            onClick={() => setView(previousView)}
            // UPDATED: Neon button style
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-screen relative overflow-hidden"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1.2s ease-in-out', // UPDATED
      }}
    >
      {/* Background Overlay (UPDATED: Deeper, cosmic gradient overlay + blur) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-0"></div>

      <div className="relative z-10 h-full w-full p-4 flex flex-col">
        {/* Header (UPDATED: Glassmorphic back button) */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleBackNavigation}
              // UPDATED: Glassmorphic button, neon hover border
              className="flex items-center gap-2 text-gray-200 hover:text-cyan-400 transition-colors bg-black/40 backdrop-blur-lg p-3 rounded-xl border border-indigo-400/30 hover:border-cyan-400/50 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              Back
            </motion.button>
            <h1 className="text-3xl font-bold text-cyan-300 drop-shadow-xl">
              {selectedProject.title}
            </h1>
          </div>
        </header>
        <main className="flex flex-1 overflow-hidden gap-4">
          <motion.div
            animate={{ width: isSidebarOpen ? '66.666667%' : '80px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            {/* NOTE: Sidebar component itself needs styling updates */}
            <Sidebar
              sidebarTab={sidebarTab}
              setSidebarTab={setSidebarTab}
              chatMessages={chatMessages}
              chatbotLoading={chatbotLoading}
              handleChatSubmit={handleChatSubmit}
              chatInput={chatInput}
              setChatInput={setChatInput}
              saveChatToHistory={saveChatToHistory}
              chatHistory={chatHistory}
              loadChatFromHistory={loadChatFromHistory}
              deleteChatFromHistory={deleteChatFromHistory}
              handleWatchVideos={handleWatchVideos}
              ideasInput={ideasInput}
              setIdeasInput={setIdeasInput}
              generateAiFeature={generateAiFeature}
              aiLoading={aiLoading}
              projectIdeas={projectIdeas}
              codeInput={codeInput}
              setCodeInput={setCodeInput}
              codeSnippet={codeSnippet}
              notesInput={notesInput}
              setNotesInput={setNotesInput}
              projectNotes={projectNotes}
              setShowShareModal={setShowShareModal}
              planInput={planInput}
              setPlanInput={setPlanInput}
              projectPlan={projectPlan}
              videos={videos}
              videosLoading={videosLoading}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </motion.div>

          {/* Main Content (UPDATED: Glassmorphic Panel) */}
          <div className="flex-1 h-full overflow-y-auto">
            <motion.div 
              className="bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-purple-500/50 shadow-2xl shadow-purple-500/20 relative overflow-hidden h-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.005 }}
            >
              
              {/* Animated Background Elements (Adjusted colors for neon) */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-full blur-xl"
                />
                <motion.div
                  animate={{
                    rotate: -360,
                    scale: [1.2, 1, 1.2],
                  }}
                  transition={{
                    rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                    scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg blur-xl"
                />
              </div>

              {/* Project Image with Enhanced Animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative mb-6"
              >
                <motion.img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  // UPDATED: Border and shadow for image
                  className="w-full h-64 object-cover rounded-xl shadow-2xl border-2 border-white/10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Floating badges on image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute top-4 left-4"
                >
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedProject?.difficulty === 'Beginner' ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-500/30' :
                    selectedProject?.difficulty === 'Intermediate' ? 'bg-yellow-600/90 text-white shadow-md shadow-yellow-500/30' :
                    'bg-pink-600/90 text-white shadow-md shadow-pink-500/30'
                  } backdrop-blur-sm`}>
                    {selectedProject?.difficulty}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="absolute top-4 right-4 flex gap-2"
                >
                  {isFavourite(selectedProject?.id || '') && (
                    <div className="bg-pink-600/90 text-white p-2 rounded-full shadow-lg shadow-pink-500/50">
                      <Star size={12} className="fill-current" />
                    </div>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/90 text-white shadow-md shadow-indigo-500/30 backdrop-blur-sm">
                    {selectedProject?.category}
                  </span>
                </motion.div>
              </motion.div>

              {/* Enhanced Description with Animation */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gray-200 mb-6 leading-relaxed text-lg"
              >
                {selectedProject.description}
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-cyan-400">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm font-medium border border-indigo-500/30 shadow-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-cyan-400">Difficulty</h3>
                  <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                    selectedProject?.difficulty === 'Beginner' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30' :
                    selectedProject?.difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' :
                    'bg-red-900/50 text-red-300 border border-red-500/30'
                  } shadow-md`}>
                    {selectedProject?.difficulty}
                  </span>
                </div>
              </div>
              
              {/* Tutorials */}
              {selectedProject.content?.tutorials && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h3 className="text-xl font-bold mb-4 text-pink-400">Tutorials</h3>
                  <div className="space-y-2">
                    {selectedProject.content.tutorials.map(tutorial => (
                      <div key={tutorial.id} className="flex items-center gap-3 text-white">
                        <input type="checkbox" checked={tutorial.completed} readOnly className="rounded border-gray-700 bg-black/50 text-pink-500 focus:ring-pink-500" />
                        <span className={tutorial.completed ? 'line-through text-gray-500' : 'text-gray-100'}>{tutorial.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Components List for Science Projects */}
              {selectedProject && selectedProject.type === 'science' && selectedProject.content?.components && selectedProject.content.components.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h3 className="text-xl font-bold mb-4 text-cyan-400">Project Components</h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {selectedProject.content.components.map((component, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleComponentClick(component)}
                        className="px-4 py-2 bg-green-900/50 text-green-300 rounded-full hover:bg-green-800/80 transition-colors text-sm font-medium border border-green-500/30 shadow-md"
                        title={`Find stores selling ${component}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {component}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    onClick={async () => {
                      if (!selectedProject.content?.components) return;
                      // Note: Store functionality is not implemented yet
                      alert('Store search functionality is coming soon!');
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold shadow-lg shadow-purple-600/30"
                    title="Find stores selling all components"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Buy Components
                  </motion.button>

                  {showStoreModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                      <div className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative border border-white/10">
                        <button
                          onClick={() => setShowStoreModal(false)}
                          className="absolute top-4 right-4 text-gray-300 hover:text-white transition"
                          aria-label="Close"
                        >
                          ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Stores Selling Components</h2>
                        {storeSearchResults.length === 0 && <p className='text-gray-300'>No store data available.</p>}
                        {storeSearchResults.map(({ component, stores }, idx) => (
                          <div key={idx} className="mb-6 border-b border-gray-700 pb-3">
                            <h3 className="text-xl font-semibold mb-2 text-white">{component}</h3>
                            {stores.length === 0 ? (
                              <p className='text-gray-400'>No stores found for this component.</p>
                            ) : (
                              <ul className="list-disc list-inside space-y-2 max-h-48 overflow-y-auto text-gray-300">
                                {stores.map((store: any, sidx: number) => (
                                  <li key={sidx} className="pb-2">
                                    <a href={store.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                      {store.title}
                                    </a>
                                    <p className="text-sm text-gray-400">{store.snippet}</p>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <label htmlFor={`progress-${selectedProject.id}`} className="block text-lg font-bold text-gray-300 mb-2">
                  Progress: <span className='text-yellow-400'>{selectedProject.progress}%</span>
                </label>
                <progress
                  id={`progress-${selectedProject.id}`}
                  value={selectedProject.progress}
                  max={100}
                  className="w-full h-4 rounded-lg bg-gray-700 appearance-none overflow-hidden"
                  style={{ 
                    // Custom style for progress bar to look neon
                    WebkitAppearance: 'none', 
                    MozAppearance: 'none', 
                    background: 'linear-gradient(to right, #4c1d95, #c026d3)' 
                  }}
                />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetailView;