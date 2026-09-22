const degreeService = require("../services/degreeService");
const { tryCatch } = require("../utils/tryCatch");


const findAll = tryCatch(async (req, res) => {
  const degrees = await degreeService.findAll();
  return res.status(200).json({elements: degrees});
});

const findById = tryCatch(async (req, res) => {
  const degree = await degreeService.findById(req.params.id);
  return res.status(200).json({elements: degree });
});

const findTeacherDegree = tryCatch(async (req, res) => {
  const degrees = await degreeService.findTeacherDegrees();
  return res.status(200).json({ elements: degrees });
});

module.exports = {findAll, findById,findTeacherDegree}