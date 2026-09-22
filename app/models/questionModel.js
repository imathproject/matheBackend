const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Question = db.define("platform__sna__questions", {
  id: {
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  id_lect: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  topic: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  subtopic:{
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  question: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  answer1:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  answer2:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  answer3:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  answer4:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  file_name:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  file_ext:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  date:{
    type: Sequelize.DATE,
    allowNull: true,
  },
  validate:{
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  validate_date:{
    type: Sequelize.DATE,
    allowNull: true,
  },
  validate_by:{
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  newLevel:{
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  algorithmLevel	:{
    type: Sequelize.INTEGER,
    allowNull: true,
  }
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = Question;