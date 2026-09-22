const user = require("../controllers/userController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const verifyUser = require("../../middleware/verifySignUp");
const { ADMIN, CONTENT_MANAGER } = require("../../middleware/roleGroups");

router.post("/getUsers", verifyRoles(ADMIN), user.findAll);
router.post("/updateStatus", verifyRoles(ADMIN), user.updateStatus);
router.post("/updateTypology",verifyRoles(ADMIN), user.updateTypology);
router.post("/userInformation", verifyRoles(ADMIN), user.getAllUsersInfo);
router.get("/getUser/:id?", verifyRoles(ADMIN),user.findOne);
router.get("/getProfile", user.findOne);
router.post("/update", user.updateUser);
router.post("/changePassword", user.changePassword);
router.post("/uploadFile", verifyRoles(CONTENT_MANAGER), user.uploadTeachingAbilitiesFile);
router.get("/getTeacherAbility/:id?", verifyRoles(CONTENT_MANAGER), user.getTeacherAbility);
router.get("/getReviewerTopics/:id", verifyRoles(ADMIN), user.getReviewerTopics);
router.post("/updateReviewerTopics", verifyRoles(ADMIN), user.updateReviewerTopics);
//router.post("/updateTeacher", user.updateTeacher);
//router.post("/completeTeacherProfile", user.completeTeacherProfile);
//router.post("/completeStudentProfile", user.completeStudentProfile);

module.exports = router;
