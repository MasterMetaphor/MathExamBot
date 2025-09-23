// This file contains the logic for generating new questions, ported from Python.

class QuestionBank {
    constructor() {
        this.lastQuestionText = null; // To track the last question
        this.questionGenerators = [
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
        ];

        this.topicMap = {
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
        };
    }

    // --- Utility functions for stats (replacing numpy) ---
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

    getNewQuestion(topic = null) {
        let generator;
        if (topic && this.topicMap[topic]) {
            generator = this.topicMap[topic];
        } else {
            const randomIndex = Math.floor(Math.random() * this.questionGenerators.length);
            generator = this.questionGenerators[randomIndex];
        }
        
        let newQuestion;
        let attempts = 0; // Safeguard against infinite loops
        do {
            newQuestion = generator();
            attempts++;
        } while (this.lastQuestionText && newQuestion.question === this.lastQuestionText && attempts < 10);

        this.lastQuestionText = newQuestion.question;
        return newQuestion;
    }

    generateVariableTypeQuestion() {
        const qPool = [
            { question: "A coffee shop tracks the types of drinks sold (e.g., 'Latte', 'Espresso'). What type of variable is the drink type?", options: ["categorical", "quantitative continuous", "quantitative discrete"], correct: 0, explanation: "Drink type is a categorical variable because it sorts data into distinct categories or labels.", hint: "Think about whether the data is a measurement, a countable number, or a category." },
            { question: "A researcher measures the exact weight of apples in grams. What type of variable is the apple's weight?", options: ["quantitative continuous", "quantitative discrete", "categorical"], correct: 0, explanation: "Weight is a quantitative continuous variable because it is measured and can take any value within a range (e.g., 150.5g, 150.51g).", hint: "Can the measurement have a decimal or fraction? If so, it's likely continuous." },
            { question: "The number of students in each classroom at a school is recorded. What type of variable is this count?", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 0, explanation: "The number of students is a quantitative discrete variable because it is a countable whole number. You can't have half a student.", hint: "Is the data something you count in whole numbers, or something you measure?" },
            { question: "A survey asks participants for their zip code. What type of variable is a zip code?", options: ["categorical", "quantitative continuous", "quantitative discrete"], correct: 0, explanation: "A zip code is a categorical variable. Even though it's a number, it's used as a label for a location, and performing mathematical operations like finding an 'average' zip code doesn't make sense.", hint: "Just because it's a number, does that mean you can do math on it? What does the number represent?" },
            { question: "A restaurant records the amount of time (in minutes) a customer spends at a table. What type of variable is this duration?", options: ["quantitative continuous", "quantitative discrete", "categorical"], correct: 1, explanation: "Time is a quantitative continuous variable because it is measured and can be broken down into smaller and smaller units (e.g., 30.5 minutes).", hint: "Think about whether the data is a measurement, a countable number, or a category." },
            { question: "A movie theater surveys customers on their favorite film genre (e.g., 'Comedy', 'Horror', 'Sci-Fi'). How would you classify the 'film genre' variable?", options: ["categorical", "quantitative continuous", "quantitative discrete"], correct: 0, explanation: "Film genre is a categorical variable as it places responses into named groups.", hint: "Are the responses words or numerical measurements?"},
            { question: "An athlete's jersey number is recorded. What type of variable is the jersey number?", options: ["categorical", "quantitative continuous", "quantitative discrete"], correct: 0, explanation: "Like a zip code, a jersey number is a numerical label. Calculating the average jersey number is meaningless, so it is a categorical variable.", hint: "Would it make sense to calculate the average of these numbers?"},
            { question: "A quality control inspector counts the number of defective products in a batch. What type of variable is this count?", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 0, explanation: "The number of defective products is a countable, whole number, making it a quantitative discrete variable.", hint: "Can you have a fraction of a defective product?"},
            { question: "The volume of gasoline in a car's tank (in gallons) is measured. What kind of variable is this?", options: ["quantitative continuous", "quantitative discrete", "categorical"], correct: 0, explanation: "Volume is a measurement that can take any value within a range, such as 10.2 gallons or 10.23 gallons. This makes it a quantitative continuous variable.", hint: "Is this a counted number or a measured quantity?"}
        ];
        const q = qPool[Math.floor(Math.random() * qPool.length)];
        return { question: q.question, options: q.options, correct: q.correct, explanation: q.explanation, ti84_steps: "Conceptual question.", hint: q.hint, type: "conceptual" };
    }

