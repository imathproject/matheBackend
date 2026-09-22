const noAuth = require("../controllers/noAuthController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");
const { authenticateToken } = require("../../middleware/verifyAuth");

router.get("/outcomes", noAuth.findOutcomes);
router.get("/questionsInfo", authenticateToken, noAuth.getAllQuestionsInformation); //IPB: Acho que é usado pelo recommendation system
router.get("/getHistoric", noAuth.getHistoric);
router.get("/getMapInfo", noAuth.getMapInformation);
router.get("/downloadEurope", noAuth.downloadEurope);
router.get("/downloadAssessment", noAuth.downloadAssessment);
router.get("/downloadLibrary", noAuth.downloadLibrary);
router.get("/downloadDataProtection", noAuth.downloadDataProtection);
router.post("/getInTouch", noAuth.sendGetInTouch);
router.get("/getTestimonials", noAuth.findValidatedTestimonials);
//router.get("/updateByID", noAuth.updateLevelById);
//router.get("/updateAssessment", noAuth.updateAssessment);router.get("/topics", noAuth.getTopics);
router.get("/topics", noAuth.getTopics); //IPB: Verificar isto
router.get("/olympics", noAuth.getOlympics);
router.post("/olympics/downloadImage", noAuth.downloadOlympicImage);
module.exports = router;
