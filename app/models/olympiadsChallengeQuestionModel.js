const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const OlympiadsChallengeQuestion = db.define(
    "olympiads_challenge_question",
    {
        id: {
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        olympiads_challenge_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        id_olympic_question: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        question_order: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        answer: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        duration: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        option_selected: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = OlympiadsChallengeQuestion;
