import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Gamepad, Puzzle, BookOpen } from 'lucide-react';
import { GeminiService } from '../lib/gemini-service';
import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    {
      title: 'Answer Quiz',
      description: 'Test your knowledge with a random general knowledge quiz',
      icon: Star,
      path: '/quizpage',
      content: '',
      id: 'quiz',
      progress: 0,
    },
    {
      title: 'Word Puzzle',
      description: 'Solve a randomly generated word puzzle',
      icon: Puzzle,
      path: '/puzzle',
      content: '',
      id: 'puzzle',
      progress: 0,
    },
    {
      title: 'Mini Games',
      description: 'Play a randomly generated educational mini game',
      icon: Gamepad,
      path: '/games',
      content: '',
      id: 'games',
      progress: 0,
    },
    {
      title: 'Reading Challenge',
      description: 'Engage with a random reading comprehension task',
      icon: BookOpen,
      path: '/reading',
      content: '',
      id: 'reading',
      progress: 0,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasksData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        let userProgress: Record<string, number> = {};
        if (user) {
          const userDocRef = doc(db, 'profiles', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data();
            userProgress = profileData.tasks_progress || {};
          }
        }
        const updatedTasks = await Promise.all(
          tasks.map(async (task) => {
            try {
              const prompt = `Generate a brief, unique daily task description for: ${task.title}. Max 20 words.`;
              const content = await GeminiService.generateText(prompt);
              return {
                ...task,
                content,
                progress: userProgress[task.id] || 0
              };
            } catch (error) {
              console.error(`Error fetching content for ${task.title}:`, error);
              return {
                ...task,
                progress: userProgress[task.id] || 0
              };
            }
          })
        );
        setTasks(updatedTasks);
      } catch (error) {
        console.error('Error fetching tasks data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasksData();
  }, []);

  const handleTaskClick = (path: string) => {
    navigate(path);
  };

  const handleGoToMenu = () => {
    navigate('/explore-menu');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-xl">Loading daily tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col items-center">
      <h1 className="text-5xl font-bold mb-8">Tasks</h1>
      <p className="mb-6 text-lg max-w-xl text-center">
        Choose a task to complete. After finishing, you can proceed to the Explore Menu.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <button
              key={task.path}
              onClick={() => handleTaskClick(task.path)}
              className="bg-white/20 rounded-xl p-6 flex flex-col items-start gap-4 hover:bg-white/30 transition-colors shadow-lg"
            >
              <div className="flex items-center gap-4 w-full">
                <Icon className="w-12 h-12 text-yellow-400" />
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold">{task.title}</h2>
                  <p className="text-sm text-white/80">{task.description}</p>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(task.progress, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-yellow-300 font-medium">
                        {Math.round(task.progress)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {task.content && (
                <p className="mt-2 text-sm text-yellow-300 italic max-w-full line-clamp-3">
                  {task.content}
                </p>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleGoToMenu}
        className="mt-12 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
      >
        Go to Explore Menu
      </button>
    </div>
  );
};

export default TasksPage;