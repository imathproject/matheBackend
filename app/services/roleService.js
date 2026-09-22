const Role = require("../models/roleModel");
const { Sequelize } = require("sequelize");


const findAll = async () => {
    try{
        return await Role.findAll({
            attributes: ["id", ["description", "label"]],
            order: [[Sequelize.fn("TRIM", Sequelize.col("description")), "ASC"]],
        });
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

const findById = async (id) => {
    try{
        return await Role.findByPk(id, {
            attributes: ['id', ["description", "label"]]
        });
    } catch (err) {
        throw { kind: "error", detail: err.message };
    }

};

module.exports = { findAll, findById };