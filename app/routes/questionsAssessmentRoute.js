const assessment = require("../controllers/questionsAssessmentController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", verifyRoles(ADMIN), assessment.findById); //IPB: provavelmente para eliminar
router.get("/getAll", verifyRoles(ADMIN),assessment.findAll); //IPB: provavelmente para eliminar
router.post("/add", assessment.addAssessment);
router.get("/topicPerformance", assessment.getAllTopicPerformance);
router.post("/subtopicPerformance", assessment.getAllSubtopicsPerformance);
router.post("/getLevelPerformanceByTopic", assessment.getLevelPerformance);
router.post("/getPerformanceOverTime", assessment.getPerformanceOverTime);
router.post("/getAnswersOverview", assessment.getAnswerOverview);
router.post( "/assessmentsInformation", verifyRoles(ADMIN), assessment.getAllAssessmentsInfo);
module.exports = router;
