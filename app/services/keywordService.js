const Keyword = require("../models/keywordModel");
const Topic = require("../models/topicModel");
const Subtopic = require("../models/subtopicModel");
const { Sequelize } = require("sequelize");
const Question = require("../models/questionModel");
const Material = require("../models/materialModel");

const findById = (key) => {
  return new Promise((resolve, reject) => {
    Keyword.findByPk(key)
      .then((keyword) => {
        return resolve(keyword);
      })
      .catch((err) => {
        return reject({ kind: "error", detail: err.message });
      });
  });
};
const updateById = async (data) => {
  if (!data.name || !data.id)
    throw { kind: "Error Update", detail: "Missing id or name" };

  try {
    const affectedRows = await Keyword.update(
      { name: data.name },
      { where: { id: data.id } },
    );

    if (affectedRows > 0) {
      return "Success: Record updated.";
    } else {
      return "No changes were made.";
    }
  } catch (err) {
    throw { kind: "Error Update", detail: err.message };
  }
};

const deleteById = async (id) => {
  return new Promise((resolve, reject) => {
    Keyword.destroy({
      where: { id: id },
    })
      .then((item) => {
        if (item > 0) {
          return resolve(`Success, item deleted`);
        } else {
          // If it's 0, there was no id on DB
          return resolve("Item not found");
        }
      })
      .catch((err) => {
        return reject({ kind: "Forbidden", detail: err.message });
      });
  });
};

const addKeyword = async (req) => {
  return new Promise((resolve, reject) => {
    Keyword.create({
      id_top: req.topic,
      id_sub: req.subtopic,
      name: req.name,
    })
      .then((newKey) => {
        return resolve(newKey);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const updateInBulk = async (data) => {
  const cleanedData = data.map((item) => {
    const filtered = {};
    if (item.id !== undefined) filtered.id = item.id;
    if (item.name !== undefined) filtered.name = item.name;
    return filtered;
  });

  return new Promise((resolve, reject) => {
    Keyword.bulkCreate(cleanedData, {
      updateOnDuplicate: ["name"],
    })
      .then((newKey) => {
        const affectedRows = newKey.length;

        if (affectedRows > 0) {
          return resolve(`Success: ${affectedRows} record(s) updated.`);
        } else {
          return resolve(
            "No changes were made (Record not found or data identical).",
          );
        }
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Bulk Update", detail: err.message });
      });
  });
};

const getKeywords = async (criteria = {}, options = {}) => {
  return await Keyword.findAll({
    where: { ...criteria },
    attributes: options.attributes || [["name", "label"], "id"],
    include: options.include || [],
    order: options.order || [],
  });
};

const getKeywordsWithRelations = (criteria = {}) => {
  return getKeywords(criteria, { include: [Topic, Subtopic] });
};

const getKeywordsSortedByName = (criteria = {}) => {
  return getKeywords(criteria, {
    order: [[Sequelize.fn("TRIM", Sequelize.col("name")), "ASC"]],
  });
};

const getAllKeywordsInfo = async ({ topic, subtopic }) => {
  const conditions = {};
  if (topic) conditions.id_top = topic;
  if (subtopic) conditions.id_sub = subtopic;

  const keywords = await Keyword.findAll({
    where: conditions,
    attributes: ["id", ["name", "keyword"]],
    include: [
      { model: Question, attributes: ["id"] },
      { model: Topic, attributes: ["name"] },
      { model: Subtopic, attributes: ["name"] },
      { model: Material, attributes: ["id", "type"] },
    ],
  });

  return keywords.map((kw) => {
    const data = kw.get({ plain: true });

    return {
      id: data.id,
      keyword: data.keyword,
      Topic: data.platform__topic?.name,
      Subtopic: data.platform__subtopic?.name,
      Associated_Questions: data.platform__sna__questions?.length || 0,
      countTeachingMaterials: data.platform_materials.filter(
        (m) => m.type === 3,
      ).length,
      countVideos: data.platform_materials.filter((m) => m.type !== 3).length,
    };
  });
};

module.exports = {
  findById,
  addKeyword,
  deleteById,
  updateById,
  updateInBulk,
  getKeywords,
  getKeywordsWithRelations,
  getKeywordsSortedByName,
  getAllKeywordsInfo,
};
