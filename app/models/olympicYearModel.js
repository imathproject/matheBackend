const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const OlympicYear = db.define("olympic_years", {
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
  year: { 
    // Para adicionar uma questão escolheria a olimpiada, o nível, o ano e a fase, mas não sei se as olimpiadas são divididas por ano ou podem ter mais de uma por ano.
    type: Sequelize.STRING,
    allowNull: false,
  }
  
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = OlympicYear;