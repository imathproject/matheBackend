const Competition = require("../models/competitionModel");
const Topic = require("../models/topicModel");
const Subtopic = require("../models/subtopicModel");
const CompetitionQuestion = require("../models/competitionQuestionModel");
const Question = require("../models/questionModel");
const User = require("../models/userModel");
const University = require("../models/universityModel");
const Keyword = require("../models/keywordModel");
const QuestionAssessment = require("../models/QuestionAssessmentModel");
const { Op } = require("sequelize");
const axios = require("axios");
const { calculateChallengeScore, COMPETITION_PENALTY_FACTOR } = require("../utils/challengeScore");

// Python recommendation algorithm server URL
const PYTHON_ALGORITHM_URL = process.env.ALGORITHM_API_URL;

const getAllCompetitions = async () => {
    const competitions = await Competition.findAll({
        order: [["id", "DESC"]],
        include: [
            { model: Topic, attributes: [["name", "label"], "id"] },
            { model: Subtopic, attributes: [["name", "label"], "id"] },
        ],
    });
    return competitions;
};

const getCompetition = async (idOrCode) => {
    let competition = null;

    // Check if it's a numeric ID first
    if (/^\d+$/.test(idOrCode)) {
        competition = await Competition.findOne({
            where: { id: idOrCode },
            include: [
                { model: Topic, attributes: [["name", "label"], "id"] },
                { model: Subtopic, attributes: [["name", "label"], "id"] },
            ],
        });
    }

    // Fallback/direct lookup by code
    if (!competition) {
        competition = await Competition.findOne({
            where: { code: idOrCode },
            include: [
                { model: Topic, attributes: [["name", "label"], "id"] },
                { model: Subtopic, attributes: [["name", "label"], "id"] },
            ],
        });
    }

    if (!competition) {
        throw new Error("COMPETITION_NOT_FOUND");
    }

    // Auto-finish check: if competition is started and maxDuration has passed
    if (competition.status === "started") {
        await checkAndAutoFinish(competition);
        // Reload to get updated status
        await competition.reload();
    }

    return competition;
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

// Same pool getNextCompetitionQuestion draws from
const assertEnoughQuestions = async (data) => {
    const questionWhere = {
        validate: 1,
        algorithmLevel: { [Op.ne]: null },
    };
    if (data.subtopic) {
        questionWhere.subtopic = data.subtopic;
    } else {
        questionWhere.topic = data.topic;
    }

    const eligibleCount = await Question.count({ where: questionWhere });
    if (eligibleCount < data.numberOfQuestions) {
        throw {
            kind: "invalid_input",
            detail: `Not enough questions: only ${eligibleCount} eligible question(s) found for the selected topic/subtopic, but ${data.numberOfQuestions} were requested.`,
        };
    }
};

const createCompetition = async (userID, data) => {
    await assertEnoughQuestions(data);

    let code;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
        code = generateRandomCode();
        const existing = await Competition.findOne({ where: { code } });
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error("FAILED_TO_GENERATE_UNIQUE_CODE");
    }

    const newCompetition = await Competition.create({
        user_id: userID,
        code: code,
        title: data.title,
        localization: data.localization || null,
        topic: data.topic,
        subtopic: data.subtopic || null,
        numberOfQuestions: data.numberOfQuestions,
        maxDuration: data.maxDuration,
        status: "created",
        date: data.date,
    });
    return newCompetition;
};

const updateCompetition = async (data) => {
    // Don't allow updates to finished competitions
    const competition = await Competition.findByPk(data.id);
    if (!competition) {
        throw new Error("COMPETITION_NOT_FOUND");
    }
    if (competition.status === "finished") {
        throw new Error("CANNOT_UPDATE_FINISHED_COMPETITION");
    }
    await assertEnoughQuestions(data);

    const [rowsUpdated] = await Competition.update(
        {
            title: data.title,
            localization: data.localization || null,
            topic: data.topic,
            subtopic: data.subtopic || null,
            numberOfQuestions: data.numberOfQuestions,
            maxDuration: data.maxDuration,
            date: data.date,
        },
        {
            where: { id: data.id },
        }
    );
    if (rowsUpdated === 0) {
        throw new Error("COMPETITION_NOT_FOUND");
    }
    return { message: "Competition updated successfully" };
};

const deleteCompetition = async (id) => {
    const deletedRows = await Competition.destroy({ where: { id: id } });
    if (deletedRows === 0) {
        throw new Error("COMPETITION_NOT_FOUND");
    }
    return { message: "Competition deleted successfully" };
};

// Valid status transitions
const VALID_TRANSITIONS = {
    created: ["started"],
    started: ["paused", "finished"],
    paused: ["started", "finished"],
    finished: [],
};

