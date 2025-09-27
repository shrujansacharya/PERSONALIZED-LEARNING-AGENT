# model.py - Enhanced AI Model with better error handling
import os
import dotenv
import vertexai
from vertexai.generative_models import GenerativeModel
import googleapiclient.discovery
import requests
import base64
import json
import logging
from typing import Dict, List, Optional, Any
import time
import re
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
dotenv.load_dotenv()

# Set credentials
credentials_path = os.path.join(os.getcwd(), 'agile-ratio-451415-u9-3af22c65bd8d.json')
if os.path.exists(credentials_path):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path

gcp_project_id = os.getenv("GCP_PROJECT_ID", "agile-ratio-451415-u9")

try:
    vertexai.init(project=gcp_project_id, location="us-central1")
    model = GenerativeModel("gemini-2.0-flash-exp")
    logger.info("Successfully initialized Vertex AI")
except Exception as e:
    logger.error(f"Failed to initialize Vertex AI: {str(e)}")
    model = None

class StudentModel:
    def __init__(self):
        self.student_data = {}
        self.model = model
        self.max_retries = 3
        self.retry_delay = 1
        
    def set_data(self, key: str, value: Any) -> None:
        self.student_data[key] = value
        logger.debug(f"Set data: {key} = {type(value).__name__}")

    def get_data(self, key: str) -> Any:
        return self.student_data.get(key)

    def _make_api_call_with_retry(self, prompt: str, max_tokens: int = 2048) -> Optional[str]:
        if not self.model:
            logger.error("Model not initialized")
            return None
            
        for attempt in range(self.max_retries):
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config={
                        "max_output_tokens": max_tokens,
                        "temperature": 0.7,
                        "top_p": 0.8,
                        "top_k": 40
                    }
                )
                
                if response and response.text:
                    logger.info(f"API call successful on attempt {attempt + 1}")
                    return response.text
                else:
                    logger.warning(f"Empty response on attempt {attempt + 1}")
                    
            except Exception as e:
                logger.error(f"API call failed on attempt {attempt + 1}: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                else:
                    logger.error("All API call attempts failed")
                    return None
        return None

    def generate_plan(self, syllabus: str, days: int, learning_style: str, 
                     class_standard: str = 'Grade 8', subject: str = '') -> str:
        if not syllabus.strip():
            return "Error: No study content provided. Please upload study materials."
        
        prompt = f"""
        You are an expert AI tutor. Create a comprehensive study plan:

        **STUDENT PROFILE:**
        - Education Level: {class_standard}
        - Subject: {subject}
        - Learning Style: {learning_style}
        - Available Time: {days} days

        **STUDY MATERIALS:**
        {syllabus[:2000]}

        **CREATE:**
        1. Day-by-day breakdown for {days} days
        2. {learning_style}-specific techniques
        3. Clear learning objectives for each day
        4. Self-assessment questions
        5. Progress checkpoints
        6. Weekly review sessions

        Format with clear headings and bullet points. Make it actionable for {class_standard} students.
        """
        
        response = self._make_api_call_with_retry(prompt, max_tokens=3000)
        return response if response else self._generate_fallback_plan(days, subject, learning_style)

    def _generate_fallback_plan(self, days: int, subject: str, learning_style: str) -> str:
        return f"""# 📚 Study Plan - {subject} ({days} days)

## Learning Style: {learning_style}

### Daily Schedule:
- Morning: 2 hours review
- Afternoon: 3 hours practice  
- Evening: 1 hour revision

### Weekly Pattern:
- Days 1-5: New concepts
- Day 6: Review and practice
- Day 7: Assessment and planning

*This is a basic plan. Please try regenerating for a detailed version.*
"""

    def adapt_plan(self, quiz_score: float, previous_plan: str) -> str:
        performance_level = "excellent" if quiz_score >= 90 else "good" if quiz_score >= 80 else "needs improvement"
        
        prompt = f"""
        Adapt the study plan based on quiz performance:
        
        **PERFORMANCE:** {quiz_score}% ({performance_level})
        **PREVIOUS PLAN:** {previous_plan[:1000]}
        
        Provide specific improvements and focus areas.
        """
        
        response = self._make_api_call_with_retry(prompt, max_tokens=1500)
        return response if response else f"Score: {quiz_score}%. Focus on weak areas and practice more."

    def generate_answers(self, question_paper_text: str, textbook_text: str, subject: str) -> str:
        if not question_paper_text.strip():
            return "Error: No question paper provided."
        
        prompt = f"""
        Generate comprehensive answers for {subject} questions:
        
        **TEXTBOOK:** {textbook_text[:1500]}
        **QUESTIONS:** {question_paper_text[:1500]}
        
        Provide detailed, numbered answers with explanations.
        """
        
        response = self._make_api_call_with_retry(prompt, max_tokens=2500)
        return response if response else "Unable to generate answers. Please try again."

    def generate_quiz(self, textbook_text: str, subject: str) -> List[Dict]:
        prompt = f"""
        Create 5 multiple-choice questions for {subject} based on:
        {textbook_text[:1000]}
        
        Format as JSON: [{{"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct": "A"}}]
        """
        
        response = self._make_api_call_with_retry(prompt)
        if response:
            try:
                return json.loads(response.strip())
            except:
                logger.error("Failed to parse quiz JSON")
        
        return [{
            "question": f"What is a key concept in {subject}?",
            "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
            "correct": "A"
        }]

    def generate_tts(self, text: str) -> Optional[bytes]:
        try:
            url = "https://texttospeech.googleapis.com/v1/text:synthesize"
            data = {
                "input": {"text": text[:1000]},
                "voice": {"languageCode": "en-US", "name": "en-US-Wavenet-D"},
                "audioConfig": {"audioEncoding": "MP3"}
            }
            params = {"key": "AIzaSyDxF6WaGax1IbNXMDx1ZIdG6hVm6fvbFIs"}
            
            response = requests.post(url, json=data, params=params, timeout=30)
            if response.status_code == 200:
                return base64.b64decode(response.json()["audioContent"])
        except Exception as e:
            logger.error(f"TTS generation failed: {str(e)}")
        return None

    def get_youtube_videos(self, subject: str, max_results: int = 5) -> List[Dict]:
        try:
            api_key = os.getenv("YOUTUBE_API_KEY")
            if not api_key:
                return []
            
            youtube = googleapiclient.discovery.build("youtube", "v3", developerKey=api_key)
            request = youtube.search().list(
                part="snippet",
                q=f"{subject} tutorial education",
                type="video",
                maxResults=max_results,
                order="relevance"
            )
            response = request.execute()
            
            videos = []
            for item in response['items']:
                videos.append({
                    'title': item['snippet']['title'],
                    'video_id': item['id']['videoId'],
                    'thumbnail': item['snippet']['thumbnails']['default']['url'],
                    'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                })
            return videos
        except Exception as e:
            logger.error(f"YouTube API error: {str(e)}")
            return []