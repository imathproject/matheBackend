const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const User = db.define("user_final", {
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
  surname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  typology: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  profile: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  university: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  uni_degree: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  degree_percentage: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  uni_courses: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  field_research: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  subject_taught: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  years_of_experience: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  checkcode: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  verifyEmail: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  completeProfile: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  privacy: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  ban: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  gender: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  birth_year: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  study_country:{
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  work:{
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  student_work: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  learning:{
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  teaching:{
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  hobbies:{
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  enjoy_math:{
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  position: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  scopus: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  orcid: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  recoverPass:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  guardian_name:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  guardian_email:{
    type: Sequelize.STRING,
    allowNull: true,
  }
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = User;