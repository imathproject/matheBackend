const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Token = db.define("refresh_token", {
 id: {
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    type: Sequelize.INTEGER,
},
  token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  }
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = Token;