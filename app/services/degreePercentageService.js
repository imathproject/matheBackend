const DegreePercentage = require("../models/degreePercentageModel");

const findAll = async () => {
    try{
        return await DegreePercentage.findAll({
            attributes: ['label', 'id']
        });
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

const findById = async (id) => {
    try {
        return await DegreePercentage.findByPk(id);
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

module.exports = {
    findAll,
    findById
};