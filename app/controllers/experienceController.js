const experienceService = require("../services/experienceService");
const { tryCatch } = require("../utils/tryCatch");


const findAll = tryCatch(async (req, res) => {
  const experience = await experienceService.findAll();
  return res.status(200).json({elements: experience});
});

const findById = tryCatch(async (req, res) => {
  const experience = await experienceService.findById(req.params.id);
  return res.status(200).json({elements: experience });
});


module.exports = {findAll, findById}