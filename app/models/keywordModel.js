const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Keyword = db.define("platform__keywords", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    id_top: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    id_sub	: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = Keyword;