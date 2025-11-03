import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProjectsView from './ProjectsView';
import { ProjectTemplate, ChatMessage } from './types';
import { projectTemplates } from './ProjectTemplates';

const ProjectsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine type from URL path
  const type = location.pathname.includes('/software') ? 'software' : 'science';

  // State management
  const [view, setView] = useState<'software' | 'science'>(type);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectTemplate | null>(null);
  const [showLearningModeModal, setShowLearningModeModal] = useState(false);
  const [previousView, setPreviousView] = useState<'software' | 'science'>(type);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'chat'>('chat');

  // Color based on type
  const color = type === 'software' ? 'blue' : 'green';

  // Load favourites from localStorage
  useEffect(() => {
    const savedFavourites = localStorage.getItem('projectFavourites');
    if (savedFavourites) {
      setFavourites(JSON.parse(savedFavourites));
    }
  }, []);

  // Save favourites to localStorage
  useEffect(() => {
    localStorage.setItem('projectFavourites', JSON.stringify(favourites));
  }, [favourites]);

  // Filter projects based on type, difficulty, search query, and favourites
  const getFilteredProjects = (projectType: 'software' | 'science') => {
    let filtered = projectTemplates.filter(project => project.type === projectType);

    if (selectedDifficulty !== 'All Difficulties') {
      filtered = filtered.filter(project => project.difficulty === selectedDifficulty);
    }

    if (projectSearchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        project.skills.some(skill => skill.toLowerCase().includes(projectSearchQuery.toLowerCase()))
      );
    }

    if (showFavouritesOnly) {
      filtered = filtered.filter(project => favourites.includes(project.id));
    }

    return filtered;
  };

  // Favourite management
  const toggleFavourite = (projectId: string) => {
    setFavourites(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const isFavourite = (projectId: string) => favourites.includes(projectId);

  // Handle navigation back to menu
  const handleBackToMenu = () => {
    navigate('/project-builder');
  };

  const handleProjectClick = (project: ProjectTemplate) => {
    navigate(`/project-builder/${type}/${project.id}`);
  };

  return (
    <ProjectsView
      type={type}
      color={color}
      onProjectClick={handleProjectClick}
      setShowStoreModal={setShowStoreModal}
      getFilteredProjects={getFilteredProjects}
      selectedDifficulty={selectedDifficulty}
      setSelectedDifficulty={setSelectedDifficulty}
      projectSearchQuery={projectSearchQuery}
      setProjectSearchQuery={setProjectSearchQuery}
      showFavouritesOnly={showFavouritesOnly}
      setShowFavouritesOnly={setShowFavouritesOnly}
      favourites={favourites}
      toggleFavourite={toggleFavourite}
      isFavourite={isFavourite}
      setSelectedProject={setSelectedProject}
      setShowLearningModeModal={setShowLearningModeModal}
      setPreviousView={setPreviousView}
      setChatMessages={setChatMessages}
      setSidebarTab={setSidebarTab}
      view={view}
    />
  );
};

export default ProjectsPage;
