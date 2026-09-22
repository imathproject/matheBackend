const { tryCatch } = require("../utils/tryCatch");
const keywordService = require("../services/keywordService");

const findAll = tryCatch(async (req, res) => {
  const keyword = await keywordService.getKeywordsWithRelations({});
  return res.status(200).json({ elements: keyword });
});

const findById = tryCatch(async (req, res) => {
  const keyword = await keywordService.findById(req.params.id);
  return res.status(200).json({ elements: keyword });
});

const findByTopic = tryCatch(async (req, res) => {
  const keyword = await keywordService.getKeywords(
    { id_top: req.params.topic },
    { attributes: ["id", ["name", "label"]] },
  );
  return res.status(200).json({ elements: keyword });
});

const findBySubtopic = tryCatch(async (req, res) => {
  const keyword = await keywordService.getKeywords(
    { id_sub: req.params.subtopic },
    { attributes: ["id", ["name", "label"]] },
  );
  return res.status(200).json({ elements: keyword });
});

const findEditByTopic = tryCatch(async (req, res) => {
  const keyword = await keywordService.getKeywordsWithRelations({
    id_top: req.params.topic,
  });
  return res.status(200).json({ elements: keyword });
});

const findEditBySubtopic = tryCatch(async (req, res) => {
  const keyword = await keywordService.getKeywordsWithRelations({
    id_sub: req.params.subtopic,
  });
  return res.status(200).json({ elements: keyword });
});

const findKeysByTopic = tryCatch(async (req, res) => {
  console.log("O id do topico:" +  req.params.topic);
  const keyword = await keywordService.getKeywordsSortedByName({
    id_top: req.params.topic,
  });
  return res.status(200).json({ elements: keyword });
});

const findKeysBySubtopic = tryCatch(async (req, res) => {
  console.log("O id do subtopico:" +  req.params.subtopic);
  const keyword = await keywordService.getKeywordsSortedByName({
    id_sub: req.params.subtopic,
  });
  return res.status(200).json({ elements: keyword });
});

const addKeyword = tryCatch(async (req, res) => {
  const keyword = await keywordService.addKeyword(req.body);
  return res.status(200).json({ elements: keyword });
});

const deleteKeyword = tryCatch(async (req, res) => {
  const keyword = await keywordService.deleteById(req.params.id);
  return res.status(200).json({ elements: keyword });
});

const updateKeyword = tryCatch(async (req, res) => {
  const keyword = await keywordService.updateById(req.body);
  return res.status(200).json({ elements: keyword });
});

const updateInBulk = tryCatch(async (req, res) => {
  const keyword = await keywordService.updateInBulk(req.body);
  return res.status(200).json({ elements: keyword });
});

const getAllKeywordsInfo = tryCatch(async (req, res) => {
  const { topic, subtopic } = req.body;
  const keyword = await keywordService.getAllKeywordsInfo({
    topic,
    subtopic,
  });

  return res.status(200).json({ elements: keyword });
});

module.exports = {
  getAllKeywordsInfo,
  findAll,
  findByTopic,
  findBySubtopic,
  findById,
  addKeyword,
  deleteKeyword,
  updateKeyword,
  updateInBulk,
  findKeysByTopic,
  findKeysBySubtopic,
  findEditByTopic,
  findEditBySubtopic,
};
