const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const OlympicLevel = db.define("olympic_levels", {
  id: {
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  id_olympic: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  level: {
    type: Sequelize.STRING,
    allowNull: false,
  }
  
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = OlympicLevel;