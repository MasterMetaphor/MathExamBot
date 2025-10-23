# Math 1530 Exam 2 Quiz Bot

A comprehensive web-based quiz application for Math 1530 Exam 2 preparation, covering Assignments 7-11 with detailed explanations and TI-84 calculator instructions.

## Features

- **Assignment-Based Topics**: Organized by Assignments 7-11
- **Interactive Quiz System**: Choose specific topics or random mix
- **TI-84 Calculator Instructions**: Step-by-step guidance for each question
- **Detailed Explanations**: Mathematical reasoning for each answer
- **Scoring System**: Base scoring with streak multipliers (up to 5x)
- **Hint System**: Get help when stuck
- **Mascot Animations**: Fun visual feedback
- **Progress Tracking**: Real-time stats and accuracy tracking

## Topics Covered

### Assignment 7: Basic Probability
- Addition rule: P(A∪B) = P(A) + P(B) - P(A∩B)
- Complement rule: P(A') = 1 - P(A)
- Venn diagrams and set operations
- Union, intersection, complement concepts

### Assignment 8: Conditional Probability
- Conditional probability: P(A|B) = P(A∩B)/P(B)
- Multiplication rule: P(A∩B) = P(A) × P(B|A)
- Independence testing: P(A) × P(B) = P(A∩B)
- Two-way tables and joint probabilities

### Assignment 9: Binomial Distribution
- Binomial probability: P(X=k) = C(n,k) × p^k × (1-p)^(n-k)
- Expected value: E(X) = n × p
- Standard deviation: SD(X) = √[n×p×(1-p)]
- TI-84 binompdf() and binomcdf() functions

### Assignment 10: Normal Distribution
- Z-score calculations: z = (x - μ)/σ
- Empirical rule: 68-95-99.7
- Normal distribution properties
- TI-84 normalcdf() function

### Assignment 11: Sampling Distributions
- Central Limit Theorem applications
- Standard error: σ/√n
- Sample proportion distributions
- CLT conditions (n ≥ 30)

## Installation

1. Clone or download this repository
2. Install Python 3.6 or higher
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Run the application:
   ```bash
   python app.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

3. Select "Exam 2" to access the assignment-based topics

## File Structure

```
ForExam2/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── cheatersheeter.txt    # Complete study guide
├── templates/            # HTML templates
│   ├── index.html        # Main quiz page
│   ├── start.html        # Start page
│   ├── topics.html       # Topic selection
│   └── exams.html        # Exam selection
└── static/               # Static assets
    ├── styles.css        # CSS styles
    ├── question-bank.js  # Question generation logic
    ├── script.js         # JavaScript functionality
    └── mascot_*.png      # Mascot animation images
```

## Study Guide

The `cheatersheeter.txt` file contains:
- All Exam 2 questions with answers
- Detailed explanations for each solution
- Step-by-step TI-84 calculator instructions
- Quick reference formulas
- Study tips and shortcuts

## Key Features

### TI-84 Calculator Integration
Each question includes step-by-step TI-84 instructions:
- **Probability calculations**: Basic arithmetic operations
- **Binomial probabilities**: binompdf() and binomcdf() functions
- **Normal probabilities**: normalcdf() function
- **Z-score calculations**: Manual formula entry
- **Statistical functions**: DISTR menu navigation

### Scoring System
- **Base Score**: 1 point per correct answer
- **Streak Bonus**: Multiplier increases with consecutive correct answers
- **Maximum Multiplier**: 5x points
- **Accuracy Tracking**: Percentage and total score display

### Question Types
- **Multiple Choice**: 4 options per question
- **Conceptual Questions**: Understanding of mathematical concepts
- **Calculation Questions**: Step-by-step problem solving
- **Formula Applications**: Using appropriate mathematical formulas

## Study Tips

1. **Read Carefully**: Pay attention to specific values in each question
2. **Use TI-84**: Follow calculator instructions for complex calculations
3. **Apply Formulas**: Use appropriate probability and statistics formulas
4. **Check Your Work**: Verify calculations before selecting answers
5. **Learn from Mistakes**: Read detailed explanations to understand correct approaches
6. **Use Hints**: Don't hesitate to use the hint system when stuck
7. **Practice Regularly**: Consistent practice leads to better understanding

## Requirements

- Python 3.6 or higher
- Flask web framework
- Modern web browser
- No external dependencies required

## Author

Created for Math 1530 students to practice probability and statistics concepts for Exam 2 preparation.

## License

This project is for educational use in Math 1530 courses.

---

**Good luck with your Exam 2 preparation!** 🎯📚
