const question = require("../controllers/questionController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { CONTENT_MANAGER, REVIEWER_OR_ADMIN, ADMIN } = require("../../middleware/roleGroups");

// router.get("/:id", user.findOne);
router.get("/getById/:id", question.findById);
router.get("/getAll", verifyRoles(CONTENT_MANAGER), question.findAll);
router.get("/getByTopic/:topic", verifyRoles(CONTENT_MANAGER), question.findByTopic);
router.get("/getBySubtopic/:subtopic", verifyRoles(CONTENT_MANAGER), question.findBySubtopic);
router.post("/getByIds", question.findMultipleIds);
router.post("/getLecturerQuestions", verifyRoles(CONTENT_MANAGER), question.findLecturerQuestions);
router.post("/update", verifyRoles(CONTENT_MANAGER), question.updateQuestion);
router.post("/delete", verifyRoles(CONTENT_MANAGER), question.deleteByID);
router.post("/add", verifyRoles(CONTENT_MANAGER), question.addQuestion);
router.post("/validate", verifyRoles(REVIEWER_OR_ADMIN), question.validate);
router.post("/getArrayByTopic", question.findArrayByTopic);
router.post("/getArrayBySubtopic", question.findArrayBySubtopic);
router.get("/getAllLevels", verifyRoles(ADMIN), question.getAllLevels); //IPB: Provavelmente para eliminar
router.post("/questionsValidation", verifyRoles(REVIEWER_OR_ADMIN), question.getQuestionsForValidation);
router.get("/getMaxLevelByTopic/:id", question.findMaxLevelByTopic);
router.get("/getMaxLevelBySubtopic/:id", question.findMaxLevelBySubtopic);
router.post("/downloadImage", question.downloadImage);
router.post("/uploadImage", verifyRoles(CONTENT_MANAGER), question.uploadQuestionImage);
router.post("/questionsInformation", verifyRoles(ADMIN), question.getAllQuestionsInfo);
router.post("/validationInformation", verifyRoles(ADMIN), question.getValidationInfo);
//router.post("/getAccepted/")

module.exports = router;
