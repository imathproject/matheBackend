const keyword = require("../controllers/keywordController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", verifyRoles(ADMIN), keyword.findById); //IPB: Provavelmente para eliminar
router.get("/getAll", verifyRoles(ADMIN), keyword.findAll); //IPB: Provavelmente para eliminar
router.post("/keywordsInformation", verifyRoles(ADMIN), keyword.getAllKeywordsInfo);
router.get("/getByTopic/:topic", verifyRoles(ADMIN), keyword.findByTopic); //IPB: Provavelmente para eliminar
router.get("/getBySubtopic/:subtopic", verifyRoles(ADMIN), keyword.findBySubtopic); //IPB: Provavelmente para eliminar
router.get("/getKeysByTopic/:topic", keyword.findKeysByTopic);
router.get("/getKeysBySubtopic/:subtopic", verifyRoles(ADMIN), keyword.findKeysBySubtopic);
router.get("/getKeysEditByTopic/:topic", verifyRoles(ADMIN), keyword.findEditByTopic);
router.get("/getKeysEditBySubtopic/:subtopic", verifyRoles(ADMIN), keyword.findEditBySubtopic);
router.get("/delete/:id", verifyRoles(ADMIN), keyword.deleteKeyword);
router.post("/add", verifyRoles(ADMIN), keyword.addKeyword);
router.post("/update", verifyRoles(ADMIN), keyword.updateKeyword);
router.post("/updateInBulk", verifyRoles(ADMIN), keyword.updateInBulk);

module.exports = router;
