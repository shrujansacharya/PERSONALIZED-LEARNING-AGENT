import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed Sun and Moon icons from import
import { Bell, Sparkles, Zap, Heart, Star, Trophy, Users, BookOpen, Target, Rocket, Brain, Globe, Palette, Microscope, Crown } from 'lucide-react';

// --- THIS IS THE UPDATED LINE ---
// (Make sure you have renamed the file to "landing-page-image.jpg" in src/types/)
import HeroBackgroundImage from '../types/landing-page-image.jpg';

interface NotificationBellProps {
  notifications: any[];
}
// ... (rest of the file is unchanged) ...
const NotificationBell: React.FC<NotificationBellProps> = ({ notifications }) => (
  <div className="relative">
    {/* Updated text color for dark mode context */}
    <Bell className="h-6 w-6 text-cyan-400 cursor-pointer hover:text-blue-300 transition-colors" />
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
  // Set default to dark mode for the cosmic theme
  const [darkMode, setDarkMode] = useState(true); 
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState('');
  const [themeBg, setThemeBg] = useState<string | null>(null);

  useEffect(() => {
    // Force dark mode class on initial load for the cosmic theme
    document.documentElement.classList.add('dark');
    
    // Original effect logic
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
    
  // Removed toggleDarkMode function
  // const toggleDarkMode = () => {
  //   const newMode = !darkMode;
  //   setDarkMode(newMode);
  //   document.documentElement.classList.toggle('dark', newMode);
  //   localStorage.setItem('darkMode', newMode.toString());
  // };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    // Added perspective to the main container for 3D transforms to work
    <div className={`relative min-h-screen dark bg-gradient-to-br from-gray-900 via-indigo-900 to-cyan-900`} style={{ perspective: '1500px' }}>
      <style>{`
        * {
            font-family: 'Baloo 2', cursive;
        }

        /* --- Enhanced 3D Card Styles for Glassmorphism & Neon Glow --- */
        .glass-card { 
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.15); /* Softer initial border */
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.15); /* Base Shadow + Inner Glow */
            transform-style: preserve-3d; /* Key for 3D transform */
            transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); /* Smoother transition */
        }

        .slide-card, .theme-card, .career-card {
            transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .slide-card:hover, .theme-card:hover, .career-card:hover { 
            /* 3D Transform: Lift, scale, and subtle rotation */
            transform: translateZ(50px) translateY(-15px) scale(1.05) rotateX(2deg) rotateY(2deg);
            
            /* Enhanced Glowing Shadow on Hover */
            box-shadow: 
                0 25px 80px rgba(79, 70, 229, 0.8), /* Main Lift Shadow */
                0 0 40px rgba(0, 255, 255, 0.9),    /* Neon Outer Glow */
                inset 0 0 15px rgba(255, 255, 255, 0.4); /* Brighter Inner Glow */
            border: 1px solid rgba(0, 255, 255, 0.7); /* Brighter neon border on hover */
        }

        /* Set perspective for sections containing 3D cards */
        #modes > div, #themes > div, #careers > div {
            transform-style: preserve-3d;
        }
        /* --- End Enhanced 3D Card Styles --- */


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
            0% { transform: scale(0.3) translateZ(-100px); opacity: 0; } /* Added Z-depth for 3D pop */
            50% { transform: scale(1.05) translateZ(0); }
            70% { transform: scale(0.9) translateZ(0); }
            100% { transform: scale(1) translateZ(0); opacity: 1; }
        }
        
        .swipe-card { opacity: 0; transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .swipe-card:nth-child(1) { transform: translateX(-100px) translateZ(-50px); transition-delay: 0.3s; }
        .swipe-card:nth-child(2) { transform: translateY(50px) translateZ(-50px); transition-delay: 0.7s; } /* Adjusted center card for depth */
        .swipe-card:nth-child(3) { transform: translateX(100px) translateZ(-50px); transition-delay: 1.2s; }
        .swipe-card.animate-in { opacity: 1; transform: translateX(0) translateZ(0); }
        
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
            0%, 100% { transform: scale(1) translateZ(0); }
            50% { transform: scale(1.15) translateZ(10px); } /* Added Z-depth to icon pulse */
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
        /* Updated nav-link hover color to match neon aesthetic */
        .nav-link:hover { transform: translateY(-3px) translateZ(10px); color: #38bdf8; } 
        .sparkle { position: fixed; pointer-events: none; z-index: 9999; animation: sparkleAnim 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes sparkleAnim {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            100% { transform: scale(1) rotate(180deg); opacity: 0; }
        }
        .science-dna { animation: dnaRotate 5s ease-in-out infinite; }
        .science-scope { animation: scopeMove 4s ease-in-out infinite; }
        .history-book { animation: bookFlip 4s ease-in-out infinite; }
        .history-glass { animation: glassMove 3.5s ease-in-out infinite; }

        @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px) translateZ(-20px); }
            to { opacity: 1; transform: translateY(0) translateZ(0); }
          }
          @keyframes careerRipple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
          }
      `}</style>

      {/* Updated Navbar for Dark Cosmic Theme */}
      <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-xl z-50 shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              {/* Updated logo gradient for cosmic neon feel */}
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-xl" style={{ textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}>
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
                  className="nav-link relative px-4 py-2 text-gray-300 font-medium rounded-full hover:bg-white/10 transition-all duration-300 group"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {item.name}
                  {/* Neon underline effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              ))}
              <div className="mx-2">
                <NotificationBell notifications={notifications} />
              </div>
              {/* REMOVED: Dark Mode Toggle Button */}
            </div>
          </div>
        </div>
      </nav>

      {/* Updated Hero Section for Cosmic Theme */}
      <section 
        id="home" 
        className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
        style={{
          // Use a dark cosmic image if available, otherwise rely on the container's gradient
          backgroundImage: `url(${HeroBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // Ensure the section color blends with the main cosmic gradient
          backgroundColor: '#0f172a',
          transformStyle: 'preserve-3d', // Added for 3D effect on children
        }}
      >
        {/* Animated background particles (using cosmic colors) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400/50 rounded-full animate-ping shadow-lg shadow-cyan-500/50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                transform: 'translateZ(-50px)', // Pushed back for depth
              }}
            />
          ))}
        </div>
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40"></div> 

        <div className="text-center z-10 px-4 max-w-5xl mx-auto relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Main heading with enhanced typography (Neon Effect) */}
          <div className="relative mb-8">
            <h1 
                className="text-6xl md:text-8xl font-black text-white mb-6 bounce-in bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-xl" 
                style={{ 
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(79, 70, 229, 0.5)', 
                    transform: 'translateZ(30px)' // Pushed forward
                }}
            >
              Welcome to LearnMyWay
            </h1>
          </div>

          {/* Enhanced subtitle */}
          <p 
            className="text-2xl md:text-3xl text-cyan-200/95 mb-6 bounce-in font-semibold" 
            style={{ 
                animationDelay: '0.2s', 
                textShadow: '0 0 5px rgba(0, 255, 255, 0.3)',
                transform: 'translateZ(20px)' // Pushed forward
            }}
          >
            Where Learning Feels Like Play! 🎮
          </p>

          {/* Enhanced CTA buttons (Neon/Cosmic Style) - added translateZ on hover via global CSS for lift */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center bounce-in" style={{ animationDelay: '0.6s', transformStyle: 'preserve-3d' }}>
            <button
              onClick={() => scrollToSection('modes')}
              className="group relative bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-cyan-500/30 transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                🎓 Explore as Student
                <div className="w-2 h-2 bg-white rounded-full animate-ping shadow-lg shadow-white"></div>
              </span>
            </button>

            <button
              onClick={() => scrollToSection('modes')}
              className="group relative bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-indigo-500/30 transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                👩‍🏫 Enter Teacher Mode
                <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s', boxShadow: '0 0 5px white' }}></div>
              </span>
            </button>

            <button
              onClick={() => scrollToSection('modes')}
              className="group relative bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-fuchsia-500/30 transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                💝 Parent Dashboard
                <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s', boxShadow: '0 0 5px white' }}></div>
              </span>
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ transform: 'translateZ(10px)' }}>
            <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-cyan-400/70 rounded-full mt-2 animate.pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Modes Section with Glassmorphism and 3D */}
      <section id="modes" className="py-20 bg-transparent relative overflow-hidden">
        {/* Animated background elements (Cosmic Colors) - Pushed back */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-100px)' }}>
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/30 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-cyan-500/30 rounded-full animate-bounce blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-500/30 rounded-full animate-spin blur-xl"></div>
          <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-fuchsia-500/30 rounded-full animate-ping blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-center mb-16" style={{ transform: 'translateZ(10px)' }}>
            <div className="relative inline-block">
              {/* Neon Heading */}
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-xl" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                🦸 Choose Your Superpower
              </h2>
              <div className="absolute -top-2 -right-2 text-4xl animate-bounce text-yellow-300">⚡</div>
              <div className="absolute -bottom-2 -left-2 text-3xl animate-spin text-cyan-300">✨</div>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 font-semibold">Discover your learning adventure!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Card (Applied glass-card class) */}
            <div className="swipe-card glass-card slide-card group relative rounded-3xl p-8 text-white text-center overflow-hidden">
              {/* Card background animation - now subtle glow/light shift */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(1px)' }}></div>

              <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300 text-cyan-400" style={{ transform: 'translateZ(20px)' }}>🎓</div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-cyan-200 transition-colors duration-300">Student Power</h3>
                <p className="text-lg leading-relaxed mb-6 text-gray-200">
                  Step into your own learning world! Play with themes, solve challenges, chat with your study buddy, and explore your dream career — all while having fun!
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="group/btn relative bg-cyan-500/80 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-cyan-500/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Start Learning 🚀
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </span>
                </button>
              </div>
            </div>

            {/* Teacher Card (Applied glass-card class) */}
            <div className="swipe-card glass-card slide-card group relative rounded-3xl p-8 text-white text-center overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(1px)' }}></div>

              <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300 text-indigo-400" style={{ transform: 'translateZ(20px)' }}>👩‍🏫</div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-indigo-200 transition-colors duration-300">Teacher Power</h3>
                <p className="text-lg leading-relaxed mb-6 text-gray-200">
                  Track lessons, update completed topics, and collaborate with students. Teaching is now interactive, visual, and engaging!
                </p>
                <button
                  onClick={() => navigate('/teacher')}
                  className="group/btn relative bg-indigo-500/80 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-400 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-indigo-500/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Teach Now 📚
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </span>
                </button>
              </div>
            </div>

            {/* Parent Card (Applied glass-card class) */}
            <div className="swipe-card glass-card slide-card group relative rounded-3xl p-8 text-white text-center overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(1px)' }}></div>

              <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300 text-fuchsia-400" style={{ transform: 'translateZ(20px)' }}>👨‍👩‍👧‍👦</div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-fuchsia-200 transition-colors duration-300">Parent Power</h3>
                <p className="text-lg leading-relaxed mb-6 text-gray-200">
                  Stay in the loop with your child's learning journey. See completed portions, check progress, and cheer them on every step!
                </p>
                <button
                  onClick={() => navigate('/parent')}
                  className="group/btn relative bg-fuchsia-500/80 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-fuchsia-400 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-fuchsia-500/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Track Progress 📈
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom decorative elements */}
          <div className="flex justify-center mt-12 space-x-4" style={{ transform: 'translateZ(10px)' }}>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/50" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-pulse shadow-lg shadow-fuchsia-400/50" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </section>

      {/* Themes Section with Glassmorphism and Dynamic Background */}
      <section
        id="themes"
        className="theme-section py-20 relative overflow-hidden"
        style={{
          background: themeBg ? `url("https://image.pollinations.ai/prompt/${encodeURIComponent(themeBg)}")` : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dynamic overlay based on active theme */}
        <div className={`absolute inset-0 transition-all duration-1000 ${activeTheme ? 'bg-black/40' : 'bg-black/70'}`} style={{ transform: 'translateZ(0)' }}></div>

        {/* Floating particles - Pushed back */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-100px)' }}>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-300/30 rounded-full animate-ping shadow-lg shadow-cyan-300/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10" style={{ transformStyle: 'preserve-3d' }}>
          <div className="relative mb-16" style={{ transform: 'translateZ(10px)' }}>
            {/* Neon Heading */}
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-xl" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
              🎨 Learn the Way YOU Love ✨
            </h2>
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce text-yellow-300">🌟</div>
            <div className="absolute -bottom-4 -left-4 text-3xl animate-spin text-fuchsia-300">🎭</div>
          </div>

          <p className="text-xl md:text-2xl text-white/90 mb-12 font-semibold drop-shadow-lg" style={{ transform: 'translateZ(5px)' }}>
            Hover on a theme and watch the magic happen! ✨
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.keys(themeBackgrounds).map((theme, index) => (
              <div
                key={theme}
                className="glass-card theme-card group relative rounded-3xl p-8 text-white text-center cursor-pointer transition-all duration-500 transform hover:scale-110 hover:-translate-y-6 overflow-hidden"
                style={{
                  // Adjusted opacity/blur for theme cards
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: activeTheme === theme ? '2px solid rgba(0, 255, 255, 0.7)' : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: activeTheme === theme ? '0 0 30px rgba(0, 255, 255, 0.6)' : '0 4px 30px rgba(0, 0, 0, 0.2)',
                  animationDelay: `${index * 0.2}s`,
                  transformStyle: 'preserve-3d',
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
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(1px)' }}></div>

                <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                  <div className={`text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 ${activeTheme === theme ? 'animate-bounce text-cyan-300' : 'text-white'}`} style={{ transform: 'translateZ(20px)' }}>
                    {theme === 'cricket' && '🏏'}
                    {theme === 'space' && '🌌'}
                    {theme === 'nature' && '🌿'}
                    {theme === 'science' && '🔬'}
                    {theme === 'art' && '🎨'}
                    {theme === 'history' && '🏛️'}
                  </div>

                  <h3 className={`text-2xl md:text-3xl font-bold capitalize mb-4 transition-colors duration-300 ${activeTheme === theme ? 'text-cyan-300' : 'text-white'}`} style={{ transform: 'translateZ(10px)' }}>
                    {theme} Theme
                  </h3>

                  <p className={`text-lg leading-relaxed text-white/90`} style={{ transform: 'translateZ(5px)' }}>
                    Make learning fun with {theme} adventures!
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(10px)' }}>
                    <div className="inline-flex items-center gap-2 bg-cyan-500/30 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg shadow-cyan-500/20">
                      <span className="text-sm font-semibold text-white">Click to explore</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>

                {/* Ripple effect on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{
                       background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
                       animation: 'ripple 1s ease-out',
                       transform: 'translateZ(1px)', // Ensure ripple is on top layer of the card
                     }}>
                </div>
              </div>
            ))}
          </div>

          {/* Theme preview indicator */}
          {activeTheme && (
            <div className="mt-12 animate-fade-in" style={{ transform: 'translateZ(10px)' }}>
              <div className="inline-flex items-center gap-3 bg-cyan-500/30 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl shadow-cyan-500/20">
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
          <div className="flex justify-center mt-16 space-x-6" style={{ transform: 'translateZ(10px)' }}>
            <div className="w-4 h-4 bg-cyan-400/50 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-4 h-4 bg-indigo-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      </section>

      {/* Careers Section with Glassmorphism and 3D */}
      <section id="careers" className="py-20 bg-transparent relative overflow-hidden">
        {/* Animated background elements (Cosmic Colors) - Pushed back */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-100px)' }}>
          <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500/20 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-fuchsia-500/20 rounded-full animate-bounce blur-xl"></div>
        </div>

        {/* Floating particles - Pushed back */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-50px)' }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-ping opacity-60 shadow-lg shadow-blue-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-center mb-16" style={{ transform: 'translateZ(10px)' }}>
            <div className="relative inline-block">
              {/* Neon Heading */}
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-xl" style={{ textShadow: '0 0 10px rgba(79, 70, 229, 0.5)' }}>
                🚀 Dream Big. Start Early.
              </h2>
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce text-yellow-300">⭐</div>
              <div className="absolute -bottom-4 -left-4 text-3xl animate-spin text-cyan-300">🌟</div>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 font-semibold">Explore careers with mini roadmaps, fun facts, and stories!</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* AI Scientist Card (Applied glass-card class) */}
            <div className="career-card glass-card group relative rounded-3xl p-8 text-center overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(1px)' }}></div>

              <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                <div className="career-icon text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce text-blue-400" style={{ transform: 'translateZ(20px)' }}>🤖</div>
                <h4 className="font-black text-xl md:text-2xl text-white mb-4 group-hover:text-blue-300 transition-colors duration-300" style={{ transform: 'translateZ(10px)' }}>AI Scientist</h4>
                <p className="text-base text-gray-300 leading-relaxed mb-6" style={{ transform: 'translateZ(5px)' }}>
                  Build the future with artificial intelligence!
                </p>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0" style={{ transform: 'translateZ(15px)' }}>
                  <div className="bg-blue-400/20 backdrop-blur-md rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-200">Skills: Python, Machine Learning, Data Science</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/30">
                      <span>Explore Path</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
                     animation: 'careerRipple 1s ease-out',
                     transform: 'translateZ(1px)',
                   }}>
              </div>
            </div>

            {/* Doctor Card (Applied glass-card class) */}
            <div className="career-card glass-card group relative rounded-3xl p-8 text-center overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(1px)' }}></div>

              <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                <div className="career-icon text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce text-green-400" style={{ transform: 'translateZ(20px)' }}>🩺</div>
                <h4 className="font-black text-xl md:text-2xl text-white mb-4 group-hover:text-green-300 transition-colors duration-300" style={{ transform: 'translateZ(10px)' }}>Doctor</h4>
                <p className="text-base text-gray-300 leading-relaxed mb-6" style={{ transform: 'translateZ(5px)' }}>
                  Help people and save lives every day!
                </p>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0" style={{ transform: 'translateZ(15px)' }}>
                  <div className="bg-green-400/20 backdrop-blur-md rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-green-200">Skills: Biology, Medicine, Compassion</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-300 cursor-pointer shadow-lg shadow-green-500/30">
                      <span>Explore Path</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
                     animation: 'careerRipple 1s ease-out',
                     transform: 'translateZ(1px)',
                   }}>
              </div>
            </div>

            {/* Space Explorer Card (Applied glass-card class) */}
            <div className="career-card glass-card group relative rounded-3xl p-8 text-center overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(1px)' }}></div>

              <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                <div className="career-icon text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce text-purple-400" style={{ transform: 'translateZ(20px)' }}>🛰</div>
                <h4 className="font-black text-xl md:text-2xl text-white mb-4 group-hover:text-purple-300 transition-colors duration-300" style={{ transform: 'translateZ(10px)' }}>Space Explorer</h4>
                <p className="text-base text-gray-300 leading-relaxed mb-6" style={{ transform: 'translateZ(5px)' }}>
                  Discover new worlds beyond Earth!
                </p>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0" style={{ transform: 'translateZ(15px)' }}>
                  <div className="bg-purple-400/20 backdrop-blur-md rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-purple-200">Skills: Physics, Engineering, Astronomy</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 cursor-pointer shadow-lg shadow-purple-500/30">
                      <span>Explore Path</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'radial-gradient(circle, rgba(147,51,234,0.1) 0%, transparent 70%)',
                     animation: 'careerRipple 1s ease-out',
                     transform: 'translateZ(1px)',
                   }}>
              </div>
            </div>

            {/* Game Designer Card (Applied glass-card class) */}
            <div className="career-card glass-card group relative rounded-3xl p-8 text-center overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: 'translateZ(1px)' }}></div>

              <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                <div className="career-icon text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce text-pink-400" style={{ transform: 'translateZ(20px)' }}>🎮</div>
                <h4 className="font-black text-xl md:text-2xl text-white mb-4 group-hover:text-pink-300 transition-colors duration-300" style={{ transform: 'translateZ(10px)' }}>Game Designer</h4>
                <p className="text-base text-gray-300 leading-relaxed mb-6" style={{ transform: 'translateZ(5px)' }}>
                  Create amazing games that millions love!
                </p>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0" style={{ transform: 'translateZ(15px)' }}>
                  <div className="bg-pink-400/20 backdrop-blur-md rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-pink-200">Skills: Art, Programming, Creativity</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-pink-600 hover:to-rose-700 transition-all duration-300 cursor-pointer shadow-lg shadow-pink-500/30">
                      <span>Explore Path</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
                     animation: 'careerRipple 1s ease-out',
                     transform: 'translateZ(1px)',
                   }}>
              </div>
            </div>
          </div>

          {/* Career exploration CTA */}
          <div className="text-center mt-16" style={{ transform: 'translateZ(10px)' }}>
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 cursor-pointer shadow-cyan-500/50">
              <span>Discover More Career Paths</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>

          {/* Bottom decorative elements */}
          <div className="flex justify-center mt-12 space-x-6" style={{ transform: 'translateZ(10px)' }}>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
            <div className="w-4 h-4 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/50" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-4 h-4 bg-fuchsia-400 rounded-full animate-pulse shadow-lg shadow-fuchsia-400/50" style={{ animationDelay: '0.6s' }}></div>
            <div className="w-4 h-4 bg-pink-400 rounded-full animate-pulse shadow-lg shadow-pink-400/50" style={{ animationDelay: '0.9s' }}></div>
          </div>
        </div>
      </section>

      {/* AI Buddy Section (Updated for 3D/Dark Theme) */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-center mb-16" style={{ transform: 'translateZ(10px)' }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              🗣 Your AI Learning Buddy
            </h2>
            <p className="text-xl text-gray-300">AI that explains concepts in the theme YOU love!</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* Glassmorphic card */}
              <div className="glass-card rounded-2xl p-8 slide-card group relative" style={{ transformStyle: 'preserve-3d' }}>
                <h3 className="text-2xl font-bold mb-4 text-cyan-300" style={{ transform: 'translateZ(10px)' }}>🏏 Cricket Bot Says:</h3>
                <p className="text-lg leading-relaxed text-gray-200" style={{ transform: 'translateZ(5px)' }}>
                  "Didn't get fractions? Think of it like cricket! If a team scores 150 runs in 30 overs, that's 150/30 = 5 runs per over. Fractions are just parts of a whole, like overs in a match!"
                </p>
              </div>
              {/* Glassmorphic card */}
              <div className="glass-card rounded-2xl p-8 mt-6 slide-card group relative" style={{ transformStyle: 'preserve-3d' }}>
                <h3 className="text-2xl font-bold mb-4 text-indigo-300" style={{ transform: 'translateZ(10px)' }}>🧠 Learning Style Bot:</h3>
                <p className="text-lg leading-relaxed text-gray-200" style={{ transform: 'translateZ(5px)' }}>
                  "Everyone learns differently! I explain topics the way YOU learn best — with visuals, stories, examples, or step-by-step logic. Let’s learn your way!"
                </p>
              </div>
            </div>
            <div className="text-center" style={{ transformStyle: 'preserve-3d' }}>
              <div className="text-8xl mb-6 text-cyan-400" style={{ transform: 'translateZ(30px)' }}>🤖</div>
              <h3 className="text-3xl font-bold mb-4 text-white" style={{ transform: 'translateZ(20px)' }}>Always Here to Help!</h3>
              <p className="text-xl text-gray-300" style={{ transform: 'translateZ(10px)' }}>Ask anything, anytime, in any theme you love!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Section (Updated for 3D/Dark Theme) */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-center mb-16" style={{ transform: 'translateZ(10px)' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
              👥 Learn Together, Feel Together
            </h2>
            <p className="text-xl text-gray-300">Join study groups with friends & teachers!</p>
          </div>
          <div className="glass-card rounded-3xl p-8 md:p-12 slide-card group relative" style={{ transformStyle: 'preserve-3d' }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div style={{ transform: 'translateZ(10px)' }}>
                <h3 className="text-2xl font-bold text-white mb-4 text-cyan-300">Emotion Detection Magic ✨</h3>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  AI tracks emotions — 😊 means understood, 😕 means confused — so teachers know exactly when to step in and help!
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">😊</span>
                    <span className="text-lg font-medium text-white">I understand this concept!</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">🤔</span>
                    <span className="text-lg font-medium text-white">I need to think about this...</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">😕</span>
                    <span className="text-lg font-medium text-white">I'm confused, need help!</span>
                  </div>
                </div>
              </div>
              <div className="text-center" style={{ transformStyle: 'preserve-3d' }}>
                <div className="bg-white/10 rounded-2xl p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-sm" style={{ transform: 'translateZ(20px)' }}>
                  <h4 className="font-bold text-lg mb-4 text-white">Live Collaboration Board</h4>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4" style={{ transform: 'translateZ(10px)' }}>
                    <div className="text-sm text-gray-400 mb-2">Sarah is drawing...</div>
                    <div className="h-20 bg-blue-800 rounded flex items-center justify-center">
                      <span className="text-2xl text-white" style={{ transform: 'translateZ(15px)' }}>📐 ➕ 📏 = 📊</span>
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

      {/* Progress Tracking Section (Updated for 3D/Dark Theme) */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-center mb-16" style={{ transform: 'translateZ(10px)' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-300 to-fuchsia-300 bg-clip-text text-transparent">
              📈 Track Your Learning Journey Like a Game!
            </h2>
            <p className="text-xl text-gray-300">Level up with every lesson completed!</p>
          </div>
          <div className="glass-card rounded-3xl p-8 md:p-12 shadow-xl shadow-indigo-500/10 slide-card group relative" style={{ transformStyle: 'preserve-3d' }}>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center" style={{ transform: 'translateZ(10px)' }}>
                <div className="text-6xl mb-4 text-yellow-400">🏆</div>
                <h3 className="text-xl font-bold text-white mb-2">Level 15</h3>
                <p className="text-gray-400">Math Master</p>
                <div className="bg-yellow-800 rounded-full h-3 mt-4">
                  <div className="bg-yellow-500 h-3 rounded-full shadow-lg shadow-yellow-500/50" style={{ width: '75%', transform: 'translateZ(5px)' }}></div>
                </div>
              </div>
              <div className="text-center" style={{ transform: 'translateZ(10px)' }}>
                <div className="text-6xl mb-4 text-white">⭐</div>
                <h3 className="text-xl font-bold text-white mb-2">847 Stars</h3>
                <p className="text-gray-400">Collected This Month</p>
                <div className="flex justify-center space-x-1 mt-4" style={{ transform: 'translateZ(5px)' }}>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-600">⭐</span>
                </div>
              </div>
              <div className="text-center" style={{ transform: 'translateZ(10px)' }}>
                <div className="text-6xl mb-4 text-fuchsia-400">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">12 Badges</h3>
                <p className="text-gray-400">Achievements Unlocked</p>
                <div className="flex justify-center space-x-2 mt-4" style={{ transform: 'translateZ(5px)' }}>
                  <span className="text-2xl">🏅</span>
                  <span className="text-2xl">🎖</span>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>
            <div className="mt-12">
              <h4 className="text-2xl font-bold text-center text-white mb-8" style={{ transform: 'translateZ(10px)' }}>Your Learning Adventure Map</h4>
              <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
                <svg className="w-full h-32" viewBox="0 0 800 120">
                  <path className="progress-path" d="M50,60 Q200,20 350,60 T650,60 L750,60" stroke="#4ade80" strokeWidth="4" fill="none" style={{ transform: 'translateZ(5px)' }} />
                  <circle cx="50" cy="60" r="8" fill="#22c55e" style={{ transform: 'translateZ(10px)' }} />
                  <circle cx="200" cy="40" r="8" fill="#22c55e" style={{ transform: 'translateZ(10px)' }} />
                  <circle cx="350" cy="60" r="8" fill="#22c55e" style={{ transform: 'translateZ(10px)' }} />
                  <circle cx="500" cy="40" r="8" fill="#fbbf24" style={{ transform: 'translateZ(10px)' }} />
                  <circle cx="650" cy="60" r="6" fill="#4b5563" style={{ transform: 'translateZ(10px)' }} /> {/* Darkened inactive node */}
                  <circle cx="750" cy="60" r="6" fill="#4b5563" style={{ transform: 'translateZ(10px)' }} /> {/* Darkened inactive node */}
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-8">
                  <span className="text-xs font-medium text-white" style={{ transform: 'translateZ(15px)' }}>Start</span>
                  <span className="text-xs font-medium text-white" style={{ transform: 'translateZ(15px)' }}>Basics</span>
                  <span className="text-xs font-medium text-white" style={{ transform: 'translateZ(15px)' }}>Intermediate</span>
                  <span className="text-xs font-medium text-yellow-400" style={{ transform: 'translateZ(15px)' }}>Current</span>
                  <span className="text-xs font-medium text-gray-400" style={{ transform: 'translateZ(15px)' }}>Advanced</span>
                  <span className="text-xs font-medium text-gray-400" style={{ transform: 'translateZ(15px)' }}>Expert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section (Updated for 3D/Dark Theme) */}
      <section id="about" className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ transformStyle: 'preserve-3d' }}>
          <div className="text-center mb-16" style={{ transform: 'translateZ(10px)' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              💡 Why LearnMyWay?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Because learning should never feel boring! We connect parents, teachers, and students through theme-based, gamified, and personalized learning experiences that make education magical.
            </p>
          </div>
          <div className="text-center" style={{ transform: 'translateZ(10px)' }}>
            <div className="text-8xl mb-8 text-cyan-400">🌈</div>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2 text-indigo-400">👨‍👩‍👧‍👦</div>
                <p className="font-medium text-gray-300">Parents</p>
              </div>
              <div className="text-3xl text-fuchsia-400">❤</div>
              <div className="text-center">
                <div className="text-4xl mb-2 text-cyan-400">👩‍🏫</div>
                <p className="font-medium text-gray-300">Teachers</p>
              </div>
              <div className="text-3xl text-fuchsia-400">❤</div>
              <div className="text-center">
                <div className="text-4xl mb-2 text-blue-400">🎓</div>
                <p className="font-medium text-gray-300">Students</p>
              </div>
            </div>
            <button onClick={() => navigate('/join')} className="bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-fuchsia-500/50">
              Join Our Learning Family! 🚀
            </button>
          </div>
        </div>
      </section>

      {/* Footer (Updated for Dark Cosmic Theme) */}
      <footer className="bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ transform: 'translateZ(0)' }}>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl font-bold text-cyan-400">LearnMyWay</span>
          </div>
          <p className="text-gray-400 mb-6">Where Learning Feels Like Play!</p>
          <div className="flex justify-center space-x-6 text-2xl text-cyan-300">
            <span>📚</span>
            <span>🎨</span>
            <span>🚀</span>
            <span>✨</span>
            <span>🌟</span>
          </div>
          <p className="text-gray-500 text-sm mt-8">© 2025 LearnMyWay. Making education magical for everyone!</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;