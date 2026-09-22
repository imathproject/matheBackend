const db = require("../utils/db");
const { Sequelize } = require("sequelize");

const TeachingTopics = db.define("teaching_topics", {
  userFinalId:    {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  platformTopicId:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  },{
  timestamps: false,
  freezeTableName: true,
});

module.exports = TeachingTopics;
