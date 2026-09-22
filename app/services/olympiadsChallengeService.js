const OlympiadsChallenge = require("../models/olympiadsChallengeModel");
const OlympiadsChallengeSelectedQuestion = require("../models/olympiadsChallengeSelectedQuestionModel");
const OlympiadsChallengeQuestion = require("../models/olympiadsChallengeQuestionModel");
const OlympicQuestion = require("../models/olympicQuestionsModel");
const OlympicAlternatives = require("../models/olympicAlternatives");
const Olympic = require("../models/olympicModel");
const OlympicLevel = require("../models/olympicLevelModel");
const OlympicYear = require("../models/olympicYearModel");
const OlympicPhase = require("../models/olympicPhaseModel");
const User = require("../models/userModel");
const University = require("../models/universityModel");
const { Op } = require("sequelize");
const { calculateChallengeScore, COMPETITION_PENALTY_FACTOR } = require("../utils/challengeScore");

const getAllOlympiadsChallenges = async () => {
    const challenges = await OlympiadsChallenge.findAll({
        order: [["id", "DESC"]],
        include: [
            { model: Olympic, attributes: ["name", "id"] },
            { model: OlympicLevel, attributes: ["level", "id"] },
            { model: OlympicYear, attributes: ["year", "id"] },
            { model: OlympicPhase, attributes: ["phase", "id"] },
        ],
    });
    return challenges;
};

const getOlympiadsChallenge = async (idOrCode) => {
    let challenge = null;

    // Check if it's a numeric ID first
    if (/^\d+$/.test(idOrCode)) {
        challenge = await OlympiadsChallenge.findOne({
            where: { id: idOrCode },
            include: [
                { model: Olympic, attributes: ["name", "id"] },
                { model: OlympicLevel, attributes: ["level", "id"] },
                { model: OlympicYear, attributes: ["year", "id"] },
                { model: OlympicPhase, attributes: ["phase", "id"] },
            ],
        });
    }

    // Fallback/direct lookup by code
    if (!challenge) {
        challenge = await OlympiadsChallenge.findOne({
            where: { code: idOrCode },
            include: [
                { model: Olympic, attributes: ["name", "id"] },
                { model: OlympicLevel, attributes: ["level", "id"] },
                { model: OlympicYear, attributes: ["year", "id"] },
                { model: OlympicPhase, attributes: ["phase", "id"] },
            ],
        });
    }

    if (!challenge) {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_FOUND");
    }

    // Auto-finish check: if challenge is started and maxDuration has passed
    if (challenge.status === "started") {
        await checkAndAutoFinish(challenge);
        await challenge.reload();
    }

    return challenge;
};

const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const size = 7;
    let result = "";
    for (let i = 0; i < size; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const createOlympiadsChallenge = async (userID, data) => {
    // Generate unique code
    let code;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
        code = generateRandomCode();
        const existing = await OlympiadsChallenge.findOne({ where: { code } });
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error("FAILED_TO_GENERATE_UNIQUE_CODE");
    }

    // Query eligible Olympic questions matching the filters
    const questionWhere = {
        id_olympic: data.id_olympic,
        active: 1,
        validate: 1,
    };
    if (data.id_olympic_level) {
        questionWhere.id_olympic_level = data.id_olympic_level;
    }
    if (data.id_olympic_year) {
        questionWhere.id_olympic_year = data.id_olympic_year;
    }
    if (data.id_olympic_phase) {
        questionWhere.id_olympic_phase = data.id_olympic_phase;
    }

    const eligibleQuestions = await OlympicQuestion.findAll({
        where: questionWhere,
        attributes: ["id"],
    });

    if (eligibleQuestions.length < data.numberOfQuestions) {
        throw {
            kind: "invalid_input",
            detail: `Not enough questions: only ${eligibleQuestions.length} eligible question(s) found for the selected filters, but ${data.numberOfQuestions} were requested.`,
        };
    }

    // Randomly select numberOfQuestions from the pool
    const shuffled = [...eligibleQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, data.numberOfQuestions);

    // Create the challenge
    const newChallenge = await OlympiadsChallenge.create({
        user_id: userID,
        code: code,
        title: data.title,
        localization: data.localization || null,
        id_olympic: data.id_olympic,
        id_olympic_level: data.id_olympic_level || null,
        id_olympic_year: data.id_olympic_year || null,
        id_olympic_phase: data.id_olympic_phase || null,
        numberOfQuestions: data.numberOfQuestions,
        maxDuration: data.maxDuration,
        status: "created",
        date: data.date,
    });

    // Store the pre-selected questions
    const selectedRecords = selectedQuestions.map((q, index) => ({
        olympiads_challenge_id: newChallenge.id,
        id_olympic_question: q.id,
        question_order: index + 1,
    }));

    await OlympiadsChallengeSelectedQuestion.bulkCreate(selectedRecords);

    return newChallenge;
};

