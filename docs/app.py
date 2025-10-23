import os
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# A simple mock for the question bank, assuming it might be needed on the server
class QuestionBank:
    def get_exam1_topics(self):
        return [
            "Variable Types",
            "Descriptive Stats",
            "Regression",
            "Empirical Rule",
            "Counting",
            "Mean Correction",
            "Z-Score",
            "Formulas",
            "Empirical Rule Concepts",
            "Conceptual Questions",
            "True/False"
        ]
    
    def get_exam2_topics(self):
        return [
            "Assignment 7: Basic Probability",
            "Assignment 8: Conditional Probability",
            "Assignment 9: Binomial Distribution",
            "Assignment 10: Normal Distribution",
            "Assignment 11: Sampling Distributions"
        ]
    
    def get_all_topics(self):
        return self.get_exam1_topics() + self.get_exam2_topics()

question_bank = QuestionBank()

@app.route('/')
def start_page():
    """Renders the start page."""
    return render_template('start.html')

@app.route('/exams')
def exams_page():
    """Renders the exam selection page."""
    return render_template('exams.html')

@app.route('/quiz')
def quiz_page():
    """Renders the main quiz page."""
    topic = request.args.get('topic')
    exam = request.args.get('exam')
    return render_template('index.html', topic=topic, exam=exam)

@app.route('/topics')
def topics_page():
    """Renders the topic selection page."""
    exam = request.args.get('exam')
    exam1_topics = question_bank.get_exam1_topics()
    exam2_topics = question_bank.get_exam2_topics()
    return render_template('topics.html', exam1_topics=exam1_topics, exam2_topics=exam2_topics, current_exam=exam)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)