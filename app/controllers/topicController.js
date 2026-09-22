const { tryCatch } = require("../utils/tryCatch");
const topicService = require("../services/topicService");
const subtopicService = require("../services/subtopicService");

const findAll = tryCatch(async (req, res) => {
  const topic = await topicService.getAllTopics();
  return res.status(200).json({elements: topic});
});

const findById = tryCatch(async (req, res) => {
  const topic = await topicService.findById(req.params.id);
  return res.status(200).json({elements: topic});
});

const addTopic = tryCatch(async (req, res) => {
  const topic = await topicService.addTopic(req.body);
  return res.status(200).json({elements: topic});
});

const deleteTopic = tryCatch(async (req, res) => {
  const topic = await topicService.deleteById(req.params.id);
  return res.status(200).json({elements: topic});
});

const updateTopic = tryCatch(async (req, res) => {
  const topic = await topicService.updateById(req.body);
  return res.status(200).json({elements: topic});
});

const findSubtopics = tryCatch(async (req, res) => {
  const topic = await topicService.findSubtopics();
  return res.status(200).json({elements: topic});
});

const findTopicNames = tryCatch(async (req, res) => {
  const topic = await topicService.getAllTopics();
  const topicNames = topic.map(topic => topic.name);
  const topicIds = topic.map(topic => topic.id);

  return res.status(200).json({names: topicNames, ids: topicIds});
});

const updateTopAndSub = tryCatch(async (req, res) => {
  await topicService.updateById(req.body);
  const subtopics = req.body.subtopics.map((subtopic) => ({
    ...subtopic,
    id_top: req.body.id,
  }));
  await subtopicService.updateSubtopicsInBulk(subtopics);
  return res.status(200).json({elements: "Success"});
});


module.exports = {findAll, findById, addTopic, updateTopic, deleteTopic, findSubtopics, findTopicNames, updateTopAndSub}
