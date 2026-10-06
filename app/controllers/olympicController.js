const OlympicService = require("../services/OlympicService");
const userService = require("../services/userService");
const { tryCatch } = require("../utils/tryCatch");
const upload = require("../../middleware/upload");

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

const REQUIRED_LISTS = ["levels", "years", "phases"];

// Trimmed, non-blank and unique (case-insensitive) values of a list, or [] when
// the payload is not a list at all.
const cleanList = (values) => {
    if (!Array.isArray(values)) return [];

    const seen = new Set();
    return values
        .filter((value) => typeof value === "string" || typeof value === "number")
        .map((value) => String(value).trim())
        .filter((value) => {
            const key = value.toLowerCase();
            if (!value || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

const isBlank = (value) =>
    (typeof value !== "string" && typeof value !== "number") || String(value).trim() === "";

const addNewOlympic = tryCatch(async (req, res) => {
    const lists = {};
    for (const field of REQUIRED_LISTS) {
        lists[field] = cleanList(req.body[field]);
        if (lists[field].length === 0) {
            return res.status(400).json({ message: `${field} is required: send at least one.` });
        }
    }

    const newOlympic = await OlympicService.addNewOlympic({ ...req.body, ...lists });
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
    if (isBlank(req.body.level)) {
        return res.status(400).json({ message: "level is required." });
    }
    const newOlympicLevel = await OlympicService.addNewOlympicLevel(req.body);
    return res.status(201).json({ element: newOlympicLevel });
});

const getAllOlympicLevels = tryCatch(async (req, res) => {
    const { olympic } = req.params;
    const levels = await OlympicService.getAllOlympicLevels(olympic);
    return res.status(200).json({ elements: levels });
});

const updateOlympicLevel = tryCatch(async (req, res) => {
    if (isBlank(req.body.level)) {
        return res.status(400).json({ message: "level is required." });
    }
    const result = await OlympicService.updateOlympicLevel(req.body);
    return res.status(200).json(result);
});

const deleteOlympicLevel = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await OlympicService.deleteOlympicLevel(id);
    return res.status(200).json(result);
});

const addNewOlympicYear = tryCatch(async (req, res) => {
    if (isBlank(req.body.year)) {
        return res.status(400).json({ message: "year is required." });
    }
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
    if (isBlank(req.body.year)) {
        return res.status(400).json({ message: "year is required." });
    }
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
    if (isBlank(req.body.phase)) {
        return res.status(400).json({ message: "phase is required." });
    }
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
    if (isBlank(req.body.phase)) {
        return res.status(400).json({ message: "phase is required." });
    }
    const result = await OlympicService.updateOlympicPhase(req.body);
    return res.status(200).json(result);
});

const deleteOlympicPhase = tryCatch(async (req, res) => {
    const { id } = req.params;
    const result = await OlympicService.deleteOlympicPhase(id);
    return res.status(200).json(result);
});

const uploadOlympicImage = tryCatch(async (req, res) => {
    await upload("olympiadsImage")(req, res);
    res.status(200).json({ message: "File uploaded successfully" });
});

//Project Information reports
const getAllOlympicsInfo = tryCatch(async (req, res) => {
    const olympics = await OlympicService.getOlympicsInfo();
    return res.status(200).json({ elements: olympics });
});

const getAllOlympicUsersInfo = tryCatch(async (req, res) => {
    // Same body as HE "user/userInformation": role = [1..4]
    const received = req.body.role ?? req.body.roles;
    const roles = (Array.isArray(received) ? received : [])
        .map((role) => Number(role))
        .filter((role) => Number.isInteger(role) && role >= 1 && role <= 4);
    const users = await userService.getOlympicUsersInfo(roles);
    return res.status(200).json({ elements: users });
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

    getAllOlympicsInfo,
    getAllOlympicUsersInfo,
}