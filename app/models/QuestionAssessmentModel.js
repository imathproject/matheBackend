const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const AssessmentQuestions = db.define(
  "assessment",
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    question_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    topic: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    subtopic: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    question_level: {
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

module.exports = AssessmentQuestions;
