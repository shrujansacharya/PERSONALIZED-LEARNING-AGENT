import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { ArrowLeft, Brain, Mail, Lock, User, Calendar, GraduationCap, Sparkles, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { auth } from '../lib/firebase';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [userClass, setUserClass] = useState('');
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`);
      if (!response.ok) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUid: user.uid,
            name: email.split('@')[0],
            email: user.email,
            dob: null,
            class: null,
          }),
        });
      }
      navigate('/welcome-back');
    } catch (error: any) {
      alert(`Login failed. ${error.message}`);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          name: username,
          dob: dob,
          class: userClass,
          email,
        }),
      });

      alert("Account created! Please check your inbox to verify your email.");
      navigate('/verify-email');
    } catch (error: any) {
      alert(`Failed to create account. ${error.message}`);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
      setIsForgotPasswordModalOpen(false);
    } catch (error: any) {
      alert(`Password reset failed: ${error.message}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-slate-50 flex items-center justify-center px-4 py-6 overflow-hidden">
      {/* Glowing background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-72 w-72 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
      </div>

      {/* Floating Background Icons */}
      <div className="floating-icon absolute top-20 left-20 text-6xl opacity-30" style={{ transform: 'translateZ(-50px)' }}>📚</div>
      <div className="floating-icon absolute top-40 right-32 text-5xl opacity-25" style={{ transform: 'translateZ(-50px)' }}>✨</div>
      <div className="floating-icon absolute bottom-32 left-16 text-7xl opacity-20" style={{ transform: 'translateZ(-50px)' }}>🚀</div>
      <div className="floating-icon absolute bottom-20 right-20 text-6xl opacity-30" style={{ transform: 'translateZ(-50px)' }}>🎮</div>
      <div className="floating-icon absolute top-60 left-1/2 text-4xl opacity-25" style={{ transform: 'translateZ(-50px)' }}>🌟</div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10">
        {/* Left Side Illustration */}
        <div className="flex-1 text-center lg:text-left">
          <div className="text-white mb-8">
            {/* Gradient Heading */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 drop-shadow-xl">
              LearnMyWay
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 font-semibold text-slate-200">Where Learning Becomes an Adventure! 🌟</p>
          </div>
          <div className="flex justify-center lg:justify-start space-x-12">
            <div className="text-6xl lg:text-8xl wiggle">🧑‍🎓</div>
            <div className="text-6xl lg:text-8xl wiggle">👩‍🏫</div>
            <div className="text-6xl lg:text-8xl wiggle">👨‍👩‍👧‍👦</div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 w-full max-w-md">
          <div className="rounded-2xl bg-white/8 border border-white/20 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.85)] p-6 sm:p-10 relative group transform group-hover:-translate-y-1 transition-all duration-300">
            {/* Toggle Buttons */}
            <div className="flex bg-white/10 rounded-xl p-1 mb-6">
              <button
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 text-white shadow-md ${isLogin ? 'bg-gradient-to-r from-sky-500 to-cyan-500 shadow-sky-500/50' : 'bg-transparent hover:bg-white/10'}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 text-white shadow-md ${!isLogin ? 'bg-gradient-to-r from-indigo-500 to-sky-500 shadow-indigo-500/50' : 'bg-transparent hover:bg-white/10'}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {/* Form Content */}
            {isLogin ? (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back, Adventurer!</h2>
                  <p className="text-slate-300 opacity-80">Your adventure continues 🚀</p>
                </div>
                <FloatingInput
                  icon={<Mail className="w-4 h-4 text-sky-300" />}
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FloatingInput
                  icon={<Lock className="w-4 h-4 text-sky-300" />}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isPassword
                />
                <div className="text-center mb-6">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                    className="text-sm text-sky-300 hover:text-sky-200 underline transition-colors duration-200"
                  >
                    Forgot Password? 🤔
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 text-white font-bold text-lg rounded-xl shadow-[0_10px_30px_rgba(56,189,248,0.5)] hover:shadow-[0_15px_40px_rgba(56,189,248,0.7)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  Start Learning! 🎯
                </button>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Join the Adventure!</h2>
                  <p className="text-slate-300 opacity-80">Unlock your learning superpowers ✨</p>
                </div>
                <FloatingInput
                  icon={<User className="w-4 h-4 text-indigo-300" />}
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <FloatingInput
                  icon={<Mail className="w-4 h-4 text-indigo-300" />}
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FloatingInput
                  icon={<Lock className="w-4 h-4 text-indigo-300" />}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isPassword
                />
                <FloatingInput
                  icon={<Calendar className="w-4 h-4 text-emerald-300" />}
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <FloatingSelect
                  icon={<GraduationCap className="w-4 h-4 text-emerald-300" />}
                  label="Select Your Class"
                  value={userClass}
                  onChange={(e) => setUserClass(e.target.value)}
                  options={["4th std", "5th std", "6th std", "7th std", "8th std", "9th std", "10th std"]}
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 text-white font-bold text-lg rounded-xl shadow-[0_10px_30px_rgba(56,189,248,0.5)] hover:shadow-[0_15px_40px_rgba(56,189,248,0.7)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  Begin My Journey! 🌟
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white/8 border border-white/20 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.85)] p-6">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Reset Password</h2>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <FloatingInput
                icon={<Mail className="w-4 h-4 text-sky-300" />}
                label="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordModalOpen(false)}
                  className="flex-1 py-3 bg-white/10 border border-white/20 text-slate-200 rounded-xl hover:bg-white/20 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-[0_10px_30px_rgba(56,189,248,0.5)] transition-all duration-200"
                >
                  Send Link ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .floating-icon {
          animation: wiggle 4s cubic-bezier(0.25, 0.8, 0.25, 1.2) infinite;
        }
        .floating-icon:nth-child(2) { animation-delay: -1.5s; }
        .floating-icon:nth-child(3) { animation-delay: -3s; }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        /* Hide default date input placeholder */
        input[type="date"]::-webkit-datetime-edit {
          color: transparent;
          display: block;
        }
        input[type="date"]::-webkit-datetime-edit-fields-wrapper {
          color: transparent;
        }
        input[type="date"]::-webkit-datetime-edit-text {
          color: transparent;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button {
          display: none;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          color: rgba(255, 255, 255, 0.5);
          opacity: 0.8;
          cursor: pointer;
          filter: invert(1);
        }
        input[type="date"]:focus::-webkit-calendar-picker-indicator {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

/* --- Floating Input Component --- */
const FloatingInput = ({ icon, label, type, value, onChange, isPassword }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
  };

  const isFilled = value && value.length > 0;
  const isDate = type === 'date';
  const iconSize = isDate ? 'w-5 h-5' : 'w-4 h-4';
  const iconTextSize = isDate ? 'text-2xl' : 'text-xl';
  const paddingLeft = isDate ? 'pl-16' : 'pl-12';
  const labelLeft = isDate ? 'left-20' : 'left-12';
  const iconLeft = isDate ? 'left-4' : 'left-4';

  return (
    <div className="relative">
      <div className={`absolute ${iconLeft} top-1/2 transform -translate-y-1/2 ${iconTextSize} pointer-events-none z-10 text-emerald-300`}>
        {React.cloneElement(icon, { className: `${icon.props.className || ''} ${iconSize}` })}
      </div>
      <input
        ref={inputRef}
        className={`peer w-full ${paddingLeft} pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-semibold focus:outline-none focus:border-sky-400 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.2)] transition-all duration-200 placeholder-transparent`}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required
        placeholder=" "
      />
      <label
        className={`absolute ${labelLeft} transition-all duration-200 pointer-events-none text-base ${isFilled || isFocused
            ? 'opacity-0'
            : 'top-1/2 -translate-y-1/2 text-white/70'
          }`}
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 z-10"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};

/* --- Floating Select Component --- */
const FloatingSelect = ({ icon, label, value, onChange, options }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
      setIsOpen(false);
    }
  };

  const handleSelect = (option: string) => {
    onChange({ target: { value: option } } as React.ChangeEvent<HTMLSelectElement>);
    setIsOpen(false);
  };

  const isFilled = value && value.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-300 text-xl pointer-events-none z-10">
        {icon}
      </div>
      <div
        className={`w-full pl-12 pr-10 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-semibold focus:outline-none cursor-pointer flex justify-between items-center transition-all duration-200 hover:bg-white/15 focus:border-sky-400 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.2)] ${isFocused ? 'ring-2 ring-sky-400/20' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={0}
      >
        <span>{value}</span>
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </div>
      <label
        className={`absolute left-12 transition-all duration-200 pointer-events-none text-base ${isFilled || isFocused
            ? 'opacity-0'
            : 'top-1/2 -translate-y-1/2 text-white/70'
          }`}
      >
        {label}
      </label>
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl bg-black border border-white/20 overflow-hidden z-20 max-h-48 overflow-y-auto shadow-lg no-scrollbar">
          {options.map((option: string, idx: number) => (
            <div
              key={idx}
              className="py-3 px-4 text-white hover:bg-white/20 cursor-pointer transition-colors duration-200"
              onClick={() => handleSelect(option)}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthPage;