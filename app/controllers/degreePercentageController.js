const degreePercentageService = require("../services/degreePercentageService");
const { tryCatch } = require("../utils/tryCatch");


const findAll = tryCatch(async (req, res) => {
  const elements = await degreePercentageService.findAll();
  return res.status(200).json({elements: elements});
});

const findById = tryCatch(async (req, res) => {
  const element = await degreePercentageService.findById(req.params.id);
  return res.status(200).json({elements: element });
});


module.exports = {findAll, findById}