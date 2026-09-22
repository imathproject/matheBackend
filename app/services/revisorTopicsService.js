const RevisorTopics = require("../models/revisorTopicsModel");

const deleteByUserId = async (user) => {
  return new Promise((resolve, reject) => {
    RevisorTopics.destroy({
      where: { userFinalId: user },
    })
      .then((item) => {
        return resolve("Success");
      })
      .catch((err) => {
        return reject({ kind: "Forbiden" });
      });
  });
};

const insertInBulk = async (user, topics) => {
  let bulk = [];
  for (const topic of topics) {
    bulk.push({ userFinalId: user, platformTopicId: topic.id });
  }
  return new Promise((resolve, reject) => {
    RevisorTopics.bulkCreate(bulk)
      .then((topics) => {
        return resolve(topics);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const findByUserId = async (id) => {
  return new Promise((resolve, reject) => {
    RevisorTopics.findAll({ where: { userFinalId: id } })
      .then((topics) => {
        //console.log(topics);
        const topicIds = topics.map((topic) => topic.platformTopicId);

        finalTopics = {
          topicIds,
        };
        return resolve(finalTopics);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const topicService = require("./topicService");

const replace = async (userId, topicIds) => {
  await deleteByUserId(userId);
  if (!topicIds || topicIds.length === 0) return;
  const topics = await topicService.findById(topicIds);
  return insertInBulk(userId, topics);
};

module.exports = { deleteByUserId, insertInBulk, findByUserId, replace };
