const learningService = require("../services/learningService");
const { tryCatch } = require("../utils/tryCatch");

const findAll = tryCatch(async (req, res) => {
  const learning = await learningService.findAll();
  return res.status(200).json({elements: learning});
});

const findById = tryCatch(async (req, res) => {
  const learning = await learningService.findById(req.params.id);
  return res.status(200).json({elements: learning });
});

module.exports = {findAll, findById}