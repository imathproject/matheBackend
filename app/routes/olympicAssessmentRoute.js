const olympicAssessment = require("../controllers/olympicAssessmentController");
const router = require("express").Router();

router.post("/answerQuestion", olympicAssessment.answerQuestion);
router.get("/getAllOlympicPerformance", olympicAssessment.getAllOlympicPerformance);
router.get("/getOlympicPerformance", olympicAssessment.getOlympicPerformance);

module.exports = router;
