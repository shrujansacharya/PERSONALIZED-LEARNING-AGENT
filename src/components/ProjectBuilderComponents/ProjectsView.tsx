import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Search, X, Star } from 'lucide-react';
import { ProjectTemplate, ChatMessage } from './types';
import { useThemeStore } from '../../store/theme'; // Import the theme store

interface ProjectsViewProps {
  type: 'software' | 'science';
  color: string;
  onProjectClick: (project: ProjectTemplate) => void;
  setShowStoreModal: (show: boolean) => void;
  getFilteredProjects: (type: 'software' | 'science') => ProjectTemplate[];
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  projectSearchQuery: string;
  setProjectSearchQuery: (query: string) => void;
  showFavouritesOnly: boolean;
  setShowFavouritesOnly: (show: boolean) => void;
  favourites: string[];
  toggleFavourite: (projectId: string) => void;
  isFavourite: (projectId: string) => boolean;
  setSelectedProject: (project: ProjectTemplate) => void;
  setShowLearningModeModal: (show: boolean) => void;
  setPreviousView: (view: 'software' | 'science') => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setSidebarTab: (tab: 'chat') => void;
  view: 'software' | 'science';
}

const ProjectsView: React.FC<ProjectsViewProps> = ({
  type,
  color,
  onProjectClick,
  setShowStoreModal,
  getFilteredProjects,
  selectedDifficulty,
  setSelectedDifficulty,
  projectSearchQuery,
  setProjectSearchQuery,
  showFavouritesOnly,
  setShowFavouritesOnly,
  favourites,
  toggleFavourite,
  isFavourite,
  setSelectedProject,
  setShowLearningModeModal,
  setPreviousView,
  setChatMessages,
  setSidebarTab,
  view
}) => {
  // --- Theme Integration Start ---
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
  // --- Theme Integration End ---

  // Determine accent color for neon based on project type
  const accentColor = type === 'software' ? 'cyan' : 'emerald';
  const shadowColor = type === 'software' ? 'cyan' : 'green';

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1.2s ease-in-out', // UPDATED
      }}
    >
      {/* Background Overlay (UPDATED: Deeper, cosmic gradient overlay + blur) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md z-0"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            {/* Back Button (UPDATED: Glassmorphic, neon hover) */}
            <motion.button
              onClick={() => (window.location.href = '/project-builder')}
              className="flex items-center gap-2 text-gray-200 hover:text-cyan-400 transition-colors bg-black/40 backdrop-blur-lg p-3 rounded-xl border border-indigo-400/30 hover:border-cyan-400/50 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              Back to Builder
            </motion.button>
            <h1 className="text-4xl font-black text-white drop-shadow-lg">
              {type.charAt(0).toUpperCase() + type.slice(1)} Projects
            </h1>
          </div>
          <div className="flex gap-4">
            {/* Store Button (UPDATED: Glassmorphic, neon hover) */}
            <motion.button
              onClick={() => setShowStoreModal(true)}
              className="p-3 bg-black/40 backdrop-blur-lg rounded-full text-white hover:bg-white/10 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-purple-500/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingCart size={20} className='text-purple-300' />
            </motion.button>
          </div>
        </div>

        {/* Filters (UPDATED: Glassmorphic container) */}
        <div className={`bg-black/40 backdrop-blur-lg border border-${accentColor}-500/30 rounded-xl p-4 mb-8 shadow-2xl shadow-${shadowColor}-500/20`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Difficulty Select (UPDATED: Glassmorphic input) */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 px-4 py-3 border border-white/20 rounded-xl bg-black/40 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
            >
              <option className="bg-gray-900 text-white">All Difficulties</option>
              <option className="bg-gray-900 text-white">Beginner</option>
              <option className="bg-gray-900 text-white">Intermediate</option>
              <option className="bg-gray-900 text-white">Advanced</option>
            </select>
            {/* Search Input (UPDATED: Glassmorphic input) */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search here..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-white/20 rounded-xl bg-black/40 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
              />
              {projectSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProjectSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                  aria-label="Clear search"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Favourites Button (UPDATED: Neon Toggle) */}
            <motion.button
              onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 shadow-md ${
                showFavouritesOnly
                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-pink-500/40'
                  : 'bg-black/40 text-gray-200 hover:bg-white/10 border border-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star
                size={20}
                className={showFavouritesOnly ? 'fill-current text-yellow-300' : 'text-yellow-400'}
              />
              {showFavouritesOnly ? 'Show All' : 'Favourites'} ({favourites.length})
            </motion.button>
          </div>
        </div>

        {/* Project Grid (PERSPECTIVE REMOVED HERE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {getFilteredProjects(type).map((project, index) => (
            <motion.div
              key={project.id}
              // Base styling for the card
              className={`bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl shadow-xl overflow-hidden cursor-pointer transform-gpu transition-all duration-300`}
              onClick={() => onProjectClick(project)}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              // MODIFIED: Only straight scale and shadow on hover (No rotateX/Y)
              whileHover={{ 
                scale: 1.03, 
                boxShadow: `0 25px 50px -12px rgba(52, 211, 153, 0.3)` 
              }}
            >
              <div className="overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  {/* Difficulty Tag */}
                  <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                    project.difficulty === 'Beginner' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30' :
                    project.difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' :
                    'bg-red-900/50 text-red-300 border border-red-500/30'
                  }`}>
                    {project.difficulty}
                  </span>
                  <div className="flex gap-2">
                    {project.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-white/10 text-gray-200 text-xs rounded-full border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 2 && <span className="px-2 py-1 bg-white/10 text-gray-200 text-xs rounded-full border border-white/5">+{project.skills.length - 2}</span>}
                  </div>
                </div>
                {/* Project progress tracking */}
                <div className="mb-4">
                  <label htmlFor={`progress-${project.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                    Progress: {project.progress}%
                  </label>
                  <progress
                    id={`progress-${project.id}`}
                    value={project.progress}
                    max={100}
                    // UPDATED: Progress bar style to fit neon aesthetic
                    className="w-full h-4 rounded-lg bg-gray-700/50 appearance-none overflow-hidden"
                    style={{ 
                      WebkitAppearance: 'none', 
                      MozAppearance: 'none', 
                      background: 'linear-gradient(to right, #4c1d95, #c026d3)' 
                    }}
                  />
                </div>
                <div className="flex gap-3">
                  {/* Favourite Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavourite(project.id);
                    }}
                    className={`p-3 rounded-lg transition-all duration-200 shadow-md ${
                      isFavourite(project.id)
                        ? 'bg-pink-600/80 text-white shadow-pink-600/30' 
                        : 'bg-black/40 text-gray-300 hover:bg-white/10 border border-white/20'
                    }`}
                    title={isFavourite(project.id) ? 'Remove from favourites' : 'Add to favourites'}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star
                      size={18}
                      className={isFavourite(project.id) ? 'fill-current text-yellow-300' : 'text-yellow-400'}
                    />
                  </motion.button>
                  {/* Start Learning Button (UPDATED: Neon Gradient) */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setShowLearningModeModal(true);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 text-sm font-bold shadow-md shadow-indigo-600/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Learning
                  </motion.button>
                  {/* Buy Components Button (UPDATED: Neon Gradient) */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setShowStoreModal(true);
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 text-sm font-bold shadow-md shadow-purple-600/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {getFilteredProjects(type).length === 0 && (
          <div className="text-center py-16 bg-black/40 backdrop-blur-lg rounded-xl mt-8 border border-white/10 shadow-lg">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-xl text-gray-200">No projects found</p>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;