const userService = require("../services/userService");
const revisorTopicsService = require("../services/revisorTopicsService");
const { tryCatch } = require("../utils/tryCatch");
const upload = require("../../middleware/upload");
const fs = require("fs");

const findOne = tryCatch(async (req, res) => {
  let userID = req.user;
  // req.roles [NUMBER] == process.env.Admin [STRING]
  if (req.roles == process.env.Admin && req.params.id)
    userID = req.params.id;

  const user = await userService.getUser(userID);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json({ elements: user });
});

const findAll = tryCatch(async (req, res) => {
  const users = await userService.findAll(req.body);
  return res.status(200).json({ elements: users });
});

const getAllUsersInfo = tryCatch(async (req, res) => {
  const users = await userService.getUsersInfo(req.body.role);
  return res.status(200).json({ elements: users });
});

const updateUser = tryCatch(async (req, res) => {
  let userID = req.user;
  // req.roles [NUMBER] == process.env.Admin [STRING]
  //if (req.roles == process.env.Admin && req.params.id) userID = req.params.id;

  const update = await userService.handleUserUpdate(userID, req.roles, req.body);
  return res.status(200).json({ elements: update });
});

const updateStatus = tryCatch(async (req, res) => {
  const update = await userService.updateStatus(req.body);
  return res.status(200).json({ elements: update });
});

const updateTypology = tryCatch(async (req, res) => {
  const update = await userService.handleTypologyUpdate(req.body);
  return res.status(200).json({ elements: update });
});

const updateTeacher = tryCatch(async (req, res) => {
  const result = await userService.handleTeacherUpdate(req.body);
  return res.status(200).json({ elements: result });
});

const completeTeacherProfile = tryCatch(async (req, res) => {
  await userService.completeTeacherProfile(req.body);
  return res.status(200).json({ elements: "Success" });
});

const confirmEmail = tryCatch(async (req, res) => {
  const email = await userService.confirmEmail(req.params.checkcode);
  return res.status(200).json({ elements: email });
});

const completeStudentProfile = tryCatch(async (req, res) => {
  const profile = await userService.completeStudentProfile(req.body);
  return res.status(200).json({ elements: profile });
});

const changePassword = tryCatch(async (req, res) => {
  const userID = req.user;
  const result = await userService.changePasswordWithValidation(userID, req.body);
  return res.status(200).json({ elements: result });
});

const getHistoric = tryCatch(async (req, res) => {
  const data = await userService.getHistoric();
  return res.status(200).json({ elements: data });
});

const recoverPassword = tryCatch(async (req, res) => {
  const pass = await userService.recoverPassword(req.body);
  return res.status(200).json({ elements: pass });
});

const uploadTeachingAbilitiesFile = tryCatch(async (req, res) => {
  const userID = req.user;
  await upload("teachingAbilities", userID.toString()+".pdf")(req, res);
  return res.status(200).json({ message: "File uploaded successfully" });
});

const getTeacherAbility = tryCatch(async (req, res) => {
  let userID = req.user;
  // req.roles [NUMBER] == process.env.Admin [STRING]
  if (req.roles == process.env.Admin && req.params.id) userID = req.params.id;

  const filePath = userService.getTeacherAbilityPath(userID);
  if (!filePath) return res.status(404).send("File not found");
  fs.createReadStream(filePath).pipe(res);
});

const getReviewerTopics = tryCatch(async (req, res) => {
  const reviewerTopics = await revisorTopicsService.findByUserId(req.params.id);
  return res.status(200).json({ elements: reviewerTopics });
});

const updateReviewerTopics = tryCatch(async (req, res) => {
  const { userId, topics } = req.body;
  const result = await userService.handleReviewerTopicsUpdate(userId, topics);
  return res.status(200).json({ elements: result });
});

module.exports = {
  findOne,
  findAll,
  updateUser,
  confirmEmail,
  completeStudentProfile,
  changePassword,
  getHistoric,
  updateTeacher,
  recoverPassword,
  uploadTeachingAbilitiesFile,
  getTeacherAbility,
  updateStatus,
  updateTypology,
  getAllUsersInfo,
  getReviewerTopics,
  updateReviewerTopics,
  completeTeacherProfile,
};