const material = require("../controllers/materialController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { CONTENT_MANAGER, REVIEWER_OR_ADMIN, ADMIN } = require("../../middleware/roleGroups");

router.get("/getById/:id", verifyRoles(CONTENT_MANAGER), material.findById);
router.post("/getAll", verifyRoles(ADMIN), material.findAll);
router.post("/getLibrary", material.findLibrary);
router.post("/add", verifyRoles(CONTENT_MANAGER), material.addMaterial);
router.post("/updateVideo", verifyRoles(CONTENT_MANAGER), material.updateVideo);
router.post("/validateMaterial", verifyRoles(REVIEWER_OR_ADMIN), material.validateMaterial);
router.post("/updateMaterial", verifyRoles(CONTENT_MANAGER), material.updateMaterial);
router.post("/getCollection", verifyRoles(CONTENT_MANAGER), material.findVideoCollection);
router.get("/deleteVideo/:id", verifyRoles(CONTENT_MANAGER), material.deleteVideoById);
router.get("/incrementClicks/:id", material.incrementClicks);
router.post("/getMaterials", verifyRoles(ADMIN), material.findMultipleMaterials); //IPB: Provavelmente para eliminar
router.post("/uploadFile", verifyRoles(CONTENT_MANAGER), material.uploadFile);
router.post("/downloadFile", material.downloadFile);
router.post("/deleteMaterial", verifyRoles(CONTENT_MANAGER), material.deleteMaterialById);
router.post("/materialsValidation", verifyRoles(REVIEWER_OR_ADMIN), material.getMaterialsForValidation);
router.post("/videosInformation", verifyRoles(ADMIN), material.getAllVideosInfo);
router.post("/materialsInformation", verifyRoles(ADMIN), material.getAllMaterialsInfo);
module.exports = router;
