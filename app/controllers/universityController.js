const { tryCatch } = require("../utils/tryCatch");
const universityService = require("../services/universityService");

const findAll = tryCatch(async (req, res) => {
  const university = await universityService.findAll();
  return res.status(200).json({ elements: university });
});

const findAvailableUniversities = tryCatch(async (req, res) => {
  const university = await universityService.getAvailableUniversities();
  return res.status(200).json({ elements: university });
});

const findAllInfo = tryCatch(async (req, res) => {
  const university = await universityService.findAllInfo();
  return res.status(200).json({ elements: university });
});

const findById = tryCatch(async (req, res) => {
  const university = await universityService.findById(req.params.id);
  return res.status(200).json({ elements: university });
});

const addUniversity = tryCatch(async (req, res) => {
  const university = await universityService.addUniversity(req.body);
  return res.status(200).json({ elements: university });
});

const suggestUniversity = tryCatch(async (req, res) => {
  const userID = req.user;
  const university = await universityService.suggestUniversity(userID, req.body);
  return res.status(200).json({ elements: university });
});

const deleteUniversity = tryCatch(async (req, res) => {
  const id = req.params.id;
  const university = await universityService.deleteUniversity(id);

  return res.status(200).json({ elements: university });
});

const updateUniversity = tryCatch(async (req, res) => {
  const university = await universityService.updateById(req.body);
  return res.status(200).json({ elements: university });
});

const findByCountry = tryCatch(async (req, res) => {
  const { country, validated } = req.body;
  const university = await universityService.findByCountry(country, validated);
  return res.status(200).json({ elements: university });
});

const updateStatus = tryCatch(async (req, res) => {
  const { id, status } = req.body;
  const university = await universityService.updateStatus(id, status);
  return res.status(200).json({ elements: university });
});

module.exports = {
  findAll,
  findById,
  addUniversity,
  updateUniversity,
  deleteUniversity,
  findByCountry,
  updateStatus,
  findAllInfo,
  suggestUniversity,
  findAvailableUniversities
};
