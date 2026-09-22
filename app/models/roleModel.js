const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const Role = db.define("roles", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    }
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = Role;