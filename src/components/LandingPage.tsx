import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Sparkles, Zap, Heart, Star, Trophy, Users, BookOpen, Target, Rocket, Brain, Globe, Palette, Microscope, Crown } from 'lucide-react';

interface NotificationBellProps {
  notifications: any[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications }) => (
  <div className="relative">
    <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-500 transition-colors" />
    {notifications.length > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </div>
);

const themeBackgrounds: Record<string, string> = {
  cricket: "An ultra-detailed 3D render of an intense cricket moment — a batsman hitting the ball mid-swing, stumps flying, and the red leather ball glowing in motion. High contrast, vivid colors, cinematic lighting, hyper-realistic.",
  space: "A breathtaking 3D render of outer space with glowing planets, radiant nebulae, asteroid belts, and a futuristic spaceship. Neon cosmic colors, cinematic depth, Unreal Engine style.",
  nature: "A vibrant 3D render of an enchanted glowing forest with colorful flowers, luminous plants, flowing waterfalls, and friendly animals. Magical atmosphere, ultra-detailed textures.",
  science: "A futuristic 3D render of a glowing science lab filled with robots, holographic screens, neon circuits, and colorful experiments. Hyper-detailed sci-fi design.",
  art: "A surreal and colorful 3D render of a creative art studio with floating glowing paint strokes, vibrant sculptures, and radiant masterpieces suspended in the air. Dreamlike surrealism.",
  history: "A dramatic 3D render combining vivid historical moments — knights, pyramids, dinosaurs, and temples — blended in a cinematic fantasy scene. Rich textures, vibrant colors.",
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState('');
  const [themeBg, setThemeBg] = useState<string | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    setNotifications([{ id: 1, message: 'Welcome to LearnMyWay!' }]);
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
          
          if (entry.target.id === 'modes') {
            const swipeCards = entry.target.querySelectorAll('.swipe-card');
            swipeCards.forEach(card => card.classList.add('animate-in'));
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
      (section as HTMLElement).style.opacity = '0';
      (section as HTMLElement).style.transform = 'translateY(30px)';
      (section as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(section);
    });

    const homeSection = document.querySelector('#home') as HTMLElement;
    if (homeSection) {
      homeSection.style.opacity = '1';
      homeSection.style.transform = 'translateY(0)';
    }

    const handleMouseMove = (e: MouseEvent) => {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.innerHTML = '✨';
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      sparkle.style.fontSize = `${Math.random() * 10 + 15}px`;
      
      document.body.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 1000);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`relative min-h-screen ${darkMode ? 'dark' : ''}`}>
      <style>{`
        * {
            font-family: 'Baloo 2', cursive;
        }
        .gradient-bg {
            background: linear-gradient(-45deg, #38BDF8, #9AE6B4, #F6AD55, #D6BCFA);
            background-size: 400% 400%;
            animation: gradientShift 8s ease-in-out infinite;
        }
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .floating-icon {
            animation: float 6s ease-in-out infinite;
        }
        .floating-icon:nth-child(2) { animation-delay: -2s; }
        .floating-icon:nth-child(3) { animation-delay: -4s; }
        .floating-icon:nth-child(4) { animation-delay: -1s; }
        .floating-icon:nth-child(5) { animation-delay: -3s; }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(5deg); }
            66% { transform: translateY(-10px) rotate(-3deg); }
        }
        .bounce-in { animation: bounceIn 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }
        .slide-card { transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .slide-card:hover { transform: translateY(-12px) scale(1.04); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
        .swipe-card { opacity: 0; transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .swipe-card:nth-child(1) { transform: translateX(-100px); transition-delay: 0.3s; }
        .swipe-card:nth-child(2) { transform: translateX(100px); transition-delay: 0.7s; }
        .swipe-card:nth-child(3) { transform: translateX(-100px); transition-delay: 1.2s; }
        .swipe-card.animate-in { opacity: 1; transform: translateX(0); }
        .theme-card { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .theme-card:hover { transform: scale(1.07) rotate(3deg); }
        .theme-section { 
          transition: background 1s cubic-bezier(0.4, 0, 0.2, 1); 
          background-size: cover !important;
          background-position: center !important;
        }
        .theme-space { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #000000 100%); }
        .theme-cricket { background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%); }
        .theme-art { background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); }
        .theme-nature { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); }
        .theme-science { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); }
        .theme-history { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%); }
        .career-icon { animation: pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }
        .progress-path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawPath 4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes drawPath { to { stroke-dashoffset: 0; } }
        .theme-bg-element { position: absolute; pointer-events: none; opacity: 0; transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .theme-bg-element.active { opacity: 0.3; }
        .nature-leaf { animation: leafFloat 5s ease-in-out infinite; }
        .nature-flower { animation: flowerSway 4s ease-in-out infinite; }
        .art-brush { animation: brushStroke 3s ease-in-out infinite; }
        .art-color { animation: colorSplash 4s ease-in-out infinite; }
        .cricket-bat { animation: batSwing 3s ease-in-out infinite; }
        .cricket-ball { animation: ballBounce 3s ease-in-out infinite; }
        @keyframes leafFloat { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(10deg); } }
        @keyframes flowerSway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes brushStroke { 0%, 100% { transform: rotate(-10deg) translateY(0px); } 50% { transform: rotate(10deg) translateY(-10px); } }
        @keyframes colorSplash { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        @keyframes batSwing { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
        @keyframes ballBounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .nav-link { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .nav-link:hover { transform: translateY(-3px); color: #FACC15; }
        .sparkle { position: fixed; pointer-events: none; z-index: 9999; animation: sparkleAnim 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes sparkleAnim {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            100% { transform: scale(1) rotate(180deg); opacity: 0; }
        }
        .science-dna { animation: dnaRotate 5s ease-in-out infinite; }
        .science-scope { animation: scopeMove 4s ease-in-out infinite; }
        .history-book { animation: bookFlip 4s ease-in-out infinite; }
        .history-glass { animation: glassMove 3.5s ease-in-out infinite; }
      `}</style>

      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 shadow-2xl border-b border-white/20 dark:bg-gray-900/80 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🚀</span>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                LearnMyWay
              </span>
            </div>
            <div className="hidden md:flex space-x-1 items-center">
              {[
                { name: 'Home', id: 'home' },
                { name: 'Modes', id: 'modes' },
                { name: 'Themes', id: 'themes' },
                { name: 'Careers', id: 'careers' },
                { name: 'About', id: 'about' }
              ].map((item) => (
                <a
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="nav-link relative px-4 py-2 text-gray-700 font-medium dark:text-gray-300 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 group"
                >
                  {item.name}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              ))}
              <div className="mx-2">
                <NotificationBell notifications={notifications} />
              </div>
              <button
                onClick={toggleDarkMode}
                className="relative p-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900 dark:hover:to-purple-900 transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                {darkMode ?
                  <Sun className="h-6 w-6 text-yellow-400 relative z-10" /> :
                  <Moon className="h-6 w-6 text-gray-600 dark:text-gray-300 relative z-10" />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="gradient-bg min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Enhanced floating elements with more variety */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-icon absolute top-20 left-10 text-6xl animate-pulse">📚</div>
          <div className="floating-icon absolute top-32 right-20 text-5xl animate-bounce">🚀</div>
          <div className="floating-icon absolute bottom-40 left-20 text-4xl animate-spin">✏</div>
          <div className="floating-icon absolute bottom-20 right-10 text-6xl animate-ping">✨</div>
          <div className="floating-icon absolute top-1/2 left-1/3 text-5xl animate-pulse">🌟</div>
          <div className="floating-icon absolute top-1/4 right-1/4 text-4xl animate-bounce">🎯</div>
          <div className="floating-icon absolute bottom-1/4 left-1/4 text-5xl animate-spin">🎨</div>
          <div className="floating-icon absolute top-3/4 right-10 text-4xl animate-ping">🔬</div>
        </div>

        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="text-center z-10 px-4 max-w-5xl mx-auto relative">
          {/* Main heading with enhanced typography */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 bounce-in bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
              Welcome to LearnMyWay
            </h1>
            <div className="absolute -top-4 -right-4 text-6xl animate-bounce">🚀</div>
            <div className="absolute -bottom-4 -left-4 text-4xl animate-spin">✨</div>
          </div>

          {/* Enhanced subtitle */}
          <p className="text-2xl md:text-3xl text-white/95 mb-6 bounce-in font-semibold" style={{ animationDelay: '0.2s' }}>
            Where Learning Feels Like Play! 🎮
          </p>

          {/* Enhanced description */}
          <p className="text-xl md:text-2xl text-white/85 mb-12 bounce-in max-w-4xl mx-auto leading-relaxed" style={{ animationDelay: '0.4s' }}>
            A magical space where Students, Teachers, and Parents connect, share, and grow together in an exciting learning adventure! 🌟
          </p>

          {/* Enhanced CTA buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center bounce-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => scrollToSection('modes')}
              className="group relative bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                🎓 Explore as Student
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </span>
            </button>

            <button
              onClick={() => scrollToSection('modes')}
              className="group relative bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                👩‍🏫 Enter Teacher Mode
                <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </span>
            </button>

            <button
              onClick={() => scrollToSection('modes')}
              className="group relative bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                💝 Parent Dashboard
                <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </span>
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="modes" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-teal-200/30 rounded-full animate-spin"></div>
          <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-orange-200/30 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-pink-200/30 rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="relative inline-block">
              <h2 className="text-4xl md:text-6xl font-black text-gray-800 dark:text-white mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                🦸 Choose Your Superpower
              </h2>
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce">⚡</div>
              <div className="absolute -bottom-2 -left-2 text-3xl animate-spin">✨</div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-semibold">Discover your learning adventure!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="swipe-card slide-card group relative bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 rounded-3xl p-8 text-white text-center transform hover:scale-105 hover:-translate-y-4 transition-all duration-500 shadow-2xl hover:shadow-teal-500/25 overflow-hidden">
              {/* Card background animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 text-2xl animate-bounce">🎓</div>
              <div className="absolute bottom-4 left-4 text-xl animate-pulse">⭐</div>

              <div className="relative z-10">
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🎓</div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-yellow-200 transition-colors duration-300">Student Power</h3>
                <p className="text-lg leading-relaxed mb-6">
                  Step into your own learning world! Play with themes, solve challenges, chat with your study buddy, and explore your dream career — all while having fun!
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="group/btn relative bg-white text-teal-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-blue-100 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Start Learning 🚀
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-ping"></div>
                  </span>
                </button>
              </div>
            </div>

            {/* Teacher Card */}
            <div className="swipe-card slide-card group relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-3xl p-8 text-white text-center transform hover:scale-105 hover:-translate-y-4 transition-all duration-500 shadow-2xl hover:shadow-orange-500/25 overflow-hidden">
              {/* Card background animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 text-2xl animate-bounce">📚</div>
              <div className="absolute bottom-4 left-4 text-xl animate-pulse">🎯</div>

              <div className="relative z-10">
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">👩‍🏫</div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-yellow-200 transition-colors duration-300">Teacher Power</h3>
                <p className="text-lg leading-relaxed mb-6">
                  Track lessons, update completed topics, and collaborate with students. Teaching is now interactive, visual, and engaging!
                </p>
                <button
                  onClick={() => navigate('/teacher')}
                  className="group/btn relative bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-red-100 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Teach Now 📚
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping"></div>
                  </span>
                </button>
              </div>
            </div>

            {/* Parent Card */}
            <div className="swipe-card slide-card group relative bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-3xl p-8 text-white text-center transform hover:scale-105 hover:-translate-y-4 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 overflow-hidden">
              {/* Card background animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 text-2xl animate-bounce">💝</div>
              <div className="absolute bottom-4 left-4 text-xl animate-pulse">🌟</div>

              <div className="relative z-10">
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">👨‍👩‍👧‍👦</div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-yellow-200 transition-colors duration-300">Parent Power</h3>
                <p className="text-lg leading-relaxed mb-6">
                  Stay in the loop with your child's learning journey. See completed portions, check progress, and cheer them on every step!
                </p>
                <button
                  onClick={() => navigate('/parent')}
                  className="group/btn relative bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Track Progress 📈
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></div>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom decorative elements */}
          <div className="flex justify-center mt-12 space-x-4">
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </section>

      <section
        id="themes"
        className="theme-section py-20 relative overflow-hidden"
        style={{
          background: themeBg ? `url("https://image.pollinations.ai/prompt/${encodeURIComponent(themeBg)}")` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dynamic overlay based on active theme */}
        <div className={`absolute inset-0 transition-all duration-1000 ${activeTheme ? 'bg-black/40' : 'bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-pink-900/80'}`}></div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="relative mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
              🎨 Learn the Way YOU Love ✨
            </h2>
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🌟</div>
            <div className="absolute -bottom-4 -left-4 text-3xl animate-spin">🎭</div>
          </div>

          <p className="text-xl md:text-2xl text-white/90 mb-12 font-semibold drop-shadow-lg">
            Hover on a theme and watch the magic happen! ✨
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.keys(themeBackgrounds).map((theme, index) => (
              <div
                key={theme}
                className="group relative rounded-3xl p-8 text-white text-center cursor-pointer transition-all duration-500 transform hover:scale-110 hover:-translate-y-6 overflow-hidden shadow-2xl"
                style={{
                  background: activeTheme === theme ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)',
                  border: activeTheme === theme ? '2px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.2)',
                  animationDelay: `${index * 0.2}s`
                }}
                onMouseEnter={() => {
                  setActiveTheme(theme);
                  setThemeBg(themeBackgrounds[theme]);
                }}
                onMouseLeave={() => {
                  setActiveTheme('');
                  setThemeBg(null);
                }}
              >
                {/* Card background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/50 transition-all duration-300"></div>

                {/* Floating elements */}
                <div className="absolute top-4 right-4 text-2xl animate-bounce opacity-60 group-hover:opacity-100 transition-opacity">
                  {theme === 'cricket' && '⚡'}
                  {theme === 'space' && '🚀'}
                  {theme === 'nature' && '🌸'}
                  {theme === 'science' && '⚗️'}
                  {theme === 'art' && '🎨'}
                  {theme === 'history' && '📜'}
                </div>

                <div className="absolute bottom-4 left-4 text-xl animate-pulse opacity-60 group-hover:opacity-100 transition-opacity">
                  {theme === 'cricket' && '🏆'}
                  {theme === 'space' && '⭐'}
                  {theme === 'nature' && '🌿'}
                  {theme === 'science' && '🔬'}
                  {theme === 'art' && '🖌️'}
                  {theme === 'history' && '🏛️'}
                </div>

                <div className="relative z-10">
                  <div className={`text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 ${activeTheme === theme ? 'animate-bounce' : ''}`}>
                    {theme === 'cricket' && '🏏'}
                    {theme === 'space' && '🌌'}
                    {theme === 'nature' && '🌿'}
                    {theme === 'science' && '🔬'}
                    {theme === 'art' && '🎨'}
                    {theme === 'history' && '🏛️'}
                  </div>

                  <h3 className={`text-2xl md:text-3xl font-bold capitalize mb-4 transition-colors duration-300 ${activeTheme === theme ? 'text-gray-800' : 'text-white'}`}>
                    {theme} Theme
                  </h3>

                  <p className={`text-lg leading-relaxed transition-colors duration-300 ${activeTheme === theme ? 'text-gray-600' : 'text-white/90'}`}>
                    Make learning fun with {theme} adventures!
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-sm font-semibold">Click to explore</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>

                {/* Ripple effect on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{
                       background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                       animation: 'ripple 1s ease-out'
                     }}>
                </div>
              </div>
            ))}
          </div>

          {/* Theme preview indicator */}
          {activeTheme && (
            <div className="mt-12 animate-fade-in">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3">
                <span className="text-lg font-semibold text-white">🌟 Exploring {activeTheme} theme...</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom decorative elements */}
          <div className="flex justify-center mt-16 space-x-6">
            <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>

        <style>{`
          @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>

      <section id="careers" className="py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-200/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-orange-200/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-red-200/20 rounded-full animate-spin"></div>
          <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-pink-200/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-purple-200/20 rounded-full animate-pulse"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="relative inline-block">
              <h2 className="text-4xl md:text-6xl font-black text-gray-800 dark:text-white mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">
                🚀 Dream Big. Start Early.
              </h2>
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce">⭐</div>
              <div className="absolute -bottom-4 -left-4 text-3xl animate-spin">🌟</div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-semibold">Explore careers with mini roadmaps, fun facts, and stories!</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* AI Scientist Card */}
            <div className="group relative bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-4 dark:bg-gray-800 overflow-hidden">
              {/* Card background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-blue-900/20 dark:to-purple-900/20"></div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-300 transition-all duration-300"></div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 text-2xl animate-bounce opacity-60 group-hover:opacity-100 transition-opacity">⚡</div>
              <div className="absolute bottom-4 left-4 text-xl animate-pulse opacity-60 group-hover:opacity-100 transition-opacity">🤖</div>

              <div className="relative z-10">
                <div className="career-icon text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce">🤖</div>
                <h4 className="font-black text-xl md:text-2xl text-gray-800 dark:text-white mb-4 group-hover:text-blue-600 transition-colors duration-300">AI Scientist</h4>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Build the future with artificial intelligence!
                </p>

                {/* Hover details */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Skills: Python, Machine Learning, Data Science</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 cursor-pointer">
                      <span>Explore Path</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ripple effect on hover */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
                     animation: 'careerRipple 1s ease-out'
                   }}>
              </div>
            </div>

            {/* Doctor Card */}
            <div className="group relative bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-4 dark:bg-gray-800 overflow-hidden">
              {/* Card background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-green-900/20 dark:to-teal-900/20"></div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-green-300 transition-all duration-300"></div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 text-2xl animate-bounce opacity-60 group-hover:opacity-100 transition-opacity">💚</div>
              <div className="absolute bottom-4 left-4 text-xl animate-pulse opacity-60 group-hover:opacity-100 transition-opacity">🏥</div>

              <div className="relative z-10">
                <div className="career-icon text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce">🩺</div>
                <h4 className="font-black text-xl md:text-2xl text-gray-800 dark:text-white mb-4 group-hover:text-green-600 transition-colors duration-300">Doctor</h4>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Help people and save lives every day!
                </p>

                {/* Hover details */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">Skills: Biology, Medicine, Compassion</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-300 cursor-pointer">
                      <span>Explore Path</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ripple effect on hover */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
                     animation: 'careerRipple 1s ease-out'
                   }}>
              </div>
            </div>

            {/* Space Explorer Card */}
            <div className="group relative bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-4 dark:bg-gray-800 overflow-hidden">
              {/* Card background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-purple-900/20 dark:to-indigo-900/20"></div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-300 transition-all duration-300"></div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 text-2xl animate-bounce opacity-60 group-hover:opacity-100 transition-opacity">🚀</div>
              <div className="absolute bottom-4 left-4 text-xl animate-pulse opacity-60 group-hover:opacity-100 transition-opacity">⭐</div>

              <div className="relative z-10">
                <div className="career-icon text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce">🛰</div>
                <h4 className="font-black text-xl md:text-2xl text-gray-800 dark:text-white mb-4 group-hover:text-purple-600 transition-colors duration-300">Space Explorer</h4>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Discover new worlds beyond Earth!
                </p>

                {/* Hover details */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">Skills: Physics, Engineering, Astronomy</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 cursor-pointer">
                      <span>Explore Path</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ripple effect on hover */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'radial-gradient(circle, rgba(147,51,234,0.1) 0%, transparent 70%)',
                     animation: 'careerRipple 1s ease-out'
                   }}>
              </div>
            </div>

            {/* Game Designer Card */}
            <div className="group relative bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-4 dark:bg-gray-800 overflow-hidden">
              {/* Card background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-pink-900/20 dark:to-rose-900/20"></div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-pink-300 transition-all duration-300"></div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 text-2xl animate-bounce opacity-60 group-hover:opacity-100 transition-opacity">🎯</div>
              <div className="absolute bottom-4 left-4 text-xl animate-pulse opacity-60 group-hover:opacity-100 transition-opacity">🎮</div>

              <div className="relative z-10">
                <div className="career-icon text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce">🎮</div>
                <h4 className="font-black text-xl md:text-2xl text-gray-800 dark:text-white mb-4 group-hover:text-pink-600 transition-colors duration-300">Game Designer</h4>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  Create amazing games that millions love!
                </p>

                {/* Hover details */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <div className="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-pink-800 dark:text-pink-200">Skills: Art, Programming, Creativity</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-pink-600 hover:to-rose-700 transition-all duration-300 cursor-pointer">
                      <span>Explore Path</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ripple effect on hover */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
                     animation: 'careerRipple 1s ease-out'
                   }}>
              </div>
            </div>
          </div>

          {/* Career exploration CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 cursor-pointer">
              <span>Discover More Career Paths</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>

          {/* Bottom decorative elements */}
          <div className="flex justify-center mt-12 space-x-6">
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <div className="w-4 h-4 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }}></div>
          </div>
        </div>

        <style>{`
          @keyframes careerRipple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
        `}</style>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              🗣 Your AI Learning Buddy
            </h2>
            <p className="text-xl">AI that explains concepts in the theme YOU love!</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">🏏 Cricket Bot Says:</h3>
                <p className="text-lg leading-relaxed">
                  "Didn't get fractions? Think of it like cricket! If a team scores 150 runs in 30 overs, that's 150/30 = 5 runs per over. Fractions are just parts of a whole, like overs in a match!"
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mt-6">
                <h3 className="text-2xl font-bold mb-4">🤔 What If? Bot:</h3>
                <p className="text-lg leading-relaxed">
                  "What if we could fly? We'd need wings 6 times our arm span and super strong chest muscles! That's why airplanes have big wings and powerful engines!"
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl mb-6">🤖</div>
              <h3 className="text-3xl font-bold mb-4">Always Here to Help!</h3>
              <p className="text-xl">Ask anything, anytime, in any theme you love!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              👥 Learn Together, Feel Together
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Join study groups with friends & teachers!</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 md:p-12 dark:from-gray-800 dark:to-gray-800">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Emotion Detection Magic ✨</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  AI tracks emotions — 😊 means understood, 😕 means confused — so teachers know exactly when to step in and help!
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">😊</span>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">I understand this concept!</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">🤔</span>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">I need to think about this...</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">😕</span>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">I'm confused, need help!</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg dark:bg-gray-700">
                  <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Live Collaboration Board</h4>
                  <div className="bg-gray-100 rounded-lg p-4 mb-4 dark:bg-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sarah is drawing...</div>
                    <div className="h-20 bg-blue-200 rounded flex items-center justify-center dark:bg-blue-800">
                      <span className="text-2xl">📐 ➕ 📏 = 📊</span>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <span className="text-2xl">😊</span>
                    <span className="text-2xl">😊</span>
                    <span className="text-2xl">🤔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              📈 Track Your Learning Journey Like a Game!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Level up with every lesson completed!</p>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl dark:bg-gray-800">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Level 15</h3>
                <p className="text-gray-600 dark:text-gray-400">Math Master</p>
                <div className="bg-yellow-200 rounded-full h-3 mt-4 dark:bg-yellow-800">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">847 Stars</h3>
                <p className="text-gray-600 dark:text-gray-400">Collected This Month</p>
                <div className="flex justify-center space-x-1 mt-4">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-300">⭐</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">12 Badges</h3>
                <p className="text-gray-600 dark:text-gray-400">Achievements Unlocked</p>
                <div className="flex justify-center space-x-2 mt-4">
                  <span className="text-2xl">🏅</span>
                  <span className="text-2xl">🎖</span>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>
            <div className="mt-12">
              <h4 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Your Learning Adventure Map</h4>
              <div className="relative">
                <svg className="w-full h-32" viewBox="0 0 800 120">
                  <path className="progress-path" d="M50,60 Q200,20 350,60 T650,60 L750,60" stroke="#4ade80" strokeWidth="4" fill="none" />
                  <circle cx="50" cy="60" r="8" fill="#22c55e" />
                  <circle cx="200" cy="40" r="8" fill="#22c55e" />
                  <circle cx="350" cy="60" r="8" fill="#22c55e" />
                  <circle cx="500" cy="40" r="8" fill="#fbbf24" />
                  <circle cx="650" cy="60" r="6" fill="#d1d5db" />
                  <circle cx="750" cy="60" r="6" fill="#d1d5db" />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-8">
                  <span className="text-xs font-medium text-gray-800 dark:text-white">Start</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">Basics</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">Intermediate</span>
                  <span className="text-xs font-medium text-yellow-600">Current</span>
                  <span className="text-xs font-medium text-gray-400">Advanced</span>
                  <span className="text-xs font-medium text-gray-400">Expert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              💡 Why LearnMyWay?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Because learning should never feel boring! We connect parents, teachers, and students through theme-based, gamified, and personalized learning experiences that make education magical.
            </p>
          </div>
          <div className="text-center">
            <div className="text-8xl mb-8">🌈</div>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Parents</p>
              </div>
              <div className="text-3xl text-pink-500">❤</div>
              <div className="text-center">
                <div className="text-4xl mb-2">👩‍🏫</div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Teachers</p>
              </div>
              <div className="text-3xl text-pink-500">❤</div>
              <div className="text-center">
                <div className="text-4xl mb-2">🎓</div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Students</p>
              </div>
            </div>
            <button onClick={() => navigate('/join')} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Join Our Learning Family! 🚀
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🚀</span>
            <span className="text-2xl font-bold">LearnMyWay</span>
          </div>
          <p className="text-gray-400 mb-6">Where Learning Feels Like Play!</p>
          <div className="flex justify-center space-x-6 text-2xl">
            <span>📚</span>
            <span>🎨</span>
            <span>🚀</span>
            <span>✨</span>
            <span>🌟</span>
          </div>
          <p className="text-gray-500 text-sm mt-8">© 2024 LearnMyWay. Making education magical for everyone!</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;