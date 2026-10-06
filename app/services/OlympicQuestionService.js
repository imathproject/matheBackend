const OlympicQuestion = require("../models/olympicQuestionsModel");
const OlympicAlternatives = require("../models/olympicAlternatives");
const Olympic = require("../models/olympicModel");
const OlympicLevel = require("../models/olympicLevelModel");
const OlympicPhase = require("../models/olympicPhaseModel");
const OlympicYear = require("../models/olympicYearModel");
const User = require("../models/userModel");
const OlympicKeyword = require("../models/olympicKeywordModel");
const OlympicQuestionAssesment = require("../models/olympicQuestionAssessmentModel");
const olympicKeywordService = require("./olympicKeywordService");
const getDate = require("../utils/date");
const db = require("../utils/db");
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const IMAGE_DIR = path.join(__dirname, "../../questionsImage");

const olympicFileName = (id, fileExt) =>
    fileExt && /^[A-Za-z0-9]{1,10}$/.test(String(fileExt)) ? `olympic${id}.${fileExt}` : null;

const deleteOlympicImage = (id, fileExt) => {
    const name = olympicFileName(id, fileExt);
    if (!name) return;

    try {
        const filePath = path.join(IMAGE_DIR, name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error) {
        console.error(`Could not remove the image of olympic question ${id}:`, error.message);
    }
};


const getOlympicImagePath = async (id) => {
    const question = await OlympicQuestion.findByPk(id, { attributes: ['id', 'file_ext'], raw: true });
    const name = question && olympicFileName(question.id, question.file_ext);
    if (!name) return null;

    const filePath = path.join(IMAGE_DIR, name);
    return fs.existsSync(filePath) ? filePath : null;
};

const MAX_ALTERNATIVES = 7;

// Accepts a plain string or { id, text }. Returns { id, text }, or null when
// the text is blank or not a string.
const normalizeAlternative = (item) => {
    const isObject = item !== null && typeof item === 'object';
    const text = isObject ? item.text : item;
    if (typeof text !== 'string' || text.trim() === '') return null;

    const id = isObject && item.id !== null && item.id !== undefined && item.id !== ''
        ? Number(item.id)
        : null;
    return { id: Number.isInteger(id) && id > 0 ? id : null, text };
};

// correctFirst: edit listings only. The forms treat index 0 as the correct
// alternative, so it goes first and the rest follow by id.
const mapAlternatives = (questions, correctFirst = false) => {
    return questions.map(q => {
        const plainQ = q.toJSON ? q.toJSON() : q;
        if (plainQ.alternatives) {
            if (correctFirst && Array.isArray(plainQ.alternatives)) {
                const correctId = plainQ.correctAnswerId;
                plainQ.alternatives = [...plainQ.alternatives].sort((a, b) => {
                    if (a.id === correctId) return -1;
                    if (b.id === correctId) return 1;
                    return a.id - b.id;
                });
            }
            delete plainQ.correctAnswerId;
        }
        if (Array.isArray(plainQ.keywords)) {
            plainQ.keywords = plainQ.keywords.map((k) => k.id);
        }
        return plainQ;
    });
};

const addNewOlympicQuestion = async (data) => {
    const date = getDate();
    try {
        const newQuestion = await OlympicQuestion.create({
            id_lect: data.id_lect,
            id_olympic: data.id_olympic,
            id_olympic_level: data.id_olympic_level,
            id_olympic_year: data.id_olympic_year,
            id_olympic_phase: data.id_olympic_phase,
            question: data.question,
            difficulty: data.difficulty ?? null,
            file_name: null,
            file_ext: data.file_ext || null,
            date: date,
            active: data.active || 0,
            validate: data.validate !== undefined ? data.validate : 0,
            correctAnswerId: null
        });

        let correctAltId = null;
        if (data.alternatives && data.alternatives.length > 0 && data.alternatives.length < 8) {
            for (let i = 0; i < data.alternatives.length; i++) {
                // Strings or { id, text }; any id is ignored on create.
                const normalized = normalizeAlternative(data.alternatives[i]);
                if (!normalized) continue;
                const alt = await OlympicAlternatives.create({ id_olympic_question: newQuestion.id, text: normalized.text });
                if (i === 0) {
                    correctAltId = alt.id;
                }
            }
        }

        const postCreate = {};
        if (correctAltId) postCreate.correctAnswerId = correctAltId;
        if (data.file_ext) postCreate.file_name = olympicFileName(newQuestion.id, data.file_ext);
        if (Object.keys(postCreate).length > 0) {
            await OlympicQuestion.update(postCreate, { where: { id: newQuestion.id } });
        }

        await olympicKeywordService.replaceForQuestion(newQuestion.id, data.keywords);

        return newQuestion.id;
    } catch (error) {
        console.error("Database error during question creation:", error.message);
        throw new Error("CREATION_FAILED");
    }
};

const getAllValidatedOlympicQuestions = async (id_olympic, id_olympic_phase, id_olympic_level, id_olympic_year) => {
    const whereClause = {
        id_olympic: id_olympic,
        active: 1,
        validate: 1,
    };
    if (id_olympic_phase) whereClause.id_olympic_phase = id_olympic_phase;
    if (id_olympic_level) whereClause.id_olympic_level = id_olympic_level;
    if (id_olympic_year) whereClause.id_olympic_year = id_olympic_year;

    const questions = await OlympicQuestion.findAll({
        where: whereClause,
        order: [['id', 'DESC']],
        include: [{ model: OlympicAlternatives, as: 'alternatives', separate: true, order: [['id', 'ASC']] }]
    });
    return mapAlternatives(questions);
}

const buildOlympicQuestionWhere = (filters) => {
    const {
        id_olympic,
        id_olympic_phase,
        id_olympic_level,
        id_olympic_year,
        validate,
        active
    } = filters;

    const whereClause = {};
    if (id_olympic) whereClause.id_olympic = id_olympic;

    if (id_olympic_phase) whereClause.id_olympic_phase = id_olympic_phase;
    if (id_olympic_level) whereClause.id_olympic_level = id_olympic_level;
    if (id_olympic_year) whereClause.id_olympic_year = id_olympic_year;
    if (validate !== undefined && validate !== null) whereClause.validate = validate;
    if (active !== undefined && active !== null) whereClause.active = active;

    return whereClause;
};

const enrichedIncludes = () => ([
    { model: Olympic, attributes: ['id', 'name'] },
    { model: OlympicLevel, attributes: ['id', 'level'] },
    { model: OlympicPhase, attributes: ['id', 'phase'] },
    { model: OlympicYear, attributes: ['id', 'year'] },
    { model: OlympicAlternatives, as: 'alternatives', separate: true, order: [['id', 'ASC']] },
    { model: User, as: 'Lecturer', attributes: ['id', 'name', 'surname'] },
    { model: OlympicKeyword, as: "keywords", attributes: ["id"], through: { attributes: [] } }
]);

const getEnrichedOlympicQuestions = async (filters) => {
    const questions = await OlympicQuestion.findAll({
        where: buildOlympicQuestionWhere(filters),
        order: [['id', 'ASC']],
        include: enrichedIncludes(),
    });
    return mapAlternatives(questions, true);
}

const getUserOlympicQuestions = async (filters, id_lect) => {
    const whereClause = buildOlympicQuestionWhere(filters);
    whereClause.id_lect = id_lect;

    const questions = await OlympicQuestion.findAll({
        where: whereClause,
        order: [['id', 'ASC']],
        include: enrichedIncludes(),
    });
    return mapAlternatives(questions, true);
}

const getOlympicQuestionOwner = async (id) => {
    return OlympicQuestion.findByPk(id, {
        attributes: ['id', 'id_lect', 'id_olympic', 'file_ext', 'validate'],
        raw: true,
    });
}

const getOlympicQuestionsForValidation = async (filters, id_lect, isAdmin, allowedOlympicIds) => {
    const whereClause = buildOlympicQuestionWhere({ ...filters, validate: 4 });

    if (!isAdmin) {
        const allowed = (allowedOlympicIds || []).map(Number);
        if (allowed.length === 0) return [];
        if (filters.id_olympic) {
            if (!allowed.includes(Number(filters.id_olympic))) return [];
        } else {
            whereClause.id_olympic = { [Sequelize.Op.in]: allowed };
        }
        whereClause.id_lect = { [Sequelize.Op.ne]: id_lect };
    }

    const questions = await OlympicQuestion.findAll({
        where: whereClause,
        order: [['id', 'ASC']],
        include: enrichedIncludes(),
    });
    return mapAlternatives(questions, true);
}

const getAllOlympicQuestions = async (id_olympic, id_olympic_phase, id_olympic_level, id_olympic_year, validate, active) => {
    const whereClause = {};
    if (id_olympic) whereClause.id_olympic = id_olympic;
    if (id_olympic_phase) whereClause.id_olympic_phase = id_olympic_phase;
    if (id_olympic_level) whereClause.id_olympic_level = id_olympic_level;
    if (id_olympic_year) whereClause.id_olympic_year = id_olympic_year;
    if (validate) whereClause.validate = validate;
    if (active) whereClause.active = active;

    const questions = await OlympicQuestion.findAll({
        where: whereClause,
        order: [['id', 'DESC']],
        include: [{ model: OlympicAlternatives, as: 'alternatives', separate: true, order: [['id', 'ASC']] }]
    });
    return mapAlternatives(questions);
};

const deleteOlympicQuestion = async (id, fileExt) => {
    await olympicKeywordService.deleteForQuestions([id]);

    const deletedRows = await OlympicQuestion.destroy({ where: { id: id } });
    if (deletedRows === 0) {
        throw new Error("QUESTION_NOT_FOUND");
    }

    deleteOlympicImage(id, fileExt);

    return { message: "Question deleted successfully" };
}

const updateOlympicQuestion = async (data, id, actingUserId, previousValidate) => {
    const date = getDate();
    const activeStatus = data.active !== undefined
        ? data.active
        : (data.validate === 1 ? 1 : 0);

    const updatePayload = {
        id_olympic: data.id_olympic,
        id_olympic_level: data.id_olympic_level,
        id_olympic_year: data.id_olympic_year,
        id_olympic_phase: data.id_olympic_phase,
        question: data.question,
        date: date,
        active: activeStatus,
        validate: data.validate !== undefined ? data.validate : 0
    };

    if (data.file_ext !== undefined) {
        updatePayload.file_ext = data.file_ext || null;
        updatePayload.file_name = olympicFileName(id, data.file_ext);
    }

    if (data.difficulty !== undefined) {
        updatePayload.difficulty = data.difficulty;
    }

    const verdict = Number(updatePayload.validate);
    if ([1, 2].includes(verdict) && verdict !== Number(previousValidate)) {
        updatePayload.validate_by = actingUserId;
        updatePayload.validate_date = date;
    }

    await db.transaction(async (transaction) => {
        const [updatedRows] = await OlympicQuestion.update(updatePayload, {
            where: { id: id },
            transaction
        });

        if (updatedRows === 0) {
            throw new Error("QUESTION_NOT_FOUND");
        }

        await syncAlternatives(id, data.alternatives, transaction);
    });

    // replaceForQuestion opens its own transaction.
    if (Array.isArray(data.keywords)) {
        await olympicKeywordService.replaceForQuestion(id, data.keywords);
    }

    return { message: "Question updated successfully" };
}

// Diffs the alternatives of a question against the payload, keeping the id of
// every alternative that still exists. Items are strings or { id, text }; the
// item at index 0 is the correct answer. A non-array payload changes nothing.
const syncAlternatives = async (id, alternatives, transaction) => {
    if (!Array.isArray(alternatives)) return;
    // Same limit as addNewOlympicQuestion, which also ignores the list silently.
    if (alternatives.length > MAX_ALTERNATIVES) return;

    const incoming = [];
    let correctIndex = -1;
    alternatives.forEach((item, index) => {
        const normalized = normalizeAlternative(item);
        if (!normalized) return;
        if (index === 0) correctIndex = incoming.length;
        incoming.push(normalized);
    });

    const existing = await OlympicAlternatives.findAll({
        where: { id_olympic_question: id },
        transaction
    });
    const existingById = new Map(existing.map((alt) => [alt.id, alt]));

    const keptIds = new Set();
    const resultIds = [];
    for (const item of incoming) {
        // Only ids of this question, used once per payload, keep their row.
        const current = item.id !== null && !keptIds.has(item.id) ? existingById.get(item.id) : null;
        if (current) {
            if (current.text !== item.text) {
                await current.update({ text: item.text }, { transaction });
            }
            keptIds.add(current.id);
            resultIds.push(current.id);
        } else {
            const created = await OlympicAlternatives.create(
                { id_olympic_question: id, text: item.text },
                { transaction }
            );
            resultIds.push(created.id);
        }
    }

    // Before the destroy: correctAnswerId may point to a row about to go.
    await OlympicQuestion.update(
        { correctAnswerId: correctIndex >= 0 ? resultIds[correctIndex] : null },
        { where: { id: id }, transaction }
    );

    const removedIds = existing.filter((alt) => !keptIds.has(alt.id)).map((alt) => alt.id);
    if (removedIds.length > 0) {
        await OlympicAlternatives.destroy({
            where: { id: removedIds, id_olympic_question: id },
            transaction
        });
    }
};



const validateOlympicQuestion = async (data, id, validatorId) => {
    const date = getDate();

    const updatePayload = {
        id_olympic: data.id_olympic,
        id_olympic_level: data.id_olympic_level,
        id_olympic_year: data.id_olympic_year,
        id_olympic_phase: data.id_olympic_phase,
        question: data.question,
        file_name: data.file_name,
        file_ext: data.file_ext,
        date: date,
        validate: data.validate,
        validate_by: validatorId,
        validate_date: date
    };

    if (data.difficulty !== undefined) {
        updatePayload.difficulty = data.difficulty;
    }

    await db.transaction(async (transaction) => {
        const [updatedRows] = await OlympicQuestion.update(updatePayload, {
            where: { id: id },
            transaction
        });

        if (updatedRows === 0) {
            throw new Error("QUESTION_NOT_FOUND");
        }

        await syncAlternatives(id, data.alternatives, transaction);
    });

    // replaceForQuestion opens its own transaction.
    if (Array.isArray(data.keywords)) {
        await olympicKeywordService.replaceForQuestion(id, data.keywords);
    }

    return { message: "Question validated successfully" };
}

const getOlympicTest = async (id_olympic, id_olympic_phase, id_olympic_level, id_olympic_year = null) => {
    const total = 5;
    const whereClause = {
        id_olympic: id_olympic,
        id_olympic_phase: id_olympic_phase,
        id_olympic_level: id_olympic_level,
        active: 1,
        validate: 1,
    };
    if (id_olympic_year) {
        whereClause.id_olympic_year = id_olympic_year;
    }
    const questions = await OlympicQuestion.findAll({
        where: whereClause,
        attributes: { exclude: ['difficulty'] },
        order: Sequelize.literal('RAND()'),
        limit: total,
        include: [
            { model: Olympic, attributes: ['id', 'name'] },
            { model: OlympicLevel, attributes: ['id', 'level'] },
            { model: OlympicPhase, attributes: ['id', 'phase'] },
            { model: OlympicYear, attributes: ['id', 'year'] },
            { model: OlympicAlternatives, as: 'alternatives', separate: true, order: [['id', 'ASC']] }
        ],
    });
    if (questions) {
        return mapAlternatives(questions);
    }
}

const getOlympicTestOptions = async (id_olympic) => {
    return OlympicQuestion.findAll({
        attributes: ['id_olympic_level', 'id_olympic_phase', 'id_olympic_year'],
        where: {
            id_olympic: id_olympic,
            active: 1,
            validate: 1,
        },
        group: ['id_olympic_level', 'id_olympic_phase', 'id_olympic_year'],
        raw: true,
    });
}

// Project Information reports: body filters ({ olympic, level, phase, year })
// to the names buildOlympicQuestionWhere expects.
const informationWhere = ({ olympic, level, phase, year } = {}) => buildOlympicQuestionWhere({
    id_olympic: olympic,
    id_olympic_level: level,
    id_olympic_phase: phase,
    id_olympic_year: year
});

// enrichedIncludes() without the alternatives (never exported, D6) and with
// the validator and the keyword names.
const informationIncludes = (withKeywords) => {
    const includes = enrichedIncludes()
        .filter((include) => !["alternatives", "keywords"].includes(include.as));

    includes.push({ model: User, as: 'Validator', attributes: ['id', 'name', 'surname'] });
    if (withKeywords) {
        includes.push({ model: OlympicKeyword, as: "keywords", attributes: ["id", "name"], through: { attributes: [] } });
    }
    return includes;
};

const fullName = (user) =>
    user ? [user.name, user.surname].filter(Boolean).join(" ") : null;

// { [id_olympic_question]: rows } for a model that points to the question.
const countByQuestion = async (model, questionIds) => {
    const rows = await model.findAll({
        attributes: ['id_olympic_question', [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']],
        where: { id_olympic_question: questionIds },
        group: ['id_olympic_question'],
        raw: true,
    });

    return rows.reduce((counts, row) => {
        counts[row.id_olympic_question] = Number(row.total);
        return counts;
    }, {});
};

const getAllOlympicQuestionsInfo = async (filters) => {
    const questions = await OlympicQuestion.findAll({
        where: informationWhere(filters),
        attributes: ['id', 'question', 'difficulty', 'validate', 'active', 'date'],
        order: [['id', 'ASC']],
        include: informationIncludes(true),
    });

    if (!questions || questions.length === 0) return [];

    const ids = questions.map((question) => question.id);
    const [alternatives, answers] = await Promise.all([
        countByQuestion(OlympicAlternatives, ids),
        countByQuestion(OlympicQuestionAssesment, ids),
    ]);

    return questions.map((question) => {
        const data = question.get({ plain: true });

        return {
            id: data.id,
            question: data.question,
            Olympiad: data.olympic ? data.olympic.name : null,
            Level: data.olympic_level ? data.olympic_level.level : null,
            Phase: data.olympic_phase ? data.olympic_phase.phase : null,
            Year: data.olympic_year ? data.olympic_year.year : null,
            Difficulty: data.difficulty,
            validate: data.validate,
            active: data.active,
            date: data.date,
            Author: fullName(data.Lecturer),
            Validator: fullName(data.Validator),
            Keywords: (data.keywords || []).map((keyword) => keyword.name).join(", "),
            countAlternatives: alternatives[data.id] || 0,
            countAnswers: answers[data.id] || 0,
        };
    });
};

const getOlympicValidationInfo = async (filters) => {
    const questions = await OlympicQuestion.findAll({
        where: informationWhere(filters),
        attributes: ['id', 'question', 'validate', 'validate_date'],
        order: [['id', 'ASC']],
        include: informationIncludes(false),
    });

    if (!questions || questions.length === 0) return [];

    return questions.map((question) => {
        const data = question.get({ plain: true });

        return {
            id: data.id,
            Olympiad: data.olympic ? data.olympic.name : null,
            Level: data.olympic_level ? data.olympic_level.level : null,
            Phase: data.olympic_phase ? data.olympic_phase.phase : null,
            Year: data.olympic_year ? data.olympic_year.year : null,
            Author: fullName(data.Lecturer),
            Validator: fullName(data.Validator),
            validate: data.validate,
            validate_date: data.validate_date,
            question: data.question,
        };
    });
};

module.exports = {
    informationWhere,
    getAllOlympicQuestionsInfo,
    getOlympicValidationInfo,
    addNewOlympicQuestion,
    getAllOlympicQuestions,
    getEnrichedOlympicQuestions,
    getUserOlympicQuestions,
    getOlympicQuestionOwner,
    getOlympicQuestionsForValidation,
    deleteOlympicQuestion,
    updateOlympicQuestion,
    validateOlympicQuestion,
    getAllValidatedOlympicQuestions,
    getOlympicTest,
    getOlympicTestOptions,
    getOlympicImagePath
}