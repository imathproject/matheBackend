const hobbiesService = require("../services/hobbiesService");
const { tryCatch } = require("../utils/tryCatch");

const findAll = tryCatch(async (req, res) => {
  const hobbies = await hobbiesService.findAll();
  return res.status(200).json({elements: hobbies});
});

const findById = tryCatch(async (req, res) => {
  const hobbies = await hobbiesService.findById(req.params.id);
  return res.status(200).json({elements: hobbies });
});

module.exports = {findAll, findById}