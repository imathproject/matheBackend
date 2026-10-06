const olympicAssessment = require("../controllers/olympicAssessmentController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.post("/answerQuestion", olympicAssessment.answerQuestion);
router.get("/getAllOlympicPerformance", olympicAssessment.getAllOlympicPerformance);
router.get("/getOlympicPerformance", olympicAssessment.getOlympicPerformance);
router.post("/assessmentsInformation", verifyRoles(ADMIN), olympicAssessment.getAllOlympicAssessmentsInfo);

module.exports = router;
