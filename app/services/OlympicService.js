const OlympicYear = require("../models/olympicYearModel");
const OlympicPhase = require("../models/olympicPhaseModel");
const OlympicLevel = require("../models/olympicLevelModel");
const Olympic = require("../models/olympicModel");
const OlympicQuestion = require("../models/olympicQuestionsModel");
const OlympicQuestionAssesment = require("../models/olympicQuestionAssessmentModel");
const OlympicAlternatives = require("../models/olympicAlternatives");
const db = require("../utils/db");
const Sequelize = require("sequelize");

const deleteQuestionsHelper = async (whereClause, transaction) => {
    const questions = await OlympicQuestion.findAll({ where: whereClause, transaction });
    if (questions.length > 0) {
        const questionIds = questions.map(q => q.id);
        // Break circular references by setting correctAnswerId to null
        await OlympicQuestion.update({ correctAnswerId: null }, { where: whereClause, transaction });
        // Delete student assessments/answers
        await OlympicQuestionAssesment.destroy({ where: { id_olympic_question: questionIds }, transaction });
        // Delete alternatives
        await OlympicAlternatives.destroy({ where: { id_olympic_question: questionIds }, transaction });
        // Delete the questions
        await OlympicQuestion.destroy({ where: whereClause, transaction });
    }
};

//Olympic operations
const getOlympic = async (id) => {
    const olympic = await Olympic.findOne({
        where: { id: id }
    });
    if (!olympic) {
        throw new Error("not_found");
    }
    return olympic;

}
const getAllOlympicsEnriched = async () => {
    const olympics = await Olympic.findAll({
        attributes: [
            ['name', 'label'],
            'id',
            'language',
            'link',
            'imageUrl',
            [Sequelize.literal('(SELECT COUNT(*) FROM olympic_questions WHERE olympic_questions.id_olympic = olympics.id)'), 'questionCount']
        ],
        order: [['name', 'ASC']],
        where: { active: 1 }
    });
    return olympics;
}

const getAllOlympics = async () => {
    const olympics = await Olympic.findAll({
        attributes: [['name', 'label'], 'id', 'language', 'link', 'imageUrl'],
        order: [['name', 'ASC']],
        where: { active: 1 }
    });
    return olympics;
}

const deleteOlympic = async (id) => {
    return await db.transaction(async (t) => {
        await deleteQuestionsHelper({ id_olympic: id }, t);
        await OlympicLevel.destroy({ where: { id_olympic: id }, transaction: t });
        await OlympicYear.destroy({ where: { id_olympic: id }, transaction: t });
        await OlympicPhase.destroy({ where: { id_olympic: id }, transaction: t });
        const deletedRows = await Olympic.destroy({
            where: { id: id },
            transaction: t
        });
        if (deletedRows === 0) {
            throw new Error("not_found");
        }
        return { message: "Olympic deleted successfully" };
    });
}

const addNewOlympic = async (data) => {
    const newOlympic = await Olympic.create({
        name: data.name,
        active: data.active,
        language: data.language,
        link: data.link,
        imageUrl: data.imageUrl
    });
    return newOlympic;
}

const updateOlympic = async (data) => {
    const olympic = await Olympic.findByPk(data.id);
    if (!olympic) {
        throw new Error("not_found");
    }
    await Olympic.update({
        name: data.name,
        active: data.active,
        language: data.language,
        link: data.link,
        imageUrl: data.imageUrl
    }, {
        where: { id: data.id }
    });
    return { message: "Olympic updated successfully" };
}

//Olympic Levels
const getOlympicLevel = async (id) => {
    const level = await OlympicLevel.findOne({
        where: { id: id }
    });
    if (!level) {
        throw new Error("OLYMPIC_LEVEL_NOT_FOUND");
    }
    return level;
};

const addNewOlympicLevel = async (data) => {
    const newOlympicLevel = await OlympicLevel.create({
        id_olympic: data.id_olympic,
        level: data.level
    });
    return newOlympicLevel;
};

const getAllOlympicLevels = async (id_olympic) => {
    const levels = await OlympicLevel.findAll({
        attributes: [['level', 'label'], 'id'],
        order: [['level', 'ASC']],
        where: { id_olympic: id_olympic }
    });
    return levels;
};

