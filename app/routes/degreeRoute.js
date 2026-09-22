const degree = require("../controllers/degreeController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { CONTENT_MANAGER, ADMIN } = require("../../middleware/roleGroups");

  router.get("/getById/:id", verifyRoles(ADMIN), degree.findById);
  router.get("/getAll", degree.findAll);
  router.get("/getTeacherDegree", verifyRoles(CONTENT_MANAGER), degree.findTeacherDegree);

  module.exports = router;
