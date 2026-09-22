
const COMPETITION_PENALTY_FACTOR = 0.0002;

const calculateChallengeScore = (
    questions,
    totalTimeSeconds,
    penaltyFactor = COMPETITION_PENALTY_FACTOR
) => {
    // --- Input validation ---
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("INVALID_QUESTIONS: 'questions' must be a non-empty array.");
    }

    if (typeof totalTimeSeconds !== "number" || totalTimeSeconds < 0) {
        throw new Error(
            "INVALID_TIME: 'totalTimeSeconds' must be a non-negative number."
        );
    }

    if (typeof penaltyFactor !== "number" || penaltyFactor < 0) {
        throw new Error(
            "INVALID_PENALTY_FACTOR: 'penaltyFactor' must be a non-negative number."
        );
    }

    // --- Numerator: Σ(Q_i * N_i) ---
    const weightedSum = questions.reduce((sum, question, index) => {
        const correct = Number(question.correct);
        const difficulty = Number(question.difficulty);

        if (![0, 1].includes(correct)) {
            throw new Error(
                `INVALID_CORRECT_VALUE: Question at index ${index} has an invalid 'correct' value (${question.correct}). Expected 0 or 1.`
            );
        }

        if (!Number.isFinite(difficulty) || difficulty < 0) {
            throw new Error(
                `INVALID_DIFFICULTY: Question at index ${index} has an invalid 'difficulty' value (${question.difficulty}). Expected a non-negative number.`
            );
        }

        return sum + correct * difficulty;
    }, 0);

    // --- Denominator: (1 + k * t) ---
    // The denominator is always >= 1 since k >= 0 and t >= 0,
    // so division by zero is structurally impossible.
    const denominator = 1 + penaltyFactor * totalTimeSeconds;

    const score = weightedSum / denominator;

    return Math.round(score * 10000) / 10000;
};

module.exports = {
    calculateChallengeScore,
    COMPETITION_PENALTY_FACTOR,
};
