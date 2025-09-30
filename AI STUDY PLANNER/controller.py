# controller.py - Enhanced Business Logic Controller
from model import StudentModel
from utils import FileProcessor, DataValidator, ProgressTracker
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class StudentController:
    def __init__(self, model: StudentModel):
        self.model = model
        self.file_processor = FileProcessor()
        self.validator = DataValidator()
        self.progress_tracker = ProgressTracker()

    def create_and_get_plan(self, syllabus: str, days: int, learning_style: str, 
                           class_standard: str = 'Grade 8', subject: str = '') -> str:
        """Orchestrates plan generation with validation and storage"""
        try:
            # Validate inputs
            validation_result = self.validator.validate_plan_inputs(
                syllabus, days, learning_style, class_standard, subject
            )
            
            if not validation_result['is_valid']:
                return f"Validation Error: {validation_result['message']}"

            # Store initial inputs
            self.model.set_data('syllabus', syllabus)
            self.model.set_data('days', days)
            self.model.set_data('learning_style', learning_style)
            self.model.set_data('class_standard', class_standard)
            self.model.set_data('subject', subject)
            self.model.set_data('plan_created_date', datetime.now().isoformat())

            # Generate the plan
            plan = self.model.generate_plan(syllabus, days, learning_style, class_standard, subject)
            
            if plan and not plan.startswith("Error:"):
                self.model.set_data('current_plan', plan)
                
                # Initialize progress tracking
                self.progress_tracker.initialize_plan_tracking(days)
                
                logger.info(f"Study plan created successfully for {subject} - {class_standard}")
                return plan
            else:
                logger.error("Failed to generate valid study plan")
                return plan or "Failed to generate study plan. Please try again."
                
        except Exception as e:
            logger.error(f"Error in create_and_get_plan: {str(e)}")
            return f"Error creating study plan: {str(e)}"

    def submit_quiz_score(self, score: float, feedback: str = "") -> str:
        """Handles quiz submission and triggers plan adaptation"""
        try:
            if not 0 <= score <= 100:
                return "Error: Quiz score must be between 0 and 100."

            previous_plan = self.model.get_data('current_plan')
            if not previous_plan:
                return "Error: No current study plan found to adapt."

            # Record quiz performance
            quiz_record = {
                'score': score,
                'date': datetime.now().isoformat(),
                'feedback': feedback,
                'plan_version': self.model.get_data('plan_version', 1)
            }
            
            # Store quiz history
            quiz_history = self.model.get_data('quiz_history', [])
            quiz_history.append(quiz_record)
            self.model.set_data('quiz_history', quiz_history)

            # Generate adapted plan
            adapted_plan = self.model.adapt_plan(score, previous_plan)
            
            if adapted_plan:
                self.model.set_data('current_plan', adapted_plan)
                self.model.set_data('plan_version', self.model.get_data('plan_version', 1) + 1)
                self.model.set_data('last_adaptation_date', datetime.now().isoformat())
                
                # Update progress tracking
                self.progress_tracker.record_quiz_performance(score)
                
                logger.info(f"Plan adapted based on quiz score: {score}%")
                return adapted_plan
            else:
                logger.error("Failed to adapt plan")
                return "Failed to adapt plan. Please try again."
                
        except Exception as e:
            logger.error(f"Error in submit_quiz_score: {str(e)}")
            return f"Error processing quiz score: {str(e)}"

    def generate_answers(self, question_paper_text: str, textbook_text: str, subject: str) -> str:
        """Generates comprehensive answers with enhanced processing"""
        try:
            # Validate inputs
            if not question_paper_text.strip():
                return "Error: No question paper provided."

            # Process and clean the texts
            processed_questions = self.file_processor.clean_text(question_paper_text)
            processed_textbook = self.file_processor.clean_text(textbook_text) if textbook_text else ""

            # Generate answers
            answers = self.model.generate_answers(processed_questions, processed_textbook, subject)
            
            if answers and not answers.startswith("Error:"):
                # Store the generated answers for reference
                self.model.set_data('last_generated_answers', answers)
                self.model.set_data('answers_generated_date', datetime.now().isoformat())
                
                logger.info(f"Answers generated successfully for {subject}")
                return answers
            else:
                logger.error("Failed to generate answers")
                return answers or "Failed to generate answers. Please try again."
                
        except Exception as e:
            logger.error(f"Error in generate_answers: {str(e)}")
            return f"Error generating answers: {str(e)}"

    def get_youtube_videos(self, subject: str, max_results: int = 5) -> List[Dict]:
        """Fetches YouTube videos with error handling and caching"""
        try:
            # Check cache first
            cache_key = f"youtube_{subject.lower().replace(' ', '_')}"
            cached_videos = self.model.get_data(cache_key)
            
            if cached_videos:
                cache_time = self.model.get_data(f"{cache_key}_timestamp")
                if cache_time:
                    cache_datetime = datetime.fromisoformat(cache_time)
                    # Use cached data if less than 1 hour old
                    if (datetime.now() - cache_datetime).total_seconds() < 3600:
                        logger.info(f"Using cached YouTube videos for {subject}")
                        return cached_videos

            # Fetch new videos
            videos = self.model.get_youtube_videos(subject, max_results)
            
            if videos:
                # Cache the results
                self.model.set_data(cache_key, videos)
                self.model.set_data(f"{cache_key}_timestamp", datetime.now().isoformat())
                
                logger.info(f"Fetched {len(videos)} YouTube videos for {subject}")
            else:
                logger.warning(f"No YouTube videos found for {subject}")
                
            return videos
            
        except Exception as e:
            logger.error(f"Error fetching YouTube videos: {str(e)}")
            return []

    def generate_quiz(self, textbook_text: str, subject: str, num_questions: int = 5) -> List[Dict]:
        """Generates a quiz based on study materials"""
        try:
            if not textbook_text.strip():
                return []

            # Process textbook text for quiz generation
            processed_text = self.file_processor.extract_key_concepts(textbook_text)
            
            quiz_data = self.model.generate_quiz(processed_text, subject, num_questions)
            
            if quiz_data:
                # Store quiz for reference
                quiz_metadata = {
                    'questions': quiz_data,
                    'subject': subject,
                    'created_date': datetime.now().isoformat(),
                    'num_questions': len(quiz_data)
                }
                
                self.model.set_data('current_quiz', quiz_metadata)
                logger.info(f"Generated {len(quiz_data)} quiz questions for {subject}")
                
            return quiz_data
            
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            return []

    def get_study_progress(self) -> Dict[str, Any]:
        """Returns comprehensive study progress information"""
        try:
            progress_data = {
                'overall_progress': self.progress_tracker.get_overall_progress(),
                'quiz_history': self.model.get_data('quiz_history', []),
                'study_streak': self.progress_tracker.get_study_streak(),
                'plan_creation_date': self.model.get_data('plan_created_date'),
                'last_study_session': self.progress_tracker.get_last_study_session(),
                'topics_covered': self.progress_tracker.get_topics_covered(),
                'recommendations': self.progress_tracker.get_recommendations()
            }
            
            return progress_data
            
        except Exception as e:
            logger.error(f"Error getting study progress: {str(e)}")
            return {}

    def export_study_data(self) -> Dict[str, Any]:
        """Exports all study data for backup or analysis"""
        try:
            export_data = {
                'profile': {
                    'class_standard': self.model.get_data('class_standard'),
                    'subject': self.model.get_data('subject'),
                    'learning_style': self.model.get_data('learning_style'),
                    'days': self.model.get_data('days')
                },
                'study_plan': {
                    'current_plan': self.model.get_data('current_plan'),
                    'plan_created_date': self.model.get_data('plan_created_date'),
                    'plan_version': self.model.get_data('plan_version', 1),
                    'last_adaptation_date': self.model.get_data('last_adaptation_date')
                },
                'performance': {
                    'quiz_history': self.model.get_data('quiz_history', []),
                    'progress_data': self.get_study_progress()
                },
                'materials': {
                    'textbook_available': bool(self.model.get_data('textbook_text')),
                    'question_paper_available': bool(self.model.get_data('question_paper_text')),
                    'last_generated_answers': bool(self.model.get_data('last_generated_answers'))
                },
                'export_metadata': {
                    'export_date': datetime.now().isoformat(),
                    'export_version': '1.0'
                }
            }
            
            logger.info("Study data exported successfully")
            return export_data
            
        except Exception as e:
            logger.error(f"Error exporting study data: {str(e)}")
            return {}

    def get_learning_analytics(self) -> Dict[str, Any]:
        """Provides detailed learning analytics and insights"""
        try:
            quiz_history = self.model.get_data('quiz_history', [])
            
            if not quiz_history:
                return {'message': 'No quiz data available for analytics'}

            scores = [q['score'] for q in quiz_history]
            
            analytics = {
                'performance_metrics': {
                    'average_score': sum(scores) / len(scores),
                    'highest_score': max(scores),
                    'lowest_score': min(scores),
                    'total_quizzes': len(quiz_history),
                    'improvement_trend': self._calculate_improvement_trend(scores)
                },
                'learning_patterns': {
                    'consistency_score': self._calculate_consistency(scores),
                    'difficulty_areas': self._identify_difficulty_areas(quiz_history),
                    'strength_areas': self._identify_strength_areas(quiz_history)
                },
                'recommendations': self._generate_learning_recommendations(scores, quiz_history)
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating learning analytics: {str(e)}")
            return {}

    def _calculate_improvement_trend(self, scores: List[float]) -> str:
        """Calculate if the student is improving, declining, or stable"""
        if len(scores) < 2:
            return "insufficient_data"
        
        recent_scores = scores[-3:] if len(scores) >= 3 else scores
        early_scores = scores[:3] if len(scores) >= 3 else scores[:-len(recent_scores)]
        
        if not early_scores:
            return "insufficient_data"
        
        recent_avg = sum(recent_scores) / len(recent_scores)
        early_avg = sum(early_scores) / len(early_scores)
        
        if recent_avg > early_avg + 5:
            return "improving"
        elif recent_avg < early_avg - 5:
            return "declining"
        else:
            return "stable"

    def _calculate_consistency(self, scores: List[float]) -> float:
        """Calculate consistency score based on score variance"""
        if len(scores) < 2:
            return 0.0
        
        mean_score = sum(scores) / len(scores)
        variance = sum((score - mean_score) ** 2 for score in scores) / len(scores)
        
        # Convert to consistency score (lower variance = higher consistency)
        consistency = max(0, 100 - (variance / 10))
        return min(100, consistency)

    def _identify_difficulty_areas(self, quiz_history: List[Dict]) -> List[str]:
        """Identify areas where student consistently scores low"""
        # This is a simplified version - in a real app, you'd analyze question types
        low_score_quizzes = [q for q in quiz_history if q['score'] < 70]
        if len(low_score_quizzes) > len(quiz_history) * 0.5:
            return ["fundamental_concepts", "problem_solving"]
        return []

    def _identify_strength_areas(self, quiz_history: List[Dict]) -> List[str]:
        """Identify areas where student consistently performs well"""
        high_score_quizzes = [q for q in quiz_history if q['score'] >= 80]
        if len(high_score_quizzes) > len(quiz_history) * 0.7:
            return ["theoretical_understanding", "application"]
        return []

    def _generate_learning_recommendations(self, scores: List[float], quiz_history: List[Dict]) -> List[str]:
        """Generate personalized learning recommendations"""
        recommendations = []
        
        if not scores:
            return ["Take more quizzes to get personalized recommendations"]
        
        avg_score = sum(scores) / len(scores)
        
        if avg_score < 60:
            recommendations.extend([
                "Focus on fundamental concepts before moving to advanced topics",
                "Spend more time reviewing basic materials",
                "Consider seeking additional help or tutoring"
            ])
        elif avg_score < 80:
            recommendations.extend([
                "Practice more problems to improve consistency",
                "Review incorrect answers to identify knowledge gaps",
                "Try explaining concepts to others to deepen understanding"
            ])
        else:
            recommendations.extend([
                "Excellent performance! Try challenging yourself with advanced problems",
                "Consider helping peers to reinforce your own learning",
                "Explore related topics to broaden your knowledge"
            ])
        
        # Add trend-based recommendations
        trend = self._calculate_improvement_trend(scores)
        if trend == "declining":
            recommendations.append("Your recent scores show a decline. Consider reviewing your study methods.")
        elif trend == "improving":
            recommendations.append("Great improvement trend! Keep up the good work.")
        
        return recommendations