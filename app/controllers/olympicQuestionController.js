const OlympicQuestionService = require("../services/OlympicQuestionService");
const OlympicService = require("../services/OlympicService");
const revisorOlympicsService = require("../services/revisorOlympicsService");
const { tryCatch } = require("../utils/tryCatch");
const fs = require("fs");

const isAdmin = (req) => String(req.roles) === String(process.env.Admin);
const isReviewer = (req) => String(req.roles) === String(process.env.Lecture_Reviewer);

const PROPOSED = 4;
const VERDICTS = [1, 2];

const buildFilters = (req) => {
    const { id_olympic } = req.params;
    const { id_olympic_phase, id_olympic_level, id_olympic_year, validate, active } = req.query;

    return {
        id_olympic: id_olympic && id_olympic !== "null" ? Number(id_olympic) : null,
        id_olympic_phase: id_olympic_phase ? Number(id_olympic_phase) : null,
        id_olympic_level: id_olympic_level ? Number(id_olympic_level) : null,
        id_olympic_year: id_olympic_year ? Number(id_olympic_year) : null,
        validate: validate !== undefined && validate !== null && validate !== "null" ? Number(validate) : null,
        active: active !== undefined && active !== null && active !== "null" ? Number(active) : null
    };
};

const resolveManageableQuestion = async (req, res, id) => {
    const question = await OlympicQuestionService.getOlympicQuestionOwner(id);
    if (!question) {
        res.status(404).json({ message: "Question not found." });
        return null;
    }

    const owns = String(question.id_lect) === String(req.user);
    if (isAdmin(req) || owns) {
        return question;
    }

    res.status(403).json({ message: "You can only manage the questions you created." });
    return null;
};
const updateDenial = async (req, question) => {
    if (isAdmin(req)) return null;

    const next = req.body.validate !== undefined ? Number(req.body.validate) : 0;

    if (String(question.id_lect) === String(req.user)) {
        const decides = VERDICTS.includes(next) && next !== Number(question.validate);
        return decides ? "You cannot accept or refuse your own question." : null;
    }

    if (!isReviewer(req)) return "You can only manage the questions you created.";

    const { olympicIds } = await revisorOlympicsService.findByUserId(req.user);
    const reviews = (olympic) => olympicIds.map(Number).includes(Number(olympic));

    if (!reviews(question.id_olympic)) return "You are not a reviewer for this olympiad.";
    if (req.body.id_olympic !== undefined && !reviews(req.body.id_olympic)) {
        return "You cannot move a question to an olympiad you do not review.";
    }
    if (Number(question.validate) !== PROPOSED) return "This question is not waiting for review.";
    if (![...VERDICTS, PROPOSED].includes(next)) {
        return "A reviewer can only accept, refuse or keep a question proposed.";
    }
    return null;
};

const addOlympicQuestion = tryCatch(async (req, res) => {
    const requiredFields = ["id_olympic", "id_olympic_level", "id_olympic_year", "id_olympic_phase", "question"];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({ message: `${field} is required.` });
        }
    }
    const questionData = {
        ...req.body,
        id_lect: req.user
    };

    const newQuestionId = await OlympicQuestionService.addNewOlympicQuestion(questionData, req.user);
    return res.status(201).json({ element: newQuestionId });
});

const getAllValidatedOlympicQuestions = tryCatch(async (req, res) => {
    const id_olympic = req.params.id_olympic
    const { id_olympic_phase, id_olympic_level, id_olympic_year } = req.query;

    if (!id_olympic || id_olympic === "null") {
        return res.status(200).json({ elements: [] });
    }

    const questions = await OlympicQuestionService.getAllValidatedOlympicQuestions(
        Number(id_olympic),
        id_olympic_phase ? Number(id_olympic_phase) : null,
        id_olympic_level ? Number(id_olympic_level) : null,
        id_olympic_year ? Number(id_olympic_year) : null
    );

    return res.status(200).json({ elements: questions });
});

const getAllOlympicQuestions = tryCatch(async (req, res) => {
    const id_olympic = req.params.id_olympic;
    const { id_olympic_phase, id_olympic_level, id_olympic_year } = req.query;

    if (!id_olympic || id_olympic === "null") {
        return res.status(200).json({ elements: [] });
    }

    const questions = await OlympicQuestionService.getAllOlympicQuestions(
        Number(id_olympic),
        id_olympic_phase ? Number(id_olympic_phase) : null,
        id_olympic_level ? Number(id_olympic_level) : null,
        id_olympic_year ? Number(id_olympic_year) : null
    );

    return res.status(200).json({ elements: questions });
});

const deleteOlympicQuestion = tryCatch(async (req, res) => {
    const { id } = req.params;

    const question = await resolveManageableQuestion(req, res, id);
    if (!question) return;

    const result = await OlympicQuestionService.deleteOlympicQuestion(id, question.file_ext);
    return res.status(200).json(result);
});

const updateOlympicQuestion = tryCatch(async (req, res) => {
    const { id } = req.params;

    const question = await OlympicQuestionService.getOlympicQuestionOwner(id);
    if (!question) {
        return res.status(404).json({ message: "Question not found." });
    }

    const denial = await updateDenial(req, question);
    if (denial) {
        return res.status(403).json({ message: denial });
    }

    const result = await OlympicQuestionService.updateOlympicQuestion(req.body, id, req.user, question.validate);
    return res.status(200).json(result);
});

