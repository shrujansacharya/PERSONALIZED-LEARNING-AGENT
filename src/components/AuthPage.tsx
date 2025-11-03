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
import './AuthPage.css';

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

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating Background Icons */}
      <div className="floating-icon absolute top-20 left-20 text-6xl opacity-30">📚</div>
      <div className="floating-icon absolute top-40 right-32 text-5xl opacity-25">✨</div>
      <div className="floating-icon absolute bottom-32 left-16 text-7xl opacity-20">🚀</div>
      <div className="floating-icon absolute bottom-20 right-20 text-6xl opacity-30">🎮</div>
      <div className="floating-icon absolute top-60 left-1/2 text-4xl opacity-25">🌟</div>

      {/* Animated Particles */}
      <div className="particles-container absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle absolute w-2 h-2 bg-white rounded-full opacity-60" style={{ top: '10%', left: '15%', animation: 'particleFloat 8s linear infinite' }}></div>
        <div className="particle absolute w-1 h-1 bg-pink-300 rounded-full opacity-70" style={{ top: '20%', left: '80%', animation: 'particleFloat 12s linear infinite 2s' }}></div>
        <div className="particle absolute w-3 h-3 bg-blue-300 rounded-full opacity-50" style={{ top: '60%', left: '10%', animation: 'particleFloat 10s linear infinite 4s' }}></div>
        <div className="particle absolute w-2 h-2 bg-purple-300 rounded-full opacity-60" style={{ top: '80%', left: '70%', animation: 'particleFloat 15s linear infinite 1s' }}></div>
        <div className="particle absolute w-1 h-1 bg-yellow-300 rounded-full opacity-80" style={{ top: '30%', left: '60%', animation: 'particleFloat 9s linear infinite 3s' }}></div>
        <div className="particle absolute w-2 h-2 bg-green-300 rounded-full opacity-50" style={{ top: '70%', left: '30%', animation: 'particleFloat 11s linear infinite 5s' }}></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 z-10">
        {/* Left Side Illustration */}
        <div className="flex-1 text-center lg:text-left">
          <div className="text-white mb-8">
            <h1 className="text-5xl lg:text-7xl font-bold mb-4 drop-shadow-lg">LearnMyWay</h1>
            <p className="text-xl lg:text-2xl opacity-90 font-semibold">Where Learning Becomes an Adventure! 🌟</p>
          </div>
          <div className="flex justify-center lg:justify-start space-x-8">
            <div className="wiggle text-6xl lg:text-8xl">🧑‍🎓</div>
            <div className="wiggle text-6xl lg:text-8xl">👩‍🏫</div>
            <div className="wiggle text-6xl lg:text-8xl">👨‍👩‍👧‍👦</div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-3xl p-8 relative"
          >
            {/* Toggle Buttons */}
            <div className="flex bg-white bg-opacity-20 rounded-2xl p-1 mb-6">
              <button
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 ${!isLogin ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {/* Form Content with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLogin ? (
                  /* Login Form */
                  <div id="loginForm">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
                      <p className="text-white opacity-80">Your adventure continues 🚀</p>
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
                      <div className="text-center mb-6">
                        <span
                          onClick={() => setIsForgotPasswordModalOpen(true)}
                          className="cursor-pointer text-white opacity-80 hover:opacity-100 font-semibold underline"
                        >
                          Forgot Password? 🤔
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="btn-bounce w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Start Learning! 🎯
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Signup Form */
                  <div id="signupForm">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">Join the Adventure!</h2>
                      <p className="text-white opacity-80">Unlock your learning superpowers ✨</p>
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
                        className="btn-bounce w-full py-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-md glass-card rounded-2xl p-8 border text-white"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <FloatingInput
                  icon="📧"
                  label="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="flex-1 py-3 bg-gray-500 bg-opacity-50 text-white font-bold rounded-2xl hover:bg-opacity-70 transition-all duration-300"
                    onClick={() => setIsForgotPasswordModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300"
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
    <div className="relative w-full mb-4">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 text-xl">
        {icon}
      </div>
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        required
        className="input-glow w-full pl-12 pr-12 py-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-2xl text-white font-semibold focus:outline-none placeholder-transparent"
        placeholder=" "
      />
      <label
        className="absolute left-12 text-white/70 transition-all 
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
                   peer-placeholder-shown:text-base
                   peer-focus:top-3 peer-focus:text-xs peer-focus:text-pink-400"
      >
        {label}
      </label>

      {isPassword && (
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white"
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
    <div className="relative w-full mb-6">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 text-xl pointer-events-none">
        {icon}
      </div>
      <div
        className="input-glow w-full pl-12 pr-4 py-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-2xl text-white font-semibold focus:outline-none cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || label}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 overflow-hidden z-20"
          >
            {options.map((option: string, idx: number) => (
              <div
                key={idx}
                className="py-3 px-12 text-white hover:bg-white/20 transition-colors cursor-pointer"
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