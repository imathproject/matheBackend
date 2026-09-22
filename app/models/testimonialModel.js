const { Sequelize } = require("sequelize");
const db = require("../utils/db");

const Testimonial = db.define(
  "testimonials",
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    testimonial: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    validated: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    public: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Testimonial;
