// Enhanced TI-84 calculator instructions for Exam 2 topics

// Function to enhance the probability question generators with better TI-84 instructions
function enhanceProbabilityQuestions() {
    // Add detailed TI-84 instructions for each type of probability question
    
    // Probability Basics
    const probabilityBasicsSteps = `
TI-84 Calculator Steps:
1. For probability calculations, use the HOME screen
2. For addition rule: P(A∪B) = P(A) + P(B) - P(A∩B)
3. For complements: P(A') = 1 - P(A)

Example: If P(A) = 0.3, P(B) = 0.4, P(A∩B) = 0.1
To find P(A∪B): 0.3 + 0.4 - 0.1 = 0.7`;

    // Probability Distribution
    const probabilityDistributionSteps = `
TI-84 Calculator Steps:
1. For expected value: Enter values in L1 and probabilities in L2
2. STAT → CALC → 1:1-Var Stats L1,L2
3. The mean (x̄) is the expected value E(X)
4. The standard deviation (Sx) is σ

Example: For P(X=1)=0.2, P(X=2)=0.5, P(X=3)=0.3
L1: 1, 2, 3
L2: 0.2, 0.5, 0.3
E(X) = 1(0.2) + 2(0.5) + 3(0.3) = 2.1`;

    // Normal Distribution
    const normalDistributionSteps = `
TI-84 Calculator Steps:
1. For probabilities: 2nd → VARS (DISTR) → normalcdf(lower, upper, mean, std)
2. For z-scores: (value - mean)/std
3. For percentiles: 2nd → VARS (DISTR) → invNorm(area, mean, std)

Examples:
- P(a < X < b): normalcdf(a, b, mean, std)
- P(X < b): normalcdf(-1E99, b, mean, std)
- P(X > a): normalcdf(a, 1E99, mean, std)
- Find value at 90th percentile: invNorm(0.90, mean, std)`;

    // Binomial Distribution
    const binomialDistributionSteps = `
TI-84 Calculator Steps:
1. For exact probability: 2nd → VARS (DISTR) → binompdf(n, p, k)
2. For cumulative probability: 2nd → VARS (DISTR) → binomcdf(n, p, k)
3. Mean = n × p
4. Standard Deviation = √(n × p × (1-p))

Examples:
- P(X = k): binompdf(n, p, k)
- P(X ≤ k): binomcdf(n, p, k)
- P(X > k): 1 - binomcdf(n, p, k)
- P(a ≤ X ≤ b): binomcdf(n, p, b) - binomcdf(n, p, a-1)`;

    // Central Limit Theorem
    const cltSteps = `
TI-84 Calculator Steps:
1. For sample mean distribution:
   - Mean = population mean
   - Standard error = σ/√n
2. Use normalcdf with these parameters
3. For sample proportion:
   - Mean = p
   - Standard error = √(p(1-p)/n)

Example: Population with μ=100, σ=10, n=36
Sample mean distribution is N(100, 10/√36) = N(100, 1.667)
For P(X̄ > 103): normalcdf(103, 1E99, 100, 1.667)`;

    // Return the enhanced instructions
    return {
        probabilityBasicsSteps,
        probabilityDistributionSteps,
        normalDistributionSteps,
        binomialDistributionSteps,
        cltSteps
    };
}
