const position = require("../controllers/positionController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { CONTENT_MANAGER, ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", verifyRoles(ADMIN), position.findById);
router.get("/getAll", verifyRoles(CONTENT_MANAGER), position.findAll);

module.exports = router;
