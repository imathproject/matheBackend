const NewsService = require("../services/newsService");
const { tryCatch } = require("../utils/tryCatch");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const getNews = tryCatch(async (req, res) => {
    const { id } = req.params;
    const news = await NewsService.getNews(id);
    return res.status(200).json({ element: news });
});

const getAllNews = tryCatch(async (req, res) => {
    const { page = 1, limit = 9 } = req.query;
    const result = await NewsService.getAllNews(page, limit);
    return res.status(200).json({ 
        elements: result.news, 
        totalItems: result.totalItems, 
        totalPages: result.totalPages, 
        currentPage: result.currentPage 
    });
});

const getAllNewsAdmin = tryCatch(async (req, res) => {
    const news = await NewsService.getAllNewsAdmin();
    return res.status(200).json({ elements: news });
});

const addNewNews = tryCatch(async (req, res) => {
    const newNews = await NewsService.addNewNews(req.body);
    return res.status(201).json({ element: newNews });
});

const updateNews = tryCatch(async (req, res) => {
    const result = await NewsService.updateNews(req.body);
    return res.status(200).json(result);
});

const deleteNews = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await NewsService.deleteNews(id);
    return res.status(200).json(result);
});

// Image upload via multer — saves to newsImage/ folder
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "newsImage");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: imageStorage });

const uploadNewsImage = tryCatch(async (req, res) => {
    await new Promise((resolve, reject) => {
        upload.single("file")(req, res, (err) => {
            if (err) {
                console.error("Error uploading file:", err);
                reject(err);
                return;
            }
            resolve();
        });
    });
    res.status(200).json({ message: "File uploaded successfully" });
});

const downloadNewsImage = tryCatch(async (req, res) => {
    const { id, file_ext } = req.body;
    const filePath = path.join(
        __dirname,
        "../../newsImage/" + id + "." + file_ext
    );
    if (fs.existsSync(filePath)) {
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        return res.status(404).send("File not found");
    }
});

module.exports = {
    getNews,
    getAllNews,
    getAllNewsAdmin,
    addNewNews,
    updateNews,
    deleteNews,
    uploadNewsImage,
    downloadNewsImage,
};
