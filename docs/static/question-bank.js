// This file contains the logic for generating new questions, ported from Python.

class QuestionBank {
    constructor() {
        this.lastQuestionText = null; // To track the last question
        this.lastQuestionHash = null; // To track the last question hash
        this.usedQuestions = []; // To track recently used questions
        this.recentQuestionTypes = []; // To track recent question types
        
        // Organize by exam topics
        this.examTopics = {
            "Exam 1": [
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
            ],
            "Exam 2": [
                "Assignment 7: Basic Probability",
                "Assignment 8: Conditional Probability",
                "Assignment 9: Binomial Distribution",
                "Assignment 10: Normal Distribution",
                "Assignment 11: Sampling Distributions"
            ]
        };

        // All question generators
        this.questionGenerators = [
            // Exam 1 generators
            this.generateVariableTypeQuestion.bind(this),
            this.generateDescriptiveStatsQuestion.bind(this),
            this.generateRegressionQuestion.bind(this),
            this.generateEmpiricalRuleQuestion.bind(this),
            this.generateCountingQuestion.bind(this),
            this.generateMeanCorrectionQuestion.bind(this),
            this.generateZScoreQuestion.bind(this),
            this.generateFormulaQuestion.bind(this),
            this.generateEmpiricalRuleConceptQuestion.bind(this),
            this.generateConceptualQuestion.bind(this),
            this.generateTrueFalseQuestion.bind(this),
            
            // Exam 2 generators
            this.generateProbabilityBasicsQuestion.bind(this),
            this.generateProbabilityDistributionQuestion.bind(this),
            this.generateVennDiagramQuestion.bind(this),
            this.generateNormalDistributionQuestion.bind(this),
            this.generateBinomialDistributionQuestion.bind(this),
            this.generateCentralLimitTheoremQuestion.bind(this),
            this.generateConditionalProbabilityQuestion.bind(this)
        ];

        // Topic to generator mapping
        this.topicMap = {
            // Exam 1 Topics
            "Variable Types": this.generateVariableTypeQuestion.bind(this),
            "Descriptive Stats": this.generateDescriptiveStatsQuestion.bind(this),
            "Regression": this.generateRegressionQuestion.bind(this),
            "Empirical Rule": this.generateEmpiricalRuleQuestion.bind(this),
            "Counting": this.generateCountingQuestion.bind(this),
            "Mean Correction": this.generateMeanCorrectionQuestion.bind(this),
            "Z-Score": this.generateZScoreQuestion.bind(this),
            "Formulas": this.generateFormulaQuestion.bind(this),
            "Empirical Rule Concepts": this.generateEmpiricalRuleConceptQuestion.bind(this),
            "Conceptual Questions": this.generateConceptualQuestion.bind(this),
            "True/False": this.generateTrueFalseQuestion.bind(this),
            
            // Exam 2 Topics - Assignment Based
            "Assignment 7: Basic Probability": this.generateProbabilityBasicsQuestion.bind(this),
            "Assignment 8: Conditional Probability": this.generateConditionalProbabilityQuestion.bind(this),
            "Assignment 9: Binomial Distribution": this.generateBinomialDistributionQuestion.bind(this),
            "Assignment 10: Normal Distribution": this.generateNormalDistributionQuestion.bind(this),
            "Assignment 11: Sampling Distributions": this.generateCentralLimitTheoremQuestion.bind(this)
        };
    }

