const country = require("../controllers/countryController");
const router = require("express").Router();

router.get("/getAll", country.findAll);

module.exports = router;
