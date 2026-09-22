const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Competition = db.define("competitions", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    localization: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    topic: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    subtopic: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    numberOfQuestions: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    maxDuration: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('created', 'started', 'paused', 'finished'),
        allowNull: false,
        defaultValue: 'created'
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

module.exports = Competition;