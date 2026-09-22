const { tryCatch } = require("../utils/tryCatch");
const roleService = require("../services/roleService");

const findAll = tryCatch(async (req, res) => {
  const roles = await roleService.findAll();
  return res.status(200).json({ elements: roles });
});

const findById = tryCatch(async (req, res) => {
  const role = await roleService.findById(req.params.id);
  return res.status(200).json({ elements: role });
})

module.exports = { findAll, findById };
