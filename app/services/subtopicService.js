const Subtopic = require("../models/subtopicModel");

const updateById = async (req) => {
  return new Promise((resolve, reject) => {
    Subtopic.update(
      {
        id_top: req.topic,
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
    Subtopic.destroy({
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

const addSubtopic = async (req) => {
  return new Promise((resolve, reject) => {
    Subtopic.create({
      id_top: req.topic,
      name: req.name,
    })
      .then((newSubtopic) => {
        if (newSubtopic) {
          return resolve("Success");
        } else {
          return resolve("Error Adding subtopic");
        }
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const getAllSubtopics = async (subtopic, topic) => {
  return new Promise((resolve, reject) => {
    Subtopic.findAll({
      attributes: [["name", "label"], "id", "id_top"],
      order: [["name", "ASC"]],
      raw: true,
      where: {
        ...(topic !== null && { id_top: topic }),
        ...(subtopic !== null && { id: subtopic }),
      },
    })
      .then((subtopics) => {
        return resolve(subtopics);
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Error", message: "/getAllSubtopics" });
      });
  });
};

const updateSubtopicsInBulk = async (subtopicsToUpdate) => {
  const idsToUpdate = subtopicsToUpdate.map((subtopic) => subtopic.id);

  return new Promise((resolve, reject) => {
    Subtopic.bulkCreate(subtopicsToUpdate, { updateOnDuplicate: ["name"] })
      .then((newSubtopic) => {
        return resolve("Success");
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

module.exports = {
  updateById,
  addSubtopic,
  deleteById,
  getAllSubtopics,
  updateSubtopicsInBulk,
};
