const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Topic = db.define("platform__topic", {
  id: {
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
    //defaultValue: 3172,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = Topic;