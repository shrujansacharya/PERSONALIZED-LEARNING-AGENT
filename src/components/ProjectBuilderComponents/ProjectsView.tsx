import React, { useState, useEffect } from 'react'; // Added useState and useEffect
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
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prevIndex => (prevIndex + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [theme.backgrounds]);

  const currentBackground = theme.backgrounds?.[currentBackgroundIndex] || '';
  // --- Theme Integration End ---

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-0"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (window.location.href = '/create')}
              className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-white">
              {type.charAt(0).toUpperCase() + type.slice(1)} Projects
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowStoreModal(true)}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white"
            >
              <option className="bg-gray-900 text-white">All Difficulties</option>
              <option className="bg-gray-900 text-white">Beginner</option>
              <option className="bg-gray-900 text-white">Intermediate</option>
              <option className="bg-gray-900 text-white">Advanced</option>
            </select>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search here..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder:text-gray-400"
              />
              {projectSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProjectSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white focus:outline-none"
                  aria-label="Clear search"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                showFavouritesOnly
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20 border border-white/20'
              }`}
            >
              <Star
                size={20}
                className={showFavouritesOnly ? 'fill-current' : ''}
              />
              {showFavouritesOnly ? 'Show All' : 'Favourites'} ({favourites.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ perspective: '1000px' }}>
          {getFilteredProjects(type).map((project) => (
            <div
              key={project.id}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-md overflow-hidden cursor-pointer transform-gpu transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => onProjectClick(project)}
            >
              <div className="overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
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
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    project.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                    project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {project.difficulty}
                  </span>
                  <div className="flex gap-2">
                    {project.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-white/20 text-gray-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 2 && <span className="px-2 py-1 bg-white/20 text-gray-200 text-xs rounded-full">+{project.skills.length - 2}</span>}
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
                    className="w-full h-4 rounded-lg bg-white/20" // Simplified styling for progress bar
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavourite(project.id);
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isFavourite(project.id)
                        ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' // Active state is fine
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                    title={isFavourite(project.id) ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <Star
                      size={16}
                      className={isFavourite(project.id) ? 'fill-current' : ''}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setShowLearningModeModal(true);
                    }}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Start Learning
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                      setShowStoreModal(true);
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {getFilteredProjects(type).length === 0 && (
          <div className="text-center py-16">
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