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
        ];
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


    getNewQuestion() {
        const generator = this.questionGenerators[Math.floor(Math.random() * this.questionGenerators.length)];
        return generator();
    }

    generateVariableTypeQuestion() {
        const qPool = [
            { question: "The time it takes to run a marathon is a:", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 1, explanation: "Time is measured on a continuous scale.", ti84_steps: "Conceptual question." },
            { question: "The number of students in a classroom is:", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 0, explanation: "Number of students is a countable whole number.", ti84_steps: "Conceptual question." },
            { question: "A person's political affiliation is:", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 2, explanation: "Political affiliation falls into named categories.", ti84_steps: "Conceptual question." },
            { question: "The weight of a bag of apples is:", options: ["quantitative discrete", "quantitative continuous", "categorical"], correct: 1, explanation: "Weight can be any value within a range and is measured.", ti84_steps: "Conceptual question." }
        ];
        return qPool[Math.floor(Math.random() * qPool.length)];
    }

    generateDescriptiveStatsQuestion() {
        const data = Array.from({ length: this._randint(8, 12) }, () => this._randint(10, 50));
        const dataStr = data.join(", ");
        
        const statToAsk = ['mean', 'median', 'std', 'range'][this._randint(0, 3)];
        let correctAns, qText, tiSteps, explanation;

        switch (statToAsk) {
            case 'mean':
                correctAns = this._mean(data);
                qText = `Given data: ${dataStr}. What is the mean?`;
                tiSteps = "TI-84: Enter data in L1 → STAT → CALC → 1:1-Var Stats → Calculate → read x̄";
                break;
            case 'median':
                correctAns = this._median(data);
                qText = `Given data: ${dataStr}. What is the median?`;
                tiSteps = "TI-84: After 1-Var Stats, read Med";
                break;
            case 'std':
                correctAns = this._std(data);
                qText = `Given data: ${dataStr}. What is the sample standard deviation?`;
                tiSteps = "TI-84: After 1-Var Stats, read Sx";
                break;
            case 'range':
                correctAns = this._max(data) - this._min(data);
                qText = `Given data: ${dataStr}. What is the range?`;
                tiSteps = "TI-84: After 1-Var Stats, read maxX and minX, then calculate.";
                break;
        }
        
        explanation = `The correct ${statToAsk} is ${correctAns.toFixed(2)}`;
        const options = this._generateOptions(correctAns);
        const correctIdx = options.indexOf(correctAns.toFixed(2));
        
        return { question: qText, options, correct: correctIdx, explanation, ti84_steps: tiSteps };
    }

    generateRegressionQuestion() {
        const nPoints = this._randint(7, 10);
        const x = Array.from({ length: nPoints }, () => parseFloat((Math.random() * 10 + 1).toFixed(1)));
        const slope = this._uniform(1.5, 5.0) * (Math.random() < 0.5 ? -1 : 1);
        const intercept = this._uniform(20, 50);
        const y = x.map(val => parseFloat((slope * val + intercept + (Math.random() - 0.5) * 10).toFixed(1)));

        const r = this._corr(x, y);
        const r2 = r * r;
        
        const qText = `For a dataset, the correlation coefficient r is ${r.toFixed(3)}. What is the coefficient of determination, r²?`;
        const options = this._generateOptions(r2, 4, null, false, true);
        const correctIdx = options.indexOf(r2.toFixed(3));
        
        return { question: qText, options, correct: correctIdx, explanation: `r² is the square of r. (${r.toFixed(3)})² = ${r2.toFixed(3)}`, ti84_steps: "TI-84: After STAT→CALC→LinReg, read r². If you only have r, square it." };
    }
    
    generateEmpiricalRuleQuestion() {
        const mean = this._randint(100, 500);
        const std = this._randint(10, 50);
        const numStd = [1, 2, 3][this._randint(0, 2)];
        const percents = { 1: "68.27%", 2: "95.45%", 3: "99.73%" };
        
        const lower = mean - numStd * std;
        const upper = mean + numStd * std;
        
        const qText = `A bell-shaped distribution has a mean of ${mean} and a standard deviation of ${std}. What percentage of data falls between ${lower} and ${upper}?`;
        let options = Object.values(percents);
        options.sort(() => Math.random() - 0.5);
        const correctIdx = options.indexOf(percents[numStd]);
        
        return { question: qText, options, correct: correctIdx, explanation: `The interval ${lower} to ${upper} represents the mean ± ${numStd} standard deviation(s).`, ti84_steps: `TI-84: Calculate (${upper} - ${mean}) / ${std} to see it's ${numStd} std dev(s).` };
    }

    generateCountingQuestion() {
        const n = this._randint(10, 30);
        const r = this._randint(3, n - 2);
        const isPerm = Math.random() < 0.5;
        
        let qText, correctAns, wrongAns, tiSteps;
        if (isPerm) {
            qText = `From ${n} items, how many ways can you choose and arrange ${r} of them?`;
            correctAns = this._perm(n, r);
            wrongAns = this._comb(n, r);
            tiSteps = `TI-84: ${n} → MATH → PRB → 2:nPr → ${r} → ENTER`;
        } else {
            qText = `From ${n} items, how many ways can you choose a group of ${r} of them (order doesn't matter)?`;
            correctAns = this._comb(n, r);
            wrongAns = this._perm(n, r);
            tiSteps = `TI-84: ${n} → MATH → PRB → 3:nCr → ${r} → ENTER`;
        }

        const options = this._generateOptions(correctAns, 4, wrongAns, true);
        const correctIdx = options.indexOf(correctAns.toString());
        
        return { question: qText, options, correct: correctIdx, explanation: `The correct calculation is ${correctAns}.`, ti84_steps: tiSteps };
    }

    generateMeanCorrectionQuestion() {
        const n = this._randint(10, 20);
        const oldMean = this._randint(50, 100);
        const wrongVal = this._randint(10, 40);
        const correctVal = wrongVal + this._randint(10, 30);
        
        const newMean = oldMean + (correctVal - wrongVal) / n;
        
        const qText = `${n} data values have a mean of ${oldMean}. One value, ${wrongVal}, should be ${correctVal}. What is the new mean?`;
        const options = this._generateOptions(newMean);
        const correctIdx = options.indexOf(newMean.toFixed(2));
        
        return { question: qText, options, correct: correctIdx, explanation: `New mean = ${oldMean} + (${correctVal}-${wrongVal})/${n} = ${newMean.toFixed(2)}`, ti84_steps: "Home screen: OldMean + (Correct-Wrong)/N" };
    }

    generateZScoreQuestion() {
        const mean = this._randint(100, 200);
        const std = this._randint(10, 25);
        const val = mean + this._randint(1, 3) * std * (Math.random() < 0.5 ? -1 : 1);
        
        const correctAns = (val - mean) / std;
        
        const qText = `A distribution has a mean of ${mean} and std dev of ${std}. What is the z-score for the value ${val}?`;
        const options = this._generateOptions(correctAns);
        const correctIdx = options.indexOf(correctAns.toFixed(2));

        return { question: qText, options, correct: correctIdx, explanation: `z = (value - mean) / std = (${val}-${mean})/${std} = ${correctAns.toFixed(2)}`, ti84_steps: "Home screen: (Value - Mean) / StdDev" };
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
