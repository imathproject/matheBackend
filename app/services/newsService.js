const News = require("../models/newsModel");

const getNews = async (id) => {
    const news = await News.findOne({ where: { id: id } });
    if (!news) {
        throw new Error("NEWS_NOT_FOUND");
    }
    return news;
};

const getAllNews = async (page = 1, limit = 9) => {
    const offset = (page - 1) * limit;
    const { count, rows: news } = await News.findAndCountAll({
        where: { isPublished: true },
        order: [["publishedAt", "DESC"]],
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
    });
    return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page, 10),
        news
    };
};

const getAllNewsAdmin = async () => {
    const news = await News.findAll({
        order: [["publishedAt", "DESC"]],
    });
    return news;
};

const addNewNews = async (data) => {
    const newNews = await News.create({
        title: data.title,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl,
        link: data.link,
        publishedAt: data.publishedAt || new Date(),
        isPublished: data.isPublished || false,
    });
    return newNews;
};

const updateNews = async (data) => {
    const [rowsUpdated] = await News.update({
        title: data.title,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl,
        link: data.link,
        publishedAt: data.publishedAt,
        isPublished: data.isPublished,
    }, {
        where: { id: data.id },
    });
    if (rowsUpdated === 0) {
        throw new Error("NEWS_NOT_FOUND");
    }
    return { message: "News updated successfully" };
};

const deleteNews = async (id) => {
    const deletedRows = await News.destroy({ where: { id: id } });
    if (deletedRows === 0) {
        throw new Error("NEWS_NOT_FOUND");
    }
    return { message: "News deleted successfully" };
};

module.exports = {
    getNews,
    getAllNews,
    getAllNewsAdmin,
    addNewNews,
    updateNews,
    deleteNews,
};
