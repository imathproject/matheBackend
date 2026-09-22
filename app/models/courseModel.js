const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Course = db.define("platform__course", {
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

module.exports = Course;