const OlympicKeyword = require("../models/olympicKeywordModel");
const OlympicKeywordTranslation = require("../models/olympicKeywordTranslationModel");
const OlympicQuestionKeyword = require("../models/olympicQuestionKeywordModel");
const OlympicQuestion = require("../models/olympicQuestionsModel");
const db = require("../utils/db");

// Options for the keywords field. `label` is the translation in `lang` when
// there is one, otherwise the canonical (PT) `name`.
const getOptions = async (lang) => {
  const language = typeof lang === "string" ? lang.trim().toLowerCase() : "";

  const keywords = await OlympicKeyword.findAll({
    attributes: ["id", "name"],
    include: language
      ? [
          {
            model: OlympicKeywordTranslation,
            as: "translations",
            attributes: ["name"],
            where: { language },
            required: false,
          },
        ]
      : [],
  });

  return keywords.map((keyword) => {
    const translation = (keyword.translations || [])[0];
    return {
      id: keyword.id,
      label: (translation && translation.name) || keyword.name,
    };
  });
};

// Replaces the keywords of a question. Ids that are not integers or that do
// not exist in `olympic_keywords` are dropped silently.
const replaceForQuestion = async (questionId, keywordIds) => {
  const list = Array.isArray(keywordIds) ? keywordIds : [];
  const requested = [
    ...new Set(
      list
        .filter((id) => id !== null && id !== "" && typeof id !== "boolean")
        .map(Number)
    ),
  ].filter(Number.isInteger);
  const existing = requested.length
    ? await OlympicKeyword.findAll({ attributes: ["id"], where: { id: requested } })
    : [];

  return db.transaction(async (transaction) => {
    await OlympicQuestionKeyword.destroy({
      where: { id_olympic_question: questionId },
      transaction,
    });
    if (existing.length === 0) return [];
    return OlympicQuestionKeyword.bulkCreate(
      existing.map((keyword) => ({
        id_olympic_question: questionId,
        id_olympic_keyword: keyword.id,
      })),
      { transaction }
    );
  });
};

// Removes the junction rows of the given questions. `transaction` is optional.
const deleteForQuestions = async (questionIds, transaction) => {
  const ids = Array.isArray(questionIds) ? questionIds : [];
  if (ids.length === 0) return 0;
  return OlympicQuestionKeyword.destroy({
    where: { id_olympic_question: ids },
    transaction,
  });
};

// Project Information: every keyword with its translations and the number of
// questions (all / validated) that use it. The filters only restrict which
// questions are counted, so a keyword with none still shows up with 0.
const getKeywordsInfo = async (filters) => {
  // Required here: OlympicQuestionService already requires this file.
  const { informationWhere } = require("./OlympicQuestionService");

  const [keywords, questions] = await Promise.all([
    OlympicKeyword.findAll({
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
      include: [
        {
          model: OlympicKeywordTranslation,
          as: "translations",
          attributes: ["language", "name"],
          separate: true,
        },
      ],
    }),
    OlympicQuestion.findAll({
      where: informationWhere(filters),
      attributes: ["id", "validate"],
      include: [
        {
          model: OlympicKeyword,
          as: "keywords",
          attributes: ["id"],
          through: { attributes: [] },
          required: true,
        },
      ],
    }),
  ]);

  const counts = {};
  questions.forEach((question) => {
    question.keywords.forEach((keyword) => {
      const count = counts[keyword.id] || (counts[keyword.id] = { all: 0, validated: 0 });
      count.all += 1;
      if (Number(question.validate) === 1) count.validated += 1;
    });
  });

  return keywords.map((keyword) => {
    const translated = (language) => {
      const translation = (keyword.translations || []).find(
        (item) => String(item.language).toLowerCase().startsWith(language)
      );
      return translation ? translation.name : null;
    };
    const count = counts[keyword.id] || { all: 0, validated: 0 };

    return {
      id: keyword.id,
      keyword: keyword.name,
      name_pt: translated("pt") || keyword.name,
      name_en: translated("en"),
      Associated_Questions: count.all,
      Validated_Questions: count.validated,
    };
  });
};

module.exports = { getOptions, replaceForQuestion, deleteForQuestions, getKeywordsInfo };