    generateDescriptiveStatsQuestion() {
        const scenarios = [
            { subject: "A student's quiz scores", unit: "points" },
            { subject: "The number of daily visitors to a small museum", unit: "visitors" },
            { subject: "The heights of plants in a garden", unit: "cm" },
            { subject: "Daily high temperatures for a city", unit: "°F" },
            { subject: "The number of home runs hit by a baseball team in a season", unit: "home runs" },
            { subject: "The sale prices of houses in a neighborhood", unit: "dollars" }
        ];
        const scenario = scenarios[this._randint(0, scenarios.length - 1)];

        const data = Array.from({ length: this._randint(8, 12) }, () => this._randint(10, 50));
        const dataStr = data.join(", ");
        
        const statToAsk = ['mean', 'median', 'std', 'range', 'iqr', 'outlier'][this._randint(0, 5)];
        let correctAns, qText, tiSteps, explanation, example, type, options;
        const hint = "Remember the definitions: mean (average), median (middle), std (spread), range (max-min), IQR (Q3-Q1), outlier (1.5*IQR rule).";

        switch (statToAsk) {
            case 'mean':
                correctAns = this._mean(data);
                qText = `${scenario.subject} were recorded as follows: ${dataStr}. What is the average?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Read the mean (x̄).";
                example = `[STAT] > 1:Edit...\\nL1: ${data.join(',')}\\n[STAT] > CALC > 1-Var Stats\\nx̄=${correctAns.toFixed(2)}`;
                type = "descriptive-mean";
                options = this._generateOptions(correctAns);
                break;
            case 'median':
                correctAns = this._median(data);
                qText = `The following data for ${scenario.subject} was collected: ${dataStr}. What is the median value?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Scroll down to find the median (Med).";
                example = `[STAT] > 1:Edit...\\nL1: ${data.join(',')}\\n[STAT] > CALC > 1-Var Stats\\n...scroll down...\\nMed=${correctAns.toFixed(2)}`;
                type = "descriptive-median";
                options = this._generateOptions(correctAns);
                break;
            case 'std':
                correctAns = this._std(data);
                qText = `For the dataset representing ${scenario.subject}: ${dataStr}, what is the sample standard deviation?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Find the sample standard deviation (Sx).";
                example = `[STAT] > 1:Edit...\\nL1: ${data.join(',')}\\n[STAT] > CALC > 1-Var Stats\\nSx=${correctAns.toFixed(2)}`;
                type = "descriptive-std";
                options = this._generateOptions(correctAns);
                break;
            case 'range':
                correctAns = this._max(data) - this._min(data);
                qText = `Given these values for ${scenario.subject}: ${dataStr}, what is the range?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Find maxX and minX, then calculate Range = maxX - minX.";
                example = `[STAT] > 1:Edit...\\nL1: ${data.join(',')}\\n[STAT] > CALC > 1-Var Stats\\n...scroll down...\\nmaxX=${this._max(data)}\\nminX=${this._min(data)}\\n[2nd]>[MODE](QUIT)\\n${this._toButtonPresses(this._max(data))}[-]${this._toButtonPresses(this._min(data))}[ENTER]`;
                type = "descriptive-range";
                options = this._generateOptions(correctAns);
                break;
            case 'iqr':
                const { q1, q3 } = this._quartiles(data);
                correctAns = q3 - q1;
                qText = `For the dataset representing ${scenario.subject}: ${dataStr}, what is the Interquartile Range (IQR)?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Scroll down to find Q1 and Q3, then calculate IQR = Q3 - Q1.";
                example = `[STAT] > 1:Edit...\\nL1: ${data.join(',')}\\n[STAT] > CALC > 1-Var Stats\\n...scroll down...\\nQ1=${q1}\\nQ3=${q3}\\n[2nd]>[MODE](QUIT)\\n${this._toButtonPresses(q3)}[-]${this._toButtonPresses(q1)}[ENTER]`;
                type = "descriptive-iqr";
                options = this._generateOptions(correctAns);
                break;
            case 'outlier':
                const quartiles = this._quartiles(data);
                const iqr = quartiles.q3 - quartiles.q1;
                const lowerBound = quartiles.q1 - 1.5 * iqr;
                const upperBound = quartiles.q3 + 1.5 * iqr;
                const outlier = data.find(x => x < lowerBound || x > upperBound);
                
                qText = `Given the data for ${scenario.subject}: ${dataStr}, and using the 1.5*IQR rule, which value would be an outlier? If none, select 'None'.`;
                
                if (outlier !== undefined) {
                    correctAns = outlier;
                    options = this._generateOptions(correctAns, 4, null, true);
                    options[this._randint(0,3)] = 'None'; 
                    options[this._randint(0,3)] = correctAns.toString();
                } else {
                    correctAns = 'None';
                    options = this._generateOptions(this._max(data) + 5, 4, null, true);
                    options[this._randint(0,3)] = 'None';
                }
                
                tiSteps = "TI-84: Find Q1 and Q3 using 1-Var Stats. Calculate IQR = Q3 - Q1. Calculate Lower Fence = Q1 - 1.5*IQR and Upper Fence = Q3 + 1.5*IQR. Check if any data points fall outside this range.";
                example = `Q1=${quartiles.q1}, Q3=${quartiles.q3} -> IQR=${iqr}\\nLower=${quartiles.q1}-1.5*${iqr}=${lowerBound}\\nUpper=${quartiles.q3}+1.5*${iqr}=${upperBound}`;
                type = "descriptive-outlier";
                break;
        }
        
        const baseExplanation = `The ${statToAsk} is the correct answer.`;
        explanation = `${baseExplanation} For the data set on ${scenario.subject}, the answer is ${typeof correctAns === 'number' ? correctAns.toFixed(2) : correctAns}.`;
        const correctIdx = options.indexOf(typeof correctAns === 'number' ? correctAns.toFixed(2) : correctAns.toString());
        
        return { question: qText, options, correct: correctIdx, explanation, ti84_steps: tiSteps, hint, example, type };
    }

    generateRegressionQuestion() {
        const scenarios = [
            { x_axis: "hours of sunshine", y_axis: "plant growth in cm", x_unit: "hours", y_unit: "cm" },
            { x_axis: "daily ads watched", y_axis: "in-app purchases", x_unit: "ads", y_unit: "purchases" },
            { x_axis: "hours studied", y_axis: "exam score", x_unit: "hours", y_unit: "points" },
            { x_axis: "years of experience", y_axis: "annual salary", x_unit: "years", y_unit: "dollars" },
            { x_axis: "temperature in °C", y_axis: "ice cream sales", x_unit: "°C", y_unit: "sales" }
        ];
        const scenario = scenarios[this._randint(0, scenarios.length - 1)];

        const nPoints = this._randint(7, 10);
        const x = Array.from({ length: nPoints }, () => parseFloat((Math.random() * 10 + 1).toFixed(1)));
        const trueSlope = this._uniform(1.5, 5.0) * (Math.random() < 0.5 ? -1 : 1);
        const trueIntercept = this._uniform(20, 50);
        const y = x.map(val => parseFloat((trueSlope * val + trueIntercept + (Math.random() - 0.5) * 10).toFixed(1)));

        // Calculate the regression line from the generated data to ensure accuracy
        const { slope, intercept } = this._linreg(x, y);

        const questionType = ['r2', 'interpret_slope', 'predict'][this._randint(0, 2)];
        
        let qText, options, correctIdx, explanation, ti84_steps, hint, example, type;

        switch (questionType) {
            case 'r2':
                const r = this._corr(x, y);
                const r2 = r * r;
                qText = `A scientist finds the correlation coefficient (r) between ${scenario.x_axis} and ${scenario.y_axis} is ${r.toFixed(3)}. What percentage of the variation in ${scenario.y_axis} can be explained by ${scenario.x_axis} (i.e., what is r²)?`;
                options = this._generateOptions(r2, 4, null, false, true);
                correctIdx = options.indexOf(r2.toFixed(3));
                example = `[HOME SCREEN]:\\n${this._toButtonPresses(r.toFixed(3))} [x²] [ENTER]\\nResult: ${r2.toFixed(3)}`;
                explanation = `The coefficient of determination, r², is the square of the correlation coefficient. Here, r² = (${r.toFixed(3)})² = ${r2.toFixed(3)}. This means ${(r2 * 100).toFixed(1)}% of the variation is explained by the model.`;
                ti84_steps = "If you have 'r', square it on the home screen. If you have the data, enter X in L1 and Y in L2, then run STAT→CALC→4:LinReg(ax+b) to find r². Make sure DiagnosticOn is enabled.";
                hint = "The coefficient of determination is the square of the correlation coefficient 'r'.";
                type = "regression-r2";
                break;
            case 'interpret_slope':
                qText = `A researcher analyzes the relationship between ${scenario.x_axis} (X) and ${scenario.y_axis} (Y). Based on a sample of data, the least-squares regression equation is found to be ŷ = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}. How should the slope be interpreted?`;
                const correctAns = `For each additional ${scenario.x_unit}, ${scenario.y_axis} are predicted to ${slope > 0 ? 'increase' : 'decrease'} by ${Math.abs(slope).toFixed(2)} ${scenario.y_unit}.`;
                options = [
                    correctAns,
                    `For each additional ${scenario.y_unit}, ${scenario.x_axis} are predicted to ${slope > 0 ? 'increase' : 'decrease'} by ${Math.abs(slope).toFixed(2)} ${scenario.x_unit}.`,
                    `The predicted number of ${scenario.y_axis} at zero ${scenario.x_axis} is ${slope.toFixed(2)}.`,
                    `The model explains ${slope.toFixed(2)}% of the variation in ${scenario.y_axis}.`
                ];
                options.sort(() => Math.random() - 0.5);
                correctIdx = options.indexOf(correctAns);
                explanation = `The slope (a) in ŷ = ax + b represents the change in the predicted Y for a one-unit increase in X. Here, for every one additional ${scenario.x_unit}, ${scenario.y_axis} are predicted to change by ${slope.toFixed(2)} ${scenario.y_unit}.`;
                ti84_steps = "This is a conceptual question. The slope is the 'a' value in the LinReg(ax+b) output.";
                hint = "The slope represents the change in Y for a one-unit change in X.";
                example = `ŷ = ax + b\na = ${slope.toFixed(2)}\nb = ${intercept.toFixed(2)}`;
                type = "regression-interpret";
                break;
            case 'predict':
                const predictX = parseFloat((Math.random() * 10 + 1).toFixed(1));
                const predictedY = slope * predictX + intercept;
                qText = `A study on the link between ${scenario.x_axis} (X) and ${scenario.y_axis} (Y) produced the regression equation ŷ = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}. What is the predicted ${scenario.y_axis} for a value of ${predictX} ${scenario.x_unit}?`;
                options = this._generateOptions(predictedY);
                correctIdx = options.indexOf(predictedY.toFixed(2));
                explanation = `To predict the Y value, substitute the given X value into the regression equation: ŷ = ${slope.toFixed(2)} * ${predictX} + ${intercept.toFixed(2)} = ${predictedY.toFixed(2)}.`;
                ti84_steps = "Enter the equation on the home screen, replacing 'x' with the value you are given.";
                example = `[HOME SCREEN]:\\n${this._toButtonPresses(slope.toFixed(2))} [*] ${this._toButtonPresses(predictX)} [+] ${this._toButtonPresses(intercept.toFixed(2))} [ENTER]`;
                type = "regression-predict";
                break;
        }

        return { question: qText, options, correct: correctIdx, explanation, ti84_steps, hint, example, type };
    }
    
    generateEmpiricalRuleQuestion() {
        const scenarios = [
            { subject: "scores on a standardized test", unit: "points" },
            { subject: "weights of a species of adult cat", unit: "pounds" },
            { subject: "heights of a type of corn stalk", unit: "inches" },
            { subject: "IQ scores for a population", unit: "points" }
        ];
        const scenario = scenarios[this._randint(0, scenarios.length - 1)];

        const mean = this._randint(100, 500);
        const std = this._randint(10, 50);
        const numStd = [1, 2, 3][this._randint(0, 2)];
        const percents = { 1: "68.27%", 2: "95.45%", 3: "99.73%" };
        
        const lower = mean - numStd * std;
        const upper = mean + numStd * std;
        
        const qText = `The ${scenario.subject} are normally distributed with a mean of ${mean} ${scenario.unit} and a standard deviation of ${std} ${scenario.unit}. What percentage of the ${scenario.subject} fall between ${lower} and ${upper}?`;
        let options = Object.values(percents);
        options.sort(() => Math.random() - 0.5);
        const correctIdx = options.indexOf(percents[numStd]);
        const example = `[HOME SCREEN]:\n[(] ${this._toButtonPresses(upper)} [-] ${this._toButtonPresses(mean)} [)] [÷] ${this._toButtonPresses(std)} [ENTER]\nResult: ${numStd}`;
        
        return { question: qText, options, correct: correctIdx, explanation: `According to the Empirical Rule, for a bell-shaped distribution, approximately ${percents[numStd]} of data falls within ${numStd} standard deviation(s) of the mean. The interval ${lower} to ${upper} represents exactly mean ± ${numStd} std. dev.`, ti84_steps: `TI-84: This is a conceptual application of the Empirical Rule. To verify, calculate (${upper} - ${mean}) / ${std} on the home screen to see it's ${numStd} std dev(s).`, hint: "The Empirical Rule (or 68-95-99.7 rule) describes percentages of data within 1, 2, and 3 standard deviations of the mean.", example, type: "empirical-rule" };
    }

    generateCountingQuestion() {
        const n = this._randint(10, 20);
        const r = this._randint(3, n - 2);
        const isPerm = Math.random() < 0.5;
        
        const permScenarios = [
            `A race has ${n} runners. How many different ways can the first, second, and third place medals be awarded (${r} positions)?`,
            `From a selection of ${n} different paintings, you want to hang ${r} of them in a row on a wall. How many different arrangements are possible?`,
            `A company needs to create a ${r}-digit PIN code using the digits 1 through ${n} without repetition. How many unique PINs can be created?`
        ];

        const combScenarios = [
            `A chef has ${n} ingredients available and needs to choose ${r} of them to make a salad. How many different combinations of ingredients are possible?`,
            `From a group of ${n} students, a committee of ${r} needs to be formed. How many different committees can be chosen?`,
            `You need to select ${r} books to read for a vacation from a list of ${n}. How many different sets of books can you choose?`
        ];

        let qText, correctAns, wrongAns, tiSteps, explanation, example, type;
        if (isPerm) {
            qText = permScenarios[this._randint(0, permScenarios.length - 1)];
            correctAns = this._perm(n, r);
            wrongAns = this._comb(n, r);
            tiSteps = `TI-84: On the home screen, type ${n}, then press MATH → PRB → 2:nPr, then type ${r} and press ENTER.`;
            explanation = `Since the order of selection matters (e.g., 1st vs 2nd place), we use permutations. The calculation is ${n}P${r} = ${correctAns}.`;
            example = `[HOME SCREEN]:\\n${this._toButtonPresses(n)} [MATH] > PRB > 2:nPr [ENTER]\\n${this._toButtonPresses(r)} [ENTER]\\nResult: ${correctAns}`;
            type = "counting-permutation";
        } else {
            qText = combScenarios[this._randint(0, combScenarios.length - 1)];
            correctAns = this._comb(n, r);
            wrongAns = this._perm(n, r);
            tiSteps = `TI-84: On the home screen, type ${n}, then press MATH → PRB → 3:nCr, then type ${r} and press ENTER.`;
            explanation = `Since we are choosing a group and the order does not matter, we use combinations. The calculation is ${n}C${r} = ${correctAns}.`;
            example = `[HOME SCREEN]:\\n${this._toButtonPresses(n)} [MATH] > PRB > 3:nCr [ENTER]\\n${this._toButtonPresses(r)} [ENTER]\\nResult: ${correctAns}`;
            type = "counting-combination";
        }

        const options = this._generateOptions(correctAns, 4, wrongAns, true);
        const correctIdx = options.indexOf(correctAns.toString());
        
        return { question: qText, options, correct: correctIdx, explanation, ti84_steps: tiSteps, hint: "Permutations (nPr) are for arrangements (order matters), while combinations (nCr) are for groups (order doesn't matter).", example, type };
    }

    generateMeanCorrectionQuestion() {
        const scenarios = [
            { subject: "average transaction value", unit: "$" },
            { subject: "average daily temperature", unit: "°C" },
            { subject: "average student grade", unit: "points" },
            { subject: "average product weight", unit: "grams" }
        ];
        const scenario = scenarios[this._randint(0, scenarios.length - 1)];

        const n = this._randint(10, 20);
        const oldMean = this._randint(50, 100);
        const wrongVal = this._randint(10, 40);
        const correctVal = wrongVal + this._randint(10, 30);
        
        const newMean = oldMean + (correctVal - wrongVal) / n;
        
        const qText = `A researcher is calculating the ${scenario.subject} for ${n} items. The initial average is ${oldMean}${scenario.unit}. However, they realize a value recorded as ${wrongVal}${scenario.unit} should have been ${correctVal}${scenario.unit}. What is the corrected average?`;
        const options = this._generateOptions(newMean);
        const correctIdx = options.indexOf(newMean.toFixed(2));
        const example = `[HOME SCREEN]:\\n${this._toButtonPresses(oldMean)} [+] [(] ${this._toButtonPresses(correctVal)} [-] ${this._toButtonPresses(wrongVal)} [)] [÷] ${this._toButtonPresses(n)} [ENTER]\\nResult: ${newMean.toFixed(2)}`;
        
        return { question: qText, options, correct: correctIdx, explanation: `To find the new mean, we correct the total sum. Original sum = ${n} * ${oldMean} = ${n * oldMean}. New sum = ${n * oldMean} - ${wrongVal} + ${correctVal} = ${(n * oldMean) - wrongVal + correctVal}. New mean = ${(n * oldMean) - wrongVal + correctVal} / ${n} = ${newMean.toFixed(2)}.`, ti84_steps: "TI-84: Use the formula: New Mean = Old Mean + (Correct Value - Wrong Value) / N. Enter this directly on the home screen.", hint: "Find the original total sum, correct it, then divide by the number of values.", example, type: "mean-correction" };
    }

    generateZScoreQuestion() {
        const scenarios = [
            { subject: "height of a certain type of plant", unit: "cm" },
            { subject: "scores on a standardized test", unit: "points" },
            { subject: "lifespan of a specific battery model", unit: "hours" },
            { subject: "weight of a product from a factory", unit: "grams" }
        ];
        const scenario = scenarios[this._randint(0, scenarios.length - 1)];

        if (Math.random() < 0.5) {
            // Original question type: Calculate z-score from value
            const mean = this._randint(100, 200);
            const std = this._randint(10, 25);
            const val = mean + this._randint(1, 3) * std * (Math.random() < 0.5 ? -1 : 1);
            
            const correctAns = (val - mean) / std;
            
            const qText = `The average ${scenario.subject} is ${mean} ${scenario.unit}, with a standard deviation of ${std} ${scenario.unit}. One item is measured to be ${val} ${scenario.unit}. What is its z-score?`;
            const options = this._generateOptions(correctAns);
            const correctIdx = options.indexOf(correctAns.toFixed(2));
            const example = `[HOME SCREEN]:\\n[(] ${this._toButtonPresses(val)} [-] ${this._toButtonPresses(mean)} [)] [÷] ${this._toButtonPresses(std)} [ENTER]\\nResult: ${correctAns.toFixed(2)}`;

            return { question: qText, options, correct: correctIdx, explanation: `A z-score measures how many standard deviations a data point is from the mean. The formula is z = (value - mean) / std. dev. For this problem, z = (${val} - ${mean}) / ${std} = ${correctAns.toFixed(2)}.`, ti84_steps: "TI-84: Use the formula: z = (value - mean) / std. dev. Enter this directly on the home screen.", hint: "The z-score formula is (value - mean) / standard deviation.", example, type: "z-score" };
        } else {
            // New question type: Find z-score from area/percentile
            const areaScenarios = [
                { area_left: 0.90, z: 1.28, text: "top 10%" },
                { area_left: 0.10, z: -1.28, text: "bottom 10%" },
                { area_left: 0.95, z: 1.645, text: "top 5%" },
                { area_left: 0.05, z: -1.645, text: "bottom 5%" },
                { area_left: 0.99, z: 2.33, text: "top 1%" },
                { area_left: 0.01, z: -2.33, text: "bottom 1%" }
            ];
            const areaScenario = areaScenarios[this._randint(0, areaScenarios.length - 1)];
            const correctAns = areaScenario.z;

            const qText = `The ${scenario.subject} are normally distributed. What is the z-score that corresponds to the ${areaScenario.text} of the distribution?`;
            const options = this._generateOptions(correctAns, 4, null, false);
            const correctIdx = options.indexOf(correctAns.toFixed(2)) > -1 ? options.indexOf(correctAns.toFixed(2)) : options.indexOf(correctAns.toFixed(3));
            
            const tiSteps = "TI-84: Press 2nd → VARS (DISTR) → 3:invNorm(. Enter the area to the left as a decimal, then the mean (0 for z-scores), and standard deviation (1 for z-scores).";
            const explanation = `To find the z-score for the ${areaScenario.text}, we need to find the point where ${areaScenario.area_left * 100}% of the area is to the left of it. We use the inverse normal function for this.`;
            const example = `[HOME SCREEN]:\\n[2nd] [VARS] > 3:invNorm(\\ninvNorm(area:${areaScenario.area_left}, μ:0, σ:1)\\n[ENTER]\\nResult: ${correctAns.toFixed(3)}`;

            return { question: qText, options, correct: correctIdx, explanation, ti84_steps: tiSteps, hint: "For 'top' percentages, the area to the left is 1 - (percent/100). For 'bottom' percentages, it's just the percentage as a decimal.", example, type: "z-score-from-area" };
        }
    }

    generateFormulaQuestion() {
        const formulas = [
            { question: "What is the formula for a z-score?", options: ["(value - mean) / std", "mean / (value * std)", "std / (mean - value)", "(value - std) / mean"], correct: 0, ti84_steps: "This is a conceptual formula. On the TI-84, you would enter it on the home screen as `(value - mean) / std`.", type: "conceptual" },
            { question: "How is the range of a dataset calculated?", options: ["max - min", "Q3 - Q1", "Sum / Count", "Average of max and min"], correct: 0, ti84_steps: "After running 1-Var Stats, find `maxX` and `minX` and subtract them on the home screen.", type: "conceptual" },
            { question: "What does the sample standard deviation (Sx) measure?", options: ["The average distance from the mean", "The middle value of the data", "The most frequent value", "The total sum of values"], correct: 0, ti84_steps: "On the TI-84, `Sx` is calculated for you in the 1-Var Stats menu.", type: "conceptual" },
        ];
        const q = formulas[Math.floor(Math.random() * formulas.length)];
        return { question: q.question, options: q.options, correct: q.correct, explanation: `The correct answer is: ${q.options[q.correct]}`, ti84_steps: q.ti84_steps, hint: "Think about the definition of each statistical term.", type: q.type };
    }

    generateEmpiricalRuleConceptQuestion() {
        const concepts = [
            { question: "According to the Empirical Rule, what percentage of data falls within 1 standard deviation of the mean?", options: ["68%", "95%", "99.7%", "50%"], correct: 0 },
            { question: "The Empirical Rule applies to what kind of distribution?", options: ["Bell-shaped (Normal)", "Skewed Left", "Skewed Right", "Uniform"], correct: 0 },
            { question: "For a bell-shaped distribution, approximately what percentage of data is within 2 standard deviations of the mean?", options: ["95%", "68%", "99.7%", "90%"], correct: 0 },
        ];
        const q = concepts[Math.floor(Math.random() * concepts.length)];
        return { question: q.question, options: q.options, correct: q.correct, explanation: `The correct answer is ${q.options[q.correct]}. The Empirical Rule states that for a normal distribution, approximately 68% of data is within 1 std dev, 95% within 2, and 99.7% within 3.`, ti84_steps: "This is a conceptual rule. The TI-84 can calculate exact probabilities with `normalcdf`, but this rule is for quick estimation.", hint: "Remember the 68-95-99.7 rule for bell-shaped distributions.", type: "conceptual" };
    }

    generateConceptualQuestion() {
        const concepts = [
            { question: "For a right-skewed distribution, where is the mean typically located relative to the median?", options: ["To the right of the median", "To the left of the median", "At the same position as the median", "It's impossible to tell"], correct: 0, explanation: "In a right-skewed distribution, the tail is on the right, which pulls the mean in that direction. The median is more resistant to outliers, so the mean will be greater than (to the right of) the median." },
            { question: "What does a z-score of -2.5 indicate?", options: ["The data point is 2.5 standard deviations below the mean.", "The data point is 2.5 standard deviations above the mean.", "The data point is 2.5 units below the mean.", "The mean is 2.5 standard deviations from the data point."], correct: 0, explanation: "A z-score measures the number of standard deviations a data point is from the mean. A negative sign indicates it is below the mean." },
            { question: "Which of the following statements about the correlation coefficient 'r' is FALSE?", options: ["r is always between -1 and 1.", "A value of r close to 0 implies no linear relationship.", "A strong positive correlation means r is close to 1.", "Correlation implies causation."], correct: 3, explanation: "Correlation does not imply causation. Two variables can be strongly correlated without one causing the other; there could be a lurking variable." },
            { question: "In regression, what is an influential observation?", options: ["A point that has a large effect on the regression line's slope.", "Any point that is considered an outlier.", "A point with a large residual.", "A point that is always located at the mean of X and Y."], correct: 0, explanation: "An influential observation is a point that, if removed, would significantly change the slope of the regression line. It often has high leverage (far from the mean of X)."},
            { question: "What is the primary characteristic of an experimental design that is not present in an observational study?", options: ["The researcher actively imposes a treatment on subjects.", "The study involves collecting data.", "The study looks for associations between variables.", "The study uses a random sample."], correct: 0, explanation: "The key difference is that in an experiment, the researcher controls and applies a treatment to a group to observe its effect. In an observational study, the researcher simply observes and measures variables without intervention." }
        ];
        const q = concepts[Math.floor(Math.random() * concepts.length)];
        return { question: q.question, options: q.options, correct: q.correct, explanation: q.explanation, ti84_steps: "This is a conceptual question and does not require a calculator.", hint: "Think about the definitions of the key terms in the question.", type: "conceptual" };
    }

    generateTrueFalseQuestion() {
        const statements = [
            // Existing Questions (some reworded)
            { statement: "The standard deviation of a dataset can be a negative value.", is_true: false, explanation: "The standard deviation is calculated from squared differences, so it can never be negative. A value of 0 indicates no spread." },
            { statement: "A z-score of 1.5 means the data point is 1.5 standard deviations above the mean.", is_true: true, explanation: "A positive z-score indicates the data point is above the mean, and its value represents the number of standard deviations away." },
            { statement: "If the correlation coefficient 'r' between two variables is 0, it means there is absolutely no relationship between them.", is_true: false, explanation: "An r value of 0 indicates no *linear* relationship. There could still be a strong curved or other non-linear relationship between the variables." },
            { statement: "Extreme values (outliers) in a dataset have a greater impact on the mean than on the median.", is_true: true, explanation: "The median is based on the position of the middle value and is resistant to outliers. The mean, however, is pulled towards the outliers." },
            { statement: "In a left-skewed distribution, the mean is typically greater than the median.", is_true: false, explanation: "In a left-skewed distribution, the long tail is on the left, which pulls the mean to the left of the median (mean < median)." },
            { statement: "The Empirical Rule (68-95-99.7 rule) can be applied to any dataset, regardless of its distribution shape.", is_true: false, explanation: "The Empirical Rule specifically applies only to data that has a symmetric, bell-shaped (normal) distribution." },
            { statement: "The coefficient of determination (r²) represents the proportion of the variance in the Y variable that is explained by the linear relationship with X.", is_true: true, explanation: "This is the definition of r². An r² of 0.75 means that 75% of the variation in Y can be explained by the linear model with X." },
            { statement: "A standard deviation of zero implies that all data points in the dataset are identical.", is_true: true, explanation: "A standard deviation of zero means there is no spread or variation in the data; all values must be the same." },
            { statement: "A correlation coefficient of -0.9 indicates a stronger linear relationship than a correlation coefficient of 0.8.", is_true: true, explanation: "The strength of a linear relationship is determined by the absolute value of r. Since |-0.9| > |0.8|, it represents a stronger linear bond." },
            
            // New Questions from Other Categories
            { statement: "The Interquartile Range (IQR) is calculated as the difference between the maximum and minimum values in a dataset.", is_true: false, explanation: "This describes the range. The IQR is the difference between the third quartile (Q3) and the first quartile (Q1)." },
            { statement: "In the regression equation ŷ = a + bx, the value 'a' represents the y-intercept.", is_true: true, explanation: "The 'a' term is the y-intercept, which is the predicted value of y when x is 0. The 'b' term is the slope." },
            { statement: "A person's jersey number is a good example of a quantitative discrete variable.", is_true: false, explanation: "A jersey number is a numerical label, making it a categorical variable. It doesn't make sense to perform mathematical operations like finding the average jersey number." },
            { statement: "When the order of selecting items from a group does NOT matter, you should use a permutation.", is_true: false, explanation: "When order does not matter, it is a combination (nCr). Permutations (nPr) are used when the order of selection is important." },
            { statement: "An outlier is formally defined as any data point that is more than 1.5 * IQR below Q1 or above Q3.", is_true: true, explanation: "This is the standard definition for identifying outliers using the 1.5 * IQR rule. Points outside this range are considered outliers." }

        ];
        
        const selected = statements[this._randint(0, statements.length - 1)];
        const qText = `True or False: ${selected.statement}`;
        const options = ["True", "False"];
        const correctIdx = selected.is_true ? 0 : 1;

        return { question: qText, options, correct: correctIdx, explanation: selected.explanation, ti84_steps: "This is a conceptual question.", hint: "Carefully consider the definition of each statistical term.", type: "true-false" };
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
}
