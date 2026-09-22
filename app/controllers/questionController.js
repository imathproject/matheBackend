const { tryCatch } = require("../utils/tryCatch");
const questionService = require("../services/questionService");
const upload = require("../../middleware/upload");
const fs = require("fs");

const findAll = tryCatch(async (req, res) => {
  const questions = await questionService.findAll();
  return res.status(200).json({ elements: questions });
});

const findById = tryCatch(async (req, res) => {
  const user = await questionService.getQuestion(req.params.id);
  return res.status(200).json({ elements: user });
});

const findMaxLevelByTopic = tryCatch(async (req, res) => {
  const result = await questionService.findMaxLevelByTopic(req.params.id);
  return res.status(200).json({ elements: result });
});

const findMaxLevelBySubtopic = tryCatch(async (req, res) => {
  const result = await questionService.findMaxLevelBySubtopic(req.params.id);
  return res.status(200).json({ elements: result });
});

const getAllQuestionsInfo = tryCatch(async (req, res) => {
  const questions = await questionService.getAllQuestionsInfo(req.body);
  return res.status(200).json({ elements: questions });
});

const getValidationInfo = tryCatch(async (req, res) => {
  const questions = await questionService.getValidationInfo(req.body);
  return res.status(200).json({ elements: questions });
});

const findMultipleIds = tryCatch(async (req, res) => {
  const questions = await questionService.findMultipleIds(req.body.ids);
  return res.status(200).json({ elements: questions });
});

const findByTopic = tryCatch(async (req, res) => {
  const questions = await questionService.findByTopic(req.params.topic);
  return res.status(200).json({ elements: questions });
});

const findBySubtopic = tryCatch(async (req, res) => {
  const questions = await questionService.findBySubtopic(req.params.subtopic);
  return res.status(200).json({ elements: questions });
});

const updateQuestion = tryCatch(async (req, res) => {
  const question = await questionService.updateQuestionWithKeywords(req.body);
  return res.status(200).json({ elements: question });
});

const deleteByID = tryCatch(async (req, res) => {
  await questionService.deleteQuestion(req.body.id);
  return res.status(200).json({ elements: "Success" });
});

const addQuestion = tryCatch(async (req, res) => {
  const userID = req.user;
  const question = await questionService.addQuestionWithKeywords(userID, req.body);
  return res.status(200).json({ elements: question });
});

const findLecturerQuestions = tryCatch(async (req, res) => {
  const userID = req.user;
  const questions = await questionService.getLecturerQuestions(userID, req.body);
  return res.status(200).json({ elements: questions });
});

const validate = tryCatch(async (req, res) => {
  const userID = req.user;
  const question = await questionService.validateQuestionWithKeywords(userID, req.body);
  return res.status(200).json({ elements: question });
});

const findArrayByTopic = tryCatch(async (req, res) => {
  const userID = req.user;
  const topic = req.body.topic;
  const result = await questionService.findArrayByTopic(userID, topic);
  return res.status(200).json({ elements: result });
});

const findArrayBySubtopic = tryCatch(async (req, res) => {
  const userID = req.user;
  const subtopic = req.body.subtopic;
  const result = await questionService.findArrayBySubtopic(userID, subtopic);
  return res.status(200).json({ elements: result });
});

const getAllLevels = tryCatch(async (req, res) => {
  const levelsArray = await questionService.getAllLevels();
  return res.status(200).json({ levels: levelsArray });
});

const getQuestionsForValidation = tryCatch(async (req, res) => {
  const userID = req.user;
  const role = req.roles;
  const questions = await questionService.getQuestionsForValidationByRole(userID, req.body, role);
  return res.status(200).json({ elements: questions });
});

const uploadQuestionImage = tryCatch(async (req, res) => {
  console.log(req.body);
  await upload("questionsImage")(req, res);
  res.status(200).json({ message: "File uploaded successfully" });
});

const downloadImage = tryCatch(async (req, res) => {
  const filePath = await questionService.getImagePath(req.body.id);
  if (!filePath) return res.status(404).send("File not found");
  fs.createReadStream(filePath).pipe(res);
});

module.exports = {
  findAll,
  findByTopic,
  findBySubtopic,
  findById,
  updateQuestion,
  deleteByID,
  addQuestion,
  validate,
  findLecturerQuestions,
  findMultipleIds,
  findArrayBySubtopic,
  findArrayByTopic,
  getAllLevels,
  getQuestionsForValidation,
  findMaxLevelByTopic,
  findMaxLevelBySubtopic,
  downloadImage,
  uploadQuestionImage,
  getAllQuestionsInfo,
  getValidationInfo,
};
