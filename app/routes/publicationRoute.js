const publication = require("../controllers/publicationController");
const router = require("express").Router();
const verifyRoles = require("../../middleware/verifyRoles");
const { ADMIN } = require("../../middleware/roleGroups");
const { authenticateToken } = require("../../middleware/verifyAuth");

router.get("/getAll", publication.findAll);
router.get("/getById/:id", authenticateToken, verifyRoles(ADMIN), publication.getById);
router.get("/deletePublication/:id", authenticateToken, verifyRoles(ADMIN), publication.deletePublication);
router.post("/addPublication", authenticateToken, verifyRoles(ADMIN), publication.addPublication);
router.post("/updatePublication", authenticateToken, verifyRoles(ADMIN), publication.updatePublication);
router.post("/updateOrder", authenticateToken, verifyRoles(ADMIN), publication.updateOrder);

module.exports = router;
