const olympicQuestionController = require("../controllers/olympicQuestionController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN, CONTENT_MANAGER, REVIEWER_OR_ADMIN } = require("../../middleware/roleGroups");

router.post("/add", verifyRoles(CONTENT_MANAGER), olympicQuestionController.addOlympicQuestion);//Admin, Lecturer, Reviewer
router.get("/getAll/:id_olympic", verifyRoles(ADMIN), olympicQuestionController.getAllOlympicQuestions);
router.get("/getMine", verifyRoles(CONTENT_MANAGER), olympicQuestionController.getOwnOlympicQuestions);//Only the caller's own questions
router.get("/getMine/:id_olympic", verifyRoles(CONTENT_MANAGER), olympicQuestionController.getOwnOlympicQuestions);
router.get("/getForValidation", verifyRoles(REVIEWER_OR_ADMIN), olympicQuestionController.getOlympicQuestionsForValidation);//Admin: all; Reviewer: own olympiads
router.get("/getForValidation/:id_olympic", verifyRoles(REVIEWER_OR_ADMIN), olympicQuestionController.getOlympicQuestionsForValidation);
router.get("/reviewScope", verifyRoles(REVIEWER_OR_ADMIN), olympicQuestionController.getReviewScope);//Admin: every olympiad; Reviewer: own olympiads
router.get("/getEnriched", verifyRoles(ADMIN), olympicQuestionController.getEnrichedOlympicQuestions);//Admin only (All Olympic Questions): validated questions only
router.get("/getEnriched/:id_olympic", verifyRoles(ADMIN), olympicQuestionController.getEnrichedOlympicQuestions);
//router.get("/getAllValidated", olympicQuestionController.getAllValidatedOlympicQuestions); //
router.get("/getTest", olympicQuestionController.getOlympicTest);
router.get("/getTestOptions", olympicQuestionController.getOlympicTestOptions);
router.post("/downloadImage", olympicQuestionController.downloadOlympicQuestionImage);//Any signed-in user, like question/downloadImage (the test shows these images)
router.delete("/delete/:id", verifyRoles(CONTENT_MANAGER), olympicQuestionController.deleteOlympicQuestion);//Admin or author
router.put("/update/:id", verifyRoles(CONTENT_MANAGER), olympicQuestionController.updateOlympicQuestion);//Admin, author or reviewer of that olympiad
router.put("/validate/:id", verifyRoles(ADMIN), olympicQuestionController.validateOlympicQuestion);//Admin (reviewers validate through /update, which checks their olympiads)

// Reviewer olympiads: the admin manages anyone's list (Manage Users), a reviewer
// only their own (Profile), the user coming from the token.

router.get(
    "/getReviewerOlympics/:id",
    verifyRoles(ADMIN),
    olympicQuestionController.getReviewerOlympics
);
router.post(
    "/updateReviewerOlympics",
    verifyRoles(ADMIN),
    olympicQuestionController.updateReviewerOlympics
);
router.get(
    "/getMyReviewerOlympics",
    verifyRoles(process.env.Lecture_Reviewer),
    olympicQuestionController.getMyReviewerOlympics
);
router.post(
    "/updateMyReviewerOlympics",
    verifyRoles(process.env.Lecture_Reviewer),
    olympicQuestionController.updateMyReviewerOlympics
);

module.exports = router;
