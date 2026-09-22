const QuestionKeyword = require("../models/questionKeywordModel");

const deleteByQuestionId = async (question) => {
  return new Promise((resolve, reject) =>{
    QuestionKeyword.destroy({
        where: { platformSnaQuestionId: question },
    }).then(item => {
      return resolve("Success")
    }).catch(err => {
      return reject({ kind: "Forbiden" })
    });
  })
};

const insertQuestionKeyword = (question, keyword) => {
  return new Promise((resolve, reject) =>{
    QuestionKeyword.create({
      platformKeywordId : keyword,
      platformSnaQuestionId : question,
    }).then(message => {
      return resolve("Success")
    }).catch(err => {
      return reject({kind: "Error Update"});
    })
  })
};

const insertInBulk = async (question, keywords) => {
  let bulk = []
  for (const keyword of keywords) {
   bulk.push({platformSnaQuestionId: question, platformKeywordId: keyword.id})
  }
  return new Promise((resolve, reject) =>{
    QuestionKeyword.bulkCreate(bulk)
    .then(keywords => {
      return resolve(keywords)
    }).catch(err => {
      console.log(err.message)
      return reject({kind: "Error Update"});
    })
  })
};
  module.exports={deleteByQuestionId, insertQuestionKeyword, insertInBulk}