const updateCompetitionStatus = async (id, newStatus) => {
    const competition = await Competition.findByPk(id);
    if (!competition) {
        throw new Error("COMPETITION_NOT_FOUND");
    }

    const currentStatus = competition.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
        throw new Error(`INVALID_STATUS_TRANSITION: Cannot transition from '${currentStatus}' to '${newStatus}'`);
    }

    // If transitioning to 'started', record the start time by updating the date
    // We keep the original date for day filtering; startedAt is tracked via the transition timestamp
    await Competition.update(
        { status: newStatus },
        { where: { id: id } }
    );

    return { message: `Competition status updated to '${newStatus}'` };
};

const getCompetitionStatus = async (id) => {
    const competition = await Competition.findByPk(id, {
        attributes: ["id", "status", "maxDuration", "title"],
    });
    if (!competition) {
        throw new Error("COMPETITION_NOT_FOUND");
    }

    // Auto-finish check
    if (competition.status === "started") {
        const fullComp = await Competition.findByPk(id);
        await checkAndAutoFinish(fullComp);
        await competition.reload();
    }

    return {
        id: competition.id,
        status: competition.status,
        maxDuration: competition.maxDuration,
        title: competition.title,
    };
};

/**
 * Check if a started competition has exceeded its maxDuration and auto-finish it.
 * We check against the competition_question records to find the earliest start time.
 */
const checkAndAutoFinish = async (competition) => {
    if (competition.status !== "started") return;

    // Find the earliest question record date (this is when the first student started)
    const earliestRecord = await CompetitionQuestion.findOne({
        where: { competition_id: competition.id },
        order: [["date", "ASC"]],
        attributes: ["date"],
    });

    if (!earliestRecord) return; // No students have started yet, nothing to auto-finish

    const startTime = new Date(earliestRecord.date).getTime();
    const now = Date.now();
    const elapsedMinutes = (now - startTime) / (1000 * 60);

    if (elapsedMinutes >= competition.maxDuration) {
        await Competition.update(
            { status: "finished" },
            { where: { id: competition.id } }
        );
    }
};

const getOrStartCompetitionQuestions = async (competitionId, userId) => {
    // 1. Get competition details
    const competition = await getCompetition(competitionId);

    // 2. Guard: only allow if status is 'started'
    if (competition.status !== "started") {
        throw new Error("COMPETITION_NOT_STARTED");
    }

    // 3. Check date: only allow if competition is scheduled for today
    const today = new Date();
    const compDate = new Date(competition.date);
    if (
        today.getFullYear() !== compDate.getUTCFullYear() ||
        today.getMonth() !== compDate.getUTCMonth() ||
        today.getDate() !== compDate.getUTCDate()
    ) {
        throw new Error("COMPETITION_NOT_AVAILABLE_TODAY");
    }

    const studentAsnweredQuestions = await CompetitionQuestion.findAll({
        where: { competition_id: competitionId, user_id: userId },
        include: [{ model: Question }],
        order: [["id", "ASC"]],
    });

    return {
        answeredQuestions: studentAsnweredQuestions,
        totalQuestions: competition.numberOfQuestions,
    };
};

