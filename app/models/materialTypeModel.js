const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const MaterialType = db.define("material_type", {
  id: {
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  description:{
    type: Sequelize.STRING,
    allowNull: false,
  },
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = MaterialType;