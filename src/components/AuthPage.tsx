import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification // 👈 --- ADDED: Import for sending verification email
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import './AuthPage.css'; // Assuming this file might contain custom font/base body styles

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

      // 📧 --- ADDED: Send verification email to the new user
      await sendEmailVerification(user);

      // Register user details in your backend
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

      // 📢 --- MODIFIED: Update alert and redirect to the verification page
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

  // Define a soft, spring-like transition for Framer Motion
  const softSpring = {
    type: "spring",
    stiffness: 80, // Lower stiffness for a softer feel
    damping: 15,   // Higher damping for quick settling
    mass: 0.5,
  };

  return (
    // Updated background and added perspective for 3D effect
    <div className="animated-bg cosmic-bg min-h-screen flex items-center justify-center p-4 overflow-hidden relative" style={{ perspective: '1200px' }}>
      <style>
        {`
        /* Global Base */
        * { font-family: 'Baloo 2', cursive; }

        /* Custom Smooth Transition Curve for "Fur" feel */
        .smooth-transition {
            transition: all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1.2); 
        }

        /* Cosmic Background Gradient (deeper, warmer colors) */
        .cosmic-bg {
            background: linear-gradient(135deg, #18032d 0%, #2f074d 50%, #150040 100%);
        }

        /* 3D Glass Card Base (SQUARE CARD UPDATES) */
        .glass-card { 
            background-color: rgba(255, 255, 255, 0.08); /* Slightly more opaque */
            backdrop-filter: blur(18px); /* More blur */
            border: 1px solid rgba(255, 255, 255, 0.2); 
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2); /* Deeper Shadow + Inner Glow */
            transform-style: preserve-3d;
            transition: all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1.2); 
            transform: translateZ(20px); 
            border-radius: 2rem; /* SQUARE LOOK: Rounded-3xl / 2xl for modern box feel */
        }
        
        /* Input Glow (SQUARE CARD UPDATES) */
        .input-glow {
            transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
            border-radius: 1.5rem; /* Smoother input corners */
        }

        .input-glow:focus {
            border-color: #f0abfc; /* Softer pink neon border on focus */
            box-shadow: 0 0 18px rgba(240, 171, 252, 0.8); 
            background-color: rgba(255, 255, 255, 0.15);
        }

        /* Button Bounce & Neon Shadow (SQUARE CARD UPDATES) */
        .btn-bounce {
            position: relative;
            transform: translateZ(10px);
            transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1.2), box-shadow 0.5s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border-radius: 1.5rem; /* SQUARE LOOK: Rounded-2xl / 3xl */
        }

        .btn-bounce:hover {
            transform: translateZ(30px) translateY(-8px);
            box-shadow: 0 20px 50px rgba(168, 85, 247, 0.9), 0 0 40px rgba(236, 72, 153, 0.8); /* Richer, softer shadow colors */
        }

        /* Particle Animation */
        @keyframes particleFloat {
            0% { transform: translate(0, 0) scale(1) translateZ(-50px); }
            25% { transform: translate(20vw, 50vh) scale(1.1) translateZ(0); }
            50% { transform: translate(50vw, 0) scale(0.9) translateZ(-50px); }
            75% { transform: translate(80vw, 40vh) scale(1.15) translateZ(0); }
            100% { transform: translate(100vw, 10vh) scale(1) translateZ(-50px); }
        }
        
        /* Icon Wiggle */
        .wiggle {
            animation: wiggle 4s cubic-bezier(0.25, 0.8, 0.25, 1.2) infinite;
        }
        .wiggle:nth-child(2) { animation-delay: -1.5s; }
        .wiggle:nth-child(3) { animation-delay: -3s; }

        @keyframes wiggle {
            0%, 100% { transform: rotate(0deg) translateZ(0); }
            50% { transform: rotate(3deg) translateZ(15px); } /* Softer wiggle, deeper Z-depth */
        }
        `}
      </style>

      {/* Floating Background Icons (Pushed back with translateZ) */}
      <div className="floating-icon absolute top-20 left-20 text-6xl opacity-30" style={{ transform: 'translateZ(-50px)' }}>📚</div>
      <div className="floating-icon absolute top-40 right-32 text-5xl opacity-25" style={{ transform: 'translateZ(-50px)' }}>✨</div>
      <div className="floating-icon absolute bottom-32 left-16 text-7xl opacity-20" style={{ transform: 'translateZ(-50px)' }}>🚀</div>
      <div className="floating-icon absolute bottom-20 right-20 text-6xl opacity-30" style={{ transform: 'translateZ(-50px)' }}>🎮</div>
      <div className="floating-icon absolute top-60 left-1/2 text-4xl opacity-25" style={{ transform: 'translateZ(-50px)' }}>🌟</div>

      {/* Animated Particles (Using animation defined in style block) */}
      <div className="particles-container absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle absolute w-3 h-3 bg-fuchsia-300 rounded-full opacity-60" style={{ top: '10%', left: '15%', animation: 'particleFloat 8s linear infinite', boxShadow: '0 0 10px #f0abfc' }}></div>
        <div className="particle absolute w-2 h-2 bg-pink-300 rounded-full opacity-70" style={{ top: '20%', left: '80%', animation: 'particleFloat 12s linear infinite 2s', boxShadow: '0 0 10px #f9a8d4' }}></div>
        <div className="particle absolute w-4 h-4 bg-indigo-300 rounded-full opacity-50" style={{ top: '60%', left: '10%', animation: 'particleFloat 10s linear infinite 4s', boxShadow: '0 0 10px #a5b4fc' }}></div>
        <div className="particle absolute w-3 h-3 bg-purple-300 rounded-full opacity-60" style={{ top: '80%', left: '70%', animation: 'particleFloat 15s linear infinite 1s', boxShadow: '0 0 10px #c4b5fd' }}></div>
        <div className="particle absolute w-2 h-2 bg-yellow-300 rounded-full opacity-80" style={{ top: '30%', left: '60%', animation: 'particleFloat 9s linear infinite 3s', boxShadow: '0 0 10px #fde047' }}></div>
        <div className="particle absolute w-3 h-3 bg-teal-300 rounded-full opacity-50" style={{ top: '70%', left: '30%', animation: 'particleFloat 11s linear infinite 5s', boxShadow: '0 0 10px #99f6e4' }}></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10" style={{ transformStyle: 'preserve-3d' }}>
        {/* Left Side Illustration */}
        <div className="flex-1 text-center lg:text-left" style={{ transform: 'translateZ(30px)' }}>
          <div className="text-white mb-8">
            {/* Soft Neon Heading */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-fuchsia-400 to-purple-400 drop-shadow-xl" style={{ textShadow: '0 0 10px rgba(236, 72, 153, 0.6)' }}>
              LearnMyWay
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 font-semibold text-fuchsia-100">Where Learning Becomes an Adventure! 🌟</p>
          </div>
          <div className="flex justify-center lg:justify-start space-x-12">
            <div className="wiggle text-6xl lg:text-8xl" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))' }}>🧑‍🎓</div>
            <div className="wiggle text-6xl lg:text-8xl" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))' }}>👩‍🏫</div>
            <div className="wiggle text-6xl lg:text-8xl" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))' }}>👨‍👩‍👧‍👦</div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 80, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={softSpring} // Applied soft spring transition
            className="glass-card rounded-2xl p-10 relative" // SQUARE LOOK: Adjusted rounding
            style={{ transformStyle: 'preserve-3d', transformOrigin: 'bottom center' }}
          >
            {/* Toggle Buttons (SQUARE LOOK: Adjusted rounding) */}
            <div className="flex bg-white bg-opacity-10 rounded-xl p-1 mb-8" style={{ transform: 'translateZ(5px)' }}>
              <button
                className={`flex-1 py-3 px-6 rounded-xl font-bold smooth-transition text-white shadow-md ${isLogin ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-pink-500/50' : 'bg-transparent hover:bg-white/10'}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-3 px-6 rounded-xl font-bold smooth-transition text-white shadow-md ${!isLogin ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-pink-500/50' : 'bg-transparent hover:bg-white/10'}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {/* Form Content with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={softSpring} // Applied soft spring transition
                style={{ transformStyle: 'preserve-3d' }}
              >
                {isLogin ? (
                  /* Login Form */
                  <div id="loginForm">
                    <div className="text-center mb-8" style={{ transform: 'translateZ(10px)' }}>
                      <h2 className="text-3xl font-bold text-white mb-2">Welcome Back, Adventurer!</h2>
                      <p className="text-fuchsia-200 opacity-80">Your adventure continues 🚀</p>
                    </div>

                    <form onSubmit={handleLogin}>
                      <FloatingInput
                        icon="📧"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <FloatingInput
                        icon="🔒"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isPassword
                      />
                      <div className="text-center mb-8" style={{ transform: 'translateZ(5px)' }}>
                        <span
                          onClick={() => setIsForgotPasswordModalOpen(true)}
                          className="cursor-pointer text-pink-300 opacity-80 hover:opacity-100 font-semibold underline smooth-transition"
                        >
                          Forgot Password? 🤔
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="btn-bounce w-full py-5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-indigo-500 text-white font-black text-xl rounded-2xl shadow-2xl smooth-transition" // SQUARE LOOK: Adjusted rounding
                      >
                        Start Learning! 🎯
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Signup Form */
                  <div id="signupForm">
                    <div className="text-center mb-8" style={{ transform: 'translateZ(10px)' }}>
                      <h2 className="text-3xl font-bold text-white mb-2">Join the Adventure!</h2>
                      <p className="text-fuchsia-200 opacity-80">Unlock your learning superpowers ✨</p>
                    </div>

                    <form onSubmit={handleSignup}>
                      <FloatingInput
                        icon="👤"
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <FloatingInput
                        icon="📧"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <FloatingInput
                        icon="🔒"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isPassword
                      />
                      <FloatingInput
                        icon="🎂"
                        label="Date of Birth"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                      <FloatingSelect
                        icon="🎓"
                        label="Select Your Class"
                        value={userClass}
                        onChange={(e) => setUserClass(e.target.value)}
                        options={["4th std", "5th std", "6th std", "7th std", "8th std", "9th std", "10th std"]}
                      />
                      <button
                        type="submit"
                        className="btn-bounce w-full py-5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-2xl smooth-transition" // SQUARE LOOK: Adjusted rounding
                      >
                        Begin My Journey! 🌟
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isForgotPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" // Deeper overlay
          >
            <motion.div
              initial={{ y: 60, opacity: 0, rotateX: 15, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
              exit={{ y: 60, opacity: 0, rotateX: 15, scale: 0.8 }}
              transition={softSpring}
              className="relative w-full max-w-md glass-card rounded-2xl p-10 border text-white" // SQUARE LOOK: Adjusted rounding
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h2 className="text-3xl font-bold text-center mb-8" style={{ transform: 'translateZ(10px)' }}>Reset Password</h2>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <FloatingInput
                  icon="📧"
                  label="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="flex gap-4" style={{ transform: 'translateZ(5px)' }}>
                  <button
                    type="button"
                    className="flex-1 py-4 bg-gray-500 bg-opacity-30 text-white font-bold rounded-2xl hover:bg-opacity-50 smooth-transition" // SQUARE LOOK: Adjusted rounding
                    onClick={() => setIsForgotPasswordModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl smooth-transition" // SQUARE LOOK: Adjusted rounding
                  >
                    Send Link ✨
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Floating Input Component --- */
const FloatingInput = ({ icon, label, type, value, onChange, isPassword }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full mb-6" style={{ transform: 'translateZ(10px)' }}>
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-300 text-xl" style={{ transform: 'translateZ(1px)' }}>
        {icon}
      </div>
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        required
        // Updated input classes for smooth, rounded look (SQUARE LOOK: Adjusted rounding)
        className="input-glow w-full pl-12 pr-12 py-4 bg-white bg-opacity-15 border border-white border-opacity-30 rounded-2xl text-white font-semibold focus:outline-none placeholder-transparent smooth-transition"
        placeholder=" "
      />
      <label
        className="absolute left-12 text-white/70 smooth-transition
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                   peer-placeholder-shown:text-base
                   peer-focus:top-3 peer-focus:text-sm peer-focus:text-pink-400"
        style={{ transform: 'translateZ(1px)' }}
      >
        {label}
      </label>

      {isPassword && (
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white smooth-transition"
          style={{ transform: 'translateZ(1px)' }}
        >
          {showPassword ? "🙈" : "👁️"}
        </span>
      )}
    </div>
  );
};

/* --- Floating Select Component --- */
const FloatingSelect = ({ icon, label, value, onChange, options }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full mb-8" style={{ transform: 'translateZ(10px)' }}>
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-300 text-xl pointer-events-none" style={{ transform: 'translateZ(1px)' }}>
        {icon}
      </div>
      <div
        // SQUARE LOOK: Adjusted rounding
        className="input-glow w-full pl-12 pr-4 py-4 bg-white bg-opacity-15 border border-white border-opacity-30 rounded-2xl text-white font-semibold focus:outline-none cursor-pointer flex justify-between items-center smooth-transition"
        onClick={() => setIsOpen(!isOpen)}
        style={{ transform: 'translateZ(0)' }}
      >
        <span>{value || label}</span>
        <span className={`transform smooth-transition ${isOpen ? 'rotate-180' : ''}`} style={{ transform: 'translateZ(1px)' }}>▾</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.8 }}
            transition={{ type: "tween", duration: 0.3 }} // Using a fast tween for dropdown
            className="absolute bottom-full left-0 right-0 mb-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 overflow-hidden z-20" // SQUARE LOOK: Adjusted rounding
            style={{ transform: 'translateZ(25px)', transformOrigin: 'bottom center' }}
          >
            {options.map((option: string, idx: number) => (
              <div
                key={idx}
                className="py-3 px-12 text-white hover:bg-white/20 smooth-transition cursor-pointer"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;