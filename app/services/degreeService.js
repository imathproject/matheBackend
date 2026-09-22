const Degree = require("../models/degreeModel");
const {Sequelize} = require("sequelize");

const findAll = async () => {
    try{
        const desiredOrder = [1, 2, 3, 7, 4, 5, 6];

        return await Degree.findAll({
            attributes: ['label', 'id'],
            order: [
                Sequelize.fn('FIELD', Sequelize.col('id'), ...desiredOrder)
            ]
        });
    }catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

const findById = async (id) => {
    try{
        return await Degree.findByPk(id);
    }catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

const findTeacherDegrees = async () => {
    try{
        const ids = [3, 7, 4, 5];

        return await Degree.findAll({
            attributes: ['label', 'id'],
            where: {
                id: ids
            },
            order: [
                Sequelize.fn('FIELD', Sequelize.col('id'), ...ids)
            ]
        });
    }catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

module.exports = {
    findAll,
    findById,
    findTeacherDegrees
};