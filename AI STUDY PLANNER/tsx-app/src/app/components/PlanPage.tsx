import React, { useState } from 'react';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { Calendar, FileText, Play, Download, ArrowLeft, Volume2, Award } from 'lucide-react';

interface Video {
  title: string;
  video_id: string;
  thumbnail: string;
  url: string;
}

interface PlanPageProps {
  plan: string;
  questionAnswers: string;
  onBack: () => void;
  onSubmitQuizScore: (score: number) => void;
  youtubeVideos: Video[];
  learningStyle: string;
}

const PlanPage: React.FC<PlanPageProps> = ({
  plan,
  questionAnswers,
  onBack,
  onSubmitQuizScore,
  youtubeVideos,
  learningStyle,
}) => {
  const [view, setView] = useState<'plan' | 'answers'>('plan');
  const [quizScore, setQuizScore] = useState(75);

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitQuizScore(quizScore);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 4000)); // Limit to 4000 chars
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };

  const downloadPDF = (planText: string, answersText: string) => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text('Study Plan', 20, 20);
    pdf.setFontSize(12);
    const planLines = pdf.splitTextToSize(planText, 180);
    pdf.text(planLines, 20, 30);

    if (answersText) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Answers to Question Paper', 20, 20);
      pdf.setFontSize(12);
      const answersLines = pdf.splitTextToSize(answersText, 180);
      pdf.text(answersLines, 20, 30);
    }

    pdf.save('study_plan_answers.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Study Plan & Resources
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-generated personalized learning materials
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 border border-gray-200 dark:border-gray-700">
            <button
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                view === 'plan'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setView('plan')}
            >
              Study Plan
            </button>
            <button
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                view === 'answers'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setView('answers')}
            >
              Question Answers
            </button>
          </div>
        </div>

        {view === 'plan' && (
          <div className="space-y-8">
            {/* Study Plan Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Your Daily Study Plan
                  </h2>
                </div>
                {learningStyle.toLowerCase() === 'auditory' && (
                  <button
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    onClick={() => speakText(plan)}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </button>
                )}
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700 rounded-lg p-4 whitespace-pre-wrap text-gray-900 dark:text-white max-h-96 overflow-y-auto">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>
            </div>

            {/* YouTube Videos Section */}
            {youtubeVideos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <Play className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Recommended YouTube Videos
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {youtubeVideos.map((video) => (
                    <div key={video.video_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                      <div className="aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${video.video_id}`}
                          frameBorder="0"
                          allowFullScreen
                          title={video.title}
                          className="rounded-t-lg"
                        ></iframe>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {video.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Quiz Time!
                </h2>
              </div>
              <form onSubmit={handleSubmitQuiz} className="space-y-6">
                <div>
                  <label htmlFor="quizScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Your quiz score (in %)
                  </label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      id="quizScore"
                      min="0"
                      max="100"
                      value={quizScore}
                      onChange={(e) => setQuizScore(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>0%</span>
                      <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">{quizScore}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                >
                  Submit Score & Adapt Plan
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
                onClick={() => downloadPDF(plan, questionAnswers)}
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        )}

        {view === 'answers' && (
          <div className="space-y-8">
            {/* Answers Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Answers to Question Paper
                  </h2>
                </div>
                {learningStyle.toLowerCase() === 'auditory' && (
                  <button
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    onClick={() => speakText(questionAnswers)}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </button>
                )}
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700 rounded-lg p-4 whitespace-pre-wrap text-gray-900 dark:text-white max-h-96 overflow-y-auto">
                <ReactMarkdown>{questionAnswers}</ReactMarkdown>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
                onClick={() => downloadPDF(plan, questionAnswers)}
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanPage;
