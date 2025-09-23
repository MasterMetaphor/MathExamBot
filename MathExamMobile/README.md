# Math 1530 Study Materials

This folder contains comprehensive study materials for Math 1530 (Elements of Statistics) based on your exam materials.

## Files Created

### 📚 Study Materials
- **`StudyGuide_TI84.md`** - Complete TI-84 button-by-button guide for all question types
- **`AnswerKey_Summer2017_E1V1.md`** - Full answer key for Summer 2017 Exam I with explanations
- **`MockExam.md`** - Practice exam similar to your actual exam format

### 🤖 Interactive Practice
- **`question_bot.py`** - Interactive Python bot with immediate feedback and TI-84 instructions
- **`test_bot.py`** - Test script to verify the bot works correctly
- **`MathExamBot.spec`** - Build configuration file for the executable.
- **`dist/MathExamBot.exe`** - The standalone executable application.

### 📊 Data Processing
- **`scripts/extract_text.py`** - Extracts text from PDFs and DOCX files
- **`scripts/compute_sleep_scores.py`** - Computes regression statistics for sleep vs score data
- **`materials/source_materials.txt`** - Combined text from all your exam materials

## How to Use

### 1. Run the Executable (Easiest Method)
Navigate to the `dist` folder and double-click on `MathExamBot.exe` to start the graphical question bot.

### 2. Run from the Command Line (For Development)
If you want to see output or run a modified version:
```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run the interactive question bot
python question_bot.py
```

### 3. Study the TI-84 Guide
Open `StudyGuide_TI84.md` to learn the exact button sequences for:
- 1-Variable statistics (mean, median, standard deviation)
- 2-Variable statistics and regression
- Scatterplots and boxplots
- Z-scores and empirical rule
- Combinations and permutations
- Mean corrections

### 4. Take the Mock Exam
Use `MockExam.md` for timed practice. It includes:
- Multiple choice questions similar to your actual exam
- Short answer questions
- Same topics as your real exam

### 5. Review the Answer Key
Check `AnswerKey_Summer2017_E1V1.md` for:
- Complete solutions to all 58 questions
- TI-84 calculator steps for complex problems
- Explanations of statistical concepts

## How to Build the Executable
If you make changes to `question_bot.py` and want to rebuild the executable, follow these steps:

1.  **Open your terminal** in the project directory.
2.  **Activate the virtual environment**: `.\.venv\Scripts\Activate.ps1`
3.  **Install PyInstaller**: `pip install pyinstaller`
4.  **Run the build command**: `pyinstaller --onefile --windowed --name MathExamBot .\question_bot.py`

The new `MathExamBot.exe` will be created in the `dist` folder.

## Key Topics Covered

### Variable Types
- Categorical vs Quantitative
- Discrete vs Continuous
- Response vs Explanatory variables

### Descriptive Statistics
- Mean, median, mode
- Standard deviation and variance
- Range and IQR
- Boxplots and histograms

### Correlation and Regression
- Scatterplots
- Correlation coefficient r
- Regression line equation
- r² (coefficient of determination)
- Prediction and extrapolation

### Probability and Counting
- Permutations (nPr)
- Combinations (nCr)
- Factorials (n!)

### Normal Distribution
- Z-scores
- Empirical rule (68-95-99.7)
- Standardization

### Study Design
- Observational studies vs Experiments
- Lurking variables
- Simpson's Paradox

## TI-84 Calculator Tips

### Essential Menu Locations
- **STAT** → Data entry, statistics, regressions
- **2nd → Y=** → Stat plots
- **ZOOM → 9** → Zoom to data
- **MATH → PRB** → Permutations, combinations, factorials
- **VARS → Y-VARS** → Access stored regression equations

### Quick Reference
- **1-Var Stats**: STAT → CALC → 1:1-Var Stats
- **Linear Regression**: STAT → CALC → 8:LinReg(ax+b)
- **Scatterplot**: 2nd → Y= → Plot1 → Type: scatterplot
- **nCr**: number → MATH → PRB → 3:nCr → r → ENTER

## Running the Question Bot

The question bot is designed for interactive practice:

1. **Start the bot**: `python question_bot.py`
2. **Answer questions**: Type the number of your choice
3. **Get help**: Type 'help' for TI-84 instructions
4. **Check stats**: Type 'stats' for your score
5. **Exit**: Type 'quit' to end the session

Each question includes:
- The problem statement
- Multiple choice options
- Immediate feedback when you answer
- TI-84 calculator instructions
- Statistical explanations

## Success Tips

1. **Practice regularly** with the question bot
2. **Master the TI-84** using the study guide
3. **Understand concepts** - don't just memorize procedures
4. **Time yourself** using the mock exam
5. **Review mistakes** using the answer key explanations

Good luck with your exam! 🎯📊📱
