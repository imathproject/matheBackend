const university = require("../controllers/universityController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", verifyRoles(ADMIN), university.findById);
router.post("/getByCountry", verifyRoles(ADMIN), university.findByCountry);
router.get("/getAll", verifyRoles(ADMIN), university.findAll);
router.get("/getAvailableUniversities", university.findAvailableUniversities);
router.get("/getAllInfo", verifyRoles(ADMIN), university.findAllInfo);
router.get("/delete/:id", verifyRoles(ADMIN), university.deleteUniversity);
router.post("/add", verifyRoles(ADMIN), university.addUniversity);
router.post("/suggest", university.suggestUniversity);
router.post("/update", verifyRoles(ADMIN), university.updateUniversity);
router.post("/updateStatus", verifyRoles(ADMIN), university.updateStatus);

module.exports = router;
