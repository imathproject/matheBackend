const OlympicService = require("../services/OlympicService");
const { tryCatch } = require("../utils/tryCatch");
const multer = require("multer");
const path = require("path");

const getOlympic = tryCatch(async (req, res) => {
    const { id } = req.params;
    const olympic = await OlympicService.getOlympic(id);
    return res.status(200).json({ element: olympic });
});

const getAllOlympics = tryCatch(async (req, res) => {
    const olympics = await OlympicService.getAllOlympics();
    return res.status(200).json({ elements: olympics });
});

const getAllOlympicsEnriched = tryCatch(async (req, res) => {
    const olympics = await OlympicService.getAllOlympicsEnriched();
    return res.status(200).json({ elements: olympics });
});

const addNewOlympic = tryCatch(async (req, res) => {
    const newOlympic = await OlympicService.addNewOlympic(req.body);
    return res.status(201).json({ element: newOlympic });
});

const deleteOlympic = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await OlympicService.deleteOlympic(id);
    return res.status(200).json(result);
});

const updateOlympic = tryCatch(async (req, res) => {
    const result = await OlympicService.updateOlympic(req.body);
    return res.status(200).json(result);
});

const getOlympicLevel = tryCatch(async (req, res) => {
    const { id } = req.params;
    const level = await OlympicService.getOlympicLevel(id);
    return res.status(200).json({ element: level });
});

const addNewOlympicLevel = tryCatch(async (req, res) => {
    const newOlympicLevel = await OlympicService.addNewOlympicLevel(req.body);
    return res.status(201).json({ element: newOlympicLevel });
});

const getAllOlympicLevels = tryCatch(async (req, res) => {
    const { olympic } = req.params;
    const levels = await OlympicService.getAllOlympicLevels(olympic);
    return res.status(200).json({ elements: levels });
});

const updateOlympicLevel = tryCatch(async (req, res) => {
    const result = await OlympicService.updateOlympicLevel(req.body);
    return res.status(200).json(result);
});

const deleteOlympicLevel = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await OlympicService.deleteOlympicLevel(id);
    return res.status(200).json(result);
});

const addNewOlympicYear = tryCatch(async (req, res) => {
    const newOlympicYear = await OlympicService.addNewOlympicYear(req.body);
    return res.status(201).json({ element: newOlympicYear });
});

const getOlympicYear = tryCatch(async (req, res) => {
    const { id } = req.params;
    const year = await OlympicService.getOlympicYear(id);
    return res.status(200).json({ element: year });
});

const getAllOlympicYears = tryCatch(async (req, res) => {
    const { olympic } = req.params;
    const years = await OlympicService.getAllOlympicYears(olympic);
    return res.status(200).json({ elements: years });
});

const updateOlympicYear = tryCatch(async (req, res) => {
    const result = await OlympicService.updateOlympicYear(req.body);
    return res.status(200).json(result);
});

const deleteOlympicYear = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await OlympicService.deleteOlympicYear(id);
    return res.status(200).json(result);
});

//Phase
const addNewOlympicPhase = tryCatch(async (req, res) => {
    const newOlympicPhase = await OlympicService.addNewOlympicPhase(req.body);
    return res.status(201).json({ element: newOlympicPhase });
});

const getOlympicPhase = tryCatch(async (req, res) => {
    const { id } = req.params;
    const phase = await OlympicService.getOlympicPhase(id);
    return res.status(200).json({ element: phase });
});

const getAllOlympicPhases = tryCatch(async (req, res) => {
    const { olympic } = req.params;
    const phases = await OlympicService.getAllOlympicPhases(olympic);
    return res.status(200).json({ elements: phases });
});

const updateOlympicPhase = tryCatch(async (req, res) => {
    const result = await OlympicService.updateOlympicPhase(req.body);
    return res.status(200).json(result);
});

const deleteOlympicPhase = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await OlympicService.deleteOlympicPhase(id);
    return res.status(200).json(result);
});

// Image upload via multer — saves to olympiadsImage/ folder
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "olympiadsImage");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: imageStorage });

const uploadOlympicImage = tryCatch(async (req, res) => {
    await new Promise((resolve, reject) => {
        upload.single("file")(req, res, (err) => {
            if (err) {
                console.error("Error uploading file:", err);
                reject(err);
                return;
            }
            resolve();
        });
    });
    res.status(200).json({ message: "File uploaded successfully" });
});

module.exports = {
    getOlympic,
    getAllOlympics,
    addNewOlympic,
    deleteOlympic,
    updateOlympic,
    getAllOlympicsEnriched,

    getOlympicLevel,
    addNewOlympicLevel,
    getAllOlympicLevels,
    updateOlympicLevel,
    deleteOlympicLevel,

    addNewOlympicYear,
    getOlympicYear,
    getAllOlympicYears,
    updateOlympicYear,
    deleteOlympicYear,

    addNewOlympicPhase,
    getOlympicPhase,
    getAllOlympicPhases,
    updateOlympicPhase,
    deleteOlympicPhase,
    uploadOlympicImage,
}