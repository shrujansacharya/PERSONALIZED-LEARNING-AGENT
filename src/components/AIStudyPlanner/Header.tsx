import React from 'react';
import { BookOpen, Brain, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = "AI Study Planner",
  subtitle = "Your personalized AI-powered study partner",
  onBack
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white py-6 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center space-x-2">
              <BookOpen className="w-7 h-7" />
              <span>{title}</span>
            </h1>
            <p className="text-blue-100 text-sm md:text-base">{subtitle}</p>
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>
    </header>
  );
};

export default Header;
