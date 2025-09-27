# app.py
import streamlit as st
from controller import StudentController
from model import StudentModel
from pypdf import PdfReader
import os
from pypdf import PdfReader
import io
import streamlit.components.v1 as components
from fpdf import FPDF
import base64

# Initialize the MCP components
if 'model' not in st.session_state:
    st.session_state.model = StudentModel()
    st.session_state.controller = StudentController(st.session_state.model)
    st.session_state.plan = None
    st.session_state.current_page = 'input'
    st.session_state.textbook_text = ""
    st.session_state.question_paper_text = ""
    st.session_state.view = 'plan'

def extract_text_from_file(uploaded_file):
    if uploaded_file is None:
        return ""
    if uploaded_file.type == "text/plain":
        return str(uploaded_file.read(), "utf-8")
    elif uploaded_file.type == "application/pdf":
        pdf_reader = PdfReader(io.BytesIO(uploaded_file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    else:
        return ""

def create_pdf(plan_text, answers_text):
    # Replace unicode characters that can't be encoded in latin-1
    plan_text = plan_text.encode('latin-1', 'replace').decode('latin-1')
    answers_text = answers_text.encode('latin-1', 'replace').decode('latin-1')

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(0, 10, "Study Plan", ln=True, align='C')
    pdf.ln(5)
    for line in plan_text.split('\n'):
        pdf.multi_cell(0, 10, line)
    pdf.add_page()
    pdf.cell(0, 10, "Answers to Question Paper", ln=True, align='C')
    pdf.ln(5)
    for line in answers_text.split('\n'):
        pdf.multi_cell(0, 10, line)

    pdf_output = pdf.output(dest='S').encode('latin1')
    return pdf_output

def get_pdf_download_link(pdf_bytes, filename="study_plan_answers.pdf"):
    b64 = base64.b64encode(pdf_bytes).decode()
    href = f'<a href="data:application/octet-stream;base64,{b64}" download="{filename}">Download PDF</a>'
    return href

def render_input_page():
    st.title("Smart Student AI Tutor & Planner")
    st.subheader("Your personalized study partner")

    with st.form("input_form"):
        st.write("### 1. Upload your study materials!")
        user_prompt = st.text_input("Enter your study prompt", "Generate a study plan based on the uploaded content")
        textbook_file = st.file_uploader("Upload textbook (PDF or TXT)", type=['pdf', 'txt'])
        question_paper_file = st.file_uploader("Upload question paper (PDF or TXT)", type=['pdf', 'txt'])
        
        class_standard = st.selectbox("Select your class/standard",
                                       ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
                                        "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
                                        "Undergraduate", "Graduate", "Other"])

        subject = st.text_input("Enter your subject", placeholder="e.g., Math, Science, History")

        days = st.number_input("Days available before exam", min_value=1, value=5)
        learning_style = st.selectbox("Choose your learning style",
                                       ["Visual", "Auditory"])

        submit_button = st.form_submit_button("Generate My Plan ðŸš€")

    if submit_button and user_prompt and days and learning_style and class_standard and subject:
        # Extract text from uploaded files
        textbook_text = extract_text_from_file(textbook_file)
        question_paper_text = extract_text_from_file(question_paper_file)

        # Limit text to avoid token limits
        max_length = 2000
        textbook_text = textbook_text[:max_length] if textbook_text else ""
        question_paper_text = question_paper_text[:max_length] if question_paper_text else ""

        # Store texts in session state
        st.session_state.textbook_text = textbook_text
        st.session_state.question_paper_text = question_paper_text

        # Combine prompt and extracted texts
        full_content = f"{user_prompt}\n\nTextbook Content:\n{textbook_text}\n\nQuestion Paper:\n{question_paper_text}\n\nSubject: {subject}"

        st.session_state.plan = st.session_state.controller.create_and_get_plan(
            full_content, days, learning_style, class_standard, subject
        )
        st.session_state.current_page = 'plan'
        st.rerun()

def render_plan_page():
    st.title("Smart Student AI Tutor & Planner - Study Plan & Resources")

    # Buttons to switch views
    col1, col2 = st.columns(2)
    with col1:
        if st.button("View Study Plan"):
            st.session_state.view = 'plan'
    with col2:
        if st.button("View Question Answers"):
            st.session_state.view = 'answers'

    if st.session_state.view == 'plan':
        st.subheader("Your Daily Study Plan ðŸ—“ï¸")
        st.markdown(st.session_state.plan, unsafe_allow_html=True)

        learning_style = st.session_state.model.get_data('learning_style')
        if learning_style == 'Auditory':
            if st.button("Listen to Study Plan"):
                audio = st.session_state.controller.model.generate_tts(st.session_state.plan[:4000])  # Limit to 4000 chars
                if audio:
                    st.audio(audio, format='audio/mp3')
                else:
                    st.error("Failed to generate audio")

        st.subheader("Recommended YouTube Videos ðŸŽ¥")
        subject = st.session_state.model.get_data('subject') or 'General Study'
        videos = st.session_state.controller.get_youtube_videos(subject)
        if videos:
            for video in videos:
                st.markdown(f"**{video['title']}**")
                video_html = f"""
                <iframe width="560" height="315" src="https://www.youtube.com/embed/{video['video_id']}" frameborder="0" allowfullscreen></iframe>
                """
                st.components.v1.html(video_html, height=315)
                st.image(video['thumbnail'], width=120)

        st.subheader("Quiz Time!")
        with st.form("quiz_form"):
            st.write("Answer the quiz questions and submit your score.")
            score = st.slider("Your quiz score (in %)", 0, 100, 75)
            submit_score_button = st.form_submit_button("Submit Score")

        if submit_score_button:
            st.session_state.plan = st.session_state.controller.submit_quiz_score(score)
            st.success("Your plan has been adapted! See the changes below.")
            st.rerun()

        if st.button("Download Plan and Answers as PDF"):
            answers_text = ""
            if st.session_state.question_paper_text.strip():
                answers_text = st.session_state.controller.generate_answers(
                    st.session_state.question_paper_text,
                    st.session_state.textbook_text,
                    st.session_state.model.get_data('subject')
                )
            pdf_bytes = create_pdf(st.session_state.plan, answers_text)
            href = get_pdf_download_link(pdf_bytes)
            st.markdown(href, unsafe_allow_html=True)

        st.button("Go Back to Home", on_click=lambda: setattr(st.session_state, 'current_page', 'input'))

    elif st.session_state.view == 'answers':
        st.subheader("Answers to Question Paper")
        if st.session_state.question_paper_text.strip():
            answers = st.session_state.controller.generate_answers(
                st.session_state.question_paper_text,
                st.session_state.textbook_text,
                st.session_state.model.get_data('subject')
            )
            st.markdown(answers)

            learning_style = st.session_state.model.get_data('learning_style')
            if learning_style == 'Auditory':
                if st.button("Listen to Answers"):
                    audio = st.session_state.controller.model.generate_tts(answers[:4000])  # Limit to 4000 chars
                    if audio:
                        st.audio(audio, format='audio/mp3')
                    else:
                        st.error("Failed to generate audio")
        else:
            st.warning("No question paper text available.")
        
        if st.button("Download Plan and Answers as PDF"):
            answers_text = ""
            if st.session_state.question_paper_text.strip():
                answers_text = st.session_state.controller.generate_answers(
                    st.session_state.question_paper_text,
                    st.session_state.textbook_text,
                    st.session_state.model.get_data('subject')
                )
            pdf_bytes = create_pdf(st.session_state.plan, answers_text)
            href = get_pdf_download_link(pdf_bytes)
            st.markdown(href, unsafe_allow_html=True)
        

# Main application flow
if st.session_state.current_page == 'input':
    render_input_page()
elif st.session_state.current_page == 'plan':
    render_plan_page()