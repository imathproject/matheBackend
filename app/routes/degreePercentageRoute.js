const degreePercentage = require("../controllers/degreePercentageController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", verifyRoles(ADMIN), degreePercentage.findById);
router.get("/getAll", degreePercentage.findAll);

module.exports = router;
