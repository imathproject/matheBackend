const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const OlympicKeyword = db.define("olympic_keywords", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    freezeTableName: true,
});

module.exports = OlympicKeyword;
