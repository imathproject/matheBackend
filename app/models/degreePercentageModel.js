const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const DegreePercentage = db.define("platform__percentage_degree", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    label: {
        type: Sequelize.STRING,
        allowNull: false,
    }
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = DegreePercentage;