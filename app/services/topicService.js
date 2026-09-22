const Topic = require("../models/topicModel");
const Subtopic = require("../models/subtopicModel");
const db = require("../utils/db");

const updateById = async (req) => {
  return new Promise((resolve, reject) => {
    Topic.update(
      {
        name: req.name,
      },
      {
        where: { id: req.id },
      },
    )
      .then((topic) => {
        return resolve(topic);
      })
      .catch((err) => {
        return reject({ kind: "Error Update" });
      });
  });
};

const deleteById = async (id) => {
  return new Promise((resolve, reject) => {
    Topic.destroy({
      where: { id: id },
    })
      .then((item) => {
        return resolve("Success");
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

const addTopic = async (req) => {
  return new Promise((resolve, reject) => {
    Topic.create({
      name: req.name,
    })
      .then((newTopic) => {
        return resolve(newTopic);
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const findSubtopics = async () => {
  return new Promise((resolve, reject) => {
    Topic.findAll({
      attributes: [
        ["name", "label"],
        "id",
        [
          db.literal(
            "(SELECT COUNT(*) FROM platform__sna__questions WHERE platform__sna__questions.topic = platform__topic.id)",
          ),
          "TopquestionCount",
        ],
      ],
      include: [
        {
          model: Subtopic,
          attributes: [
            "id",
            "name",
            [
              db.literal(
                "(SELECT COUNT(*) FROM platform__sna__questions WHERE platform__sna__questions.subtopic = platform__subtopic.id)",
              ),
              "SubquestionCount",
            ],
          ],
          separate: true,
          order: [["name", "ASC"]],
        },
      ],
      order: [["name", "ASC"]],
    })
      .then((newTopic) => {
        return resolve(newTopic);
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const getAllTopics = async () => {
  return new Promise((resolve, reject) => {
    Topic.findAll({
      attributes: [["name", "label"], "id"],
      order: [["name", "ASC"]],
      raw: true,
      where: {},
    })
      .then((newTopic) => {
        return resolve(newTopic);
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const findById = (topic) => {
  return new Promise((resolve, reject) => {
    Topic.findAll({
      where: {
        id: topic,
      },
    })
      .then((keyword) => {
        return resolve(keyword);
      })
      .catch((err) => {
        return reject({ kind: "error" });
      });
  });
};

module.exports = {
  updateById,
  addTopic,
  deleteById,
  findSubtopics,
  getAllTopics,
  findById,
};
