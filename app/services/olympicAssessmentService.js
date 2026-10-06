const OlympicQuestion = require("../models/olympicQuestionsModel");
const OlympicQuestionAssessment = require("../models/olympicQuestionAssessmentModel");
const OlympicAlternatives = require("../models/olympicAlternatives");
const Olympic = require("../models/olympicModel");
const OlympicLevel = require("../models/olympicLevelModel");
const OlympicPhase = require("../models/olympicPhaseModel");
const OlympicYear = require("../models/olympicYearModel");
const OlympiadsChallenge = require("../models/olympiadsChallengeModel");
const OlympiadsChallengeQuestion = require("../models/olympiadsChallengeQuestionModel");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const getDate = require("../utils/date");
const { QueryTypes, Op } = require("sequelize");
const db = require("../utils/db");

const answerQuestion = async (username, data) => {
  const { id_olympic_question, answer, duration } = data;

  const question = await OlympicQuestion.findByPk(id_olympic_question);
  if (!question) {
    throw new Error("not_found");
  }

  let answerValue;
  // - correct id => correct
  // - 0 => "I don't know"
  // - wrong id => wrong
  if (Number(answer) === 0) answerValue = -1;
  else if (Number(answer) === question.correctAnswerId) answerValue = 1;
  else answerValue = 0;

  const questionAssessment = await OlympicQuestionAssessment.create({
    student_id: username,
    id_olympic_question: id_olympic_question,
    answer: answerValue,
    duration: duration,
    option_selected: answer,
    date: getDate(),
  });

  const correctAnswer = await OlympicAlternatives.findByPk(question.correctAnswerId);

  return {
    id: questionAssessment.id,
    message: "Assessment recorded successfully",
    isCorrect: answerValue === 1,
    correctAnswerText: correctAnswer ? correctAnswer.text : ""
  };
};

const getAllOlympicPerformance = async (studentId) => {
  const query = `
    SELECT 
      o.id as id, 
      o.name AS group_name,
      COUNT(*) AS total_answers,
      SUM(CASE WHEN oqa.answer = 1 THEN 1 ELSE 0 END) AS correct_answers,
      ROUND((SUM(CASE WHEN oqa.answer = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) AS percentage
    FROM olympic_question_assessment oqa
    INNER JOIN olympic_questions oq ON oqa.id_olympic_question = oq.id 
    INNER JOIN olympics o ON oq.id_olympic = o.id
    WHERE oqa.student_id = :studentId
    GROUP BY o.id, o.name
    ORDER BY percentage DESC
  `;

  const results = await db.query(query, {
    replacements: { studentId },
    type: QueryTypes.SELECT
  });

  return results;
};

const getOlympicPerformance = async (studentId, filters, groupBy) => {
  const groupMapping = {
    'olympic': {
      joinClause: 'INNER JOIN olympics tbl ON oq.id_olympic = tbl.id',
      groupColumn: 'tbl.id, tbl.name',
      selectColumn: 'tbl.id, tbl.name AS group_name'
    },
    'year': {
      joinClause: 'INNER JOIN olympic_years tbl ON oq.id_olympic_year = tbl.id',
      groupColumn: 'tbl.id, tbl.year',
      selectColumn: 'tbl.id, tbl.year AS group_name'
    },
    'phase': {
      joinClause: 'INNER JOIN olympic_phases tbl ON oq.id_olympic_phase = tbl.id',
      groupColumn: 'tbl.id, tbl.phase',
      selectColumn: 'tbl.id, tbl.phase AS group_name'
    },
    'level': {
      joinClause: 'INNER JOIN olympic_levels tbl ON oq.id_olympic_level = tbl.id',
      groupColumn: 'tbl.id, tbl.level',
      selectColumn: 'tbl.id, tbl.level AS group_name'
    },
    // Month the answer was given (not the question's olympiad year). It is read
    // in SQL from the stored DATETIME so no JS timezone conversion can shift it.
    'month': {
      joinClause: '',
      groupColumn: 'group_name',
      selectColumn: "DATE_FORMAT(oqa.date, '%Y-%m') AS group_name",
      orderBy: 'group_name ASC'
    }
  };

  const config = groupMapping[groupBy] || groupMapping['olympic'];

  let whereClause = 'WHERE oqa.student_id = :studentId';
  let replacements = { studentId };

  if (filters.olympicId) {
    whereClause += ' AND oq.id_olympic = :olympicId';
    replacements.olympicId = filters.olympicId;
  }
  if (filters.yearId) {
    whereClause += ' AND oq.id_olympic_year = :yearId';
    replacements.yearId = filters.yearId;
  }
  if (filters.phaseId) {
    whereClause += ' AND oq.id_olympic_phase = :phaseId';
    replacements.phaseId = filters.phaseId;
  }
  if (filters.levelId) {
    whereClause += ' AND oq.id_olympic_level = :levelId';
    replacements.levelId = filters.levelId;
  }

  const query = `
    SELECT 
      ${config.selectColumn},
      COUNT(*) AS total_answers,
      SUM(CASE WHEN oqa.answer = 1 THEN 1 ELSE 0 END) AS correct_answers,
      ROUND((SUM(CASE WHEN oqa.answer = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) AS percentage
    FROM olympic_question_assessment oqa
    INNER JOIN olympic_questions oq ON oqa.id_olympic_question = oq.id 
    ${config.joinClause}
    ${whereClause}
    GROUP BY ${config.groupColumn}
    ORDER BY ${config.orderBy || 'percentage DESC'}
  `;

  const results = await db.query(query, {
    replacements,
    type: QueryTypes.SELECT
  });

  return groupBy === 'month' ? fillMissingMonths(results) : results;
};

