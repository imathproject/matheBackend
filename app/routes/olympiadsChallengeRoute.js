const olympiadsChallenge = require("../controllers/olympiadsChallengeController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getAll", verifyRoles(ADMIN), olympiadsChallenge.getAllOlympiadsChallenges);
router.get("/getById/:id", olympiadsChallenge.getOlympiadsChallenge);
router.post("/create", verifyRoles(ADMIN), olympiadsChallenge.createOlympiadsChallenge);
router.put("/update", verifyRoles(ADMIN), olympiadsChallenge.updateOlympiadsChallenge);
router.delete("/delete/:id", verifyRoles(ADMIN), olympiadsChallenge.deleteOlympiadsChallenge);

// Status management (admin only for updating, any user for reading)
router.put("/updateStatus", verifyRoles(ADMIN), olympiadsChallenge.updateStatus);
router.get("/:id/status", olympiadsChallenge.getStatus);

// Student challenge endpoints
router.post("/start", olympiadsChallenge.startOlympiadsChallenge);
router.post("/submitAnswer", olympiadsChallenge.submitAnswer);
router.post("/nextQuestion", olympiadsChallenge.getNextQuestion);
router.get("/:id/leaderboard", olympiadsChallenge.getLeaderboard);

module.exports = router;
