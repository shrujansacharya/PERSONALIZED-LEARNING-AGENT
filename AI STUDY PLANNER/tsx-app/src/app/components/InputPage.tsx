import React, { useState } from 'react';
import { Upload, FileText, BookOpen, Calendar, Target, Zap, Send } from 'lucide-react';

interface InputPageProps {
  onSubmit: (data: {
    userPrompt: string;
    textbookFile: File | null;
    questionPaperFile: File | null;
    classStandard: string;
    subject: string;
    days: number;
    learningStyle: string;
  }) => void;
}

const classStandards = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "Undergraduate", "Graduate", "Other"
];

const learningStyles = ["Visual", "Auditory"];

const InputPage: React.FC<InputPageProps> = ({ onSubmit }) => {
  const [userPrompt, setUserPrompt] = useState("Generate a study plan based on the uploaded content");
  const [textbookFile, setTextbookFile] = useState<File | null>(null);
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [classStandard, setClassStandard] = useState("Grade 8");
  const [subject, setSubject] = useState("");
  const [days, setDays] = useState(5);
  const [learningStyle, setLearningStyle] = useState("Visual");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userPrompt && days && learningStyle && classStandard && subject) {
      onSubmit({
        userPrompt,
        textbookFile,
        questionPaperFile,
        classStandard,
        subject,
        days,
        learningStyle
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Study Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload your materials and let AI craft a personalized learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Study Materials Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Study Materials
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Study Prompt</span>
                </label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  rows={3}
                  placeholder="Describe your study goals..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Textbook (PDF or TXT)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => setTextbookFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Question Paper (PDF or TXT)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => setQuestionPaperFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900 dark:file:text-green-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Study Preferences Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Study Preferences
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Class/Standard</span>
                </label>
                <select
                  value={classStandard}
                  onChange={(e) => setClassStandard(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {classStandards.map((standard) => (
                    <option key={standard} value={standard} className="bg-white dark:bg-gray-700">
                      {standard}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Subject</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g., Math, Science, History"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Days Available</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Learning Style</span>
                </label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {learningStyles.map((style) => (
                    <option key={style} value={style} className="bg-white dark:bg-gray-700">
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
            >
              <Send className="w-5 h-5" />
              <span>Generate My Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputPage;