const updateOlympiadsChallenge = async (data) => {
    const challenge = await OlympiadsChallenge.findByPk(data.id);
    if (!challenge) {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_FOUND");
    }
    if (challenge.status === "finished") {
        throw new Error("CANNOT_UPDATE_FINISHED_CHALLENGE");
    }

    const [rowsUpdated] = await OlympiadsChallenge.update(
        {
            title: data.title,
            localization: data.localization || null,
            id_olympic: data.id_olympic,
            id_olympic_level: data.id_olympic_level || null,
            id_olympic_year: data.id_olympic_year || null,
            id_olympic_phase: data.id_olympic_phase || null,
            numberOfQuestions: data.numberOfQuestions,
            maxDuration: data.maxDuration,
            date: data.date,
        },
        {
            where: { id: data.id },
        }
    );
    if (rowsUpdated === 0) {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_FOUND");
    }

    // Re-select questions if the challenge hasn't been started yet
    if (challenge.status === "created") {
        // Remove old selected questions
        await OlympiadsChallengeSelectedQuestion.destroy({
            where: { olympiads_challenge_id: data.id },
        });

        // Query eligible questions with the updated filters
        const questionWhere = {
            id_olympic: data.id_olympic,
            active: 1,
            validate: 1,
        };
        if (data.id_olympic_level) {
            questionWhere.id_olympic_level = data.id_olympic_level;
        }
        if (data.id_olympic_year) {
            questionWhere.id_olympic_year = data.id_olympic_year;
        }
        if (data.id_olympic_phase) {
            questionWhere.id_olympic_phase = data.id_olympic_phase;
        }

        const eligibleQuestions = await OlympicQuestion.findAll({
            where: questionWhere,
            attributes: ["id"],
        });

        if (eligibleQuestions.length < data.numberOfQuestions) {
            throw {
                kind: "invalid_input",
                detail: `Not enough questions: only ${eligibleQuestions.length} eligible question(s) found for the selected filters, but ${data.numberOfQuestions} were requested.`,
            };
        }

        const shuffled = [...eligibleQuestions].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, data.numberOfQuestions);

        const selectedRecords = selectedQuestions.map((q, index) => ({
            olympiads_challenge_id: data.id,
            id_olympic_question: q.id,
            question_order: index + 1,
        }));

        await OlympiadsChallengeSelectedQuestion.bulkCreate(selectedRecords);
    }

    return { message: "Olympiads Challenge updated successfully" };
};

const deleteOlympiadsChallenge = async (id) => {
    // Delete selected questions and student answers first
    await OlympiadsChallengeSelectedQuestion.destroy({ where: { olympiads_challenge_id: id } });
    await OlympiadsChallengeQuestion.destroy({ where: { olympiads_challenge_id: id } });

    const deletedRows = await OlympiadsChallenge.destroy({ where: { id: id } });
    if (deletedRows === 0) {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_FOUND");
    }
    return { message: "Olympiads Challenge deleted successfully" };
};

// Valid status transitions
const VALID_TRANSITIONS = {
    created: ["started"],
    started: ["paused", "finished"],
    paused: ["started", "finished"],
    finished: [],
};

const updateOlympiadsChallengeStatus = async (id, newStatus) => {
    const challenge = await OlympiadsChallenge.findByPk(id);
    if (!challenge) {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_FOUND");
    }

    const currentStatus = challenge.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw new Error(`INVALID_STATUS_TRANSITION: Cannot transition from '${currentStatus}' to '${newStatus}'`);
    }

    await OlympiadsChallenge.update(
        { status: newStatus },
        { where: { id: id } }
    );

    return { message: `Olympiads Challenge status updated to '${newStatus}'` };
};

