const course = require("../controllers/courseController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

  router.get("/getById/:id", verifyRoles(ADMIN), course.findById);
  router.get("/getAll", course.findAll);

  module.exports = router;
