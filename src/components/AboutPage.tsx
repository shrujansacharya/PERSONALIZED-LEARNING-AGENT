import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Eye, Headphones, Hand, Sparkles, ArrowUpRight } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log('No user, redirecting to login');
        navigate('/student', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-slate-50 flex items-center justify-center px-4 py-6 overflow-hidden">
      {/* Glowing background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-72 w-72 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.2fr,1.1fr] gap-8 lg:gap-10 items-center">
        {/* LEFT: Simple explanation for kids */}
        <div className="space-y-5">
          {/* Small label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.8)]">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            Learning Style Quiz
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-snug">
            Before the quiz,
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">
              let’s understand it in a simple way.
            </span>
          </h1>

          {/* Why this quiz */}
          <div className="rounded-2xl bg-white/8 border border-white/20 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.85)] p-4 sm:p-5 space-y-3">
            <p className="text-sm sm:text-base font-semibold text-slate-50">
              🎯 Why am I taking this quiz?
            </p>
            <ul className="text-xs sm:text-sm text-slate-200 space-y-1.5">
              <li>• To find out how <span className="font-semibold text-sky-200">you</span> like to learn.</li>
              <li>• To know if you are a “seeing”, “listening”, or “doing” learner.</li>
              <li>• To help you study in a way that feels easier and more fun.</li>
            </ul>
          </div>

          {/* How it helps */}
          <div className="grid sm:grid-cols-3 gap-3 text-[11px] sm:text-xs">
            <div className="rounded-xl bg-sky-500/10 border border-sky-400/30 px-3 py-2.5">
              <p className="font-semibold text-sky-200 mb-0.5">Step 1</p>
              <p className="text-slate-100">You answer a few fun questions.</p>
            </div>
            <div className="rounded-xl bg-indigo-500/10 border border-indigo-400/30 px-3 py-2.5">
              <p className="font-semibold text-indigo-200 mb-0.5">Step 2</p>
              <p className="text-slate-100">
                We see which learning way you choose the most.
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 px-3 py-2.5">
              <p className="font-semibold text-emerald-200 mb-0.5">Step 3</p>
              <p className="text-slate-100">
                You get tips to learn in your best style.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate('/quiz')}
              className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white text-slate-900 text-sm sm:text-base font-semibold shadow-[0_18px_55px_rgba(56,189,248,0.9)] hover:shadow-[0_22px_70px_rgba(56,189,248,1)] hover:-translate-y-0.5 transition-all duration-200 border border-sky-100"
              aria-label="Start the learning style quiz"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500">
                <Brain size={18} className="text-white" />
              </span>
              <span>Start the Learning Style Quiz</span>
              <ArrowUpRight className="w-4 h-4 text-sky-500" />
            </button>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Takes about 2–3 minutes · No right or wrong answers · Just be yourself ✨
            </p>
          </div>
        </div>

        {/* RIGHT: 3 learning styles in kid language */}
        <div className="space-y-3 sm:space-y-4">
          {/* Title */}
          <p className="text-xs sm:text-sm text-slate-200 font-semibold tracking-wide mb-1">
            3 main ways kids learn:
          </p>

          {/* Visual */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-2xl bg-sky-500/40 blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900/90 to-sky-900/80 border border-sky-400/50 backdrop-blur-xl shadow-[0_20px_60px_rgba(56,189,248,0.8)] p-4 flex items-start gap-3 transform group-hover:-translate-y-1.5 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-sky-500/25 border border-sky-200/70 flex items-center justify-center">
                <Eye className="w-5 h-5 text-sky-100" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-sky-200 uppercase tracking-[0.18em]">
                  Visual
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  You learn by <span className="text-sky-200">seeing</span>.
                </p>
                <p className="text-xs text-slate-200 mt-1.5">
                  You like pictures, videos, drawings, and neat notes.
                </p>
                <ul className="text-[11px] text-slate-300 mt-2 space-y-1">
                  <li>• You enjoy watching examples.</li>
                  <li>• You remember things you see on the board or screen.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Auditory */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/40 blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900/90 to-indigo-900/80 border border-indigo-400/50 backdrop-blur-xl shadow-[0_20px_60px_rgba(129,140,248,0.8)] p-4 flex items-start gap-3 transform group-hover:-translate-y-1.5 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/25 border border-indigo-200/70 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-[0.18em]">
                  Auditory
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  You learn by <span className="text-indigo-200">listening</span>.
                </p>
                <p className="text-xs text-slate-200 mt-1.5">
                  You like hearing stories, talking, and explaining things.
                </p>
                <ul className="text-[11px] text-slate-300 mt-2 space-y-1">
                  <li>• You enjoy listening to your teacher.</li>
                  <li>• You remember things when you say them out loud.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Kinesthetic */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/40 blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900/90 to-emerald-900/80 border border-emerald-400/50 backdrop-blur-xl shadow-[0_20px_60px_rgba(16,185,129,0.8)] p-4 flex items-start gap-3 transform group-hover:-translate-y-1.5 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/25 border border-emerald-200/70 flex items-center justify-center">
                <Hand className="w-5 h-5 text-emerald-50" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-[0.18em]">
                  Kinesthetic
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  You learn by <span className="text-emerald-200">doing</span>.
                </p>
                <p className="text-xs text-slate-200 mt-1.5">
                  You like moving, touching, building, and trying things yourself.
                </p>
                <ul className="text-[11px] text-slate-300 mt-2 space-y-1">
                  <li>• You enjoy experiments and projects.</li>
                  <li>• Sitting still for too long feels boring.</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
            You use all three sometimes. The quiz just tells you which one feels{' '}
            <span className="font-semibold text-sky-200">strongest</span> for you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
