const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const RevisorOlympics = db.define("revisor_olympics", {
  id: {
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  userFinalId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  id_olympic: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  freezeTableName: true,
});

module.exports = RevisorOlympics;
