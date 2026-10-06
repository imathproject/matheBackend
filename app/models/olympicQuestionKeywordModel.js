const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const OlympicQuestionKeyword = db.define("olympic_question_keywords", {
    id_olympic_question: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    id_olympic_keyword: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    freezeTableName: true,
});

module.exports = OlympicQuestionKeyword;
