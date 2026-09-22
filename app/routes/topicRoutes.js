const topic = require("../controllers/topicController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

  // router.get("/:id", user.findOne);
  router.get("/getAll", topic.findAll);
  router.get("/getById/:id", verifyRoles(ADMIN), topic.findById) //IPB: Provavelmente para eliminar
  router.get("/delete/:id", verifyRoles(ADMIN), topic.deleteTopic);
  router.get("/getSubtopics", verifyRoles(ADMIN), topic.findSubtopics);
  router.post("/add", verifyRoles(ADMIN), topic.addTopic);
  router.post("/update", verifyRoles(ADMIN), topic.updateTopic);
  router.get("/getTopicNames", verifyRoles(ADMIN), topic.findTopicNames); //IPB: Provavelmente para eliminar
  router.post("/updateTopAndSub", verifyRoles(ADMIN), topic.updateTopAndSub);
  
  module.exports = router;

  