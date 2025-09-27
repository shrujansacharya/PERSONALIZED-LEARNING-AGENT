# utils.py - Utility classes for AI Study Planner
import re
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class FileProcessor:
    """Handles text processing and cleaning operations"""

    def __init__(self):
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
            'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall'
        }

    def clean_text(self, text: str) -> str:
        """Clean and normalize text content"""
        if not text:
            return ""

        try:
            # Remove extra whitespace and normalize
            text = re.sub(r'\s+', ' ', text.strip())

            # Remove special characters but keep basic punctuation
            text = re.sub(r'[^\w\s.,!?-]', '', text)

            # Remove multiple consecutive punctuation
            text = re.sub(r'([.,!?])\1+', r'\1', text)

            # Normalize quotes
            text = text.replace('"', '"').replace('"', '"')

            logger.debug("Text cleaned successfully")
            return text

        except Exception as e:
            logger.error(f"Error cleaning text: {str(e)}")
            return text

    def extract_key_concepts(self, text: str) -> str:
        """Extract key concepts and important terms from text"""
        if not text:
            return ""

        try:
            # Clean the text first
            cleaned_text = self.clean_text(text)

            # Split into sentences
            sentences = re.split(r'[.!?]+', cleaned_text)

            # Extract potential key concepts
            concepts = []

            for sentence in sentences:
                words = sentence.lower().split()
                # Look for capitalized words (potential proper nouns)
                caps_words = [word for word in words if word and word[0].isupper()]

                # Look for technical terms (words longer than 6 characters)
                long_words = [word for word in words if len(word) > 6 and word not in self.stop_words]

                concepts.extend(caps_words + long_words)

            # Remove duplicates and sort by frequency
            concept_freq = {}
            for concept in concepts:
                concept_freq[concept] = concept_freq.get(concept, 0) + 1

            # Get top concepts
            top_concepts = sorted(concept_freq.items(), key=lambda x: x[1], reverse=True)[:10]

            result = "Key concepts extracted:\n" + "\n".join([f"- {concept} (mentioned {freq} times)"
                                                            for concept, freq in top_concepts])

            logger.debug("Key concepts extracted successfully")
            return result

        except Exception as e:
            logger.error(f"Error extracting key concepts: {str(e)}")
            return "Error extracting key concepts from text"


class DataValidator:
    """Handles input validation for the application"""

    def __init__(self):
        self.valid_learning_styles = {
            'visual', 'auditory', 'kinesthetic', 'reading/writing',
            'visual learning', 'auditory learning', 'kinesthetic learning',
            'reading and writing', 'mixed', 'adaptive'
        }

        self.valid_class_standards = {
            'grade 1', 'grade 2', 'grade 3', 'grade 4', 'grade 5', 'grade 6',
            'grade 7', 'grade 8', 'grade 9', 'grade 10', 'grade 11', 'grade 12',
            'class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'class 6',
            'class 7', 'class 8', 'class 9', 'class 10', 'class 11', 'class 12',
            'primary', 'secondary', 'higher secondary', 'undergraduate', 'graduate'
        }

    def validate_plan_inputs(self, syllabus: str, days: int, learning_style: str,
                           class_standard: str = 'Grade 8', subject: str = '') -> Dict[str, Any]:
        """Validate inputs for study plan generation"""
        errors = []

        # Validate syllabus
        if not syllabus or not syllabus.strip():
            errors.append("Syllabus content is required")
        elif len(syllabus.strip()) < 10:
            errors.append("Syllabus content is too short (minimum 10 characters)")
        elif len(syllabus.strip()) > 10000:
            errors.append("Syllabus content is too long (maximum 10000 characters)")

        # Validate days
        if not isinstance(days, int) or days < 1:
            errors.append("Number of days must be a positive integer")
        elif days > 365:
            errors.append("Number of days cannot exceed 365")

        # Validate learning style
        if not learning_style or not learning_style.strip():
            errors.append("Learning style is required")
        elif learning_style.lower().strip() not in self.valid_learning_styles:
            errors.append(f"Invalid learning style. Valid options: {', '.join(sorted(self.valid_learning_styles))}")

        # Validate class standard
        if class_standard and class_standard.lower().strip() not in self.valid_class_standards:
            errors.append(f"Invalid class standard. Valid options: {', '.join(sorted(self.valid_class_standards))}")

        # Validate subject (optional but if provided, should be reasonable)
        if subject and len(subject.strip()) > 100:
            errors.append("Subject name is too long (maximum 100 characters)")

        if errors:
            return {
                'is_valid': False,
                'message': '; '.join(errors)
            }

        return {
            'is_valid': True,
            'message': 'All inputs are valid'
        }


