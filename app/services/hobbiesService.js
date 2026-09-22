const Hobbies = require("../models/hobbiesModel");

const findAll = async () => {
    return await Hobbies.findAll({
        attributes: ['id', 'label']
    });
};

const findById = async (id) => {
    return await Hobbies.findByPk(id);
};

module.exports = { findAll, findById };