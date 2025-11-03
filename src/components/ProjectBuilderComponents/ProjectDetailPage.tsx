import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDetailView from './ProjectDetailView';
import { ProjectTemplate, ChatMessage } from './types';
import { projectTemplates } from './ProjectTemplates';
import { GeminiService } from '../../lib/gemini-service';
import { YouTubeService } from '../../lib/YouTubeService';
import { useThemeStore } from '../../store/theme'; // Import the theme store

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

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

  // Find the selected project
  const selectedProject = projectTemplates.find(project => project.id === projectId) || null;

  // State management
  const [view, setView] = useState<'landing' | 'software' | 'science'>('landing');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [storeSearchResults, setStoreSearchResults] = useState<any[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'history' | 'files' | 'video' | 'ideas' | 'code' | 'notes' | 'planner'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[][]>([]);
  const [ideasInput, setIdeasInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [projectIdeas, setProjectIdeas] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [planInput, setPlanInput] = useState('');
  const [projectPlan, setProjectPlan] = useState<string[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

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

  // Initialize chat with welcome message
  useEffect(() => {
    if (selectedProject) {
      const initialMessage: ChatMessage = {
        role: 'assistant',
        content: `Hi! I'm here to help you with your ${selectedProject.title} project. I can assist you with planning, coding, debugging, and answering any questions you have. What would you like to know?`,
        timestamp: new Date()
      };
      setChatMessages([initialMessage]);
    }
  }, [selectedProject]);

  // Favourite management
  const toggleFavourite = (projectId: string) => {
    setFavourites(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const isFavourite = (projectId: string) => favourites.includes(projectId);

  // Navigation handlers
  const handleBackNavigation = () => {
    const path = window.location.pathname;
    if (path.includes('/software/')) {
      navigate('/project-builder/software');
    } else if (path.includes('/science/')) {
      navigate('/project-builder/science');
    } else {
      navigate('/project-builder');
    }
  };

  const handleComponentClick = (componentName: string) => {
    // Handle component click - could open store search or similar
    console.log('Component clicked:', componentName);
  };

  // Chat handlers
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatbotLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setChatbotLoading(true);

    try {
      const context = selectedProject ?
        `Project: ${selectedProject.title}\nDescription: ${selectedProject.description}\nSkills: ${selectedProject.skills.join(', ')}\n\n` : '';

      const response = await GeminiService.generateText(context + currentInput);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      if (chatMessages.length >= 8) {
        setTimeout(() => saveChatToHistory(false), 1000);
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatbotLoading(false);
    }
  };

  const saveChatToHistory = (clearCurrent?: boolean) => {
    if (chatMessages.length > 0) {
      setChatHistory(prev => [...prev, chatMessages]);
      if (clearCurrent) {
        setChatMessages([]);
      }
    }
  };

  const loadChatFromHistory = (index: number) => {
    if (chatHistory[index]) {
      setChatMessages(chatHistory[index]);
    }
  };

  const deleteChatFromHistory = (index: number) => {
    setChatHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleWatchVideos = async () => {
    if (!selectedProject) return;

    setVideosLoading(true);
    try {
      const youtubeService = new YouTubeService('AIzaSyCpN2hq1WvTVIYmVx9bi2IdG_r0aAwGErE');
      const fetchedVideos = await youtubeService.searchVideos(selectedProject.title);

      if (fetchedVideos.length > 0) {
        setVideos(fetchedVideos);
        setSidebarTab('video');
      } else {
        setVideos([]);
        setSidebarTab('video');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
      setSidebarTab('video');
    } finally {
      setVideosLoading(false);
    }
  };

  const generateAiFeature = async (feature: 'ideas' | 'code' | 'notes' | 'plan', input?: string) => {
    let actualInput = input ?? '';
    if (feature === 'ideas') actualInput = ideasInput;
    if (feature === 'code') actualInput = codeInput;
    if (feature === 'notes') actualInput = notesInput;
    if (feature === 'plan') actualInput = planInput;

    if (!actualInput.trim() || aiLoading) return;

    if (feature === 'ideas') setProjectIdeas([]);
    if (feature === 'code') setCodeSnippet('');
    if (feature === 'notes') setProjectNotes('');
    if (feature === 'plan') setProjectPlan([]);

    setAiLoading(true);

    try {
      let response = '';
      switch(feature) {
        case 'ideas':
          const ideas = await generateIdeasResponse(actualInput);
          setProjectIdeas(ideas);
          break;
        case 'code':
          response = await generateCodeHelperResponse(actualInput);
          setCodeSnippet(response);
          break;
        case 'notes':
          const promptNotes = `You are an educational AI assistant helping children organize and understand project information. Analyze the following content and create comprehensive, structured notes:\n\nCONTENT TO ANALYZE: "${actualInput}"\n\nPROJECT CONTEXT: ${selectedProject ? `Project: ${selectedProject.title}, Skills: ${selectedProject.skills.join(', ')}, Difficulty: ${selectedProject.difficulty}` : 'General project context'}\n\nCreate structured notes with the following sections:\n\n1. **📋 KEY CONCEPTS** - Main ideas and important terms
2. **🎯 LEARNING OBJECTIVES** - What should be learned from this content
3. **📝 MAIN POINTS** - Summarized key information in bullet points
4. **🔗 CONNECTIONS** - How this relates to the project or other concepts
5. **❓ IMPORTANT QUESTIONS** - Key questions that arise from this content
6. **💡 STUDY TIPS** - How to remember and apply this information
7. **📚 RESOURCES NEEDED** - Materials or tools mentioned
8. **⏰ TIME ESTIMATES** - How long different parts might take\n\nFormat the response in a clear, organized way that's easy for children to read and study. Use emojis and formatting to make it engaging. Include practical examples and real-world applications where relevant.\n\nMake the notes comprehensive but not overwhelming - focus on the most important information that will help with the project.`;
          response = await GeminiService.generateText(promptNotes);
          setProjectNotes(response);
          break;
        case 'plan':
          const promptPlan = `You are an educational project planning assistant helping children create detailed, achievable project plans. Create a comprehensive project plan based on the following:\n\nPROJECT DESCRIPTION: "${actualInput}"\n${selectedProject ? `PROJECT DETAILS: Title: ${selectedProject.title}, Skills: ${selectedProject.skills.join(', ')}, Difficulty: ${selectedProject.difficulty}, Current Progress: ${selectedProject.progress}%` : ''}\n\nCreate a detailed project plan with the following structure:\n\n**🎯 PROJECT OVERVIEW**
- Project title and main goal
- Why this project is valuable to learn
- Expected learning outcomes\n\n**📋 DETAILED STEPS**
Break down the project into specific, actionable steps. Each step should include:
- Step number and title
- Detailed description of what to do
- Time estimate (in minutes/hours)
- Required materials or tools
- Skills needed for this step
- Potential challenges and how to overcome them
- Success criteria (how to know it's done correctly)\n\n**🛠️ MATERIALS & RESOURCES**
- Complete list of all materials needed
- Where to get materials (home, store, online)
- Cost estimates if applicable
- Alternative materials if originals aren't available\n\n**⏰ TIMELINE & MILESTONES**
- Total estimated time
- Suggested daily/weekly schedule
- Key milestones and checkpoints
- Flexibility for different paces\n\n**📚 LEARNING INTEGRATION**
- How each step builds skills
- Related concepts to research
- Extension activities for advanced learners
- Simplified versions for beginners\n\n**🔍 ASSESSMENT & NEXT STEPS**
- How to evaluate project success
- What to do if things don't go as planned
- Ideas for presenting or sharing the project
- Follow-up projects or related activities\n\n**⚠️ SAFETY & SUPERVISION NOTES**
- Any safety considerations
- When adult supervision is needed
- Age-appropriate modifications\n\nFormat this as a clear, step-by-step guide that's encouraging and supportive. Use emojis and formatting to make it engaging for children. Consider the child's age and skill level when creating the plan.`;
          response = await GeminiService.generateText(promptPlan);
          const lines = response.split('\n').filter((line: any) => line.trim());
          const steps = lines
            .filter((line: any) => /^\d+\./.test(line) || /^•/.test(line) || /^-/.test(line))
            .map((line: any) => line.replace(/^(\d+\.|•|\-)\s*/, '').trim())
            .filter((step: any) => step.length > 0);
          setProjectPlan(steps);
          break;
      }
    } catch (error) {
      console.error(`Error generating ${feature}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (feature === 'ideas') setProjectIdeas([`❌ Failed to generate ideas. Please check your internet connection and try again. Error: ${errorMessage}`]);
      if (feature === 'code') setCodeSnippet(`❌ Failed to generate code help. Please check your internet connection and try again. Error: ${errorMessage}`);
      if (feature === 'notes') setProjectNotes(`❌ Failed to generate notes summary. Please check your internet connection and try again. Error: ${errorMessage}`);
      if (feature === 'plan') setProjectPlan([`❌ Failed to generate project plan. Please check your internet connection and try again. Error: ${errorMessage}`]);
    } finally {
      setAiLoading(false);
    }
  };

  const generateIdeasResponse = async (input: string): Promise<string[]> => {
    if (!input.trim()) return [];
    try {
      const prompt = `Generate 5 creative and educational project ideas for children based on the following interests or keywords: "${input}".\n\nRequirements:
- Each idea should be suitable for children aged 8-14
- Include a mix of software and science projects
- Make ideas engaging and age-appropriate
- Focus on learning through fun activities
- Consider safety and supervision needs\n\nFormat each idea as a brief title followed by a short description (2-3 sentences).
Separate each idea with a blank line.`;

      const response = await GeminiService.generateText(prompt);

      const ideas = response.split('\n\n').filter(idea => idea.trim().length > 0);

      return ideas.map(idea => idea.trim()).filter(idea => idea.length > 0);
    } catch (error) {
      console.error('Error generating ideas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return [`❌ Failed to generate ideas. Please check your internet connection and try again. Error: ${errorMessage}`];
    }
  };

  const generateCodeHelperResponse = async (input: string): Promise<string> => {
    if (!input.trim()) return '';
    try {
      const prompt = `You are a helpful coding assistant for children learning to program.\n\nThe child has asked for help with: "${input}"\n\nPlease provide:
1. A clear, simple explanation of the concept or solution
2. Working code example (if applicable)
3. Step-by-step instructions
4. Common mistakes to avoid
5. Tips for testing and debugging\n\nKeep the language simple and encouraging. Use age-appropriate examples.\nIf this involves debugging, explain what might be wrong and how to fix it.
If this is a new concept, start with basics and build up.\n\nFormat your response with clear sections and code blocks where appropriate.`;

      const response = await GeminiService.generateText(prompt);
      return response || 'Sorry, I couldn\'t generate a response. Please try rephrasing your question.';
    } catch (error) {
      console.error('Error generating code snippet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `❌ Failed to generate code help. Please check your internet connection and try again. Error: ${errorMessage}`;
    }
  };

  if (!selectedProject) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden text-white"
        style={{
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-0"></div>

        <div className="text-center relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
          <p className="text-gray-200 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={handleBackNavigation}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectDetailView
      selectedProject={selectedProject}
      previousView={view}
      setView={setView}
      isFavourite={isFavourite}
      handleBackNavigation={handleBackNavigation}
      handleComponentClick={handleComponentClick}
      isLoadingStores={false}
      showStoreModal={showStoreModal}
      setShowStoreModal={setShowStoreModal}
      storeSearchResults={storeSearchResults}
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
      setVideos={setVideos}
      setVideosLoading={setVideosLoading}
      currentBackground={currentBackground} // Pass the background prop
    />
  );
};

export default ProjectDetailPage;