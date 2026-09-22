const { tryCatch } = require("../utils/tryCatch");
const materialService = require("../services/materialService");
const fs = require("fs");
const upload = require("../../middleware/upload");

const findAll = tryCatch(async (req, res) => {
  const materials = await materialService.getAllMaterials(req);
  return res.status(200).json({ elements: materials });
});

const findLibrary = tryCatch(async (req, res) => {
  const materials = await materialService.getLibraryMaterials(req);
  return res.status(200).json({ elements: materials }); 
});

const findById = tryCatch(async (req, res) => {
  const material = await materialService.getMaterial(req.params.id);
  return res.status(200).json({ elements: material });
});

const addMaterial = tryCatch(async (req, res) => {
  const userID = req.user;
  const material = await materialService.addMaterial(userID, req.body);
  return res.status(200).json({ elements: material.id });
});

const updateMaterial = tryCatch(async (req, res) => {
  const materialK = await materialService.updateById(req.body);
  return res.status(200).json({ elements: materialK });
});

const updateVideo = tryCatch(async (req, res) => {
  const materialK = await materialService.updateById(req.body);
  return res.status(200).json({ elements: materialK });
});

const validateMaterial = tryCatch(async (req, res) => {
  const userID = req.user;
  const materialK = await materialService.validate(userID, req.body);
  return res.status(200).json({ elements: materialK });
});
const findValidatedMaterials = tryCatch(async (req, res) => {
  const userID = req.user;
  const material = await materialService.getValidated(userID, req.body);
  return res.status(200).json({ elements: material });
});

const findVideoCollection = tryCatch(async (req, res) => {
  const userID = req.user;
  const collection = await materialService.getCollection(userID, req.body);
  return res.status(200).json({ elements: collection });
});

const deleteMaterialById = tryCatch(async (req, res) => {
  const material = await materialService.getMaterial(req.body.id);
  await materialService.deleteById(material.id);
  await materialService.deleteFile(material.id + "." + material.file_ext);
  return res.status(200).json({ elements: "Success" });
});

const deleteVideoById = tryCatch(async (req, res) => {
  const material = await materialService.getMaterial(req.params.id);
  await materialService.deleteById(material.id);
  return res.status(200).json({ elements: "Success" });
});

const findMultipleMaterials = tryCatch(async (req, res) => {
  const material = await materialService.getMultipleMaterials(req.body);
  return res.status(200).json({ elements: material });
});

const incrementClicks = tryCatch(async (req, res) => {
  const increment = await materialService.incrementClicks(req.params.id);
  return res.status(200).json({ elements: increment });
});

const getAllVideosInfo = tryCatch(async (req, res) => {
  const { topic, subtopic } = req.body;
  const videos = await materialService.getAllVideosInfo({ topic, subtopic });
  return res.status(200).json({ elements: videos });
});

const getAllMaterialsInfo = tryCatch(async (req, res) => {
  const { topic = null, subtopic = null } = req.body;
  const materials = await materialService.getAllMaterialsInfo({
    topic,
    subtopic,
  });
  return res.status(200).json({ elements: materials });
});

const uploadFile = tryCatch(async (req, res) => {
  await upload("uploads")(req, res);
  res.status(200).json({ message: "File uploaded successfully" });
});

const downloadFile = tryCatch(async (req, res) => {
  const { id } = req.body;
  const filePath = await materialService.getFilePath(id);
  if (!filePath) return res.status(404).send("File not found");
  res.status(200);
  fs.createReadStream(filePath).pipe(res);
});

const getMaterialsForValidation = tryCatch(async (req, res) => {
  const userID = req.user;
  const role = req.roles;
  const materials = await materialService.getMaterialsForValidationByRole(userID, req.body, role);
  return res.status(200).json({ elements: materials });
});

module.exports = {
  findAll,
  findLibrary,
  findById,
  addMaterial,
  updateMaterial,
  updateVideo,
  findValidatedMaterials,
  findVideoCollection,
  validateMaterial,
  findMultipleMaterials,
  incrementClicks,
  uploadFile,
  downloadFile,
  deleteMaterialById,
  deleteVideoById,
  getMaterialsForValidation,
  getAllMaterialsInfo,
  getAllVideosInfo,
};