const fillMissingMonths = (rows) => {
  const dated = rows.filter((row) => row.group_name);
  if (dated.length === 0) return dated;

  const rowsByMonth = new Map(dated.map((row) => [row.group_name, row]));
  const [lastYear, lastMonth] = dated[dated.length - 1].group_name.split('-').map(Number);
  let [year, month] = dated[0].group_name.split('-').map(Number);
  const filled = [];

  while (year < lastYear || (year === lastYear && month <= lastMonth)) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    filled.push(rowsByMonth.get(key) || {
      group_name: key,
      total_answers: 0,
      correct_answers: 0,
      percentage: null
    });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return filled;
};

const ASSESSMENT_INFO_SOURCES = ["assessment", "challenge", "both"];

const buildAssessmentInfoIncludes = ({ olympic, level, phase, year, role }, questionAs) => {
  const questionWhere = {};
  if (olympic) questionWhere.id_olympic = olympic;
  if (level) questionWhere.id_olympic_level = level;
  if (phase) questionWhere.id_olympic_phase = phase;
  if (year) questionWhere.id_olympic_year = year;

  const questionInclude = {
    model: OlympicQuestion,
    attributes: ["id"],
    include: [
      { model: Olympic, attributes: ["name"] },
      { model: OlympicLevel, attributes: ["level"] },
      { model: OlympicPhase, attributes: ["phase"] },
      { model: OlympicYear, attributes: ["year"] },
    ],
  };
  if (questionAs) questionInclude.as = questionAs;
  if (Object.keys(questionWhere).length > 0) questionInclude.where = questionWhere;

  const userInclude = {
    model: User,
    attributes: ["id", "typology"],
    include: [{ model: Role, attributes: ["id", "description"] }],
  };
  if (Array.isArray(role)) {
    const valueMap = {
      1: process.env.Student,
      2: process.env.Lecture,
      3: process.env.Lecture_Reviewer,
      4: process.env.Admin,
    };
    userInclude.where = { typology: role.map((num) => valueMap[num]) };
  }

  return [questionInclude, userInclude];
};

// Same flat keys for both sources, so the frontend can export the raw JSON.
const toAssessmentInfoRow = (source, item, question, studentId, challenge) => ({
  Source: source,
  Challenge: challenge ? challenge.code : null,
  student_id: studentId,
  Typology: item.user_final?.role?.description ?? null,
  question_id: item.id_olympic_question,
  Olympiad: question?.olympic?.name ?? null,
  Level: question?.olympic_level?.level ?? null,
  Phase: question?.olympic_phase?.phase ?? null,
  Year: question?.olympic_year?.year ?? null,
  option_selected: item.option_selected,
  answer: item.answer,
  date: item.date,
  duration: item.duration,
});

const getAllOlympicAssessmentsInfo = async (data) => {
  const { date } = data;
  const source = data.source || "both";
  const conditions = {};
  if (date) conditions.date = { [Op.substring]: date };

  let assessments = [];
  let challenges = [];

  if (source !== "challenge") {
    const rows = await OlympicQuestionAssessment.findAll({
      where: conditions,
      attributes: ["student_id", "id_olympic_question", "answer", "date", "duration", "option_selected"],
      include: buildAssessmentInfoIncludes(data, "question_details"),
      order: [["date", "ASC"]],
    });
    assessments = rows.map((item) =>
      toAssessmentInfoRow("Assessment", item, item.question_details, item.student_id, null)
    );
  }

  if (source !== "assessment") {
    const rows = await OlympiadsChallengeQuestion.findAll({
      // option_selected = -1 is the placeholder created when the student starts the challenge
      where: { ...conditions, option_selected: { [Op.ne]: -1 } },
      attributes: ["user_id", "id_olympic_question", "answer", "date", "duration", "option_selected"],
      include: [
        ...buildAssessmentInfoIncludes(data),
        { model: OlympiadsChallenge, attributes: ["code", "title"] },
      ],
      order: [["date", "ASC"]],
    });
    challenges = rows.map((item) =>
      toAssessmentInfoRow("Challenge", item, item.olympic_question, item.user_id, item.olympiads_challenge)
    );
  }

  if (source !== "both") return source === "assessment" ? assessments : challenges;

  return [...assessments, ...challenges].sort((a, b) => new Date(a.date) - new Date(b.date));
};


module.exports = {
  answerQuestion,
  getAllOlympicPerformance,
  getOlympicPerformance,
  getAllOlympicAssessmentsInfo,
  ASSESSMENT_INFO_SOURCES
}