    // --- Utility functions and original methods remain the same ---
    _sum(arr) { return arr.reduce((a, b) => a + b, 0); }
    _mean(arr) { return this._sum(arr) / arr.length; }
    _std(arr) {
        const mean = this._mean(arr);
        const variance = this._sum(arr.map(x => (x - mean) ** 2)) / (arr.length - 1);
        return Math.sqrt(variance);
    }
    _median(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    _max(arr) { return Math.max(...arr); }
    _min(arr) { return Math.min(...arr); }
    _perm(n, k) {
        if (n < k) return 0;
        let result = 1;
        for (let i = 0; i < k; i++) {
            result *= (n - i);
        }
        return result;
    }
    _comb(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let result = 1;
        for (let i = 1; i <= k; i++) {
            result = result * (n - i + 1) / i;
        }
        return Math.round(result);
    }
    _corr(x, y) {
        const n = x.length;
        const meanX = this._mean(x);
        const meanY = this._mean(y);
        const stdX = Math.sqrt(this._sum(x.map(val => (val - meanX) ** 2)) / n);
        const stdY = Math.sqrt(this._sum(y.map(val => (val - meanY) ** 2)) / n);
        const covariance = this._sum(x.map((val, i) => (val - meanX) * (y[i] - meanY))) / n;
        return covariance / (stdX * stdY);
    }
    _linreg(x, y) {
        const n = x.length;
        const meanX = this._mean(x);
        const meanY = this._mean(y);
        
        const numerator = this._sum(x.map((val, i) => (val - meanX) * (y[i] - meanY)));
        const denominator = this._sum(x.map(val => (val - meanX) ** 2));
        
        const slope = numerator / denominator;
        const intercept = meanY - slope * meanX;
        
        return { slope, intercept };
    }
    _randint(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    _uniform(min, max) {
        return Math.random() * (max - min) + min;
    }
    _toButtonPresses(num) {
        return num.toString().split('').map(char => `[${char}]`).join('');
    }
    _quartiles(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const q2 = this._median(arr);
        const lowerHalf = sorted.filter(x => x < q2);
        const upperHalf = sorted.filter(x => x > q2);
        const q1 = this._median(lowerHalf);
        const q3 = this._median(upperHalf);
        return { q1, q3 };
    }
    _generateOptions(correctAns, numOptions = 4, otherWrongAns = null, isInt = false, isPercent = false) {
        let options = new Set();
        const formatter = (val) => isInt ? val.toString() : (isPercent ? val.toFixed(3) : val.toFixed(2));
        
        options.add(formatter(correctAns));
        
        if (otherWrongAns !== null) {
            options.add(formatter(otherWrongAns));
        }
            
        while (options.size < numOptions) {
            let wrong;
            if (isInt) {
                const error = this._uniform(0.8, 1.2);
                wrong = Math.round(correctAns * error) + this._randint(-5, 5);
                if (wrong === correctAns) continue;
            } else {
                const error = (Math.random() - 0.5) * (Math.abs(correctAns * 0.4) + 2);
                wrong = correctAns + error;
            }
            options.add(formatter(wrong));
        }
            
        let optionsList = Array.from(options);
        optionsList.sort(() => Math.random() - 0.5);
        return optionsList;
    }

    // Fisher-Yates shuffle algorithm for randomizing arrays
    _shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Modified to support exam selection and prevent repetition
    getNewQuestion(topic = null, examType = null, previousQuestion = null) {
        // Track last 5 question types to avoid repetition patterns
        if (!this.recentQuestionTypes) {
            this.recentQuestionTypes = [];
        }
        
        let generator;
        let questionType;
        let questionVariant;
        
        // If specific topic is requested
        if (topic && this.topicMap[topic]) {
            questionType = topic;
            generator = this.topicMap[topic];
        }
        // If exam type is specified but no topic
        else if (examType && this.examTopics[examType]) {
            // Get topics for this exam
            const examSpecificTopics = this.examTopics[examType];
            
            // Shuffle topics for randomization
            const shuffledTopics = this._shuffleArray([...examSpecificTopics]);
            
            // Filter out the 3 most recently used topics
            let availableTopics = shuffledTopics.filter(t => !this.recentQuestionTypes.slice(0, 3).includes(t));
            
            // If we've filtered out all topics, just use all of them except the most recent
            if (availableTopics.length === 0) {
                availableTopics = shuffledTopics.filter(t => t !== this.recentQuestionTypes[0]);
                if (availableTopics.length === 0) {
                    availableTopics = shuffledTopics;
                }
            }
            
            // Choose the first topic from the shuffled and filtered list
            questionType = availableTopics[0];
            generator = this.topicMap[questionType];
        }
        // Neither topic nor exam specified
        else {
            // Get all available topics
            const allTopics = Object.keys(this.topicMap).filter(k => !k.includes('_'));
            
            // Shuffle topics for randomization
            const shuffledTopics = this._shuffleArray([...allTopics]);
            
            // Filter out the 5 most recently used topics
            let availableTopics = shuffledTopics.filter(t => !this.recentQuestionTypes.slice(0, 5).includes(t));
            
            // If we've filtered out all topics, just use all of them except the most recent
            if (availableTopics.length === 0) {
                availableTopics = shuffledTopics.filter(t => t !== this.recentQuestionTypes[0]);
                if (availableTopics.length === 0) {
                    availableTopics = shuffledTopics;
                }
            }
            
            // Choose the first topic from the shuffled and filtered list
            questionType = availableTopics[0];
            generator = this.topicMap[questionType];
        }
        
        let newQuestion;
        let attempts = 0;
        let questionHash;
        
        do {
            newQuestion = generator();
            
            // Add randomized values to the question to increase variety
            if (typeof newQuestion.randomize === 'function') {
                newQuestion.randomize();
            }
            
            // Create a hash of the question to track duplicates
            questionHash = newQuestion.question + newQuestion.options.join('');
            attempts++;
            
            // Break if we can't find a new question after several attempts
            if (attempts > 20) {
                // If we can't find a different question after many attempts, 
                // force generation of a completely different question type
                const allGenerators = Object.values(this.topicMap);
                const shuffledGenerators = this._shuffleArray([...allGenerators]);
                const randomGenerator = shuffledGenerators[0];
                newQuestion = randomGenerator();
                questionHash = newQuestion.question + newQuestion.options.join('');
                break;
            }
            
        } while (
            // Avoid exact same question as the last one (strict back-to-back prevention)
            (previousQuestion && newQuestion.question === previousQuestion.question) || // Check against previousQuestion object
            (this.lastQuestionHash && questionHash === this.lastQuestionHash) ||
            // Avoid exact same question text
            (this.lastQuestionText && newQuestion.question === this.lastQuestionText) ||
            // Avoid recently used questions (from the last 30)
            (this.usedQuestions.includes(questionHash))
        );

        // Update tracking
        this.lastQuestionText = newQuestion.question;
        this.lastQuestionHash = questionHash; // Track exact question hash to prevent back-to-back
        const trackingKey = questionVariant ? `${questionType}_${questionVariant}` : questionType;
        
        // Add to recent question types list, keep only last 10
        this.recentQuestionTypes.unshift(trackingKey);
        if (this.recentQuestionTypes.length > 10) {
            this.recentQuestionTypes.pop();
        }
        
        // Add to used questions list, keep only last 30
        this.usedQuestions.push(questionHash);
        if (this.usedQuestions.length > 30) {
            this.usedQuestions.shift();
        }
        
        return newQuestion;
    }

    // All original question generators remain unchanged
    // Adding new Exam 2 question generators below

    generateProbabilityBasicsQuestion() {
        const questionTypes = [
            // Addition rule questions
            () => {
                const pA = this._randint(1, 8) / 10;
                const pB = this._randint(1, 8) / 10;
                const pAB = Math.min(pA, pB) * this._randint(1, 5) / 10;
                const pAUB = pA + pB - pAB;
                
                return {
                    question: `If P(A) = ${pA}, P(B) = ${pB}, and P(A∩B) = ${pAB}, what is P(A∪B)?`,
                    options: this._generateOptions(pAUB, 4, pAUB + 0.1),
                    correct: 0,
                    explanation: `Using the addition rule, P(A∪B) = P(A) + P(B) - P(A∩B) = ${pA} + ${pB} - ${pAB} = ${pAUB}`,
                    hint: "Use the addition rule for probability."
                };
            },
            // Complement rule questions
            () => {
                const pA = this._randint(1, 9) / 10;
                const pNotA = 1 - pA;
                
                return {
                    question: `If P(A) = ${pA}, what is P(A')?`,
                    options: this._generateOptions(pNotA, 4, pNotA + 0.1),
                    correct: 0,
                    explanation: `Using the complement rule, P(A') = 1 - P(A) = 1 - ${pA} = ${pNotA}`,
                    hint: "Use the complement rule: P(A') = 1 - P(A)."
                };
            },
            // Multiplication rule questions
            () => {
                const pA = this._randint(1, 8) / 10;
                const pB = this._randint(1, 8) / 10;
                const pAB = pA * pB;
                
                return {
                    question: `If P(A) = ${pA} and P(B) = ${pB}, and A and B are independent, what is P(A∩B)?`,
                    options: this._generateOptions(pAB, 4, pAB + 0.1),
                    correct: 0,
                    explanation: `For independent events, P(A∩B) = P(A) × P(B) = ${pA} × ${pB} = ${pAB}`,
                    hint: "For independent events, use the multiplication rule: P(A∩B) = P(A) × P(B)."
                };
            },
            // Conceptual questions
            () => {
                const concepts = [
                    {
                        question: "Which type of probability is based on long-run frequencies of outcomes in repeated trials?",
                        options: ["Experimental", "Theoretical", "Subjective"],
                        correct: 0,
                        explanation: "Experimental probability is based on observed outcomes from repeated trials, giving empirical frequencies.",
                        hint: "Think about how this type of probability is determined in practice."
                    },
                    {
                        question: "If two events are disjoint (mutually exclusive), what is true about their intersection?",
                        options: ["P(A∩B) = 0", "P(A∩B) = 1", "P(A∩B) = P(A) × P(B)", "P(A∩B) = P(A) + P(B)"],
                        correct: 0,
                        explanation: "Disjoint events cannot occur simultaneously, so their intersection has probability zero.",
                        hint: "Disjoint means the events cannot happen together."
                    },
                    {
                        question: "What is the primary characteristic of a subjective probability?",
                        options: ["It's based on personal judgment", "It's derived from mathematical formulas", "It requires repeated experiments", "It's always accurate"],
                        correct: 0,
                        explanation: "Subjective probability is based on personal judgment or belief rather than formal calculations or experiments.",
                        hint: "Think about what makes this type of probability different from others."
                    }
                ];
                
                return concepts[Math.floor(Math.random() * concepts.length)];
            }
        ];
        
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const question = selectedType();
        
        return {
            question: question.question,
            options: question.options,
            correct: question.correct,
            explanation: question.explanation,
            ti84_steps: "This is a conceptual question that doesn't require calculator computation.",
            hint: question.hint,
            type: "probability-basics"
        };
    }

    generateProbabilityDistributionQuestion() {
        const questionTypes = [
            // Expected value questions
            () => {
                const n = this._randint(3, 5);
                const values = [];
                const probs = [];
                let totalProb = 0;
                
                for (let i = 0; i < n; i++) {
                    values.push(this._randint(1, 10));
                    const prob = this._randint(1, 10) / 10;
                    probs.push(prob);
                    totalProb += prob;
                }
                
                // Normalize probabilities
                for (let i = 0; i < n; i++) {
                    probs[i] = (probs[i] / totalProb).toFixed(1);
                }
                
                let expectedValue = 0;
                for (let i = 0; i < n; i++) {
                    expectedValue += values[i] * parseFloat(probs[i]);
                }
                
                const distText = values.map((v, i) => `P(X=${v})=${probs[i]}`).join(', ');
                
                return {
                    question: `A discrete random variable X has the following probability distribution: ${distText}. What is E(X), the expected value of X?`,
                    options: this._generateOptions(expectedValue, 4, expectedValue + 0.5),
                correct: 0,
                    explanation: `E(X) = Σ[x·P(X=x)] = ${values.map((v, i) => `${v}(${probs[i]})`).join(' + ')} = ${expectedValue.toFixed(1)}`,
                ti84_steps: "On the TI-84, enter the values in L1 and probabilities in L2, then use 1-Var Stats with frequencies.",
                hint: "Multiply each value by its probability and sum them up."
                };
            },
            // Variance questions
            () => {
                const n = this._randint(3, 4);
                const values = [];
                const probs = [];
                let totalProb = 0;
                
                for (let i = 0; i < n; i++) {
                    values.push(this._randint(1, 8));
                    const prob = this._randint(1, 10) / 10;
                    probs.push(prob);
                    totalProb += prob;
                }
                
                // Normalize probabilities
                for (let i = 0; i < n; i++) {
                    probs[i] = (probs[i] / totalProb).toFixed(1);
                }
                
                let expectedValue = 0;
                for (let i = 0; i < n; i++) {
                    expectedValue += values[i] * parseFloat(probs[i]);
                }
                
                let variance = 0;
                for (let i = 0; i < n; i++) {
                    variance += Math.pow(values[i] - expectedValue, 2) * parseFloat(probs[i]);
                }
                
                const distText = values.map((v, i) => `P(X=${v})=${probs[i]}`).join(', ');
                
                return {
                    question: `For a discrete random variable X with the following distribution: ${distText}, what is the variance of X?`,
                    options: this._generateOptions(variance, 4, variance + 0.5),
                    correct: 0,
                    explanation: `First find E(X) = ${expectedValue.toFixed(1)}. Then Var(X) = E[(X-μ)²] = ${variance.toFixed(2)}`,
                ti84_steps: "Calculate manually or use 1-Var Stats with appropriate lists.",
                hint: "Find the expected value first, then calculate the variance using the formula."
                };
            },
            // Probability questions
            () => {
                const n = this._randint(3, 5);
                const values = [];
                const probs = [];
                let totalProb = 0;
                
                for (let i = 0; i < n; i++) {
                    values.push(this._randint(0, 5));
                    const prob = this._randint(1, 10) / 10;
                    probs.push(prob);
                    totalProb += prob;
                }
                
                // Normalize probabilities
                for (let i = 0; i < n; i++) {
                    probs[i] = (probs[i] / totalProb).toFixed(1);
                }
                
                const threshold = this._randint(1, Math.max(...values));
                let probSum = 0;
                for (let i = 0; i < n; i++) {
                    if (values[i] >= threshold) {
                        probSum += parseFloat(probs[i]);
                    }
                }
                
                const distText = values.map((v, i) => `P(X=${v})=${probs[i]}`).join(', ');
                
                return {
                    question: `A random variable X has probability distribution: ${distText}. What is P(X ≥ ${threshold})?`,
                    options: this._generateOptions(probSum, 4, probSum + 0.1),
                correct: 0,
                    explanation: `P(X ≥ ${threshold}) = ${values.filter(v => v >= threshold).map(v => `P(X=${v})`).join(' + ')} = ${probSum.toFixed(1)}`,
                ti84_steps: "This is a direct calculation by adding the appropriate probabilities.",
                    hint: "Add up the probabilities for all values greater than or equal to the threshold."
                };
            }
        ];
        
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const question = selectedType();
        
        return {
            question: question.question,
            options: question.options,
            correct: question.correct,
            explanation: question.explanation,
            ti84_steps: question.ti84_steps,
            hint: question.hint,
            type: "probability-distribution"
        };
    }

    generateVennDiagramQuestion() {
        const questionTypes = [
            // Union questions
            () => {
                const pA = this._randint(20, 60);
                const pB = this._randint(20, 60);
                const pAB = this._randint(5, Math.min(pA, pB));
                const pAUB = pA + pB - pAB;
                
                const subjects = [
                    { A: "rock music", B: "country music" },
                    { A: "Science", B: "Business" },
                    { A: "basketball", B: "football" },
                    { A: "pizza", B: "burgers" }
                ];
                
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                
                return {
                    question: `In a survey, ${pA}% of respondents like ${subject.A}, ${pB}% like ${subject.B}, and ${pAB}% like both. What percentage like either ${subject.A} or ${subject.B}?`,
                    options: this._generateOptions(pAUB, 4, pAUB + 10),
                correct: 0,
                    explanation: `Using P(A∪B) = P(A) + P(B) - P(A∩B): ${pA}% + ${pB}% - ${pAB}% = ${pAUB}%`,
                ti84_steps: "This is a direct application of the addition rule of probability.",
                hint: "Use the formula for the union of two events."
                };
            },
            // Set difference questions
            () => {
                const pA = this._randint(25, 50);
                const pB = this._randint(20, 40);
                const pAB = this._randint(5, Math.min(pA, pB));
                const pAOnly = pA - pAB;
                
                const subjects = [
                    { A: "Science", B: "Business" },
                    { A: "Math", B: "English" },
                    { A: "Art", B: "Music" }
                ];
                
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                
                return {
                    question: `At a university, ${pA}% of students are in ${subject.A}, ${pB}% are in ${subject.B}, and ${pAB}% are in both. If a student is selected at random, what is the probability they are in ${subject.A} but not ${subject.B}?`,
                    options: this._generateOptions(pAOnly, 4, pAOnly + 5),
                correct: 0,
                    explanation: `P(${subject.A} and not ${subject.B}) = P(${subject.A}) - P(${subject.A} and ${subject.B}) = ${pA}% - ${pAB}% = ${pAOnly}%`,
                ti84_steps: "This is a direct application of set difference in probability.",
                    hint: "Find the probability of being in the first group, then subtract those who are also in the second group."
                };
            },
            // Independent events questions
            () => {
                const pA = this._randint(1, 8) / 10;
                const pB = this._randint(1, 8) / 10;
                const pAB = pA * pB;
                
                return {
                    question: `If two events A and B are independent, and P(A) = ${pA}, P(B) = ${pB}, what is P(A∩B)?`,
                    options: this._generateOptions(pAB, 4, pAB + 0.1),
                correct: 0,
                    explanation: `For independent events, P(A∩B) = P(A) × P(B) = ${pA} × ${pB} = ${pAB}`,
                    ti84_steps: "This is a direct application of the multiplication rule for independent events.",
                    hint: "For independent events, multiply the individual probabilities."
                };
            }
        ];
        
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const question = selectedType();
        
        return {
            question: question.question,
            options: question.options,
            correct: question.correct,
            explanation: question.explanation,
            ti84_steps: question.ti84_steps,
            hint: question.hint,
            type: "venn-diagram"
        };
    }

    generateNormalDistributionQuestion() {
        const questionTypes = [
            // Z-score questions
            () => {
                const mean = this._randint(50, 100);
                const stdDev = this._randint(5, 15);
                const value = mean + this._randint(-30, 30);
                const zScore = (value - mean) / stdDev;
                
                return {
                    question: `A normal distribution has mean ${mean} and standard deviation ${stdDev}. What is the z-score for a value of ${value}?`,
                    options: this._generateOptions(zScore, 4, zScore + 1),
                correct: 0,
                    explanation: `z = (x - μ) / σ = (${value} - ${mean}) / ${stdDev} = ${zScore.toFixed(2)}`,
                    ti84_steps: "Use normalcdf or calculate z-score manually.",
                    hint: "Use the formula z = (x - μ) / σ"
                };
            },
            // Probability questions
            () => {
                const mean = this._randint(50, 100);
                const stdDev = this._randint(5, 15);
                const lower = mean + this._randint(-20, 0);
                const upper = mean + this._randint(0, 20);
                
                const zLower = (lower - mean) / stdDev;
                const zUpper = (upper - mean) / stdDev;
                const prob = 0.5 * (Math.erf(zUpper/Math.sqrt(2)) - Math.erf(zLower/Math.sqrt(2)));
                
                return {
                    question: `A normal distribution has mean ${mean} and standard deviation ${stdDev}. What is the probability that a randomly selected value is between ${lower} and ${upper}?`,
                    options: this._generateOptions(prob, 4, prob + 0.1),
                correct: 0,
                    explanation: `P(${lower} < X < ${upper}) = P(z₁ < Z < z₂) where z₁ = (${lower} - ${mean})/${stdDev} = ${zLower.toFixed(2)} and z₂ = (${upper} - ${mean})/${stdDev} = ${zUpper.toFixed(2)} = ${prob.toFixed(3)}`,
                    ti84_steps: "Use normalcdf(lower, upper, mean, stdDev).",
                    hint: "Convert to z-scores and use the standard normal distribution."
                };
            }
        ];
        
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const question = selectedType();
        
        return {
            question: question.question,
            options: question.options,
            correct: question.correct,
            explanation: question.explanation,
            ti84_steps: question.ti84_steps,
            hint: question.hint,
            type: "normal-distribution"
        };
    }

        generateBinomialDistributionQuestion() {
        const questionTypes = [
            // Probability questions
            () => {
                const n = this._randint(5, 20);
                const p = this._randint(1, 8) / 10;
                const k = this._randint(0, n);
                
                const prob = this._comb(n, k) * Math.pow(p, k) * Math.pow(1-p, n-k);
                
                return {
                    question: `In a binomial experiment with n=${n} and p=${p}, what is the probability of exactly ${k} successes?`,
                    options: this._generateOptions(prob, 4, prob + 0.1),
                correct: 0,
                    explanation: `P(X=${k}) = C(${n},${k}) × ${p}^${k} × ${(1-p)}^${n-k} = ${prob.toFixed(4)}`,
                    ti84_steps: "Use binompdf(n, p, k) for exact probability.",
                    hint: "Use the binomial probability formula."
                };
            },
            // Expected value questions
            () => {
                const n = this._randint(10, 30);
                const p = this._randint(1, 8) / 10;
                const expected = n * p;
                
                return {
                    question: `In a binomial experiment with n=${n} and p=${p}, what is the expected number of successes?`,
                    options: this._generateOptions(expected, 4, expected + 2),
                correct: 0,
                    explanation: `E(X) = n × p = ${n} × ${p} = ${expected}`,
                    ti84_steps: "Expected value is n × p for binomial distribution.",
                    hint: "For binomial distribution, E(X) = n × p."
                };
            }
        ];
        
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const question = selectedType();
        
        return {
            question: question.question,
            options: question.options,
            correct: question.correct,
            explanation: question.explanation,
            ti84_steps: question.ti84_steps,
            hint: question.hint,
            type: "binomial-distribution"
        };
    }

        generateCentralLimitTheoremQuestion() {
        const questionTypes = [
            // Sample mean questions
            () => {
                const popMean = this._randint(50, 100);
                const popStd = this._randint(5, 15);
                const n = this._randint(20, 50);
                const sampleMean = popMean;
                const sampleStd = popStd / Math.sqrt(n);
                
                return {
                    question: `A population has mean ${popMean} and standard deviation ${popStd}. What is the standard deviation of the sample mean for samples of size ${n}?`,
                    options: this._generateOptions(sampleStd, 4, sampleStd + 1),
                correct: 0,
                    explanation: `By Central Limit Theorem, σₓ̄ = σ/√n = ${popStd}/√${n} = ${sampleStd.toFixed(2)}`,
                    ti84_steps: "Calculate σ/√n manually.",
                    hint: "Use the Central Limit Theorem formula for sample mean standard deviation."
                };
            },
            // Probability questions
            () => {
                const popMean = this._randint(50, 100);
                const popStd = this._randint(5, 15);
                const n = this._randint(20, 50);
                const threshold = popMean + this._randint(-10, 10);
                
                const sampleStd = popStd / Math.sqrt(n);
                const zScore = (threshold - popMean) / sampleStd;
                const prob = 0.5 * (1 + Math.erf(zScore/Math.sqrt(2)));
                
                return {
                    question: `A population has mean ${popMean} and standard deviation ${popStd}. What is the probability that the sample mean of size ${n} is less than ${threshold}?`,
                    options: this._generateOptions(prob, 4, prob + 0.1),
                correct: 0,
                    explanation: `By CLT, X̄ ~ N(μ, σ/√n). P(X̄ < ${threshold}) = P(Z < (${threshold} - ${popMean})/(${popStd}/√${n})) = ${prob.toFixed(3)}`,
                    ti84_steps: "Use normalcdf(-∞, threshold, popMean, popStd/√n).",
                    hint: "Apply Central Limit Theorem and use normal distribution."
                };
            }
        ];
        
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const question = selectedType();
        
        return {
            question: question.question,
            options: question.options,
            correct: question.correct,
            explanation: question.explanation,
            ti84_steps: question.ti84_steps,
            hint: question.hint,
            type: "central-limit-theorem"
        };
    }

        generateConditionalProbabilityQuestion() {
        const questionTypes = [
            // Basic conditional probability
            () => {
                const pA = this._randint(1, 8) / 10;
                const pB = this._randint(1, 8) / 10;
                const pAB = Math.min(pA, pB) * this._randint(1, 5) / 10;
                const pBGivenA = pAB / pA;
                
                return {
                    question: `If P(A) = ${pA} and P(A∩B) = ${pAB}, what is P(B|A)?`,
                    options: this._generateOptions(pBGivenA, 4, pBGivenA + 0.1),
                correct: 0,
                    explanation: `P(B|A) = P(A∩B) / P(A) = ${pAB} / ${pA} = ${pBGivenA.toFixed(3)}`,
                    ti84_steps: "Calculate P(A∩B) / P(A) manually.",
                    hint: "Use the definition of conditional probability: P(B|A) = P(A∩B) / P(A)."
                };
            },
            // Independence questions
            () => {
                const pA = this._randint(1, 8) / 10;
                const pB = this._randint(1, 8) / 10;
                const pAB = pA * pB; // Independent events
                
                return {
                    question: `If P(A) = ${pA}, P(B) = ${pB}, and A and B are independent, what is P(A∩B)?`,
                    options: this._generateOptions(pAB, 4, pAB + 0.1),
                correct: 0,
                    explanation: `For independent events, P(A∩B) = P(A) × P(B) = ${pA} × ${pB} = ${pAB}`,
                    ti84_steps: "For independent events, multiply the probabilities.",
                    hint: "For independent events, P(A∩B) = P(A) × P(B)."
                };
            }
        ];
        
        const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const question = selectedType();
        
        return {
            question: question.question,
            options: question.options,
            correct: question.correct,
            explanation: question.explanation,
            ti84_steps: question.ti84_steps,
            hint: question.hint,
            type: "conditional-probability"
        };
    }

    // Placeholder generators for Exam 1 topics (to be implemented)
    generateVariableTypeQuestion() {
        const variables = [
            { name: "Age in years", type: "Quantitative Continuous", reason: "Age is measured on a continuous scale and can take any value within a range." },
            { name: "Number of siblings", type: "Quantitative Discrete", reason: "It's a countable whole number that can only take specific values." },
            { name: "Hair color", type: "Categorical", reason: "Hair color is a category or quality that cannot be measured numerically." },
            { name: "Height in centimeters", type: "Quantitative Continuous", reason: "Height can take any value within a range and is measured on a continuous scale." },
            { name: "Zip code", type: "Categorical", reason: "Though represented by numbers, zip codes are labels for areas and don't have mathematical meaning." },
            { name: "Number of pets", type: "Quantitative Discrete", reason: "It's a countable whole number that can only take specific values." },
            { name: "Blood type", type: "Categorical", reason: "Blood type is a category with no inherent numerical value or order." },
            { name: "Temperature in Celsius", type: "Quantitative Continuous", reason: "Temperature is measured on a continuous scale and can take any value within a range." },
            { name: "Marital status", type: "Categorical", reason: "Marital status represents categories like 'single' or 'married' with no numerical meaning." },
            { name: "Number of children", type: "Quantitative Discrete", reason: "It's a countable whole number that can only take specific values." }
        ];
        
        const randomVar = variables[Math.floor(Math.random() * variables.length)];
        
        return {
            question: `Which type of variable is ${randomVar.name}?`,
            options: ["Categorical", "Quantitative Discrete", "Quantitative Continuous"],
            correct: ["Categorical", "Quantitative Discrete", "Quantitative Continuous"].indexOf(randomVar.type),
            explanation: `${randomVar.name} is a ${randomVar.type.toLowerCase()} variable because ${randomVar.reason}`,
            hint: "Think about whether the data is a measurement, a countable number, or a category.",
            type: "variable-type",
            ti84: null
        };
    }

    generateDescriptiveStatsQuestion() {
        // Generate random data set with 5-9 numbers
        const size = this._randint(5, 9);
        const data = [];
        for (let i = 0; i < size; i++) {
            data.push(this._randint(10, 45));
        }
        
        const mean = this._mean(data);
        const median = this._median(data);
        const range = this._max(data) - this._min(data);
        const std = this._std(data);
        
        // Randomly choose which statistic to ask for
        const statTypes = ["mean", "median", "range", "std"];
        const statType = statTypes[Math.floor(Math.random() * statTypes.length)];
        
        let question, correct, options, explanation, hint;
        
        if (statType === "mean") {
            question = `Find the mean of: ${data.join(', ')}`;
            correct = 0;
            options = this._generateOptions(mean);
            explanation = `Mean = (${data.join(' + ')}) / ${data.length} = ${this._sum(data)} / ${data.length} = ${mean}`;
            hint = "Add all values and divide by the number of values.";
        } else if (statType === "median") {
            question = `Find the median of: ${data.join(', ')}`;
            correct = 0;
            options = this._generateOptions(median);
            const sortedData = [...data].sort((a, b) => a - b);
            explanation = `Median = middle value of sorted data [${sortedData.join(', ')}] = ${median}`;
            hint = "Sort the data and find the middle value.";
        } else if (statType === "range") {
            question = `Find the range of: ${data.join(', ')}`;
            correct = 0;
            options = this._generateOptions(range);
            explanation = `Range = max - min = ${this._max(data)} - ${this._min(data)} = ${range}`;
            hint = "Find the difference between the largest and smallest values.";
        } else { // std
            question = `Find the standard deviation of: ${data.join(', ')}`;
            correct = 0;
            options = this._generateOptions(std);
            explanation = `Standard deviation = √(Σ(x-μ)²/(n-1)) = ${std.toFixed(2)}`;
            hint = "Calculate the square root of the variance.";
        }
        
        return {
            question: question,
            options: options,
            correct: correct,
            explanation: explanation,
            hint: hint,
            type: "descriptive-stats",
            ti84: statType === "std" ? "Enter values in L1, then use 1-Var Stats." : "Enter values in L1, then use 1-Var Stats."
        };
    }

    generateRegressionQuestion() {
        const questions = [
            {
                question: "What does the slope in a regression equation represent?",
                options: ["The y-intercept", "The change in y per unit change in x", "The correlation coefficient", "The standard deviation"],
                correct: 1,
                explanation: "The slope represents the change in the dependent variable (y) for each unit increase in the independent variable (x)."
            },
            {
                question: "What does the y-intercept in a regression equation represent?",
                options: ["The slope of the line", "The value of y when x = 0", "The correlation coefficient", "The standard deviation"],
                correct: 1,
                explanation: "The y-intercept represents the value of the dependent variable (y) when the independent variable (x) equals zero."
            },
            {
                question: "What does a correlation coefficient of 0.8 indicate?",
                options: ["No relationship", "Weak positive relationship", "Strong positive relationship", "Perfect negative relationship"],
                correct: 2,
                explanation: "A correlation coefficient of 0.8 indicates a strong positive linear relationship between the variables."
            },
            {
                question: "What is the range of possible values for a correlation coefficient?",
                options: ["0 to 1", "-1 to 1", "-∞ to ∞", "0 to ∞"],
                correct: 1,
                explanation: "Correlation coefficients range from -1 to 1, where -1 indicates perfect negative correlation and 1 indicates perfect positive correlation."
            }
        ];
        
        const selected = questions[Math.floor(Math.random() * questions.length)];

    return { 
            question: selected.question,
            options: selected.options,
            correct: selected.correct,
        explanation: selected.explanation, 
            hint: "Think about the relationship between variables and regression concepts.",
            type: "regression",
            ti84: null
        };
    }

    generateEmpiricalRuleQuestion() {
        const questions = [
            {
                question: "In a normal distribution, what percentage of data falls within 1 standard deviation of the mean?",
                options: ["68%", "95%", "99.7%", "50%"],
                correct: 0,
                explanation: "According to the empirical rule, approximately 68% of data falls within 1 standard deviation of the mean."
            },
            {
                question: "In a normal distribution, what percentage of data falls within 2 standard deviations of the mean?",
                options: ["68%", "95%", "99.7%", "50%"],
                correct: 1,
                explanation: "According to the empirical rule, approximately 95% of data falls within 2 standard deviations of the mean."
            },
            {
                question: "In a normal distribution, what percentage of data falls within 3 standard deviations of the mean?",
                options: ["68%", "95%", "99.7%", "50%"],
                correct: 2,
                explanation: "According to the empirical rule, approximately 99.7% of data falls within 3 standard deviations of the mean."
            },
            {
                question: "What is the empirical rule also known as?",
                options: ["The 68-95-99.7 rule", "The normal rule", "The standard rule", "The distribution rule"],
                correct: 0,
                explanation: "The empirical rule is also known as the 68-95-99.7 rule because it states that 68%, 95%, and 99.7% of data fall within 1, 2, and 3 standard deviations of the mean respectively."
            }
        ];
        
        const selected = questions[Math.floor(Math.random() * questions.length)];
        
        return {
            question: selected.question,
            options: selected.options,
            correct: selected.correct,
            explanation: selected.explanation,
            hint: "Remember the 68-95-99.7 rule for normal distributions.",
            type: "empirical-rule",
            ti84: null
        };
    }

    generateCountingQuestion() {
        const n = this._randint(3, 8);
        const k = this._randint(2, n);
        
        const permutation = this._perm(n, k);
        const combination = this._comb(n, k);
        
        const questionTypes = [
            {
                question: `How many ways can you arrange ${n} books on a shelf?`,
                answer: this._factorial(n),
                explanation: `This is a permutation of all ${n} items: ${n}! = ${this._factorial(n)}`,
                hint: "Use the factorial formula for arranging all items."
            },
            {
                question: `How many ways can you arrange ${k} books from ${n} books on a shelf?`,
                answer: permutation,
                explanation: `This is a permutation: P(${n},${k}) = ${n}!/(${n}-${k})! = ${permutation}`,
                hint: "Use the permutation formula P(n,k) = n!/(n-k)!"
            },
            {
                question: `How many ways can you choose ${k} books from ${n} books?`,
                answer: combination,
                explanation: `This is a combination: C(${n},${k}) = ${n}!/(${k}!(${n}-${k})!) = ${combination}`,
                hint: "Use the combination formula C(n,k) = n!/(k!(n-k)!)"
            }
        ];
        
        const selected = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    return { 
            question: selected.question,
            options: this._generateOptions(selected.answer, 4, null, true),
            correct: 0,
        explanation: selected.explanation, 
            hint: selected.hint,
            type: "counting",
            ti84: "Use factorial, permutation, or combination functions on calculator."
        };
    }
    
    _factorial(n) {
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    generateMeanCorrectionQuestion() {
        const constant = this._randint(2, 10);
        const operations = [
            { op: "add", text: "add", effect: "increases" },
            { op: "subtract", text: "subtract", effect: "decreases" },
            { op: "multiply", text: "multiply by", effect: "multiplies" }
        ];
        
        const selected = operations[Math.floor(Math.random() * operations.length)];
        
        let question, correct, explanation;
        
        if (selected.op === "add") {
            question = `If you add ${constant} to each value in a dataset, what happens to the mean?`;
            correct = 0;
            explanation = `Adding a constant to all values increases the mean by that same constant.`;
        } else if (selected.op === "subtract") {
            question = `If you subtract ${constant} from each value in a dataset, what happens to the mean?`;
            correct = 0;
            explanation = `Subtracting a constant from all values decreases the mean by that same constant.`;
        } else {
            question = `If you multiply each value in a dataset by ${constant}, what happens to the mean?`;
            correct = 0;
            explanation = `Multiplying all values by a constant multiplies the mean by that same constant.`;
        }
        
        return {
            question: question,
            options: ["It increases by 5", "It decreases by 5", "It stays the same", "It doubles"],
            correct: correct,
            explanation: explanation,
            hint: "Think about how operations on all values affect the average.",
            type: "mean-correction",
            ti84: null
        };
    }

    generateZScoreQuestion() {
        const mean = this._randint(50, 100);
        const stdDev = this._randint(5, 15);
        const value = mean + this._randint(-20, 20);
        
        const zScore = (value - mean) / stdDev;
        
        return {
            question: `What is the z-score for a value of ${value} in a distribution with mean ${mean} and standard deviation ${stdDev}?`,
            options: this._generateOptions(zScore, 4, zScore + 1),
            correct: 0,
            explanation: `z = (x - μ) / σ = (${value} - ${mean}) / ${stdDev} = ${(value - mean)} / ${stdDev} = ${zScore.toFixed(1)}`,
            hint: "Use the formula z = (x - μ) / σ",
            type: "z-score",
            ti84: `Calculate (${value} - ${mean}) / ${stdDev}`
        };
    }

    generateFormulaQuestion() {
        const formulas = [
            {
                question: "What is the formula for the standard deviation of a sample?",
                options: ["√(Σ(x-μ)²/n)", "√(Σ(x-μ)²/(n-1))", "Σ(x-μ)²/n", "Σ(x-μ)²/(n-1)"],
                correct: 1,
                explanation: "The sample standard deviation uses n-1 in the denominator (Bessel's correction) to provide an unbiased estimate."
            },
            {
                question: "What is the formula for the mean of a dataset?",
                options: ["Σx/n", "Σx/(n-1)", "√(Σx²/n)", "Σx²/n"],
                correct: 0,
                explanation: "The mean is calculated as the sum of all values divided by the number of values: μ = Σx/n"
            },
            {
                question: "What is the formula for the variance of a sample?",
                options: ["Σ(x-μ)²/n", "Σ(x-μ)²/(n-1)", "√(Σ(x-μ)²/n)", "√(Σ(x-μ)²/(n-1))"],
                correct: 1,
                explanation: "The sample variance uses n-1 in the denominator to provide an unbiased estimate of the population variance."
            },
            {
                question: "What is the formula for the correlation coefficient?",
                options: ["Σxy/n", "Σ(x-μx)(y-μy)/n", "Σ(x-μx)(y-μy)/(n-1)", "Σ(x-μx)(y-μy)/(σxσy)"],
                correct: 3,
                explanation: "The correlation coefficient is calculated as the covariance divided by the product of standard deviations."
            }
        ];
        
        const selected = formulas[Math.floor(Math.random() * formulas.length)];

    return { 
            question: selected.question,
            options: selected.options,
            correct: selected.correct,
        explanation: selected.explanation, 
            hint: "Remember the key statistical formulas and when to use n vs n-1.",
            type: "formula",
            ti84: null
        };
    }

    generateEmpiricalRuleConceptQuestion() {
        const concepts = [
            {
                question: "What does the empirical rule tell us about normal distributions?",
                options: ["It's always accurate", "It provides approximate percentages for data within certain standard deviations", "It only works for small samples", "It requires the mean to be 0"],
                correct: 1,
                explanation: "The empirical rule provides approximate percentages (68%, 95%, 99.7%) for data within 1, 2, and 3 standard deviations of the mean in normal distributions."
            },
            {
                question: "When is the empirical rule most accurate?",
                options: ["For any distribution", "For normal distributions", "For skewed distributions", "For small samples"],
                correct: 1,
                explanation: "The empirical rule is most accurate for normal distributions, though it can provide rough estimates for other distributions."
            },
            {
                question: "What percentage of data falls within 1 standard deviation of the mean according to the empirical rule?",
                options: ["50%", "68%", "95%", "99.7%"],
                correct: 1,
                explanation: "According to the empirical rule, approximately 68% of data falls within 1 standard deviation of the mean in a normal distribution."
            }
        ];
        
        const selected = concepts[Math.floor(Math.random() * concepts.length)];

    return { 
            question: selected.question,
            options: selected.options,
            correct: selected.correct,
        explanation: selected.explanation, 
            hint: "Think about what the empirical rule describes about data distribution.",
            type: "empirical-rule-concept",
            ti84: null
        };
    }

    generateConceptualQuestion() {
        const concepts = [
            {
                question: "What is the difference between a parameter and a statistic?",
                options: ["A parameter describes a population, a statistic describes a sample", "A statistic describes a population, a parameter describes a sample", "They are the same thing", "Parameters are always larger than statistics"],
                correct: 0,
                explanation: "A parameter is a numerical characteristic of a population, while a statistic is a numerical characteristic of a sample."
            },
            {
                question: "What is the difference between descriptive and inferential statistics?",
                options: ["Descriptive summarizes data, inferential makes predictions", "Inferential summarizes data, descriptive makes predictions", "They are the same thing", "Descriptive is always more accurate"],
                correct: 0,
                explanation: "Descriptive statistics summarize and describe data, while inferential statistics make predictions and draw conclusions about populations from samples."
            },
            {
                question: "What is the difference between a sample and a population?",
                options: ["A sample is a subset of a population", "A population is a subset of a sample", "They are the same thing", "A sample is always larger than a population"],
                correct: 0,
                explanation: "A sample is a subset of a population that is used to make inferences about the entire population."
            }
        ];
        
        const selected = concepts[Math.floor(Math.random() * concepts.length)];

    return { 
            question: selected.question,
            options: selected.options,
            correct: selected.correct,
        explanation: selected.explanation, 
            hint: "Think about the fundamental concepts in statistics.",
            type: "conceptual",
            ti84: null
        };
    }

    generateTrueFalseQuestion() {
        const statements = [
            { statement: "The mean is always greater than the median in a right-skewed distribution.", is_true: true, explanation: "In right-skewed distributions, the mean is pulled in the direction of the tail, making it greater than the median." },
            { statement: "Correlation implies causation.", is_true: false, explanation: "Correlation does not imply causation. Two variables can be correlated without one causing the other." },
            { statement: "The standard deviation can never be negative.", is_true: true, explanation: "Standard deviation is calculated using squared differences, so it's always non-negative." },
            { statement: "A z-score of 0 means the value is at the mean.", is_true: true, explanation: "A z-score of 0 indicates the value is exactly at the mean of the distribution." },
            { statement: "The median is resistant to outliers.", is_true: true, explanation: "The median is not affected by extreme values, making it resistant to outliers." },
            { statement: "A correlation coefficient of 0.9 indicates a weak relationship.", is_true: false, explanation: "A correlation coefficient of 0.9 indicates a very strong positive relationship." },
            { statement: "The mode is always unique in a dataset.", is_true: false, explanation: "A dataset can have multiple modes (bimodal, trimodal) or no mode at all." },
            { statement: "In a normal distribution, the mean equals the median.", is_true: true, explanation: "In symmetric distributions like the normal distribution, the mean and median are equal." }
    ];
    
    const selected = statements[Math.floor(Math.random() * statements.length)];
    return { 
            question: `True or False: ${selected.statement}`,
            options: ["True", "False"],
            correct: selected.is_true ? 0 : 1,
            explanation: selected.is_true ? `This statement is true. ${selected.explanation}` : `This statement is false. ${selected.explanation}`,
            hint: "Consider the statistical principles involved.",
            type: "true-false",
            ti84: null
        };
    }
}