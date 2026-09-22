const { tryCatch } = require("../utils/tryCatch");
const questionAssessmentService = require("../services/questionAssessmentService");

const findAll = tryCatch(async (req, res) => {
  const assessment = await questionAssessmentService.findAll();
  return res.status(200).json({ elements: assessment });
});

const findById = tryCatch(async (req, res) => {
  const assessment = await questionAssessmentService.findById(req.params.id);
  return res.status(200).json({ elements: assessment });
});

const addAssessment = tryCatch(async (req, res) => {
  const userID = req.user; //students userID
  const assessment = await questionAssessmentService.addAssessment(userID, req.body);
  return res.status(200).json({ elements: assessment });
});

const getAllAssessmentsInfo = tryCatch(async (req, res) => {
  const assessment = await questionAssessmentService.getAllAssessmentsInfo(req.body);
  return res.status(200).json({ elements: assessment });
});

const getPerformanceOverTime = tryCatch(async (req, res) => {
  const userID = req.user;
  const finalData = await questionAssessmentService.getPerformanceOverTime(userID,req.body);
  return res.status(200).json({ elements: finalData });
});

const getAnswerOverview = tryCatch(async (req, res) => {
  const userID = req.user;
  const finalData = await questionAssessmentService.getAnswerOverview(userID, req.body);
  return res.status(200).json({ elements: finalData });
});

const getAllTopicPerformance = tryCatch(async (req, res) => {
  const userID = req.user;
  const finalObject = await questionAssessmentService.getAllTopicPerformance(userID);
  return res.status(200).json({ elements: finalObject });
});

const getAllSubtopicsPerformance = tryCatch(async (req, res) => {
  const userID = req.user;
  const finalObject = await questionAssessmentService.getAllSubtopicsPerformance(userID, req.body);
  return res.status(200).json({ elements: finalObject });
});

const getLevelPerformance = tryCatch(async (req, res) => {
  const userID = req.user;
  const merged = await questionAssessmentService.getLevelPerformance(userID, req.body);
  return res.status(200).json({ elements: merged });
});

module.exports = {
  findAll,
  findById,
  addAssessment,
  getAllTopicPerformance,
  getAllSubtopicsPerformance,
  getLevelPerformance,
  getAllAssessmentsInfo,
  getPerformanceOverTime,
  getAnswerOverview,
};