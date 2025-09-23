document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
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
    let score = 0;
    let total = 0;
    let streak = 0;
    let multiplier = 1;
    const questionBank = new QuestionBank();

    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic');

    function getQuestion() {
        currentQuestion = questionBank.getNewQuestion(topic);
        displayQuestion();
        animationManager.reset();
    }

    function displayQuestion() {
        feedbackCard.style.display = 'none';
        hintCard.style.display = 'none';
        
        // Explicitly hide and clear the previous question's example
        if (exampleInterval) clearInterval(exampleInterval);
        exampleContainer.style.display = 'none';
        exampleText.textContent = '';

        hintButton.disabled = false;

        // --- Button Visibility Logic ---
        // 1. Show Skip button, hide Next button
        skipButton.style.display = 'block';
        nextButton.style.display = 'none';
        nextButton.disabled = true; // Ensure Next is disabled

        // 2. Reset Next button to its original bottom position for when it reappears
        if (nextButtonContainerTop) {
            nextButtonContainerTop.style.display = 'none';
        }
        if (bottomButtonContainer && nextButton) {
            bottomButtonContainer.appendChild(nextButton);
        }

        questionText.textContent = currentQuestion.question;
        optionsContainer.innerHTML = '';

        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('button');
            button.dataset.index = index;
            button.addEventListener('click', handleAnswer);
            optionsContainer.appendChild(button);
        });
    }

    function handleAnswer(event) {
        const selectedIndex = parseInt(event.target.dataset.index, 10);
        const isCorrect = selectedIndex === currentQuestion.correct;
        
        total++;
        if (isCorrect) {
            score++;
            streak++;
            if (streak > 0 && streak % 5 === 0) {
                multiplier = Math.min(10, multiplier + 1);
                playBonusAnimation();
            }
            animationManager.setAnimation('correct');
        } else {
            streak = 0;
            multiplier = 1;
            animationManager.setAnimation('incorrect');
        }

        updateStats();

        feedbackText.textContent = isCorrect ? `✅ Correct! ${currentQuestion.explanation}` : `❌ Incorrect. ${currentQuestion.explanation}`;
        ti84Text.textContent = currentQuestion.ti84_steps;
        
        const optionButtons = optionsContainer.querySelectorAll('.button');
        optionButtons.forEach((button, index) => {
            button.disabled = true;
            if (index === currentQuestion.correct) {
                button.classList.add('correct');
            } else if (index === selectedIndex) {
                button.classList.add('incorrect');
            }
        });
        
        // --- Button Visibility Logic ---
        // 1. Hide Skip button, show Next button
        skipButton.style.display = 'none';
        nextButton.style.display = 'block';
        nextButton.disabled = false;

        // 2. Move Next button to appear above the options
        if (nextButtonContainerTop && nextButton) {
            nextButtonContainerTop.appendChild(nextButton);
            nextButtonContainerTop.style.display = 'flex';
        }

        if (currentQuestion.example) {
            animateExample(currentQuestion.example);
        }

        feedbackCard.style.display = 'block';
        hintCard.style.display = 'none';
        hintButton.disabled = true;
    }

    function playBonusAnimation() {
        const overlay = document.getElementById('bonus-animation-overlay');
        if (!overlay) return;

        overlay.style.display = 'block';
        const screenHeight = window.innerHeight;
        const numLanes = 8; // 8 lanes for each direction
        const laneHeight = screenHeight / numLanes;

        // Create two independent pools of lanes
        let rToLLanes = Array.from({length: numLanes}, (_, i) => (i * laneHeight) + (laneHeight / 2) - 12);
        let lToRLanes = Array.from({length: numLanes}, (_, i) => (i * laneHeight) + (laneHeight / 2) - 12);
        
        const skipLtoR = [1, 3, 5, 7];
        const skipRtoL = [2, 4, 6, 8];

        // Create R->L ships (top half of loop)
        for (let i = 1; i <= numLanes; i++) {
            if (skipRtoL.includes(i)) continue;
            
            const rocket = document.createElement('img');
            rocket.className = 'mini-rocket';
            
            // Pick a random lane and remove it
            const laneIndex = Math.floor(Math.random() * rToLLanes.length);
            const topPos = rToLLanes.splice(laneIndex, 1)[0];
            rocket.style.top = `${topPos}px`;

            rocket.src = './static/alien.png'; // Standard relative path format
            rocket.classList.add('fly-left');
            overlay.appendChild(rocket);
        }

        // Create L->R ships (bottom half of loop)
        for (let i = 1; i <= numLanes; i++) {
            if (skipLtoR.includes(i)) continue;
            
            const rocket = document.createElement('img');
            rocket.className = 'mini-rocket';

            // Pick a random lane and remove it
            const laneIndex = Math.floor(Math.random() * lToRLanes.length);
            const topPos = lToRLanes.splice(laneIndex, 1)[0];
            rocket.style.top = `${topPos}px`;
            
            rocket.src = './static/alien.png'; // Standard relative path format
            rocket.classList.add('fly-right');
            overlay.appendChild(rocket);
        }

        setTimeout(() => {
            // Clear all rockets at once
            overlay.innerHTML = '';
            overlay.style.display = 'none';
        }, 5500);
    }

    function skipQuestion() {
        // Skipping doesn't affect the score, but it does break the streak.
        streak = 0;
        multiplier = 1;
        updateStats();
        getQuestion(); // This generates a new question
    }

    function updateStats() {
        statsLabel.querySelector('span').textContent = `Streak: ${streak} (X${multiplier})`;
    }

    function showHint() {
        if (!currentQuestion || !currentQuestion.hint) return;
        hintText.textContent = `💡 ${currentQuestion.hint}`;
        hintCard.style.display = 'block';
        hintButton.disabled = true;
    }

    function animateExample(text) {
        if (exampleInterval) clearInterval(exampleInterval);
        exampleContainer.style.display = 'block';
        
        let i = 0;
        exampleText.textContent = '_';
        
        exampleInterval = setInterval(() => {
            if (i < text.length) {
                // Use textContent exclusively. The <pre> tag will handle newlines.
                let currentText = exampleText.textContent.slice(0, -1);
                currentText += text.charAt(i);
                exampleText.textContent = currentText + '_';
                i++;
            } else {
                // Animation finished. Stop the interval and remove the cursor.
                clearInterval(exampleInterval);
                exampleText.textContent = exampleText.textContent.slice(0, -1);
            }
        }, 150); // Typing speed
    }

    nextButton.addEventListener('click', getQuestion);
    skipButton.addEventListener('click', skipQuestion);
    hintButton.addEventListener('click', showHint);

    // Initial load
    getQuestion();

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js') // Standard relative path
            .then((reg) => console.log('Service worker registered.', reg))
            .catch((err) => console.log('Service worker not registered.', err));
    }
});

