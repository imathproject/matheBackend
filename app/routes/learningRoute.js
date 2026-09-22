const learning = require("../controllers/learningController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

  router.get("/getById/:id", verifyRoles(ADMIN), learning.findById);
  router.get("/getAll", learning.findAll);

  module.exports = router;
