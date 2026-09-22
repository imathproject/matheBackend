const Gender = require("../models/genderModel");

const findAll = async () => {
    try{
        return await Gender.findAll({
            attributes: ['id', 'label']
        });
    }catch(err){
        throw { kind: "error", detail: err.message };
    }

};

const findById = async (id) => {
    try{
        return await Gender.findByPk(id);
    }catch(err){
        throw { kind: "error", detail: err.message };
    }
};

module.exports = { findAll, findById };