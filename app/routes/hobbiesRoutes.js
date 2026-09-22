const hobbies = require("../controllers/hobbiesController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

  router.get("/getById/:id", verifyRoles(ADMIN), hobbies.findById);
  router.get("/getAll", hobbies.findAll);

  module.exports = router;
