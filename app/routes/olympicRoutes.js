const olympic = require("../controllers/olympicController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN, REVIEWER_OR_ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", olympic.getOlympic); //Ok para todos
router.get("/getAll", olympic.getAllOlympics); //Ok para todos
router.get("/getAllEnriched", olympic.getAllOlympicsEnriched); //Ok para todos
router.post("/add", verifyRoles(ADMIN), olympic.addNewOlympic); //Admin
router.put("/update", verifyRoles(ADMIN), olympic.updateOlympic); //Admin
router.delete("/delete/:id", verifyRoles(ADMIN), olympic.deleteOlympic);//Admin
router.post("/uploadImage", verifyRoles(ADMIN), olympic.uploadOlympicImage); //Admin

//Olympic Level routes
router.post("/level/add", verifyRoles(ADMIN), olympic.addNewOlympicLevel);
router.get("/level/getById/:id", olympic.getOlympicLevel);
router.get("/level/getAll/:olympic", olympic.getAllOlympicLevels);
router.put("/level/update", verifyRoles(ADMIN), olympic.updateOlympicLevel);
router.delete("/level/delete/:id", verifyRoles(ADMIN), olympic.deleteOlympicLevel);

//Olympic Year routes
router.post("/year/add", verifyRoles(ADMIN), olympic.addNewOlympicYear);
router.get("/year/getById/:id", olympic.getOlympicYear);
router.get("/year/getAll/:olympic", olympic.getAllOlympicYears);
router.put("/year/update", verifyRoles(ADMIN), olympic.updateOlympicYear);
router.delete("/year/delete/:id", verifyRoles(ADMIN), olympic.deleteOlympicYear);

//Olympic Phase routes
router.post("/phase/add", verifyRoles(ADMIN), olympic.addNewOlympicPhase);
router.get("/phase/getById/:id", olympic.getOlympicPhase);
router.get("/phase/getAll/:olympic", olympic.getAllOlympicPhases);
router.put("/phase/update", verifyRoles(ADMIN), olympic.updateOlympicPhase);
router.delete("/phase/delete/:id", verifyRoles(ADMIN), olympic.deleteOlympicPhase);

module.exports = router;