const testimonial = require("../controllers/testimonialController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { CONTENT_MANAGER, ADMIN } = require("../../middleware/roleGroups");

router.get("/getValidated", verifyRoles(ADMIN), testimonial.findValidated); //IPB: Provavelmente para eliminar
router.get("/getAll", verifyRoles(ADMIN), testimonial.findAll);
router.get("/getByUser", testimonial.findByUserId);
router.get("/getById/:id", verifyRoles(ADMIN), testimonial.findById);
router.get("/delete/:id", verifyRoles(ADMIN), testimonial.deleteTestimonial);
router.post("/add", testimonial.addTestimonial);
router.post("/validate", verifyRoles(ADMIN), testimonial.validateTestimonial);
router.post("/updateStatus", verifyRoles(ADMIN), testimonial.updateStatus);

module.exports = router;