class ProgressTracker:
    """Tracks student progress and study patterns"""

    def __init__(self):
        self.study_sessions = []
        self.quiz_scores = []
        self.topics_covered = []
        self.plan_start_date = None
        self.total_days = 0

    def initialize_plan_tracking(self, days: int) -> None:
        """Initialize tracking for a new study plan"""
        try:
            self.plan_start_date = datetime.now()
            self.total_days = days
            self.study_sessions = []
            self.quiz_scores = []
            self.topics_covered = []

            logger.info(f"Initialized progress tracking for {days}-day plan")
        except Exception as e:
            logger.error(f"Error initializing plan tracking: {str(e)}")

    def record_quiz_performance(self, score: float) -> None:
        """Record a quiz score and update tracking"""
        try:
            quiz_record = {
                'score': score,
                'date': datetime.now(),
                'day': len(self.quiz_scores) + 1
            }

            self.quiz_scores.append(quiz_record)
            self.study_sessions.append({
                'date': datetime.now(),
                'type': 'quiz',
                'score': score
            })

            logger.debug(f"Recorded quiz score: {score}%")
        except Exception as e:
            logger.error(f"Error recording quiz performance: {str(e)}")

    def get_overall_progress(self) -> float:
        """Calculate overall study progress as percentage"""
        try:
            if not self.plan_start_date or self.total_days == 0:
                return 0.0

            days_elapsed = (datetime.now() - self.plan_start_date).days
            planned_progress = min(100.0, (days_elapsed / self.total_days) * 100)

            # Adjust based on quiz performance
            if self.quiz_scores:
                avg_score = sum(q['score'] for q in self.quiz_scores) / len(self.quiz_scores)
                performance_factor = avg_score / 100.0
                actual_progress = planned_progress * performance_factor
            else:
                actual_progress = planned_progress * 0.5  # Assume 50% completion without quizzes

            return min(100.0, max(0.0, actual_progress))

        except Exception as e:
            logger.error(f"Error calculating overall progress: {str(e)}")
            return 0.0

    def get_study_streak(self) -> int:
        """Calculate current study streak in days"""
        try:
            if not self.study_sessions:
                return 0

            # Sort sessions by date
            sorted_sessions = sorted(self.study_sessions, key=lambda x: x['date'], reverse=True)

            streak = 0
            check_date = datetime.now().date()

            for session in sorted_sessions:
                session_date = session['date'].date()

                if session_date == check_date:
                    streak += 1
                    check_date -= timedelta(days=1)
                elif session_date == check_date - timedelta(days=1):
                    streak += 1
                    check_date = session_date
                else:
                    break

            return streak

        except Exception as e:
            logger.error(f"Error calculating study streak: {str(e)}")
            return 0

    def get_last_study_session(self) -> Optional[str]:
        """Get the date of the last study session"""
        try:
            if not self.study_sessions:
                return None

            last_session = max(self.study_sessions, key=lambda x: x['date'])
            return last_session['date'].isoformat()

        except Exception as e:
            logger.error(f"Error getting last study session: {str(e)}")
            return None

    def get_topics_covered(self) -> List[str]:
        """Get list of topics covered so far"""
        try:
            # This is a simplified version - in a real app, topics would be tracked separately
            if not self.quiz_scores:
                return []

            # Generate mock topics based on quiz performance
            topics = []
            avg_score = sum(q['score'] for q in self.quiz_scores) / len(self.quiz_scores)

            if avg_score >= 80:
                topics.extend(["Advanced Concepts", "Problem Solving", "Critical Thinking"])
            elif avg_score >= 60:
                topics.extend(["Core Concepts", "Basic Problem Solving"])
            else:
                topics.extend(["Fundamental Concepts"])

            return topics

        except Exception as e:
            logger.error(f"Error getting topics covered: {str(e)}")
            return []

    def get_recommendations(self) -> List[str]:
        """Generate study recommendations based on progress"""
        try:
            recommendations = []

            if not self.quiz_scores:
                recommendations.append("Take your first quiz to get personalized recommendations")
                return recommendations

            avg_score = sum(q['score'] for q in self.quiz_scores) / len(self.quiz_scores)
            streak = self.get_study_streak()

            if avg_score < 60:
                recommendations.extend([
                    "Focus on understanding fundamental concepts",
                    "Spend more time on practice problems",
                    "Consider reviewing basic materials"
                ])
            elif avg_score < 80:
                recommendations.extend([
                    "Practice more challenging problems",
                    "Review incorrect answers to identify knowledge gaps",
                    "Try teaching concepts to others"
                ])
            else:
                recommendations.extend([
                    "Excellent progress! Try advanced topics",
                    "Help peers to reinforce your understanding",
                    "Explore real-world applications"
                ])

            if streak == 0:
                recommendations.append("Start a daily study routine to build consistency")
            elif streak < 3:
                recommendations.append("Try to maintain a longer study streak")
            else:
                recommendations.append("Great consistency! Keep up the daily study habit")

            return recommendations

        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return ["Unable to generate recommendations at this time"]