const getOlympiadsChallengeStatus = async (id) => {
    const challenge = await OlympiadsChallenge.findByPk(id, {
        attributes: ["id", "status", "maxDuration", "title"],
    });
    if (!challenge) {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_FOUND");
    }

    // Auto-finish check
    if (challenge.status === "started") {
        const fullChallenge = await OlympiadsChallenge.findByPk(id);
        await checkAndAutoFinish(fullChallenge);
        await challenge.reload();
    }

    return {
        id: challenge.id,
        status: challenge.status,
        maxDuration: challenge.maxDuration,
        title: challenge.title,
    };
};

/**
 * Check if a started challenge has exceeded its maxDuration and auto-finish it.
 */
const checkAndAutoFinish = async (challenge) => {
    if (challenge.status !== "started") return;

    const earliestRecord = await OlympiadsChallengeQuestion.findOne({
        where: { olympiads_challenge_id: challenge.id },
        order: [["date", "ASC"]],
        attributes: ["date"],
    });

    if (!earliestRecord) return;

    const startTime = new Date(earliestRecord.date).getTime();
    const now = Date.now();
    const elapsedMinutes = (now - startTime) / (1000 * 60);

    if (elapsedMinutes >= challenge.maxDuration) {
        await OlympiadsChallenge.update(
            { status: "finished" },
            { where: { id: challenge.id } }
        );
    }
};

const getOrStartOlympiadsChallengeQuestions = async (challengeId, userId) => {
    // 1. Get challenge details
    const challenge = await getOlympiadsChallenge(challengeId);

    // 2. Guard: only allow if status is 'started'
    if (challenge.status !== "started") {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_STARTED");
    }

    // 3. Check date: only allow if challenge is scheduled for today
    const today = new Date();
    const challengeDate = new Date(challenge.date);
    if (
        today.getFullYear() !== challengeDate.getUTCFullYear() ||
        today.getMonth() !== challengeDate.getUTCMonth() ||
        today.getDate() !== challengeDate.getUTCDate()
    ) {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_AVAILABLE_TODAY");
    }

    // 4. Check if student already has records (resume)
    const existingRecords = await OlympiadsChallengeQuestion.findAll({
        where: { olympiads_challenge_id: challengeId, user_id: userId },
        include: [{
            model: OlympicQuestion,
            include: [{ model: OlympicAlternatives, as: "alternatives" }],
        }],
        order: [["question_order", "ASC"]],
    });

    if (existingRecords.length > 0) {
        return {
            answeredQuestions: existingRecords,
            totalQuestions: challenge.numberOfQuestions,
        };
    }

    // 5. First time: create records from the pre-selected questions
    const selectedQuestions = await OlympiadsChallengeSelectedQuestion.findAll({
        where: { olympiads_challenge_id: challengeId },
        order: [["question_order", "ASC"]],
    });

    const records = selectedQuestions.map((sq) => ({
        olympiads_challenge_id: challengeId,
        user_id: userId,
        id_olympic_question: sq.id_olympic_question,
        question_order: sq.question_order,
        answer: 0,
        duration: 0,
        option_selected: -1,
        date: new Date(),
    }));

    await OlympiadsChallengeQuestion.bulkCreate(records);

    // Fetch the newly created records with question details
    const studentQuestions = await OlympiadsChallengeQuestion.findAll({
        where: { olympiads_challenge_id: challengeId, user_id: userId },
        include: [{
            model: OlympicQuestion,
            include: [{ model: OlympicAlternatives, as: "alternatives" }],
        }],
        order: [["question_order", "ASC"]],
    });

    return {
        answeredQuestions: studentQuestions,
        totalQuestions: challenge.numberOfQuestions,
    };
};

/**
 * Get the next unanswered question for a student in an Olympiads Challenge.
 */
const getNextOlympiadsChallengeQuestion = async (challengeId, userId) => {
    // 1. Get challenge details
    const challenge = await getOlympiadsChallenge(challengeId);

    // 2. Guard: only allow if status is 'started'
    if (challenge.status !== "started") {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_STARTED");
    }

    // 3. Count total answered (option_selected != -1)
    const allStudentQuestions = await OlympiadsChallengeQuestion.findAll({
        where: { olympiads_challenge_id: challengeId, user_id: userId },
        order: [["question_order", "ASC"]],
    });

    const answeredCount = allStudentQuestions.filter((q) => q.option_selected !== -1).length;

    // 4. If all answered, challenge is done
    if (answeredCount >= challenge.numberOfQuestions) {
        return { finished: true, answeredCount, totalQuestions: challenge.numberOfQuestions };
    }

    // 5. Find the next unanswered question
    const nextQuestion = await OlympiadsChallengeQuestion.findOne({
        where: {
            olympiads_challenge_id: challengeId,
            user_id: userId,
            option_selected: -1,
        },
        include: [{
            model: OlympicQuestion,
            include: [{ model: OlympicAlternatives, as: "alternatives" }],
        }],
        order: [["question_order", "ASC"]],
    });

    if (!nextQuestion) {
        return { finished: true, answeredCount, totalQuestions: challenge.numberOfQuestions };
    }

    return {
        finished: false,
        question: nextQuestion,
        answeredCount: answeredCount,
        totalQuestions: challenge.numberOfQuestions,
    };
};

