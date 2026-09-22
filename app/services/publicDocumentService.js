const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const EUROPE_PATH = path.join(UPLOADS_DIR, "europe.pdf");
const ASSESSMENT_PATH = path.join(UPLOADS_DIR, "Assessment.pdf");
const LIBRARY_PATH = path.join(UPLOADS_DIR, "Library.pdf");
const DATA_PROTECTION_PATH = path.join(UPLOADS_DIR, "Data_Protection_Policy.pdf");

const existingOrNull = (filePath) => (fs.existsSync(filePath) ? filePath : null);

const getEuropeDocumentPath = () => existingOrNull(EUROPE_PATH);
const getAssessmentDocumentPath = () => existingOrNull(ASSESSMENT_PATH);
const getLibraryDocumentPath = () => existingOrNull(LIBRARY_PATH);
const getDataProtectionDocumentPath = () => existingOrNull(DATA_PROTECTION_PATH);

module.exports = {
  getEuropeDocumentPath,
  getAssessmentDocumentPath,
  getLibraryDocumentPath,
  getDataProtectionDocumentPath
};
