const revisorTopicsModel = require("../models/revisorTopicsModel");

const getPermissionsByUser = async (id) => {
  return new Promise((resolve, reject) =>{
    revisorTopicsModel.findAll({where: {userFinalId: id}})
    .then(permission => {
        if(permission){
            const topics = permission.map(permission => permission.platformTopicId);
            return resolve({topics: topics})
          }
          return reject({kind: "No results"});
    }).catch(err => {
      console.log(err.message)
      return reject({kind: "Error Update"});
    })
  })
};

module.exports={getPermissionsByUser}