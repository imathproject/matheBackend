const { Sequelize } = require('sequelize');
const db = require("../utils/db");

/**
 * Sequelize model for the `countries` table.
 *
 * @typedef {Object} Country
 * @property {number} id - Unique identifier (auto increment)
 * @property {string} name - Country name
 * @property {string} alpha_2 - ISO 3166-1 alpha-2 country code
 */
const Country = db.define("countries", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    alpha_2: {
        type: Sequelize.STRING,
        allowNull: false,
    },
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = Country;