from flask import Flask, request, jsonify
from flask_cors import CORS
from controller import StudentController
from model import StudentModel
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize the components
model = StudentModel()
controller = StudentController(model)

@app.route('/api/generate-plan', methods=['POST'])
def generate_plan():
    try:
        data = request.json
        syllabus = data.get('syllabus')
        days = data.get('days')
        learning_style = data.get('learningStyle')
        class_standard = data.get('classStandard', 'Grade 8')
        subject = data.get('subject', '')

        if not syllabus or not days or not learning_style:
            return jsonify({'error': 'Missing required fields'}), 400

        plan = controller.create_and_get_plan(syllabus, days, learning_style, class_standard, subject)
        return jsonify({'plan': plan})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-answers', methods=['POST'])
def generate_answers():
    try:
        data = request.json
        question_paper_text = data.get('questionPaperText')
        textbook_text = data.get('textbookText')
        subject = data.get('subject', '')

        if not question_paper_text:
            return jsonify({'error': 'Missing question paper text'}), 400

        answers = controller.generate_answers(question_paper_text, textbook_text, subject)
        return jsonify({'answers': answers})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/youtube-videos', methods=['POST'])
def youtube_videos():
    try:
        data = request.json
        subject = data.get('subject')

        if not subject:
            return jsonify({'error': 'Missing subject'}), 400

        videos = controller.get_youtube_videos(subject)
        return jsonify({'videos': videos})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/adapt-plan', methods=['POST'])
def adapt_plan():
    try:
        data = request.json
        score = data.get('score')
        previous_plan = data.get('previousPlan')

        if score is None or not previous_plan:
            return jsonify({'error': 'Missing score or previous plan'}), 400

        # For simplicity, generate a new plan based on score
        adapted_plan = f"Adapted Plan based on score {score}%:\n\n{previous_plan}\n\nImprovement suggestions: Focus on weak areas."
        return jsonify({'adaptedPlan': adapted_plan})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        textbook_text = data.get('textbookText')
        subject = data.get('subject', '')

        if not textbook_text or not subject:
            return jsonify({'error': 'Missing textbook text or subject'}), 400

        quiz = controller.generate_quiz(textbook_text, subject)
        return jsonify({'quiz': quiz})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
