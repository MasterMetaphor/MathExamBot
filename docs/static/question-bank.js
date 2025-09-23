// This file contains the logic for generating new questions, ported from Python.

class QuestionBank {
    constructor() {
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
    _randint(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    _uniform(min, max) {
        return Math.random() * (max - min) + min;
    }

    _toButtonPresses(num) {
        return num.toString().split('').map(char => `[${char}]`).join('');
    }


    getNewQuestion(topic = null) {
        let generator;
        if (topic && this.topicMap[topic]) {
            generator = this.topicMap[topic];
        } else {
            const randomIndex = Math.floor(Math.random() * this.questionGenerators.length);
            generator = this.questionGenerators[randomIndex];
        }
        return generator();
    }

    generateVariableTypeQuestion() {
        const qPool = [
            { question: "A coffee shop tracks the types of drinks sold (e.g., 'Latte', 'Espresso', 'Cappuccino'). What type of variable is the drink type?", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 2, explanation: "Drink type is a categorical variable because it sorts data into distinct categories or labels.", ti84_steps: "Conceptual question.", hint: "Think about whether the data is a measurement, a countable number, or a category.", type: "conceptual" },
            { question: "A researcher measures the exact amount of rainfall in inches per day. What type of variable is the rainfall measurement?", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 1, explanation: "Rainfall is a quantitative continuous variable because it is measured and can take any value in a range.", ti84_steps: "Conceptual question.", hint: "Think about whether the data is a measurement, a countable number, or a category.", type: "conceptual" },
            { question: "The number of cars passing through a toll booth each hour is recorded. What type of variable is this count?", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 0, explanation: "The number of cars is a quantitative discrete variable because it is a countable whole number.", ti84_steps: "Conceptual question.", hint: "Think about whether the data is a measurement, a countable number, or a category.", type: "conceptual" },
            { question: "A survey asks participants to rate their satisfaction on a scale of 'Very Dissatisfied' to 'Very Satisfied'. What type of variable is this rating?", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 2, explanation: "Even though the categories have an order, they are still named labels, making this a categorical (specifically, ordinal) variable.", ti84_steps: "Conceptual question.", hint: "Think about whether the data is a measurement, a countable number, or a category.", type: "conceptual" }
        ];
        return qPool[Math.floor(Math.random() * qPool.length)];
    }

    generateDescriptiveStatsQuestion() {
        const data = Array.from({ length: this._randint(8, 12) }, () => this._randint(10, 50));
        const dataStr = data.join(", ");
        
        const statToAsk = ['mean', 'median', 'std', 'range'][this._randint(0, 3)];
        let correctAns, qText, tiSteps, explanation, example, type;
        const hint = "Remember the difference between mean (average), median (middle value), standard deviation (spread), and range (max - min).";

        switch (statToAsk) {
            case 'mean':
                correctAns = this._mean(data);
                qText = `A student scored the following on their last few quizzes: ${dataStr}. What is their average (mean) score?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Press Enter and read the mean (x̄).";
                example = `[STAT] > 1:Edit...\nL1: ${data.join(',')}...\n[STAT] > CALC > 1:1-Var Stats\n1-Var Stats L1\nx̄=${correctAns.toFixed(2)}`;
                type = "descriptive-mean";
                break;
            case 'median':
                correctAns = this._median(data);
                qText = `The number of daily visitors to a small museum is recorded for a week: ${dataStr}. What is the median number of visitors?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Scroll down to find the median (Med).";
                example = `[STAT] > 1:Edit...\nL1: ${data.join(',')}...\n[STAT] > CALC > 1:1-Var Stats\n...scroll down...\nMed=${correctAns.toFixed(2)}`;
                type = "descriptive-median";
                break;
            case 'std':
                correctAns = this._std(data);
                qText = `A botanist measures the height (in cm) of ${data.length} plants of the same species: ${dataStr}. What is the sample standard deviation of their heights?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Find the sample standard deviation (Sx).";
                example = `[STAT] > 1:Edit...\nL1: ${data.join(',')}...\n[STAT] > CALC > 1:1-Var Stats\nSx=${correctAns.toFixed(2)}`;
                type = "descriptive-std";
                break;
            case 'range':
                correctAns = this._max(data) - this._min(data);
                qText = `The following are the daily high temperatures (°F) for a city over several days: ${dataStr}. What is the range of the temperatures?`;
                tiSteps = "TI-84: Press STAT → 1:Edit..., enter data in L1. Then press STAT → CALC → 1:1-Var Stats. Find maxX and minX, then calculate Range = maxX - minX.";
                const maxVal = this._max(data);
                const minVal = this._min(data);
                example = `[STAT] > 1:Edit...\nL1: ${data.join(',')}...\n[STAT] > CALC > 1:1-Var Stats\n...scroll down...\nmaxX=${maxVal}\nminX=${minVal}\n[2nd] > [MODE] (QUIT)\n${this._toButtonPresses(maxVal)} [-] ${this._toButtonPresses(minVal)} [ENTER]\nResult: ${correctAns}`;
                type = "descriptive-range";
                break;
        }
        
        const baseExplanation = `The ${statToAsk} is the correct answer. The ${statToAsk} is a measure of central tendency or spread.`;
        explanation = `${baseExplanation} For the data set ${dataStr}, the ${statToAsk} is ${correctAns.toFixed(2)}.`;
        const options = this._generateOptions(correctAns);
        const correctIdx = options.indexOf(correctAns.toFixed(2));
        
        return { question: qText, options, correct: correctIdx, explanation, ti84_steps: tiSteps, hint, example, type };
    }

    generateRegressionQuestion() {
        const nPoints = this._randint(7, 10);
        const x = Array.from({ length: nPoints }, () => parseFloat((Math.random() * 10 + 1).toFixed(1)));
        const slope = this._uniform(1.5, 5.0) * (Math.random() < 0.5 ? -1 : 1);
        const intercept = this._uniform(20, 50);
        const y = x.map(val => parseFloat((slope * val + intercept + (Math.random() - 0.5) * 10).toFixed(1)));

        const r = this._corr(x, y);
        const r2 = r * r;
        
        const qText = `A scientist studies the relationship between hours of sleep and reaction time. They find a correlation coefficient (r) of ${r.toFixed(3)}. What percentage of the variation in reaction time can be explained by the hours of sleep (i.e., what is r²)?`;
        const options = this._generateOptions(r2, 4, null, false, true);
        const correctIdx = options.indexOf(r2.toFixed(3));
        const example = `[HOME SCREEN]:\n${this._toButtonPresses(r.toFixed(3))} [x²] [ENTER]\nResult: ${r2.toFixed(3)}`;
        
        return { question: qText, options, correct: correctIdx, explanation: `The coefficient of determination, r², tells us the proportion of variance in the dependent variable that is predictable from the independent variable. Here, r² = (${r.toFixed(3)})² = ${r2.toFixed(3)}. This means ${ (r2 * 100).toFixed(1) }% of the variation can be explained by the model.`, ti84_steps: "TI-84: To find r², you first need r. If r/r² aren't shown in LinReg results, press 2nd→0(CATALOG)→DiagnosticOn→ENTER. Then run STAT→CALC→8:LinReg. If you only have r, calculate r*r on the home screen.", hint: "The coefficient of determination is the square of the correlation coefficient 'r'.", example, type: "regression-r2" };
    }
    
    generateEmpiricalRuleQuestion() {
        const mean = this._randint(100, 500);
        const std = this._randint(10, 50);
        const numStd = [1, 2, 3][this._randint(0, 2)];
        const percents = { 1: "68.27%", 2: "95.45%", 3: "99.73%" };
        
        const lower = mean - numStd * std;
        const upper = mean + numStd * std;
        
        const qText = `The scores on a standardized test are normally distributed with a mean of ${mean} and a standard deviation of ${std}. What percentage of students score between ${lower} and ${upper}?`;
        let options = Object.values(percents);
        options.sort(() => Math.random() - 0.5);
        const correctIdx = options.indexOf(percents[numStd]);
        const example = `[HOME SCREEN]:\n[(] ${this._toButtonPresses(upper)} [-] ${this._toButtonPresses(mean)} [)] [÷] ${this._toButtonPresses(std)} [ENTER]\nResult: ${numStd}`;
        
        return { question: qText, options, correct: correctIdx, explanation: `According to the Empirical Rule, for a bell-shaped distribution, approximately ${percents[numStd]} of data falls within ${numStd} standard deviation(s) of the mean. The interval ${lower} to ${upper} represents exactly mean ± ${numStd} std. dev.`, ti84_steps: `TI-84: This is a conceptual application of the Empirical Rule. To verify, calculate (${upper} - ${mean}) / ${std} on the home screen to see it's ${numStd} std dev(s).`, hint: "The Empirical Rule (or 68-95-99.7 rule) describes percentages of data within 1, 2, and 3 standard deviations of the mean.", example, type: "empirical-rule" };
    }

    generateCountingQuestion() {
        const n = this._randint(10, 30);
        const r = this._randint(3, n - 2);
        const isPerm = Math.random() < 0.5;
        
        let qText, correctAns, wrongAns, tiSteps, explanation, example, type;
        if (isPerm) {
            qText = `A club with ${n} members needs to elect a president, vice-president, and treasurer (a total of ${r} positions). How many different ways can these positions be filled?`;
            correctAns = this._perm(n, r);
            wrongAns = this._comb(n, r);
            tiSteps = `TI-84: On the home screen, type ${n}, then press MATH → PRB → 2:nPr, then type ${r} and press ENTER.`;
            explanation = `Since the items are being arranged, order matters. Therefore, we use permutations. The formula is nPr = n! / (n-r)!. The calculation is ${n}P${r} = ${correctAns}.`;
            example = `[HOME SCREEN]:\n${this._toButtonPresses(n)} [MATH] > PRB > 2:nPr [ENTER]\n${this._toButtonPresses(r)} [ENTER]\nResult: ${correctAns}`;
            type = "counting-permutation";
        } else {
            qText = `You need to choose ${r} books to read from a list of ${n}. How many different groups of books can you choose?`;
            correctAns = this._comb(n, r);
            wrongAns = this._perm(n, r);
            tiSteps = `TI-84: On the home screen, type ${n}, then press MATH → PRB → 3:nCr, then type ${r} and press ENTER.`;
            explanation = `Since we are choosing a group and order does not matter, we use combinations. The formula is nCr = n! / (r!(n-r)!). The calculation is ${n}C${r} = ${correctAns}.`;
            example = `[HOME SCREEN]:\n${this._toButtonPresses(n)} [MATH] > PRB > 3:nCr [ENTER]\n${this._toButtonPresses(r)} [ENTER]\nResult: ${correctAns}`;
            type = "counting-combination";
        }

        const options = this._generateOptions(correctAns, 4, wrongAns, true);
        const correctIdx = options.indexOf(correctAns.toString());
        
        return { question: qText, options, correct: correctIdx, explanation, ti84_steps: tiSteps, hint: "Permutations (nPr) are for arrangements (order matters), while combinations (nCr) are for groups (order doesn't matter).", example, type };
    }

    generateMeanCorrectionQuestion() {
        const n = this._randint(10, 20);
        const oldMean = this._randint(50, 100);
        const wrongVal = this._randint(10, 40);
        const correctVal = wrongVal + this._randint(10, 30);
        
        const newMean = oldMean + (correctVal - wrongVal) / n;
        
        const qText = `A cashier is calculating the average transaction value for ${n} sales. The initial average is $${oldMean}. However, they realize a sale recorded as $${wrongVal} should have been $${correctVal}. What is the corrected average transaction value?`;
        const options = this._generateOptions(newMean);
        const correctIdx = options.indexOf(newMean.toFixed(2));
        const example = `[HOME SCREEN]:\n${this._toButtonPresses(oldMean)} [+] [(] ${this._toButtonPresses(correctVal)} [-] ${this._toButtonPresses(wrongVal)} [)] [÷] ${this._toButtonPresses(n)} [ENTER]\nResult: ${newMean.toFixed(2)}`;
        
        return { question: qText, options, correct: correctIdx, explanation: `To find the new mean, we correct the total sum. Original sum = ${n} * ${oldMean} = ${n * oldMean}. New sum = ${n * oldMean} - ${wrongVal} + ${correctVal} = ${(n * oldMean) - wrongVal + correctVal}. New mean = ${(n * oldMean) - wrongVal + correctVal} / ${n} = ${newMean.toFixed(2)}.`, ti84_steps: "TI-84: Use the formula: New Mean = Old Mean + (Correct Value - Wrong Value) / N. Enter this directly on the home screen.", hint: "Find the original total sum, correct it, then divide by the number of values.", example, type: "mean-correction" };
    }

    generateZScoreQuestion() {
        const mean = this._randint(100, 200);
        const std = this._randint(10, 25);
        const val = mean + this._randint(1, 3) * std * (Math.random() < 0.5 ? -1 : 1);
        
        const correctAns = (val - mean) / std;
        
        const qText = `The average height of a certain type of plant is ${mean} cm, with a standard deviation of ${std} cm. One plant is measured to be ${val} cm tall. How many standard deviations from the mean is this plant? (i.e., what is its z-score?)`;
        const options = this._generateOptions(correctAns);
        const correctIdx = options.indexOf(correctAns.toFixed(2));
        const example = `[HOME SCREEN]:\n[(] ${this._toButtonPresses(val)} [-] ${this._toButtonPresses(mean)} [)] [÷] ${this._toButtonPresses(std)} [ENTER]\nResult: ${correctAns.toFixed(2)}`;

        return { question: qText, options, correct: correctIdx, explanation: `A z-score measures how many standard deviations a data point is from the mean. The formula is z = (value - mean) / std. dev. For this problem, z = (${val} - ${mean}) / ${std} = ${correctAns.toFixed(2)}.`, ti84_steps: "TI-84: Use the formula: z = (value - mean) / std. dev. Enter this directly on the home screen.", hint: "The z-score formula is (value - mean) / standard deviation.", example, type: "z-score" };
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
