document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const questionPlaceholder = document.getElementById('question-placeholder');
    const optionsContainer = document.getElementById('options-container');
    const feedbackCard = document.getElementById('feedback-card');
    const feedbackText = document.getElementById('feedback-text');
    const ti84Text = document.getElementById('ti84-text');
    const nextButton = document.getElementById('next-button');
    const skipButton = document.getElementById('skip-button');
    const statsLabel = document.getElementById('stats-label');
    const hintButton = document.getElementById('hint-button');
    const hintCard = document.getElementById('hint-card');
    const hintText = document.getElementById('hint-text');
    const streakCounter = document.getElementById('streak-counter');
    const mascot = document.getElementById('mascot');
    const exampleContainer = document.getElementById('example-container');
    const exampleText = document.getElementById('example-text');
    const nextButtonContainerTop = document.getElementById('next-button-container-top');
    const bottomButtonContainer = document.getElementById('bottom-button-container');
    let exampleInterval = null;

    // Return early if we're not on the quiz page
    if (!questionText) return;
    
    // Mascot Animation Manager
    const animationManager = {
        mascot: mascot,
        intervalId: null,
        currentAnimation: 'idle',
        animations: {
            idle: JSON.parse(mascot.dataset.idleFrames.replace(/'/g, '"')),
            incorrect: JSON.parse(mascot.dataset.incorrectFrames.replace(/'/g, '"')),
        },
        
        setAnimation: function(name) {
            this.stop(); // Always stop the current animation first
            this.currentAnimation = name;
            this.frameIndex = 0;
            
            if (name === 'correct') {
                this.playCorrect();
            } else {
                this.play();
            }
        },

        play: function() { // Handles idle and incorrect animations
            const frames = this.animations[this.currentAnimation];
            if (!frames) return; // Exit if no frames for this animation
            let speed = (this.currentAnimation === 'idle') ? 500 : 150;
            
            this.intervalId = setInterval(() => {
                if (this.frameIndex >= frames.length) {
                    if (this.currentAnimation === 'incorrect') {
                        this.mascot.style.visibility = 'hidden';
                        this.stop();
                        return;
                    }
                    this.frameIndex = 0; // Loop for idle
                }
                this.mascot.src = `./static/${frames[this.frameIndex]}`; // Standard relative path format
                this.frameIndex++;
            }, speed);
        },

        playCorrect: function() {
            // Show rocket with flames, then trigger CSS animation
            this.mascot.src = './static/mascot_correct_1.png'; // Standard relative path format
            this.mascot.classList.add('blast-off');
        },
        
        stop: function() {
            clearInterval(this.intervalId);
            this.mascot.classList.remove('blast-off');
        },
        
        reset: function() {
            this.mascot.style.visibility = 'visible';
            this.setAnimation('idle');
        }
    };
    animationManager.play();


    let currentQuestion = null;
    let previousQuestion = null;
    let usedQuestions = []; // Track ALL used questions in this session
    let score = 0;
    let total = 0;
    let streak = 0;
    let multiplier = 1;
    const questionBank = new QuestionBank();
    
    // Initialize used questions from session storage if available
    if (sessionStorage.getItem('usedQuestions')) {
        usedQuestions = JSON.parse(sessionStorage.getItem('usedQuestions'));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic');
    const examType = urlParams.get('exam'); // Exam type parameter

    function getQuestion() {
        // Show loading spinner
        if (questionPlaceholder) {
            questionPlaceholder.classList.remove('hidden-element');
        }
        if (questionText) {
            questionText.classList.add('hidden-element');
        }
        
        // Store the current question as previous before getting a new one
        previousQuestion = currentQuestion;
        
        // Generate a new question, ensuring it's not used before in this session
        let attempts = 0;
        let newQuestion;
        do {
            newQuestion = questionBank.getNewQuestion(topic, examType);
            attempts++;
            
            // Break after 20 attempts to prevent infinite loops
            if (attempts > 20) {
                // If we've used all questions, reset the used list
                usedQuestions = [];
                sessionStorage.removeItem('usedQuestions');
                newQuestion = questionBank.getNewQuestion(topic, examType);
                break;
            }
            
        } while (
            // Check if this exact question has been used before
            usedQuestions.some(used => 
                used.question === newQuestion.question && 
                used.options && 
                JSON.stringify(used.options) === JSON.stringify(newQuestion.options)
            )
        );
        
        // Update current question
        currentQuestion = newQuestion;
        
        // Add to used questions list
        usedQuestions.push({
            question: currentQuestion.question,
            options: currentQuestion.options,
            correct: currentQuestion.correct
        });
        
        // Save to session storage
        sessionStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
        
        // Render the question immediately after getting it
        displayQuestion();
        animationManager.reset();
        
        // Remove loading spinner
        if (questionPlaceholder) {
            questionPlaceholder.classList.add('hidden-element');
        }
        if (questionText) {
            questionText.classList.remove('hidden-element');
        }
    }

    function displayQuestion() {
        if (!currentQuestion) return;

        questionText.innerHTML = currentQuestion.question;
        optionsContainer.innerHTML = '';

        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.classList.add('hover-effect');
            button.textContent = option;
            button.dataset.index = index;
            button.addEventListener('click', checkAnswer);
            optionsContainer.appendChild(button);
        });

        feedbackCard.classList.add('hidden');
        hintCard.classList.add('hidden');
        exampleContainer.classList.add('hidden');
        nextButtonContainerTop.classList.add('hidden');
        
        updateStats();
    }

    function checkAnswer(event) {
        const selectedIndex = parseInt(event.target.dataset.index);
        const isCorrect = selectedIndex === currentQuestion.correct;
        
        // Disable all buttons to prevent multiple answers
        const buttons = document.querySelectorAll('.option-button');
        buttons.forEach(button => {
            button.disabled = true;
            button.classList.remove('hover-effect');
            
            // Highlight correct and incorrect answers
            const index = parseInt(button.dataset.index);
            if (index === currentQuestion.correct) {
                button.classList.add('correct-answer');
            } else if (index === selectedIndex) {
                button.classList.add('incorrect-answer');
            }
        });

        // Show feedback
        feedbackCard.classList.remove('hidden');
        feedbackText.textContent = currentQuestion.explanation;
        
        // Check for TI-84 calculator steps
        if (currentQuestion.ti84) {
            ti84Text.textContent = currentQuestion.ti84;
            document.getElementById('ti84-section').classList.remove('hidden');
        } else {
            document.getElementById('ti84-section').classList.add('hidden');
        }

        // Show calculator example if available
        if (currentQuestion.example) {
            exampleContainer.classList.remove('hidden');
            displayCalculatorExample(currentQuestion.example);
        }
        
        // Update stats
        if (isCorrect) {
            score += 1 * multiplier;
            streak += 1;
            multiplier = Math.min(5, streak > 3 ? Math.floor(streak / 3) : 1);
            animationManager.setAnimation('correct');
        } else {
            streak = 0;
            multiplier = 1;
            animationManager.setAnimation('incorrect');
        }
        total += 1;
        updateStats();

        // Show next button
        nextButtonContainerTop.classList.remove('hidden');
        bottomButtonContainer.classList.add('hidden');
    }

    function displayCalculatorExample(example) {
        if (!example) return;
        
        // Split steps and show one by one with delay
        const lines = example.split('\\n');
        let currentLine = 0;
        
        // Clear any existing interval
        if (exampleInterval) clearInterval(exampleInterval);
        
        exampleText.textContent = '';
        
        exampleInterval = setInterval(() => {
            if (currentLine < lines.length) {
                exampleText.textContent += lines[currentLine] + '\n';
                currentLine++;
            } else {
                clearInterval(exampleInterval);
            }
        }, 800);
    }

    function updateStats() {
        statsLabel.textContent = `Score: ${score} / ${total}`;
        streakCounter.textContent = streak > 0 ? `${streak} 🔥 (${multiplier}x)` : '';
    }

    hintButton.addEventListener('click', () => {
        if (currentQuestion && currentQuestion.hint) {
            hintCard.classList.toggle('hidden');
            hintText.textContent = currentQuestion.hint;
        }
    });

    nextButton.addEventListener('click', getQuestion);
    skipButton.addEventListener('click', getQuestion);

    // Move the next button to the top container when it's shown
    const moveNextButton = () => {
        const buttonClone = nextButton.cloneNode(true);
        buttonClone.addEventListener('click', getQuestion);
        nextButtonContainerTop.innerHTML = '';
        nextButtonContainerTop.appendChild(buttonClone);
    };

    // Create a MutationObserver to watch for class changes on nextButtonContainerTop
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && 
                !nextButtonContainerTop.classList.contains('hidden')) {
                moveNextButton();
            }
        });
    });

    // Start observing the next button container
    observer.observe(nextButtonContainerTop, { attributes: true });

    // Add a function to clear used questions
    window.clearUsedQuestions = function() {
        usedQuestions = [];
        sessionStorage.removeItem('usedQuestions');
        getQuestion();
    };

    // Initial question
    getQuestion();
});