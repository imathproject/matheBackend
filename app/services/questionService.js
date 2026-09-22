const Question = require("../models/questionModel");
const QuestionAssessment = require("../models/QuestionAssessmentModel");
const Keyword = require("../models/keywordModel");
const Material = require("../models/materialModel");
const MaterialKeyword = require("../models/materialKeywordModel");
const Topic = require("../models/topicModel");
const Subtopic = require("../models/subtopicModel");
const User = require("../models/userModel");
const { Op } = require("sequelize");
const getDate = require("../utils/date");
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const keywordService = require("./keywordService");
const questionKeywordService = require("./questionKeywordService");
const permissionService = require("./permissionsService");

const QUESTIONS_IMAGE_DIR = path.join(__dirname, "../../questionsImage");

// Internal helper — deletes existing keyword links and creates new ones.
// Safe for new questions: deleteByQuestionId is a no-op when no links exist.
const relinkKeywords = async (questionId, keywordIds) => {
  await questionKeywordService.deleteByQuestionId(questionId);
  const keywords = await keywordService.getKeywords({ id: keywordIds });
  await questionKeywordService.insertInBulk(questionId, keywords);
};

const updateById = async (req) => {
  console.log(req);
  return new Promise((resolve, reject) => {
    Question.update(
      {
        topic: req.topic,
        subtopic: req.subtopic,
        question: req.question,
        newLevel: req.level,
        answer1: req.a1,
        answer2: req.a2,
        answer3: req.a3,
        answer4: req.a4,
        validate: req.validate,
        file_ext: req.file_ext,
        file_name: req.file_name,
      },
      {
        where: { id: req.id },
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

const updateLevelById = async (id, level) => {
  return new Promise((resolve, reject) => {
    Question.update(
      {
        algorithmLevel: level,
      },
      {
        where: { id: id },
      },
    )
      .then((question) => {
        console.log(id);
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

const getQuestion = async (id) => {
  return new Promise((resolve, reject) => {
    Question.findByPk(id, {
      include: [
        Topic,
        Subtopic,
        { model: Keyword, attributes: ["id"], raw: true },
      ],
    })
      .then((question) => {
        if (question) {
          //TODO: logging
          //console.log(question);
          const keywordIds = question.dataValues.platform__keywords.map(
            (keyword) => keyword.id,
          );
          question = {
            ...question.toJSON(),
            lecturer_level: question.newLevel,
            keywordIds,
          };
          return resolve(question);
        }
        return reject({ kind: "not_found" });
      })
      .catch((err) => {
        // TODO: throw err?
        return reject({ kind: "Error Update" });
      });
  });
};

const getAllQuestions = async () => {
  return new Promise((resolve, reject) => {
    Question.findAll({
      where: { validate: 1 },
      attributes: ["id", ["newLevel", "level"], "topic", "subtopic"],
      include: [{ model: Keyword, attributes: ["id"], raw: true }],
    })
      .then((questions) => {
        if (questions) {
          const updatedQuestions = questions.map((question) => {
            const keyword = question.platform__keywords.map(
              (keyword) => keyword.id,
            );
            // Convert question to JSON, remove platform__keywords, and add keywordIds
            const questionJson = question.toJSON();
            delete questionJson.platform__keywords;
            return {
              ...questionJson,
              keyword,
            };
          });
          console.log(updatedQuestions);
          return resolve(updatedQuestions);
        }
        return reject({ kind: "User not found" });
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const deleteById = async (id) => {
  return new Promise((resolve, reject) => {
    Question.destroy({
      where: { id: id },
    })
      .then((item) => {
        return resolve("Success");
      })
      .catch((err) => {
        return reject({ kind: "Forbiden" });
      });
  });
};

const addNewQuestion = async (userID, req) => {
  const date = getDate();
  return new Promise((resolve, reject) => {
    Question.create({
      id_lect: userID,
      description: req.description,
      topic: req.topic,
      subtopic: req.subtopic,
      question: req.question,
      newLevel: req.level,
      answer1: req.a1,
      answer2: req.a2,
      answer3: req.a3,
      answer4: req.a4,
      file_name: req.file_name,
      file_ext: req.file_ext,
      date: date,
      validate: req.validate,
    })
      .then((newQuestion) => {
        return resolve(newQuestion);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const validateQuestion = (userID, req) => {
  const date = new Date();
  return new Promise((resolve, reject) => {
    Question.update(
      {
        topic: req.topic,
        subtopic: req.subtopic,
        question: req.question,
        newLevel: req.level,
        answer1: req.a1,
        answer2: req.a2,
        answer3: req.a3,
        answer4: req.a4,
        validate: req.validate,
        file_ext: req.file_ext,
        file_name: req.file_name,
        validate_date: date,
        validate_by: userID,
      },
      {
        where: { id: req.id },
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

const getLecturerQuestions = async (userID, data) => {
  const conditions = { validate: { [Op.ne]: 0 } };
  const paramsToFields = [
    { param: data.topic, field: "topic" },
    { param: data.subtopic, field: "subtopic" },
    { param: data.validate, field: "validate" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }

  return new Promise((resolve, reject) => {
    Question.findAll({
      where: {
        [Op.and]: [{ id_lect: userID }, conditions],
      },
      order: [["id", "DESC"]],
      include: [
        Topic,
        Subtopic,
      ],
    })
      .then((questions) => {
        if (questions) return resolve(questions);
        return reject({ kind: "Not Found" });
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const getAllLevels = async () => {
  return new Promise((resolve, reject) => {
    Question.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("newLevel")), "newLevel"],
      ],
      where: {
        newLevel: {
          [Sequelize.Op.gt]: 0,
        },
      },
      order: [["newLevel", "ASC"]],
    })
      .then((levels) => {
        if (levels) return resolve(levels.map((level) => level.newLevel));
        return reject({ kind: "Levels not found" });
      })
      .catch((err) => {
        return reject({ kind: "Error Update" });
      });
  });
};

const countQuestions = () => {
  return new Promise((resolve, reject) => {
    Question.count({
      where: {
        validate: 1,
      },
    })
      .then((count) => {
        console.log("Number of questions", count);
        return resolve(count);
      })
      .catch((err) => {
        console.log(err);
        return reject({ kind: "Error Counting Users" });
      });
  });
};

const getQuestionsForValidation = (permissions, data, lect) => {
  const conditions = { validate: { [Op.ne]: 0 } };
  const paramsToFields = [
    { param: data.topic, field: "topic" },
    { param: data.subtopic, field: "subtopic" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null && param !== undefined) {
      conditions[field] = param;
    }
  }
  return new Promise((resolve, reject) => {
    Question.findAll({
      where: {
        [Op.and]: [
          {
            validate: 4,
          },
          {topic: permissions.topics},
          conditions,
        ],
      },
      include: [
        Topic,
        Subtopic,
        { model: Keyword, attributes: ["id"], raw: true },
      ],
    })
      .then((question) => {
        if (question) {
          console.log(question);
          // const keywordIds = question.dataValues.platform__keywords.map(keyword => keyword.id);
          // question = {
          //   ...question.toJSON(),
          //   keywordIds
          // };
          return resolve(question);
        }
        return reject({ kind: "not_found" });
      })
      .catch((err) => {
        console.log(err);
        return reject({ kind: "Error Getting Questions" });
      });
  });
};

const getQuestionsForValidationAdmin = (data) => {
  const conditions = { validate: { [Op.ne]: 0 } };
  const paramsToFields = [
    { param: data.topic, field: "topic" },
    { param: data.subtopic, field: "subtopic" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }
  return new Promise((resolve, reject) => {
    Question.findAll({
      where: {
        [Op.and]: [{ validate: 4 }, conditions],
      },
      include: [
        Topic,
        Subtopic,
        { model: Keyword, attributes: ["id"], raw: true },
      ],
    })
      .then((question) => {
        if (question) {
          //TODO: logging
          //console.log(question);
          return resolve(question);
        }
        return reject({ kind: "User not found" });
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err);
        return reject({ kind: "Error Counting Users" });
      });
  });
};

// Returns questions with topic/subtopic labels, author/validator names,
// and counts of linked teaching materials and video lessons.
// Filters by topic and/or subtopic if provided; returns [] when no results are found.
const getAllQuestionsInfo = async ({ topic, subtopic }) => {
  // Build where conditions only for non-null params
  const conditions = {};
  const paramsToFields = [
    { param: topic, field: "topic" },
    { param: subtopic, field: "subtopic" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }

  const questions = await Question.findAll({
    where: { [Op.and]: [conditions] },
    attributes: [
      "id",
      "question",
      "newLevel",
      "algorithmLevel",
      "topic",
      "subtopic",
      "validate",
    ],
    include: [
      {
        model: Keyword,
        attributes: ["id"],
        include: [
          {
            model: Material,
            through: { model: MaterialKeyword, attributes: [] },
            attributes: ["id", "type"],
          },
        ],
      },
      { model: User, as: "Lecturer", attributes: ["name"] },
      { model: User, as: "Validator", attributes: ["name"] },
      { model: Topic, attributes: ["name"] },
      { model: Subtopic, attributes: ["name"] },
    ],
  });

  if (!questions || questions.length === 0) return [];

  // Flatten associations and count linked materials/videos per question
  return questions.map((question) => {
    const data = { ...question.dataValues };
    data.Topic = data.platform__topic.name;
    data.LecturerLevel = data.newLevel;
    data.Subtopic =
      data.platform__subtopic == null ? null : data.platform__subtopic.name;

    const teachingMaterials = new Set();
    const videoLessons = new Set();
    question.platform__keywords.forEach((keyword) => {
      keyword.platform_materials.forEach((material) => {
        if (material.type == 3) teachingMaterials.add(material.id);
        else videoLessons.add(material.id);
      });
    });
    data.countMaterials = teachingMaterials.size;
    data.countVideos = videoLessons.size;
    data.Author = data.Lecturer.name;
    data.Validator = data.Validator == null ? null : data.Validator.name;

    delete data.platform__topic;
    delete data.platform__subtopic;
    delete data.topic;
    delete data.subtopic;
    delete data.newLevel;
    delete data.platform__keywords;
    return data;
  });
};

// Returns a flat list of questions with author/validator names and topic/subtopic labels.
// Filters by topic and/or subtopic if provided; returns [] when no results are found.
const getValidationInfo = async ({ topic, subtopic }) => {
  // Build where conditions only for non-null params
  const conditions = {};
  const paramsToFields = [
    { param: topic, field: "topic" },
    { param: subtopic, field: "subtopic" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }

  const questions = await Question.findAll({
    where: { [Op.and]: [conditions] },
    attributes: [
      "id",
      "question",
      "id_lect",
      "topic",
      "subtopic",
      "validate",
      "validate_by",
    ],
    include: [
      { model: User, as: "Lecturer", attributes: ["name"] },
      { model: User, as: "Validator", attributes: ["name"] },
      { model: Topic },
      { model: Subtopic },
    ],
  });

  if (!questions || questions.length === 0) return [];

  return questions.map((question) => {
    const data = { ...question.dataValues };
    data.Topic = data.platform__topic.name;
    data.Subtopic =
      data.platform__subtopic == null ? null : data.platform__subtopic.name;
    data.Author = data.Lecturer.name;
    data.Validator = data.Validator == null ? null : data.Validator.name;
    delete data.platform__topic;
    delete data.platform__subtopic;
    delete data.topic;
    delete data.subtopic;
    delete data.id_lect;
    delete data.Lecturer;
    delete data.validate_by;
    return data;
  });
};

// Returns [questions, historic] for the adaptive algorithm, filtered by topic.
// questions: validated questions with algorithmLevel and keyword IDs.
// historic: student's past answers for the same topic.
const findArrayByTopic = async ( studentId, topic ) => {
  const questions = await Question.findAll({
    where: { topic, validate: 1, algorithmLevel: { [Op.ne]: null } },
    attributes: ["id", ["algorithmLevel", "level"]],
    include: [{ model: Keyword, attributes: ["id"] }],
  });

  const transformedQuestions = questions.map((question) => ({
    id: question.id,
    level: question.get("level"),
    keyword: question.platform__keywords.map((k) => k.id),
  }));

  const historic = await QuestionAssessment.findAll({
    where: { student_id: studentId, topic },
    attributes: ["question_id", "question_level", "answer"],
  });

  return [transformedQuestions, historic];
};

// Returns [questions, historic] for the adaptive algorithm, filtered by subtopic.
const findArrayBySubtopic = async (studentId, subtopic) => {
  const questions = await Question.findAll({
    where: { subtopic, validate: 1, algorithmLevel: { [Op.ne]: null } },
    attributes: ["id", ["algorithmLevel", "level"]],
    include: [{ model: Keyword, attributes: ["id"] }],
  });

  const transformedQuestions = questions.map((question) => ({
    id: question.id,
    level: question.get("level"),
    keyword: question.platform__keywords.map((k) => k.id),
  }));

  const historic = await QuestionAssessment.findAll({
    where: { student_id: studentId, subtopic },
    attributes: ["question_id", "question_level", "answer"],
  });

  return [transformedQuestions, historic];
};

// Returns questions by IDs preserving the original order, with keyword IDs included.
const findMultipleIds = async (ids) => {
  const idOrderMap = {};
  ids.forEach((id, index) => {
    idOrderMap[id] = index;
  });

  const questions = await Question.findAll({
    where: { id: ids },
    include: [{ model: Keyword, attributes: ["id"] }],
  });

  return questions.sort((a, b) => idOrderMap[a.id] - idOrderMap[b.id]);
};

// Returns the max algorithmLevel for a given topic.
const findMaxLevelByTopic = async (topicId) => {
  return Question.findOne({
    attributes: [
      [
        Sequelize.fn("max", Sequelize.col("algorithmLevel")),
        "maxAlgorithmLevel",
      ],
    ],
    where: { topic: topicId },
  });
};

// Returns the max algorithmLevel for a given subtopic.
const findMaxLevelBySubtopic = async (subtopicId) => {
  return Question.findOne({
    attributes: [
      [
        Sequelize.fn("max", Sequelize.col("algorithmLevel")),
        "maxAlgorithmLevel",
      ],
    ],
    where: { subtopic: subtopicId },
  });
};

// Returns all validated questions for a given topic, with topic and subtopic included.
const findByTopic = async (topic) => {
  return Question.findAll({
    where: { topic: topic, validate: 1 },
    include: [{ model: Topic }, { model: Subtopic }],
  });
};

// Returns all validated questions for a given subtopic, with topic and subtopic included.
const findBySubtopic = async (subtopic) => {
  return Question.findAll({
    where: { subtopic: subtopic, validate: 1 },
    include: [{ model: Topic }, { model: Subtopic }],
  });
};

// Returns all validated questions with topic, subtopic and lecturer included.
const findAll = async () => {
  return Question.findAll({
    where: { validate: 1 },
    include: [{ model: Topic }, { model: Subtopic }],
  });
};


const deleteFile = async (name) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(QUESTIONS_IMAGE_DIR, name);
    if (path.dirname(filePath) !== QUESTIONS_IMAGE_DIR) return resolve("Invalid file");
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlinkSync(filePath);
      resolve("File deleted successfully");
    } else {
      resolve("File does not exist");
    }
  });
};

// Verifies existence, deletes the question, and removes the associated file if provided.
const deleteQuestion = async (id) => {
  const question = await Question.findByPk(id);
  //TODO: logging
  //console.log("QUESTAO:", question);
  if (!question) {
    throw { kind: "not_found" };
  }
  await deleteById(id);
  if (question.file_ext) await deleteFile(`${question.id}.${question.file_ext}`);
};

const addQuestionWithKeywords = async (userID, body) => {
  const newQuestion = await addNewQuestion(userID, body);
  await relinkKeywords(newQuestion.id, body.keywords);
  return newQuestion.id;
};

const updateQuestionWithKeywords = async (body) => {
  const previous = body.oldFile
    ? await Question.findByPk(body.id, { attributes: ["id", "file_ext"] })
    : null;
  await updateById(body);
  await relinkKeywords(body.id, body.keywords);
  if (previous?.file_ext) await deleteFile(`${previous.id}.${previous.file_ext}`);
  return getQuestion(body.id);
};

const validateQuestionWithKeywords = async (userID, body) => {
  const previous = body.oldFile
    ? await Question.findByPk(body.id, { attributes: ["id", "file_ext"] })
    : null;
  await validateQuestion(userID, body);
  await relinkKeywords(body.id, body.keywords);
  if (previous?.file_ext) await deleteFile(`${previous.id}.${previous.file_ext}`);
  return getQuestion(body.id);
};

const getQuestionsForValidationByRole = async (userID, data, typology) => {
  if (typology == process.env.Admin) return getQuestionsForValidationAdmin(data);

  const permissions = await permissionService.getPermissionsByUser(userID);
  return getQuestionsForValidation(permissions, data, userID);
};


const getImagePath = async (id) => {
  const question = await Question.findByPk(id, { attributes: ["id", "file_ext"] });
  if (!question || !question.file_ext) return null;

  const filePath = path.join(QUESTIONS_IMAGE_DIR, `${question.id}.${question.file_ext}`);
  if (path.dirname(filePath) !== QUESTIONS_IMAGE_DIR) return null;

  return fs.existsSync(filePath) ? filePath : null;
};

module.exports = {
  updateById,
  addNewQuestion,
  validateQuestion,
  getQuestion,
  deleteById,
  getLecturerQuestions,
  getAllLevels,
  countQuestions,
  getQuestionsForValidation,
  getQuestionsForValidationAdmin,
  getAllQuestions,
  updateLevelById,
  updateLevelsInBulk,
  deleteFile,
  getValidationInfo,
  findArrayByTopic,
  findArrayBySubtopic,
  findAll,
  findByTopic,
  findBySubtopic,
  findMultipleIds,
  findMaxLevelByTopic,
  findMaxLevelBySubtopic,
  getAllQuestionsInfo,
  deleteQuestion,
  addQuestionWithKeywords,
  updateQuestionWithKeywords,
  validateQuestionWithKeywords,
  getQuestionsForValidationByRole,
  getImagePath,
};
