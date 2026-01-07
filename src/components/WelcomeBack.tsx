import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const WelcomeBack: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smoother progress bar animation
    const startTime = Date.now();
    const duration = 5000;

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(animateProgress);
      } else {
        navigate('/explore-menu');
      }
    };

    const animationFrame = requestAnimationFrame(animateProgress);

    return () => cancelAnimationFrame(animationFrame);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/explore-menu');
  };

  const particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  // Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, when: 'beforeChildren', staggerChildren: 0.15 },
    },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="relative min-h-screen bg-[#030014] flex items-center justify-center overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* --- Dynamic Background Layers --- */}

      {/* 1. Deep Space Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] opacity-40 z-0" />

      {/* 2. Abstract Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />

      {/* 3. Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0" />

      {/* --- Particles --- */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fpsLimit: 60,
          particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } as any },
            color: { value: '#ffffff' },
            opacity: { value: 0.3, random: true } as any,
            size: { value: 1.5, random: true } as any,
            move: { enable: true, speed: 0.3, direction: 'none', random: true, out_mode: 'out' } as any,
          },
          interactivity: { events: { onhover: { enable: true, mode: 'bubble' } as any }, modes: { bubble: { distance: 200, size: 3, duration: 2, opacity: 0.6 } } },
          retina_detect: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* --- Main Glass Card --- */}
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 w-full max-w-[480px] mx-6"
        >
          {/* Card Container with multiple borders for depth */}
          <div className="relative group perspective-1000">
            {/* Glow Effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />

            <div className="relative backdrop-blur-3xl bg-black/40 border border-white/10 rounded-[1.8rem] p-8 md:p-10 shadow-2xl ring-1 ring-white/5">

              {/* Floating Sparkle Icon */}
              <motion.div variants={itemVariants} className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
                    <Sparkles className="w-10 h-10 text-indigo-300 drop-shadow-[0_0_10px_rgba(165,180,252,0.5)]" />
                  </div>
                  {/* Decorative orbital dots */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-white/10 w-[140%] h-[140%] -left-[20%] -top-[20%]"
                  />
                </div>
              </motion.div>

              {/* Title Section */}
              <motion.div variants={itemVariants} className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200 mb-4 tracking-tight drop-shadow-sm">
                  Welcome Back
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full opacity-50" />
              </motion.div>

              {/* Text Content */}
              <motion.div variants={itemVariants} className="space-y-4 text-center mb-10">
                <p className="text-lg text-indigo-100/90 font-medium leading-relaxed">
                  Ready to continue your journey?
                </p>
                <p className="text-sm text-indigo-200/60 leading-relaxed max-w-xs mx-auto">
                  "The universe is under no obligation to make sense to you." <br />— <span className="italic text-indigo-300">Team Learnmyway</span>
                </p>
              </motion.div>

              {/* Progress System */}
              <motion.div variants={itemVariants} className="relative mb-10 group/progress">
                <div className="flex justify-between text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider">
                  <span>Authenticating</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shimmer effect on progress bar */}
                    <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-progress-shimmer" />
                    {/* Glowing tip */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-[4px] shadow-[0_0_10px_white]" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div variants={itemVariants}>
                <button
                  onClick={handleContinue}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-black"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#312E81_50%,#E2E8F0_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <span className="relative flex items-center justify-center gap-2 h-full w-full rounded-xl bg-black/50 px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition-all group-hover:bg-black/40">
                    <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    <span>Launch Dashboard</span>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </span>
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        @keyframes progress-shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-progress-shimmer {
          animation: progress-shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default WelcomeBack;