const Learning = require("../models/learningModel");

const findAll = async () => {
    try{
        return await Learning.findAll({
            attributes: ['id', 'label']
        });
    }
    catch(err){
        throw { kind: "error", detail: err.message };
    }

};

const findById = async (id) => {
    try{
        return await Learning.findByPk(id, {
            attributes: ['id', 'label']
        });
    }
    catch(err){
        throw { kind: "error", detail: err.message };
    }

};

module.exports = { findAll, findById };