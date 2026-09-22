const TeachingTopics = require("../models/teachingTopicsModel");
const topicService = require("./topicService");

const deleteByUserId = async (user) => {
  return new Promise((resolve, reject) =>{
    TeachingTopics.destroy({
        where: { userFinalId: user },
    }).then(item => {
      console.log(item);
      return resolve("Success")
    }).catch(err => {
      console.log(err);
      return reject({ kind: "Forbidden" })
    });
  })
};


const insertInBulk = async (user, topics) => {
  let bulk = []
  for (const topic of topics) {
   bulk.push({userFinalId: user, platformTopicId: topic.id})
  }
  return new Promise((resolve, reject) =>{
    TeachingTopics.bulkCreate(bulk)
    .then(topics => {
      return resolve(topics)
    }).catch(err => {
      console.log(err.message)
      return reject({kind: "Error Update"});
    })
  })
};

const replace = async (userId, topicIds) => {
  await deleteByUserId(userId);
  if (!topicIds || topicIds.length === 0) return;
  const topics = await topicService.findById(topicIds);
  return insertInBulk(userId, topics);
};

module.exports = { deleteByUserId, insertInBulk, replace };