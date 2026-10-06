const OlympicAssessmentService = require("../services/olympicAssessmentService");
const { tryCatch } = require("../utils/tryCatch");

const withOlympicErrorHandling = (controller, logPrefix, message) =>
  tryCatch(async (req, res) => {
    try {
      await controller(req, res);
    } catch (err) {
      if (err.message === "OLYMPIC_QUESTION_NOT_FOUND") {
        return res.status(404).json({ message: "Olympic question not found" });
      }

      console.error(logPrefix, err);
      return res.status(500).json({ message });
    }
  });

const answerQuestion = withOlympicErrorHandling(
  async (req, res) => {
    const result = await OlympicAssessmentService.answerQuestion(req.user, req.body);
    return res.status(201).json({ element: result });
  },
  "Error answering Olympic Question:",
  "Error answering Olympic Question"
);

const getAllOlympicPerformance = withOlympicErrorHandling(
  async (req, res) => {
    const userId = req.user;
    const results = await OlympicAssessmentService.getAllOlympicPerformance(userId);

    const labels = results.map((r) => r.group_name);
    const data = results.map((r) => Number(r.percentage));

    const finalObject = {
      labels,
      datasets: [
        {
          label: "My performance",
          data,
          backgroundColor: "rgb(5, 120, 183, 0.7)",
          borderRadius: 5,
          borderWidth: 1,
          borderColor: "rgb(5, 120, 183,1)",
          categoryPercentage: 0.6,
        },
      ],
    };

    return res.status(200).json({ elements: finalObject });
  },
  "Error getting all Olympic performance:",
  "Error fetching Olympic performance data"
);

const getOlympicPerformance = withOlympicErrorHandling(
  async (req, res) => {
    const studentId = req.user;
    if (!studentId) {
      return res.status(401).json({ message: "User not found" });
    }

    const filters = {
      olympicId: req.query.olympicId,
      yearId: req.query.yearId,
      phaseId: req.query.phaseId,
      levelId: req.query.levelId,
    };
    const groupBy = req.query.groupBy || "olympic";

    const results = await OlympicAssessmentService.getOlympicPerformance(
      studentId,
      filters,
      groupBy
    );

    const labels = results.map((r) => r.group_name);
    const data = results.map((r) => (r.percentage === null ? null : Number(r.percentage)));

    const finalObject = {
      labels,
      datasets: [
        {
          label: "My performance",
          data,
          backgroundColor: "rgb(5, 120, 183, 0.7)",
          borderRadius: 5,
          borderWidth: 1,
          borderColor: "rgb(5, 120, 183,1)",
          categoryPercentage: 0.6,
        },
      ],
    };

    return res.status(200).json({ elements: finalObject });
  },
  "Error getting Olympic performance:",
  "Error fetching Olympic performance data"
);

const toFilterId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getAllOlympicAssessmentsInfo = withOlympicErrorHandling(
  async (req, res) => {
    const { olympic, level, phase, year, role, date, source } = req.body;

    const finalSource = source === undefined || source === null || source === "" ? "both" : source;
    if (!OlympicAssessmentService.ASSESSMENT_INFO_SOURCES.includes(finalSource)) {
      return res.status(400).json({ message: "Invalid source" });
    }

    const filters = {
      olympic: toFilterId(olympic),
      level: toFilterId(level),
      phase: toFilterId(phase),
      year: toFilterId(year),
      // 1..4 = Student / Lecturer / Reviewer / Admin; not sent = every role
      role: Array.isArray(role)
        ? role.map(Number).filter((num) => [1, 2, 3, 4].includes(num))
        : null,
      date: /^\d{4}$/.test(String(date ?? "")) ? String(date) : null,
      source: finalSource,
    };

    const assessments = await OlympicAssessmentService.getAllOlympicAssessmentsInfo(filters);
    return res.status(200).json({ elements: assessments });
  },
  "Error getting Olympic assessments information:",
  "Error fetching Olympic assessments information"
);

module.exports = {
  answerQuestion,
  getAllOlympicPerformance,
  getOlympicPerformance,
  getAllOlympicAssessmentsInfo,
};