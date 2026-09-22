const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Olympic = db.define("olympics", {
  id: {
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  active: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  language: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  link: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: true,
  }
}, {
  timestamps: false,
  freezeTableName: true,
});

module.exports = Olympic;