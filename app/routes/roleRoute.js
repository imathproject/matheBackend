const role = require("../controllers/roleController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getAll", verifyRoles(ADMIN), role.findAll);
router.get("/getById/:id", verifyRoles(ADMIN), role.findById);

  module.exports = router;