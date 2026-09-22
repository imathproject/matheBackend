const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const OlympicQuestion = db.define("olympic_questions", {
  id: {//Adicionar validação igual do question normal
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  id_lect: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  id_olympic: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  id_olympic_level: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  id_olympic_year: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  id_olympic_phase: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  question: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  correctAnswerId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  file_name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  file_ext: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  active: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  validate: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  validate_date: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  validate_by: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: false,
  freezeTableName: true,
});

module.exports = OlympicQuestion;