const submitStudentAnswer = async (challengeId, userId, questionId, optionSelected, duration) => {
    // Check challenge is still started
    const challenge = await OlympiadsChallenge.findByPk(challengeId);
    if (!challenge || challenge.status !== "started") {
        throw new Error("OLYMPIADS_CHALLENGE_NOT_ACTIVE");
    }

    // Determine correctness for Olympic questions:
    // optionSelected === 0 means "I don't know" (answer = -1)
    // optionSelected === correctAnswerId means correct (answer = 1)
    // otherwise incorrect (answer = 0)
    const olympicQuestion = await OlympicQuestion.findByPk(questionId);
    if (!olympicQuestion) {
        throw new Error("OLYMPIC_QUESTION_NOT_FOUND");
    }

    let answerVal = 0;
    if (Number(optionSelected) === 0) {
        answerVal = -1; // "I don't know"
    } else if (Number(optionSelected) === olympicQuestion.correctAnswerId) {
        answerVal = 1; // correct
    }

    const [rowsUpdated] = await OlympiadsChallengeQuestion.update(
        {
            answer: answerVal,
            option_selected: optionSelected,
            duration: duration,
            date: new Date(),
        },
        {
            where: {
                olympiads_challenge_id: challengeId,
                user_id: userId,
                id_olympic_question: questionId,
            },
        }
    );

    if (rowsUpdated === 0) {
        throw new Error("OLYMPIADS_CHALLENGE_QUESTION_RECORD_NOT_FOUND");
    }

    return { message: "Answer submitted successfully", isCorrect: answerVal === 1 };
};

const getOlympiadsChallengeLeaderboard = async (challengeId) => {
    const records = await OlympiadsChallengeQuestion.findAll({
        where: { olympiads_challenge_id: challengeId },
        include: [
            {
                model: User,
                attributes: ["id", "name", "surname", "email"],
                include: [
                    { model: University, attributes: ["name"] },
                ],
            },
        ],
    });

    // Group records by user_id
    const userStatsMap = {};

    records.forEach((rec) => {
        const userId = rec.user_id;
        const user = rec.user_final;
        if (!userStatsMap[userId]) {
            userStatsMap[userId] = {
                userId: userId,
                name: user ? user.name : "Unknown",
                surname: user ? user.surname : "",
                email: user ? user.email : "N/A",
                university: user && user.platform__university ? user.platform__university.name : "N/A",
                correct: 0,
                total: 0,
                duration: 0,
                questions: [],
            };
        }

        userStatsMap[userId].total += 1;
        if (rec.answer === 1) {
            userStatsMap[userId].correct += 1;
        }
        userStatsMap[userId].duration += rec.duration;

        // Flat difficulty = 1 for all Olympic questions
        userStatsMap[userId].questions.push({
            correct: rec.answer === 1 ? 1 : 0,
            difficulty: 1,
        });
    });

    // Calculate score for each user and build leaderboard
    const leaderboard = Object.values(userStatsMap).map((entry) => {
        const { questions, ...userData } = entry;

        let score = 0;
        if (questions.length > 0) {
            score = calculateChallengeScore(
                questions,
                userData.duration,
                COMPETITION_PENALTY_FACTOR
            );
        }

        return { ...userData, score };
    });

    // Sort by score DESC, then by duration ASC as tiebreaker
    leaderboard.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.duration - b.duration;
    });

    return leaderboard;
};

module.exports = {
    getAllOlympiadsChallenges,
    getOlympiadsChallenge,
    createOlympiadsChallenge,
    updateOlympiadsChallenge,
    deleteOlympiadsChallenge,
    updateOlympiadsChallengeStatus,
    getOlympiadsChallengeStatus,
    getOrStartOlympiadsChallengeQuestions,
    getNextOlympiadsChallengeQuestion,
    submitStudentAnswer,
    getOlympiadsChallengeLeaderboard,
};
