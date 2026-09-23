const multer = require("multer");
const path = require("path");

const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg"]);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const ROOT_DIR = path.join(__dirname, "..");

module.exports = (destination, name) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(ROOT_DIR, destination)),
        filename: (req, file, cb) => cb(null, path.basename(name || file.originalname)),
    });

    const fileFilter = (req, file, cb) => {
        const ext = path.extname(name || file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            const err = new Error("Unsupported file type");
            err.kind = "invalid_input";
            return cb(err);
        }
        cb(null, true);
    };

    return (req, res) =>
        new Promise((resolve, reject) => {
            multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE_BYTES } }).single("file")(req, res, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
};