const updateOlympicLevel = async (data) => {
    const level = await OlympicLevel.findByPk(data.id);
    if (!level) {
        throw new Error("OLYMPIC_LEVEL_NOT_FOUND");
    }
    await OlympicLevel.update({
        level: data.level
    }, {
        where: { id: data.id }
    });
    return { message: "Olympic Level updated successfully" };
};

const deleteOlympicLevel = async (id) => {
    return await db.transaction(async (t) => {
        await deleteQuestionsHelper({ id_olympic_level: id }, t);
        const deletedRows = await OlympicLevel.destroy({
            where: { id: id },
            transaction: t
        });
        if (deletedRows === 0) {
            throw new Error("OLYMPIC_LEVEL_NOT_FOUND");
        }
        return { message: "Olympic Level deleted successfully" };
    });
};

//Olympic Year

const addNewOlympicYear = async (data) => {
    const newOlympicYear = await OlympicYear.create({
        id_olympic: data.id_olympic,
        year: data.year
    });
    return newOlympicYear;
}

const getOlympicYear = async (id) => {
    const year = await OlympicYear.findOne({
        where: { id: id }
    });
    if (!year) {
        throw new Error("OLYMPIC_YEAR_NOT_FOUND");
    }
    return year;
}

const getAllOlympicYears = async (id_olympic) => {
    const years = await OlympicYear.findAll({
        attributes: [['year', 'label'], 'id'],
        order: [['year', 'ASC']],
        where: { id_olympic: id_olympic }
    });
    return years;
}

const updateOlympicYear = async (data) => {
    const year = await OlympicYear.findByPk(data.id);
    if (!year) {
        throw new Error("OLYMPIC_YEAR_NOT_FOUND");
    }
    await OlympicYear.update({
        year: data.year
    }, {
        where: { id: data.id }
    });
    return { message: "Olympic Year updated successfully" };
}

const deleteOlympicYear = async (id) => {
    return await db.transaction(async (t) => {
        await deleteQuestionsHelper({ id_olympic_year: id }, t);
        const deletedRows = await OlympicYear.destroy({
            where: { id: id },
            transaction: t
        });
        if (deletedRows === 0) {
            throw new Error("OLYMPIC_YEAR_NOT_FOUND");
        }
        return { message: "Olympic Year deleted successfully" };
    });
}

//Olympic Phase
const addNewOlympicPhase = async (data) => {
    const newOlympicPhase = await OlympicPhase.create({
        id_olympic: data.id_olympic,
        phase: data.phase
    });
    return newOlympicPhase;
}

const getOlympicPhase = async (id) => {
    const phase = await OlympicPhase.findOne({
        where: { id: id }
    });
    if (!phase) {
        throw new Error("OLYMPIC_PHASE_NOT_FOUND");
    }
    return phase;
}

const getAllOlympicPhases = async (id_olympic) => {
    const phases = await OlympicPhase.findAll({
        attributes: [['phase', 'label'], 'id'],
        order: [['phase', 'ASC']],
        where: { id_olympic: id_olympic }
    });
    return phases;
}

const updateOlympicPhase = async (data) => {
    const phase = await OlympicPhase.findByPk(data.id);
    if (!phase) {
        throw new Error("OLYMPIC_PHASE_NOT_FOUND");
    }
    await OlympicPhase.update({
        phase: data.phase
    }, {
        where: { id: data.id }
    });
    return { message: "Olympic Phase updated successfully" };
}

const deleteOlympicPhase = async (id) => {
    return await db.transaction(async (t) => {
        await deleteQuestionsHelper({ id_olympic_phase: id }, t);
        const deletedRows = await OlympicPhase.destroy({
            where: { id: id },
            transaction: t
        });
        if (deletedRows === 0) {
            throw new Error("OLYMPIC_PHASE_NOT_FOUND");
        }
        return { message: "Olympic Phase deleted successfully" };
    });
}

module.exports = {
    getOlympic,
    addNewOlympic,
    getAllOlympics,
    deleteOlympic,
    updateOlympic,
    getAllOlympicsEnriched,

    getOlympicLevel,
    addNewOlympicLevel,
    getAllOlympicLevels,
    updateOlympicLevel,
    deleteOlympicLevel,

    addNewOlympicYear,
    getOlympicYear,
    getAllOlympicYears,
    updateOlympicYear,
    deleteOlympicYear,

    addNewOlympicPhase,
    getOlympicPhase,
    getAllOlympicPhases,
    updateOlympicPhase,
    deleteOlympicPhase
}