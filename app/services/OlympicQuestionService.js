const OlympicQuestion = require("../models/olympicQuestionsModel");
const OlympicAlternatives = require("../models/olympicAlternatives");
const Olympic = require("../models/olympicModel");
const OlympicLevel = require("../models/olympicLevelModel");
const OlympicPhase = require("../models/olympicPhaseModel");
const OlympicYear = require("../models/olympicYearModel");
const User = require("../models/userModel");
const getDate = require("../utils/date");
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

const mapAlternatives = (questions) => {
    return questions.map(q => {
        const plainQ = q.toJSON ? q.toJSON() : q;
        if (plainQ.alternatives) {
            delete plainQ.correctAnswerId;
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
                const altText = data.alternatives[i];
                if (!altText || altText.trim() === '') continue;
                const alt = await OlympicAlternatives.create({ id_olympic_question: newQuestion.id, text: altText });
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
    { model: User, as: 'Lecturer', attributes: ['id', 'name', 'surname'] }
]);

const getEnrichedOlympicQuestions = async (filters) => {
    const questions = await OlympicQuestion.findAll({
        where: buildOlympicQuestionWhere(filters),
        order: [['id', 'ASC']],
        include: enrichedIncludes(),
    });
    return mapAlternatives(questions);
}

const getOwnOlympicQuestions = async (filters, id_lect) => {
    const whereClause = buildOlympicQuestionWhere(filters);
    whereClause.id_lect = id_lect;

    const questions = await OlympicQuestion.findAll({
        where: whereClause,
        order: [['id', 'ASC']],
        include: enrichedIncludes(),
    });
    return mapAlternatives(questions);
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
    return mapAlternatives(questions);
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

    const verdict = Number(updatePayload.validate);
    if ([1, 2].includes(verdict) && verdict !== Number(previousValidate)) {
        updatePayload.validate_by = actingUserId;
        updatePayload.validate_date = date;
    }

    const [updatedRows] = await OlympicQuestion.update(updatePayload, {
        where: { id: id }
    });

    if (updatedRows === 0) {
        throw new Error("QUESTION_NOT_FOUND");
    }

    await recreateAlternatives(id, data.alternatives);

    return { message: "Question updated successfully" };
}

const recreateAlternatives = async (id, alternatives) => {
    await OlympicAlternatives.destroy({ where: { id_olympic_question: id } });
    let correctAltId = null;
    if (alternatives && alternatives.length > 0) {
        for (let i = 0; i < alternatives.length; i++) {
            const altText = alternatives[i];
            if (!altText || altText.trim() === '') continue;
            const alt = await OlympicAlternatives.create({ id_olympic_question: id, text: altText });
            if (i === 0) {
                correctAltId = alt.id;
            }
        }
    }

    if (correctAltId) {
        await OlympicQuestion.update({ correctAnswerId: correctAltId }, { where: { id: id } });
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

    const [updatedRows] = await OlympicQuestion.update(updatePayload, {
        where: { id: id }
    });

    if (updatedRows === 0) {
        throw new Error("QUESTION_NOT_FOUND");
    }

    await recreateAlternatives(id, data.alternatives);

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

module.exports = {
    addNewOlympicQuestion,
    getAllOlympicQuestions,
    getEnrichedOlympicQuestions,
    getOwnOlympicQuestions,
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