document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackCard = document.getElementById('feedback-card');
    const feedbackText = document.getElementById('feedback-text');
    const ti84Text = document.getElementById('ti84-text');
    const nextButton = document.getElementById('next-button');
    const statsLabel = document.getElementById('stats-label');

    let currentQuestion = null;
    let score = 0;
    let total = 0;
    const questionBank = new QuestionBank();

    function getQuestion() {
        currentQuestion = questionBank.getNewQuestion();
        displayQuestion();
    }

    function displayQuestion() {
        feedbackCard.style.display = 'none';
        nextButton.disabled = true;

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

        feedbackCard.style.display = 'block';
        nextButton.disabled = false;
    }

    function updateStats() {
        const percentage = total > 0 ? (score / total) * 100 : 0;
        statsLabel.textContent = `Score: ${score}/${total} (${percentage.toFixed(1)}%)`;
    }

    nextButton.addEventListener('click', getQuestion);

    // Initial load
    getQuestion();

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then((reg) => console.log('Service worker registered.', reg))
            .catch((err) => console.log('Service worker not registered.', err));
    }
});
