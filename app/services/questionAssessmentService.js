const QuestionAssessment = require("../models/QuestionAssessmentModel");
const { Sequelize, Op } = require("sequelize");
const getDate = require("../utils/date");
const Topic = require("../models/topicModel");
const Question = require("../models/questionModel");
const Subtopic = require("../models/subtopicModel");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const topicService = require("./topicService");
const subtopicService = require("./subtopicService");
const questionService = require("./questionService");

const addAssessment = async (userID,data) => {
  const {
    topic,
    subtopic,
    question_id,
    question_level,
    answer,
    duration,
    option_selected,
  } = data;
  const date = getDate();
  return new Promise((resolve, reject) => {
    QuestionAssessment.create({
      student_id: userID,
      topic: topic,
      subtopic: subtopic,
      question_id: question_id,
      question_level: question_level,
      answer: answer,
      option_selected: option_selected,
      duration: duration,
      date: date,
    })
      .then((newMaterial) => {
        return resolve(newMaterial);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

// Callers (getAllTopicPerformance, getAllSubtopicsPerformance) only access
// `topic` and `percentage` from the results — student_id, correct, total
// and the Topic include were not used and were removed.
const getPerformanceById = (userId, topics) => {
  return new Promise((resolve, reject) => {
    QuestionAssessment.findAll({
      attributes: [
        "topic",
        [
          Sequelize.literal(
            "(COALESCE(COUNT(CASE WHEN answer = 1 THEN 1 ELSE NULL END), 0) * 100.0 / COALESCE(COUNT(*), 0))",
          ),
          "percentage",
        ],
      ],
      where: {
        student_id: userId,
        topic: topics,
      },
      group: ["student_id", "topic"],
    })
      .then((results) => {
        return resolve(results);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({
          kind: "Error Getting Info",
          message: "/getPerformanceById",
        });
      });
  });
};

const getGlobalPerformance = (topics) => {
  return new Promise((resolve, reject) => {
    QuestionAssessment.findAll({
      attributes: [
        "topic",
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.literal(
              "COUNT(CASE WHEN answer = 1 THEN 1 ELSE NULL END)",
            ),
            0,
          ),
          "correct",
        ],
        [Sequelize.fn("COALESCE", Sequelize.fn("COUNT", "*"), 0), "total"],
        [
          Sequelize.literal(
            "(COALESCE(COUNT(CASE WHEN answer = 1 THEN 1 ELSE NULL END), 0) * 100.0 / COALESCE(COUNT(*), 0))",
          ),
          "percentage",
        ],
      ],
      where: {
        topic: topics,
      },
      include: [{ model: Topic, attributes: ["name"] }],
      group: [
        "topic",
        Sequelize.col("platform__topic.id"),
        Sequelize.col("platform__topic.name"),
      ],
    })
      .then((results) => {
        return resolve(results);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({
          kind: "Error Getting Info",
          message: "/getGlobalPerformance",
        });
      });
  });
};

const getSubtopicPerformanceById = (userId, subtopics) => {
  return new Promise((resolve, reject) => {
    QuestionAssessment.findAll({
      attributes: [
        "student_id",
        "subtopic",
        [
          Sequelize.literal(
            "(COALESCE(COUNT(CASE WHEN answer = 1 THEN 1 ELSE NULL END), 0) * 100.0 / COALESCE(COUNT(*), 0))",
          ),
          "percentage",
        ],
      ],
      where: {
        student_id: userId,
        subtopic: subtopics,
      },
      group: ["student_id", "subtopic"],
    })
      .then((results) => {
        return resolve(results);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Getting Info" });
      });
  });
};

const getSubtopicGlobalPerformance = (subtopics) => {
  return new Promise((resolve, reject) => {
    QuestionAssessment.findAll({
      attributes: [
        "subtopic",
        [
          Sequelize.literal(
            "(COALESCE(COUNT(CASE WHEN answer = 1 THEN 1 ELSE NULL END), 0) * 100.0 / COALESCE(COUNT(*), 0))",
          ),
          "percentage",
        ],
      ],
      where: {
        subtopic: subtopics,
      },
      group: ["subtopic"],
    })
      .then((results) => {
        return resolve(results);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Getting Info" });
      });
  });
};

const queryLevelPerformance = (where) => {
  return QuestionAssessment.findAll({
    attributes: [
      "question_level",
      [
        Sequelize.literal(
          "(COALESCE(COUNT(CASE WHEN answer = 1 THEN 1 ELSE NULL END), 0) * 100.0 / COALESCE(COUNT(*), 0))",
        ),
        "percentage",
      ],
    ],
    where,
    group: ["question_level"],
  });
};

const getLevelPerformanceById = (levels, topic, subtopic, userId) => {
  const where = { question_level: levels, student_id: userId };
  if (subtopic != null) where.subtopic = subtopic;
  else where.topic = topic;
  return queryLevelPerformance(where);
};

const getGlobalLevelPerformance = (levels, topic, subtopic) => {
  const where = { question_level: levels };
  if (subtopic != null) where.subtopic = subtopic;
  else where.topic = topic;
  return queryLevelPerformance(where);
};

const updateLevelById = async (id, level) => {
  return new Promise((resolve, reject) => {
    QuestionAssessment.update(
      {
        question_level: level,
      },
      {
        where: { question_id: id },
      },
    )
      .then((question) => {
        return resolve(question);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const updateLevelsInBulk = async (ids, levels) => {
  for (let i = 0; i < ids.length; i++) {
    await updateLevelById(ids[i], levels[i]);
  }
};

const EXPR_RATE =
  "(COALESCE(COUNT(CASE WHEN answer = 1 THEN 1 ELSE NULL END), 0) * 100.0 / COALESCE(COUNT(*), 0))";
const EXPR_CORRECT =
  "(COALESCE(COUNT(CASE WHEN answer = 1 THEN 1 ELSE NULL END), 0))";
const EXPR_WRONG =
  "(COALESCE(COUNT(CASE WHEN answer = 0 THEN 1 ELSE NULL END), 0))";

const queryOverTime = async (
  { userId, topic, subtopic, year, month },
  percentageExpr,
) => {
  const attributes = [];
  const baseConditions = {};
  const group = [];

  if (userId != null) {
    attributes.push("student_id");
    baseConditions.student_id = userId;
    group.push("student_id");
  }

  attributes.push([Sequelize.literal(percentageExpr), "percentage"]);

  if (topic != null) {
    baseConditions.topic = topic;
    attributes.push("topic");
    group.push("topic");
  }
  if (subtopic != null) {
    baseConditions.subtopic = subtopic;
    attributes.push("subtopic");
    group.push("subtopic");
  }

  const dateConditions = [];
  if (year) {
    dateConditions.push(
      Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
    );
    group.push(Sequelize.fn("YEAR", Sequelize.col("date")));
    if (month) {
      dateConditions.push(
        Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("date")), month),
      );
      attributes.push([Sequelize.fn("DAY", Sequelize.col("date")), "day"]);
      group.push(Sequelize.fn("DAY", Sequelize.col("date")));
    } else {
      attributes.push([Sequelize.fn("MONTH", Sequelize.col("date")), "month"]);
      group.push(Sequelize.fn("MONTH", Sequelize.col("date")));
    }
  } else {
    attributes.push([Sequelize.fn("YEAR", Sequelize.col("date")), "year"]);
    group.push(Sequelize.fn("YEAR", Sequelize.col("date")));
  }

  return QuestionAssessment.findAll({
    attributes,
    where: { [Op.and]: [baseConditions, ...dateConditions] },
    group,
    order: group.map((field) => [field, "ASC"]),
  });
};

const getGlobalPerformanceOverTime = (data) => queryOverTime(data, EXPR_RATE);
const getStudentPerformanceOverTime = (data) => queryOverTime(data, EXPR_RATE);
const getCorrectAnswers = (data) => queryOverTime(data, EXPR_CORRECT);
const getWrongAnswers = (data) => queryOverTime(data, EXPR_WRONG);

const structureMonth = (student, global, color1, color2, label1, label2) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const studentData = Array(12).fill(null);
  const globalData = Array(12).fill(null);

  student.forEach((entry) => {
    if (entry.dataValues.month >= 1 && entry.dataValues.month <= 12) {
      studentData[entry.dataValues.month - 1] = parseInt(
        entry.dataValues.percentage,
      );
    }
  });

  global.forEach((entry) => {
    if (entry.dataValues.month >= 1 && entry.dataValues.month <= 12) {
      globalData[entry.dataValues.month - 1] = parseInt(
        entry.dataValues.percentage,
      );
    }
  });

  const filteredMonths = months.filter(
    (month, index) => studentData[index] !== null || globalData[index] !== null,
  );

  const filteredStudentData = filteredMonths.map(
    (month) => studentData[months.indexOf(month)] || 0,
  );
  const filteredGlobalData = filteredMonths.map(
    (month) => globalData[months.indexOf(month)] || 0,
  );

  return {
    labels: filteredMonths,
    datasets: [
      {
        label: label1,
        data: filteredStudentData,
        borderColor: color1,
        backgroundColor: color1,
        yAxisID: "y",
      },
      {
        label: label2,
        data: filteredGlobalData,
        borderColor: color2,
        backgroundColor: color2,
        yAxisID: "y",
      },
    ],
  };
};

const structureYear = (student, global, color1, color2, label1, label2) => {
  const years = [
    ...new Set([
      ...student.map((entry) => entry.dataValues.year),
      ...global.map((entry) => entry.dataValues.year),
    ]),
  ].sort((a, b) => a - b);

  const studentData = Array(years.length).fill(null);
  const globalData = Array(years.length).fill(null);

  student.forEach((entry) => {
    const index = years.indexOf(entry.dataValues.year);
    if (index !== -1) {
      studentData[index] = parseInt(entry.dataValues.percentage);
    }
  });

  global.forEach((entry) => {
    const index = years.indexOf(entry.dataValues.year);
    if (index !== -1) {
      globalData[index] = parseInt(entry.dataValues.percentage);
    }
  });

  const filteredStudentData = studentData.map((value) =>
    value !== null ? value : 0,
  );
  const filteredGlobalData = globalData.map((value) =>
    value !== null ? value : 0,
  );

  return {
    labels: years,
    datasets: [
      {
        label: label1,
        data: filteredStudentData,
        borderColor: color1,
        backgroundColor: color1,
        yAxisID: "y",
      },
      {
        label: label2,
        data: filteredGlobalData,
        borderColor: color2,
        backgroundColor: color2,
        yAxisID: "y",
      },
    ],
  };
};

const structureDay = (student, global, color1, color2, label1, label2) => {
  const days = [
    ...new Set([
      ...student.map((entry) => entry.dataValues.day),
      ...global.map((entry) => entry.dataValues.day),
    ]),
  ].sort((a, b) => a - b);

  const studentData = Array(days.length).fill(null);
  const globalData = Array(days.length).fill(null);

  student.forEach((entry) => {
    const index = days.indexOf(entry.dataValues.day);
    if (index !== -1) {
      studentData[index] = parseInt(entry.dataValues.percentage);
    }
  });

  global.forEach((entry) => {
    const index = days.indexOf(entry.dataValues.day);
    if (index !== -1) {
      globalData[index] = parseInt(entry.dataValues.percentage);
    }
  });

  const filteredStudentData = studentData.map((value) =>
    value !== null ? value : 0,
  );
  const filteredGlobalData = globalData.map((value) =>
    value !== null ? value : 0,
  );

  days.forEach((entry, index) => {
    days[index] = "Day " + entry;
  });

  return {
    labels: days,
    datasets: [
      {
        label: label1,
        data: filteredStudentData,
        borderColor: color1,
        backgroundColor: color1,
        yAxisID: "y",
      },
      {
        label: label2,
        data: filteredGlobalData,
        borderColor: color2,
        backgroundColor: color2,
        yAxisID: "y",
      },
    ],
  };
};

const findAll = async () => {
  return QuestionAssessment.findAll();
};

const findById = async (id) => {
  return QuestionAssessment.findByPk(id);
};

const getAllAssessmentsInfo = async (data) => {
  const { topic, subtopic, role, date } = data;
  const conditions = {};
  const paramsToFields = [
    { param: topic, field: "topic" },
    { param: subtopic, field: "subtopic" },
  ];
  const valueMap = { 1: 5584, 2: 5139, 3: 8079, 4: 7811 };
  const finalRoles = role.map((num) => valueMap[num]);

  for (const { param, field } of paramsToFields) {
    if (param !== null) conditions[field] = param;
  }
  if (date !== null) conditions["date"] = { [Op.substring]: date };

  const assessment = await QuestionAssessment.findAll({
    where: { [Op.and]: [conditions] },
    attributes: [
      "id",
      "student_id",
      "question_id",
      "topic",
      "subtopic",
      "question_level",
      "answer",
      "date",
      "duration",
      "option_selected",
    ],
    include: [
      { model: Question },
      { model: Topic },
      { model: Subtopic },
      {
        model: User,
        where: { typology: finalRoles },
        include: [{ model: Role }],
      },
    ],
    order: [["date", "ASC"]],
  });

  return assessment.map((item) => {
    const d = { ...item.dataValues };
    d.Topic = d.platform__topic.name;
    d.Subtopic =
      d.platform__subtopic == null ? null : d.platform__subtopic.name;
    d.Lecturer_level = d.platform__sna__question == null ? null : d.platform__sna__question.newLevel;
    d.Algorithm_level = d.platform__sna__question == null ? null : d.platform__sna__question.algorithmLevel;
    d.Typology = d.user_final?.role?.description ?? null;
    delete d.user_final;
    delete d.platform__topic;
    delete d.platform__subtopic;
    delete d.topic;
    delete d.subtopic;
    delete d.platform__sna__question;
    delete d.question_level;
    delete d.id;
    return d;
  });
};

const getPerformanceOverTime = async (userId,data) => {
  const { year, month, ...dataWithoutUserID } = data;
  data.userId = userId;
  const student = await getStudentPerformanceOverTime(data);
  const global = await getGlobalPerformanceOverTime(dataWithoutUserID);
  const color1 = "#4db6db";
  const color2 = "#e8ad6d";
  const label1 = "My performance";
  const label2 = "Global Performance";

  if (year == null)
    return structureYear(student, global, color1, color2, label1, label2);
  if (month != null)
    return structureDay(student, global, color1, color2, label1, label2);
  return structureMonth(student, global, color1, color2, label1, label2);
};

const getAnswerOverview = async (userID, data) => {
  const { year, month } = data;
  data.userId = userID;
  const correct = await getCorrectAnswers(data);
  const wrong = await getWrongAnswers(data);
  const color1 = "#8AFF8A";
  const color2 = "#FF2E2E";
  const label1 = "My correct Answers";
  const label2 = "My wrong Answers";

  if (year == null)
    return structureYear(correct, wrong, color1, color2, label1, label2);
  if (month != null)
    return structureDay(correct, wrong, color1, color2, label1, label2);
  return structureMonth(correct, wrong, color1, color2, label1, label2);
};

const getAllTopicPerformance = async (userId) => {
  const topics = await topicService.getAllTopics();
  const topicIds = topics.map((t) => t.id);

  const user = await getPerformanceById(userId, topicIds);
  const global = await getGlobalPerformance(topicIds);

  const userMap = {};
  user.forEach((u) => {
    userMap[u.dataValues.topic] = parseInt(u.dataValues.percentage);
  });

  const globalMap = {};
  global.forEach((g) => {
    globalMap[g.dataValues.topic] = parseInt(g.dataValues.percentage);
  });

  return {
    labels: topics.map((t) => t.label),
    datasets: [
      {
        label: "My performance",
        data: topicIds.map((id) => userMap[id] ?? 0),
        backgroundColor: "rgb(5, 120, 183, 0.7)",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "rgb(5, 120, 183,1)",
        categoryPercentage: 0.6,
      },
      {
        label: "Global performance",
        data: topicIds.map((id) => globalMap[id] ?? 0),
        backgroundColor: "rgb(93, 93, 93, 0.5)",
        borderRadius: 5,
      },
    ],
  };
};

const getAllSubtopicsPerformance = async (userID,data) => {
  const { topic } = data;
  let userPerformance, globalPerformance;
  let finalLabels;

  const subtopics = await subtopicService.getAllSubtopics(null, topic);
  const subtopicNames = subtopics.map((s) => s.label);
  const subtopicIds = subtopics.map((s) => s.id);

  let user = await getSubtopicPerformanceById(userID, subtopicIds);

  if (subtopicIds.length === 0) {
    user = await getPerformanceById(userID, topic);
    const global = await getGlobalPerformance(topic);

    userPerformance = user.map((u) => parseInt(u.dataValues.percentage));
    globalPerformance = global.map((g) => parseInt(g.dataValues.percentage));
    finalLabels = global.map((g) => {
      if (g.dataValues.topic === topic)
        return g.dataValues.platform__topic.name;
    });
  } else {
    const global = await getSubtopicGlobalPerformance(subtopicIds);

    userPerformance = subtopicIds.map((id) => {
      const match = user.find((a) => a.dataValues.subtopic === id);
      return match ? parseInt(match.dataValues.percentage) : 0;
    });
    globalPerformance = subtopicIds.map((id) => {
      const match = global.find((a) => a.dataValues.subtopic === id);
      return match ? parseInt(match.dataValues.percentage) : 0;
    });
    finalLabels = subtopicNames;
  }

  if (user.length === 0) {
    return {
      labels: finalLabels,
      datasets: [
        {
          label: "Global performance",
          data: globalPerformance,
          borderRadius: 5,
        },
      ],
    };
  }

  return {
    labels: finalLabels,
    datasets: [
      {
        label: "My performance",
        data: userPerformance,
        backgroundColor: "rgb(5, 120, 183, 0.7)",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "rgb(5, 120, 183,1)",
      },
      { label: "Global performance", data: globalPerformance, borderRadius: 5 },
    ],
  };
};

const getLevelPerformance = async (userID, data) => {
  const { topic,  subtopic } = data;
  const merged = [];

  const levelsArray = await questionService.getAllLevels();
  const user = await getLevelPerformanceById(
    levelsArray,
    topic,
    subtopic,
      userID,
  );
  const global = await getGlobalLevelPerformance(levelsArray, topic, subtopic);

  global.forEach((globalItem) => {
    if (globalItem.dataValues.percentage > 0.0) {
      const userItem = user.find(
        (u) => u.question_level === globalItem.question_level,
      );
      const userRest =
        100 - (userItem ? parseInt(userItem.dataValues.percentage) : 0);
      const globalRest = 100 - parseInt(globalItem.dataValues.percentage);
      merged.push({
        level: globalItem.dataValues.question_level,
        data: {
          datasets: [
            {
              label: "My performance",
              data: [
                userItem ? parseInt(userItem.dataValues.percentage) : 0,
                userRest,
              ],
              backgroundColor: [
                "rgb(5, 120, 183, 0.7)",
                "rgb(5, 120, 183, 0.2)",
              ],
            },
            {
              label: "Global",
              data: [parseInt(globalItem.dataValues.percentage), globalRest],
              backgroundColor: [
                "rgb(93, 93, 93, 0.5)",
                "rgb(220, 220, 220,0.4)",
              ],
            },
          ],
        },
      });
    }
  });

  return merged;
};

module.exports = {
  findAll,
  findById,
  addAssessment,
  getAllAssessmentsInfo,
  getPerformanceOverTime,
  getAnswerOverview,
  getAllTopicPerformance,
  getAllSubtopicsPerformance,
  getLevelPerformance,
  getPerformanceById,
  getGlobalPerformance,
  getSubtopicGlobalPerformance,
  getStudentPerformanceOverTime,
  getSubtopicPerformanceById,
  updateLevelById,
  updateLevelsInBulk,
  getGlobalPerformanceOverTime,
  structureMonth,
  structureYear,
  structureDay,
  getCorrectAnswers,
  getWrongAnswers,
};