const getNextCompetitionQuestion = async (competitionId, userId) => {
    const competition = await getCompetition(competitionId);

    if (competition.status !== "started") {
        throw new Error("COMPETITION_NOT_STARTED");
    }

    const studentAsnweredQuestions = await CompetitionQuestion.findAll({
        where: { competition_id: competitionId, user_id: userId },
        include: [{ model: Question }],
        order: [["id", "ASC"]],
    });

    const answeredCount = studentAsnweredQuestions.length;
    const hasFinishedCompetition = answeredCount >= competition.numberOfQuestions;

    if (hasFinishedCompetition) {
        return { finished: true, answeredCount, totalQuestions: competition.numberOfQuestions };
    }
    const user = await User.findByPk(userId, {
        attributes: ["name", "surname", "email"],
        include: [{ model: University, attributes: ["name"] }],
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const universityName = user.platform__university ? user.platform__university.name : "IPB";

    // Get questions for this topic/subtopic (with keywords) — same format as findArrayByTopic/Subtopic
    const questionWhereClause = {
        validate: 1,
        algorithmLevel: { [Op.ne]: null },
    };

    if (competition.subtopic !== null) {
        questionWhereClause.subtopic = competition.subtopic;
    } else {
        questionWhereClause.topic = competition.topic;
    }

    const topicQuestions = await Question.findAll({
        where: questionWhereClause,
        attributes: ["id", ["algorithmLevel", "level"]],
        include: [{
            model: Keyword,
            attributes: ["id"],
        }],
    });

    if (topicQuestions.length === 0) {
        throw { kind: "no results", detail: "No questions available for this topic/subtopic yet." };
    }

    const transformedQuestions = topicQuestions.map((q) => {
        const keywordIds = q.platform__keywords.map((kw) => kw.id);
        return { id: q.id, level: q.get("level"), keyword: keywordIds };
    });

    // Get student's assessment history for this topic/subtopic
    const historyWhereClause = { student_id: userId };
    if (competition.subtopic !== null) {
        historyWhereClause.subtopic = competition.subtopic;
    } else {
        historyWhereClause.topic = competition.topic;
    }

    const historicRecords = await QuestionAssessment.findAll({
        where: historyWhereClause,
        attributes: ["question_id", "question_level", "answer"],
    });

    const historic = historicRecords.map((h) => ({
        question_id: h.question_id,
        question_level: h.question_level,
        answer: h.answer,
    }));

    // Build the personalInfo array (same format as self-assessment Header component)
    // Positions: [name, surname, university, email, -1, -1, -1, -1, qId1, ans1, qId2, ans2, ...]
    const personalInfo = [
        user.name,
        user.surname,
        universityName,
        user.email,
        "-1", "-1", "-1", "-1",
    ];

    // Add the recent competition answers (up to 5 pairs: questionId, answer)
    const recentAnswers = studentAsnweredQuestions.slice(-5);
    for (const sq of recentAnswers) {
        personalInfo.push(sq.id_question);
        personalInfo.push(sq.answer);
    }

    // Pad remaining slots to fill 10 slots (5 pairs) after position 8
    const pairsNeeded = 5 - recentAnswers.length;
    for (let i = 0; i < pairsNeeded; i++) {
        personalInfo.push("-1");
        personalInfo.push("-1");
    }

    // uild the payload for the Python algorithm
    const algorithmPayload = {
        elements: [personalInfo, transformedQuestions, historic],
    };

    // Call the Python recommendation server
    let nextQuestionId;
    try {
        const response = await axios.post(PYTHON_ALGORITHM_URL, algorithmPayload);
        nextQuestionId = response.data.id;
    } catch (err) {
        console.error("Error calling Python algorithm:", err.message);
        throw new Error("ALGORITHM_SERVER_ERROR");
    }

    // Handle special case: algorithm returns -1 (all levels completed)
    if (nextQuestionId === -1) {
        return { finished: true, answeredCount, totalQuestions: competition.numberOfQuestions };
    }

    // Create a single competition_question record for this question
    await CompetitionQuestion.create({
        competition_id: competitionId,
        user_id: userId,
        id_question: nextQuestionId,
        answer: 0,
        duration: 0,
        option_selected: -1,
        date: new Date(),
    });

    // Fetch and return the newly created record with question details
    const newRecord = await CompetitionQuestion.findOne({
        where: {
            competition_id: competitionId,
            user_id: userId,
            id_question: nextQuestionId,
        },
        include: [{ model: Question }],
        order: [["id", "DESC"]],
    });

    return {
        finished: false,
        question: newRecord,
        answeredCount: answeredCount,
        totalQuestions: competition.numberOfQuestions,
    };
};

const submitStudentAnswer = async (competitionId, userId, questionId, optionSelected, duration) => {
    // Check competition is still started (not paused or finished)
    const competition = await Competition.findByPk(competitionId);
    if (!competition || competition.status !== "started") {
        throw new Error("COMPETITION_NOT_ACTIVE");
    }

    // Determine correctness
    // optionSelected === 0 is correct (answer = 1)
    // optionSelected === 4 is "I don't know" (answer = -1)
    // others are incorrect (answer = 0)
    let answerVal = 0;
    if (optionSelected === 0) {
        answerVal = 1;
    } else if (optionSelected === 4) {
        answerVal = -1;
    }

    const [rowsUpdated] = await CompetitionQuestion.update(
        {
            answer: answerVal,
            option_selected: optionSelected,
            duration: duration,
            date: new Date(),
        },
        {
            where: {
                competition_id: competitionId,
                user_id: userId,
                id_question: questionId,
            },
        }
    );

    if (rowsUpdated === 0) {
        throw new Error("COMPETITION_QUESTION_RECORD_NOT_FOUND");
    }

    return { message: "Answer submitted successfully" };
};

const getCompetitionLeaderboard = async (competitionId) => {
    const records = await CompetitionQuestion.findAll({
        where: { competition_id: competitionId },
        include: [
            {
                model: User,
                attributes: ["id", "name", "surname", "email"],
                include: [
                    { model: University, attributes: ["name"] },
                ],
            },
            {
                model: Question,
                attributes: ["algorithmLevel"],
            },
        ],
    });

    // Group records by user_id
    const userStatsMap = {};

    records.forEach(rec => {
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

        // Collect question data for score calculation
        // Fallback to difficulty 1 when algorithmLevel is null (Option A)
        const difficulty = rec.platform__sna__question
            ? (rec.platform__sna__question.algorithmLevel ?? 1)
            : 1;

        userStatsMap[userId].questions.push({
            correct: rec.answer === 1 ? 1 : 0,
            difficulty: difficulty,
        });
    });

    // Calculate score for each user and build leaderboard
    const leaderboard = Object.values(userStatsMap).map(entry => {
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
    getAllCompetitions,
    getCompetition,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    updateCompetitionStatus,
    getCompetitionStatus,
    getOrStartCompetitionQuestions,
    getNextCompetitionQuestion,
    submitStudentAnswer,
    getCompetitionLeaderboard,
};