const validateOlympicQuestion = tryCatch(async (req, res) => {
    const { id } = req.params;
    const { validate } = req.body;
    const userId = req.user;

    if (validate === undefined || validate === null) {
        return res.status(400).json({ message: "validate is required." });
    }

    const data = { ...req.body, validate: Number(validate) };
    const result = await OlympicQuestionService.validateOlympicQuestion(data, id, userId);
    return res.status(200).json(result);
});

const getEnrichedOlympicQuestions = tryCatch(async (req, res) => {
    // Validated questions only, whatever the query string asks for: the same
    // pool the tests draw from.
    const filters = { ...buildFilters(req), validate: 1, active: 1 };

    const questions = await OlympicQuestionService.getEnrichedOlympicQuestions(filters);

    return res.status(200).json({ elements: questions });
});

const getOwnOlympicQuestions = tryCatch(async (req, res) => {
    const questions = await OlympicQuestionService.getOwnOlympicQuestions(buildFilters(req), req.user);

    return res.status(200).json({ elements: questions });
});

const getOlympicQuestionsForValidation = tryCatch(async (req, res) => {
    const admin = isAdmin(req);
    const { olympicIds } = admin
        ? { olympicIds: [] }
        : await revisorOlympicsService.findByUserId(req.user);

    const questions = await OlympicQuestionService.getOlympicQuestionsForValidation(
        buildFilters(req),
        req.user,
        admin,
        olympicIds
    );

    return res.status(200).json({ elements: questions });
});

const getReviewScope = tryCatch(async (req, res) => {
    const olympics = await OlympicService.getAllOlympics();
    if (isAdmin(req)) {
        return res.status(200).json({ elements: olympics });
    }

    const { olympicIds } = await revisorOlympicsService.findByUserId(req.user);
    const allowed = olympicIds.map(Number);
    const scope = olympics.filter((olympic) => allowed.includes(Number(olympic.id)));

    return res.status(200).json({ elements: scope });
});

const getOlympicTest = tryCatch(async (req, res) => {
    const { id_olympic, id_olympic_phase, id_olympic_level, id_olympic_year } = req.query;
    if (!id_olympic || id_olympic === "null" || !id_olympic_phase || id_olympic_phase === "null" || !id_olympic_level || id_olympic_level === "null") {
        return res.status(400).json({ message: "Missing required information" });
    }
    const questions = await OlympicQuestionService.getOlympicTest(
        Number(id_olympic),
        Number(id_olympic_phase),
        Number(id_olympic_level),
        id_olympic_year && id_olympic_year !== "null" ? Number(id_olympic_year) : null
    );
    return res.status(200).json({ elements: questions });
});

const getOlympicTestOptions = tryCatch(async (req, res) => {
    const { id_olympic } = req.query;
    if (!id_olympic || id_olympic === "null") {
        return res.status(200).json({ elements: [] });
    }
    const combinations = await OlympicQuestionService.getOlympicTestOptions(Number(id_olympic));
    return res.status(200).json({ elements: combinations });
});

const downloadOlympicQuestionImage = tryCatch(async (req, res) => {
    const id = Number(req.body.id);
    if (!Number.isInteger(id)) return res.status(400).send("Invalid question id");

    const filePath = await OlympicQuestionService.getOlympicImagePath(id);
    if (!filePath) return res.status(404).send("File not found");
    fs.createReadStream(filePath).pipe(res);
});

const getReviewerOlympics = tryCatch(async (req, res) => {
    const userId = req.params.id;
    const reviewerOlympics = await revisorOlympicsService.findByUserId(userId);
    return res.status(200).json({ elements: reviewerOlympics });
});

const updateReviewerOlympics = tryCatch(async (req, res) => {
    const { userId, olympics } = req.body;

    const revisorOlympics = await revisorOlympicsService.replaceForUser(
        userId,
        olympics
    );

    return res.status(200).json({ elements: revisorOlympics });
});

const getMyReviewerOlympics = tryCatch(async (req, res) => {
    const reviewerOlympics = await revisorOlympicsService.findByUserId(req.user);
    return res.status(200).json({ elements: reviewerOlympics });
});

const updateMyReviewerOlympics = tryCatch(async (req, res) => {
    const { olympics } = req.body;
    if (!Array.isArray(olympics) || olympics.length === 0) {
        return res.status(400).json({ message: "Select at least one olympiad." });
    }

    const revisorOlympics = await revisorOlympicsService.replaceForUser(
        req.user,
        olympics
    );

    return res.status(200).json({ elements: revisorOlympics });
});
module.exports = {
    addOlympicQuestion,
    getAllOlympicQuestions,
    getEnrichedOlympicQuestions,
    getOwnOlympicQuestions,
    getOlympicQuestionsForValidation,
    getReviewScope,
    deleteOlympicQuestion,
    updateOlympicQuestion,
    validateOlympicQuestion,
    getAllValidatedOlympicQuestions,
    getOlympicTest,
    getOlympicTestOptions,
    downloadOlympicQuestionImage,
    getReviewerOlympics,
    updateReviewerOlympics,
    getMyReviewerOlympics,
    updateMyReviewerOlympics,
}
