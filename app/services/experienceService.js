const Experience = require("../models/experienceModel");

const findAll = async () => {
    try{
        return await Experience.findAll({
            attributes: ['id', 'label']
        });
    } catch(err){
        throw { kind: "error", detail: err.message };
    }

};

const findById = async (id) => {
    try{
        return await Experience.findByPk(id);
    } catch(err){
        throw { kind: "error", detail: err.message };
    }
};

module.exports = { findAll, findById };