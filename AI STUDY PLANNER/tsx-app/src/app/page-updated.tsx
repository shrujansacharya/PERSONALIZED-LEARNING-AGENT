'use client';

import { useState } from 'react';
import InputPage from './components/InputPage';
import PlanPage from './components/PlanPage';

interface Video {
  title: string;
  video_id: string;
  thumbnail: string;
  url: string;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'input' | 'plan'>('input');
  const [plan, setPlan] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState<Video[]>([]);
  const [learningStyle, setLearningStyle] = useState('Visual');

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
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
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
    <>
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
    </>
  );
}
