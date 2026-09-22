const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const StudentWork = db.define("studentwork_preference", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    label: {
        type: Sequelize.STRING,
        allowNull: false,
    }
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = StudentWork;