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
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 5000);
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
          transition: 'background-image 1s ease-in-out',
        }}
      >
        {/* Changed bg-opacity-50 to bg-opacity-60 */}
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-xl">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">No project selected</h2>
          <p className="text-gray-200 mb-4">Please select a project to view its details.</p>
          <button
            onClick={() => setView(previousView)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back
          </button>
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
        transition: 'background-image 1s ease-in-out',
      }}
    >
      {/* Changed bg-opacity-50 to bg-opacity-60 */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>

      <div className="relative z-10 h-full w-full p-4 flex flex-col">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors bg-black/20 backdrop-blur-sm p-2 rounded-lg"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-2xl font-bold text-white drop-shadow-md">
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

          {/* Main Content */}
          <div className="flex-1 h-full overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg relative overflow-hidden h-full">
              
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-5">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-sm"
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
                  className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg blur-sm"
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
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedProject?.difficulty === 'Beginner' ? 'bg-green-500 text-white' :
                    selectedProject?.difficulty === 'Intermediate' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  } shadow-lg`}>
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
                    <div className="bg-red-500 text-white p-1 rounded-full shadow-lg">
                      <Star size={12} className="fill-current" />
                    </div>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-lg">
                    {selectedProject?.category}
                  </span>
                </motion.div>
              </motion.div>

              {/* Enhanced Description with Animation */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
              >
                {selectedProject.description}
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Difficulty</h3>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    selectedProject?.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                    selectedProject?.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {selectedProject?.difficulty}
                  </span>
                </div>
              </div>
              
              {/* Tutorials */}
              {selectedProject.content?.tutorials && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tutorials</h3>
                  <div className="space-y-2">
                    {selectedProject.content.tutorials.map(tutorial => (
                      <div key={tutorial.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={tutorial.completed} readOnly className="rounded" />
                        <span className={tutorial.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}>{tutorial.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Components List for Science Projects */}
              {selectedProject && selectedProject.type === 'science' && selectedProject.content?.components && selectedProject.content.components.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Components</h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {selectedProject.content.components.map((component, index) => (
                      <button
                        key={index}
                        onClick={() => handleComponentClick(component)}
                        className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
                        title={`Find stores selling ${component}`}
                      >
                        {component}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      if (!selectedProject.content?.components) return;
                      // Note: Store functionality is not implemented yet
                      alert('Store search functionality is coming soon!');
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    title="Find stores selling all components"
                  >
                    Buy Components
                  </button>

                  {showStoreModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
                        <button
                          onClick={() => setShowStoreModal(false)}
                          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                          aria-label="Close"
                        >
                          ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Stores Selling Components</h2>
                        {storeSearchResults.length === 0 && <p>No store data available.</p>}
                        {storeSearchResults.map(({ component, stores }, idx) => (
                          <div key={idx} className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">{component}</h3>
                            {stores.length === 0 ? (
                              <p>No stores found for this component.</p>
                            ) : (
                              <ul className="list-disc list-inside space-y-2 max-h-48 overflow-y-auto">
                                {stores.map((store: any, sidx: number) => (
                                  <li key={sidx} className="border-b border-gray-200 pb-2">
                                    <a href={store.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {store.title}
                                    </a>
                                    <p className="text-sm text-gray-600">{store.snippet}</p>
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
              <div className="mt-6">
                <label htmlFor={`progress-${selectedProject.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Progress: {selectedProject.progress}%
                </label>
                <progress
                  id={`progress-${selectedProject.id}`}
                  value={selectedProject.progress}
                  max={100}
                  className="w-full h-4 rounded-lg bg-gray-200 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetailView;