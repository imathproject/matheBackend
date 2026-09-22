const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const OlympicAssessmentQuestion = db.define(
  "olympic_question_assessment",
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
    id_olympic_question: {
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

module.exports = OlympicAssessmentQuestion;
