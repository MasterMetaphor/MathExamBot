
import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# A simple mock for the question bank, assuming it might be needed on the server
class QuestionBank:
    def get_question_types(self):
        return [
            "Variable Types",
            "Descriptive Stats",
            "Regression",
            "Empirical Rule",
            "Counting",
            "Mean Correction",
            "Z-Score",
            "Formulas",
            "Empirical Rule Concepts"
        ]

question_bank = QuestionBank()

@app.route('/')
def start_page():
    """Renders the start page."""
    return render_template('start.html')

@app.route('/quiz')
def quiz_page():
    """Renders the main quiz page."""
    return render_template('index.html')

@app.route('/topics')
def topics_page():
    """Renders the topic selection page."""
    question_types = question_bank.get_question_types()
    return render_template('topics.html', question_types=question_types)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
