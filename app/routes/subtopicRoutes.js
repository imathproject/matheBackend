const subtopic = require("../controllers/subtopicController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

  router.get("/getAll", verifyRoles(ADMIN), subtopic.findAll); //IPB: provavelmente para eliminar
  router.get("/getByTopic/:topic", subtopic.findByTopic);
  router.get("/getById/:id", verifyRoles(ADMIN), subtopic.findById) //IPB: provavelmente para eliminar
  router.get("/delete/:id", verifyRoles(ADMIN), subtopic.deleteSubtopic);
  router.post("/add", verifyRoles(ADMIN), subtopic.addSubtopic);
  router.post("/update", verifyRoles(ADMIN), subtopic.updateSubtopic);
  router.get("/getSubtopicNames/:id", subtopic.findSubtopics); //IPB: provavelmente para eliminar
  module.exports = router;
