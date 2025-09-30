import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import Header from './AIStudyPlanner/Header';
import InputPage from './AIStudyPlanner/InputPage';
import PlanPage from './AIStudyPlanner/PlanPage';

interface Video {
  title: string;
  video_id: string;
  thumbnail: string;
  url: string;
}

const AIStudyPlanner: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<'input' | 'plan'>('input');
  const [plan, setPlan] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState<Video[]>([]);
  const [learningStyle, setLearningStyle] = useState('Visual');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setLoading(true);
        try {
          const token = await user.getIdToken();
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            console.error("Failed to fetch user data.");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputSubmit = async (data: {
    userPrompt: string;
    textbookFile: File | null;
    questionPaperFile: File | null;
    classStandard: string;
    subject: string;
    days: number;
    learningStyle: string;
  }) => {
    try {
      // Extract text from files
      let textbookText = '';
      let questionPaperText = '';

      if (data.textbookFile) {
        textbookText = await extractTextFromFile(data.textbookFile);
      }

      if (data.questionPaperFile) {
        questionPaperText = await extractTextFromFile(data.questionPaperFile);
      }

      // Limit text length
      const maxLength = 2000;
      textbookText = textbookText.slice(0, maxLength);
      questionPaperText = questionPaperText.slice(0, maxLength);

      // Combine prompt and texts
      const fullContent = `${data.userPrompt}\n\nTextbook Content:\n${textbookText}\n\nQuestion Paper:\n${questionPaperText}\n\nSubject: ${data.subject}`;

      // Call API to generate plan
      const response = await fetch('http://localhost:5000/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syllabus: fullContent,
          days: data.days,
          learningStyle: data.learningStyle,
          classStandard: data.classStandard,
          subject: data.subject,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const result = await response.json();
      setPlan(result.plan);
      setLearningStyle(data.learningStyle);

      // Generate answers if question paper exists
      if (questionPaperText.trim()) {
        const answersResponse = await fetch('http://localhost:5000/api/generate-answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionPaperText,
            textbookText,
            subject: data.subject,
          }),
        });

        if (answersResponse.ok) {
          const answersResult = await answersResponse.json();
          setQuestionAnswers(answersResult.answers);
        }
      }

      // Fetch YouTube videos
      const videosResponse = await fetch('http://localhost:5000/api/youtube-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: data.subject,
        }),
      });

      if (videosResponse.ok) {
        const videosResult = await videosResponse.json();
        setYoutubeVideos(videosResult.videos);
      }

      setCurrentPage('plan');
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate study plan. Please try again.');
    }
  };

  const handleQuizSubmit = async (score: number) => {
    try {
      const response = await fetch('http://localhost:5000/api/adapt-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score,
          previousPlan: plan,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPlan(result.adaptedPlan);
        alert('Your plan has been adapted!');
      } else {
        alert('Failed to adapt plan. Please try again.');
      }
    } catch (error) {
      console.error('Error adapting plan:', error);
      alert('Failed to adapt plan. Please try again.');
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
      return await file.text();
    } else if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n';
        }

        return text;
      } catch (error) {
        console.error('Error parsing PDF:', error);
        return 'Error parsing PDF file';
      }
    } else {
      return '';
    }
  };

  return (
    <div>
      <Header onBack={() => navigate(-1)} />
      {currentPage === 'input' && (
        <InputPage onSubmit={handleInputSubmit} />
      )}
      {currentPage === 'plan' && (
        <PlanPage
          plan={plan}
          questionAnswers={questionAnswers}
          onBack={() => setCurrentPage('input')}
          onSubmitQuizScore={handleQuizSubmit}
          youtubeVideos={youtubeVideos}
          learningStyle={learningStyle}
        />
      )}
    </div>
  );
};

export default AIStudyPlanner;
