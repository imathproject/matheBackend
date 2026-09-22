const work = require("../controllers/workController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

  router.get("/getById/:id", verifyRoles(ADMIN), work.findById);
  router.get("/getAll", work.findAll);

  module.exports = router;
