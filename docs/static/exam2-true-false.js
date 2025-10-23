// Additional True/False questions for Exam 2 material

generateExam2TrueFalseQuestion() {
    const statements = [
        // Probability Basics
        { 
            statement: "In a standard normal distribution, the total area under the curve equals 1.",
            is_true: true, 
            explanation: "This is a fundamental property of all probability distributions. The total area under any probability density function must equal 1."
        },
        { 
            statement: "Subjective probability can be calculated using mathematical formulas.",
            is_true: false, 
            explanation: "Subjective probability is based on personal judgment and belief, not mathematical formulas. It represents an individual's assessment of likelihood based on their knowledge and experience."
        },
        { 
            statement: "In a Venn diagram, disjoint events have no overlap.",
            is_true: true, 
            explanation: "Disjoint (or mutually exclusive) events cannot occur simultaneously, so their intersection is empty, meaning they have no overlap in a Venn diagram."
        },
        
        // Probability Distributions
        { 
            statement: "The variance of a probability distribution is always positive or zero.",
            is_true: true, 
            explanation: "Variance is calculated using squared deviations from the mean, which are always non-negative. Therefore, variance can only be positive or zero (zero only when all values are identical)."
        },
        { 
            statement: "The expected value (mean) of a discrete random variable can be negative.",
            is_true: true, 
            explanation: "The expected value is a weighted average of possible values and can be negative if the random variable takes negative values with sufficient probability."
        },
        
        // Normal Distribution
        { 
            statement: "In a normal distribution, the mean, median, and mode are all equal.",
            is_true: true, 
            explanation: "This is a property of normally distributed data. The normal distribution is symmetric around its mean, which causes these three measures of central tendency to coincide."
        },
        { 
            statement: "The standard normal distribution has mean 0 and standard deviation 1.",
            is_true: true, 
            explanation: "The standard normal distribution (Z distribution) is defined to have a mean of 0 and a standard deviation of 1."
        },
        { 
            statement: "All normal distributions have the same shape regardless of their mean and standard deviation.",
            is_true: false, 
            explanation: "While all normal distributions have the same bell-shaped form, distributions with larger standard deviations are more spread out and flatter, while those with smaller standard deviations are more peaked."
        },
        
        // Binomial Distribution
        { 
            statement: "A binomial experiment has only two possible outcomes for each trial.",
            is_true: true, 
            explanation: "A binomial random variable models a fixed number of independent trials, each with exactly two possible outcomes (typically labeled 'success' and 'failure')."
        },
        { 
            statement: "The standard deviation of a binomial distribution is n×p.",
            is_true: false, 
            explanation: "The standard deviation of a binomial distribution is √(n×p×(1-p)). The mean (expected value) is n×p."
        },
        { 
            statement: "The binomial distribution approaches the normal distribution as the number of trials increases.",
            is_true: true, 
            explanation: "According to the Central Limit Theorem, as n gets larger, the binomial distribution can be approximated by a normal distribution with the same mean and standard deviation."
        },
        
        // Central Limit Theorem
        { 
            statement: "The Central Limit Theorem states that the sample mean will always equal the population mean.",
            is_true: false, 
            explanation: "The Central Limit Theorem states that the distribution of sample means approaches a normal distribution as sample size increases, regardless of the population distribution shape. It doesn't guarantee that an individual sample mean equals the population mean."
        },
        { 
            statement: "According to the Central Limit Theorem, the standard deviation of the sampling distribution is equal to the population standard deviation divided by the square root of the sample size.",
            is_true: true, 
            explanation: "This is correct. The standard error (standard deviation of the sampling distribution) equals σ/√n, where σ is the population standard deviation and n is the sample size."
        },
        
        // Conditional Probability
        { 
            statement: "If two events are independent, knowing that one occurred provides no information about whether the other occurred.",
            is_true: true, 
            explanation: "This is the definition of independence. When events A and B are independent, P(A|B) = P(A) and P(B|A) = P(B), meaning knowledge of one event doesn't affect the probability of the other."
        },
        { 
            statement: "If P(A|B) = P(A), then events A and B must be independent.",
            is_true: true, 
            explanation: "This is one of the definitions of independence. If the conditional probability equals the unconditional probability, the events are independent."
        },
        { 
            statement: "Bayes' theorem can be used to update probabilities when new information becomes available.",
            is_true: true, 
            explanation: "This is a primary application of Bayes' theorem. It allows us to calculate the posterior probability P(A|B) using the prior probability P(A) and the likelihood P(B|A)."
        }
    ];
    
    const selected = statements[Math.floor(Math.random() * statements.length)];
    const qText = `True or False: ${selected.statement}`;
    const options = ["True", "False"];
    const correctIdx = selected.is_true ? 0 : 1;

    return { 
        question: qText, 
        options, 
        correct: correctIdx, 
        explanation: selected.explanation, 
        ti84_steps: "This is a conceptual question.", 
        hint: "Think about the definitions and properties of the statistical concept involved.", 
        type: "true-false-exam2"
    };
}
