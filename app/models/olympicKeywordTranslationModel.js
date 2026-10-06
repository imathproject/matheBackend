const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const OlympicKeywordTranslation = db.define("olympic_keyword_translations", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    id_olympic_keyword: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    language: {
        type: Sequelize.STRING(5),
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    freezeTableName: true,
});

module.exports = OlympicKeywordTranslation;
