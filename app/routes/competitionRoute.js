const competition = require("../controllers/competitionController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getAll", verifyRoles(ADMIN), competition.getAllCompetitions);
router.get("/getById/:id", competition.getCompetition);
router.post("/create", verifyRoles(ADMIN), competition.createCompetition);
router.put("/update", verifyRoles(ADMIN), competition.updateCompetition);
router.delete("/delete/:id", verifyRoles(ADMIN), competition.deleteCompetition);

// Status management (admin only for updating, any user for reading)
router.put("/updateStatus", verifyRoles(ADMIN), competition.updateStatus);
router.get("/:id/status", competition.getStatus);

// Student competition endpoints
router.post("/start", competition.startCompetition);
router.post("/submitAnswer", competition.submitAnswer);
router.post("/nextQuestion", competition.getNextQuestion);
router.get("/:id/leaderboard", competition.getLeaderboard);

module.exports = router;
