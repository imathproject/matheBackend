const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Subtopic = db.define("platform__subtopic", {
  id: {
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  id_top: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = Subtopic;