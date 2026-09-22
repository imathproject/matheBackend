const positionService = require("../services/positionService");
const { tryCatch } = require("../utils/tryCatch");

const findAll = tryCatch(async (req, res) => {
  const positions = await positionService.findAll();
  return res.status(200).json({elements: positions});
});

const findById = tryCatch(async (req, res) => {
  const position = await positionService.findById(req.params.id);
  return res.status(200).json({elements: position });
});

module.exports = {findAll, findById}