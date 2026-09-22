const experience = require("../controllers/experienceController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { CONTENT_MANAGER, ADMIN } = require("../../middleware/roleGroups");

  router.get("/getById/:id", verifyRoles(ADMIN), experience.findById);
  router.get("/getAll", verifyRoles(CONTENT_MANAGER), experience.findAll);

  module.exports = router;
