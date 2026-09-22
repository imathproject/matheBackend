const { tryCatch } = require("../utils/tryCatch");
const subtopicService = require("../services/subtopicService");

const findAll = tryCatch(async (req, res) => {
  const subtopic = await subtopicService.getAllSubtopics(null, null);
  return res.status(200).json({ elements: subtopic });
});

const findByTopic = tryCatch(async (req, res) => {
  const subtopic = await subtopicService.getAllSubtopics(
    null,
    req.params.topic,
  );
  return res.status(200).json({ elements: subtopic });
});

const findById = tryCatch(async (req, res) => {
  const subtopic = await subtopicService.getAllSubtopics(req.params.id, null);
  return res.status(200).json({ elements: subtopic });
});

const addSubtopic = tryCatch(async (req, res) => {
  const subtopic = await subtopicService.addSubtopic(req.body);
  return res.status(200).json({ elements: subtopic });
});

const deleteSubtopic = tryCatch(async (req, res) => {
  const subtopic = await subtopicService.deleteById(req.params.id);
  return res.status(200).json({ elements: subtopic });
});

const updateSubtopic = tryCatch(async (req, res) => {
  const subtopic = await subtopicService.updateById(req.body);
  return res.status(200).json({ elements: subtopic });
});

const findSubtopics = tryCatch(async (req, res) => {
  const subtopic = await subtopicService.getAllSubtopics(req.params.id, null);
  const subtopicNames = subtopic.map((subtopic) => subtopic.name);
  const subtopicIds = subtopic.map((subtopic) => subtopic.id);

  return res.status(200).json({ names: subtopicNames, ids: subtopicIds });
});

module.exports = {
  findAll,
  findByTopic,
  findById,
  addSubtopic,
  deleteSubtopic,
  updateSubtopic,
  findSubtopics,
};
