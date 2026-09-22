const courseService = require("../services/courseService");
const { tryCatch } = require("../utils/tryCatch");


const findAll = tryCatch(async (req, res) => {
  const courses = await courseService.findAll();
  return res.status(200).json({elements: courses});
});

const findById = tryCatch(async (req, res) => {
  const course = await courseService.findById(req.params.id);
  return res.status(200).json({elements: course });
});


module.exports = {findAll, findById}