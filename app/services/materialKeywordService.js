const MaterialKeyword = require("../models/materialKeywordModel");
const QuestionKeyword = require("../models/questionKeywordModel");
const keywordService = require("./keywordService");

const deleteByMaterialId = async (material) => {
  return new Promise((resolve, reject) =>{
    MaterialKeyword.destroy({
        where: { platformMaterialId: material },
    }).then(item => {
      return resolve("Success")
    }).catch(err => {
      console.log(err);
      return reject({ kind: "Forbidden" })
    });
  })
};

const insertMaterialKeyword = (material, keyword) => {
  return new Promise((resolve, reject) =>{
    QuestionKeyword.create({
      platformKeywordId: keyword,
      platformMaterialId: material,
    }).then(message => {
      return resolve("Success")
    }).catch(err => {
      return reject({kind: "Error Update"});
    })
  })
};

const insertInBulk = async (material, keywords) => {
  let bulk = []
  for (const keyword of keywords) {
   bulk.push({platformMaterialId: material, platformKeywordId: keyword.id}) 
  }
  return new Promise((resolve, reject) =>{
    MaterialKeyword.bulkCreate(bulk)
    .then(keywords => {
      return resolve(keywords)
    }).catch(err => {
      console.log(err.message)
      return reject({kind: "Error Update"});
    })
  })
};

const replace = async (material, keywords) => {
  await deleteByMaterialId(material);
  const fetched = await keywordService.getKeywords({ id: keywords });
  return insertInBulk(material, fetched);
};

module.exports = { deleteByMaterialId, insertMaterialKeyword, insertInBulk, replace };