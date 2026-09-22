const gender = require("../controllers/genderController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id",verifyRoles(ADMIN), gender.findById);
router.get("/getAll", gender.findAll);

module.exports = router;
