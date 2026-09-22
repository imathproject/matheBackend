const Course = require("../models/courseModel");

const findAll = async () => {
    try{
        return await Course.findAll({
            attributes: ['id', 'label'],
            order: [["label", "ASC"]]
        });
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

const findById = async (id) => {
    try{
        return await Course.findByPk(id);
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }
};

module.exports = { findAll, findById };