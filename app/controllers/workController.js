 const workService = require("../services/workService");
const { tryCatch } = require("../utils/tryCatch");


const findAll = tryCatch(async (req, res) => {
  const work = await workService.findAll();
  return res.status(200).json({elements: work});
});

const findById = tryCatch(async (req, res) => {
  const work = await workService.findById(req.params.id);
  return res.status(200).json({elements: work });
});


module.exports = {findAll, findById}