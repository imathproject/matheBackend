const OlympiadsChallengeService = require("../services/olympiadsChallengeService");
const { tryCatch } = require("../utils/tryCatch");

const getAllOlympiadsChallenges = tryCatch(async (req, res) => {
    const challenges = await OlympiadsChallengeService.getAllOlympiadsChallenges();
    return res.status(200).json({ elements: challenges });
});

const getOlympiadsChallenge = tryCatch(async (req, res) => {
    const { id } = req.params;
    const challenge = await OlympiadsChallengeService.getOlympiadsChallenge(id);
    return res.status(200).json({ element: challenge });
});

const createOlympiadsChallenge = tryCatch(async (req, res) => {
    const userID = req.user;
    const newChallenge = await OlympiadsChallengeService.createOlympiadsChallenge(userID, req.body);
    return res.status(201).json({ element: newChallenge });
});

const updateOlympiadsChallenge = tryCatch(async (req, res) => {
    const result = await OlympiadsChallengeService.updateOlympiadsChallenge(req.body);
    return res.status(200).json(result);
});

const deleteOlympiadsChallenge = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await OlympiadsChallengeService.deleteOlympiadsChallenge(id);
    return res.status(200).json(result);
});

const updateStatus = tryCatch(async (req, res) => {
    const { id, status } = req.body;
    const result = await OlympiadsChallengeService.updateOlympiadsChallengeStatus(id, status);
    return res.status(200).json(result);
});

const getStatus = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await OlympiadsChallengeService.getOlympiadsChallengeStatus(id);
    return res.status(200).json({ element: result });
});

const startOlympiadsChallenge = tryCatch(async (req, res) => {
    const challengeId = req.body.challengeId;
    const userToUse = req.user;
    const result = await OlympiadsChallengeService.getOrStartOlympiadsChallengeQuestions(challengeId, userToUse);
    return res.status(200).json({
        elements: result.answeredQuestions,
        totalQuestions: result.totalQuestions,
    });
});

const submitAnswer = tryCatch(async (req, res) => {
    const challengeId = req.body.challengeId;
    const { questionId, optionSelected, duration } = req.body;
    const userToUse = req.user;
    const result = await OlympiadsChallengeService.submitStudentAnswer(challengeId, userToUse, questionId, optionSelected, duration);
    return res.status(200).json(result);
});

const getLeaderboard = tryCatch(async (req, res) => {
    const { id } = req.params;
    const leaderboard = await OlympiadsChallengeService.getOlympiadsChallengeLeaderboard(id);
    return res.status(200).json({ elements: leaderboard });
});

const getNextQuestion = tryCatch(async (req, res) => {
    const challengeId = req.body.challengeId;
    const userToUse = req.user;
    const result = await OlympiadsChallengeService.getNextOlympiadsChallengeQuestion(challengeId, userToUse);
    return res.status(200).json({ element: result });
});

module.exports = {
    getAllOlympiadsChallenges,
    getOlympiadsChallenge,
    createOlympiadsChallenge,
    updateOlympiadsChallenge,
    deleteOlympiadsChallenge,
    updateStatus,
    getStatus,
    startOlympiadsChallenge,
    submitAnswer,
    getLeaderboard,
    getNextQuestion,
};
