const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const OlympicPhase = db.define("olympic_phases", {
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
  phase: {
    type: Sequelize.STRING,
    allowNull: false,
  }
  
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = OlympicPhase;