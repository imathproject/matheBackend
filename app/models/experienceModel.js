const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Experience = db.define("teacher_experience", {
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

module.exports = Experience;