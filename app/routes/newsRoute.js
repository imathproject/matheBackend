const news = require("../controllers/newsController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const verify = require("../../middleware/verifyAuth");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", news.getNews);                                                          // Public
router.get("/getAll", news.getAllNews);                                                              // Public
router.get("/getAll/admin", verify.authenticateToken, verifyRoles(ADMIN), news.getAllNewsAdmin); // Admin
router.post("/add", verify.authenticateToken, verifyRoles(ADMIN), news.addNewNews);     // Admin
router.put("/update", verify.authenticateToken, verifyRoles(ADMIN), news.updateNews);   // Admin
router.delete("/delete/:id", verify.authenticateToken, verifyRoles(ADMIN), news.deleteNews); // Admin
router.post("/uploadImage", verify.authenticateToken, verifyRoles(ADMIN), news.uploadNewsImage); // Admin
router.post("/downloadImage", news.downloadNewsImage);                                               // Public

module.exports = router;
