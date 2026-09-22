const genderService = require("../services/genderService");
const { tryCatch } = require("../utils/tryCatch");

const findAll = tryCatch(async (req, res) => {
  const elements = await genderService.findAll();
  return res.status(200).json({elements: elements});
});

const findById = tryCatch(async (req, res) => {
  const element = await genderService.findById(req.params.id);
  return res.status(200).json({elements: element });
});

module.exports = {findAll, findById}