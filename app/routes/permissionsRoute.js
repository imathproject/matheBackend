const permissions = require("../controllers/permissionController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", verifyRoles(ADMIN), permissions.findById)
  
module.exports = router;

  