const CompetitionService = require("../services/competitionService");
const { tryCatch } = require("../utils/tryCatch");

const getAllCompetitions = tryCatch(async (req, res) => {
    const competitions = await CompetitionService.getAllCompetitions();
    return res.status(200).json({ elements: competitions });
});

const getCompetition = tryCatch(async (req, res) => {
    const { id } = req.params;
    const competition = await CompetitionService.getCompetition(id);
    return res.status(200).json({ element: competition });
});

const createCompetition = tryCatch(async (req, res) => {
    const userID = req.user;
    const newCompetition = await CompetitionService.createCompetition(userID, req.body);
    return res.status(201).json({ element: newCompetition });
});

const updateCompetition = tryCatch(async (req, res) => {
    const result = await CompetitionService.updateCompetition(req.body);
    return res.status(200).json(result);
});

const deleteCompetition = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await CompetitionService.deleteCompetition(id);
    return res.status(200).json(result);
});

const updateStatus = tryCatch(async (req, res) => {
    const { id, status } = req.body;
    const result = await CompetitionService.updateCompetitionStatus(id, status);
    return res.status(200).json(result);
});

const getStatus = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await CompetitionService.getCompetitionStatus(id);
    return res.status(200).json({ element: result });
});

const startCompetition = tryCatch(async (req, res) => {
    const competitionId = req.body.competitionId || req.body.challengeId;
    const userToUse = req.user;
    const result = await CompetitionService.getOrStartCompetitionQuestions(competitionId, userToUse);
    return res.status(200).json({
        elements: result.answeredQuestions,
        totalQuestions: result.totalQuestions,
    });
});

const submitAnswer = tryCatch(async (req, res) => {
    const competitionId = req.body.competitionId || req.body.challengeId;
    const { questionId, optionSelected, duration } = req.body;
    const userToUse = req.user;
    const result = await CompetitionService.submitStudentAnswer(competitionId, userToUse, questionId, optionSelected, duration);
    return res.status(200).json(result);
});

const getLeaderboard = tryCatch(async (req, res) => {
    const { id } = req.params;
    const leaderboard = await CompetitionService.getCompetitionLeaderboard(id);
    return res.status(200).json({ elements: leaderboard });
});

const getNextQuestion = tryCatch(async (req, res) => {
    const competitionId = req.body.competitionId || req.body.challengeId;
    const userToUse = req.user;
    const result = await CompetitionService.getNextCompetitionQuestion(competitionId, userToUse);
    return res.status(200).json({ element: result });
});

module.exports = {
    getAllCompetitions,
    getCompetition,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    updateStatus,
    getStatus,
    startCompetition,
    submitAnswer,
    getLeaderboard,
    getNextQuestion,
};
