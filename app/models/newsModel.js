const { Sequelize } = require('sequelize');
const db = require("../utils/db");

const News = db.define("platform_news", {
    id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    summary: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    link: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
    },
    isPublished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: false,
    freezeTableName: true,
});

module.exports = News;
