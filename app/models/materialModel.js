const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const Material = db.define("platform_materials", {
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
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  author: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  link: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  languages: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  file_name: {
    type: Sequelize.INTEGER,
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
  clicks: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  topic: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  subtopic: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = Material;
