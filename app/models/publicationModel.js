const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const Publication = db.define(
  "publications",
  {
    id: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    link: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    authors: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    itemOrder: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Publication;
