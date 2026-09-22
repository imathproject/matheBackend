const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const OlympicAlternatives = db.define("olympic_alternatives", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    id_olympic_question: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    text: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
}, {
    timestamps: false,
    freezeTableName: true,
});

module.exports = OlympicAlternatives;