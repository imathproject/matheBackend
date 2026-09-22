const Work = require("../models/workModel");

const findAll = async () => {
    try{
        return await Work.findAll();
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }
};

const findById = async (id) => {
    try{
        return await Work.findByPk(id);
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }
};

module.exports = { findAll, findById };