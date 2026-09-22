const Position = require("../models/positionModel");

const findAll = async () => {
    try{
        return await Position.findAll({
            attributes: ['id', 'label']
        });
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

const findById = async (id) => {
    try{
        return await Position.findByPk(id, {
            attributes: ['id', 'label']
        });
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

module.exports = { findAll, findById };