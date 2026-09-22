const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const University = db.define(
  "platform__university",
  {
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
    country: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    latitude: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    longitude: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    validated: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    suggested_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = University;
