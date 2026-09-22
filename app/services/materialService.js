const Material = require("../models/materialModel");
const MaterialType = require("../models/materialTypeModel");
const Keyword = require("../models/keywordModel");
const Subtopic = require("../models/subtopicModel");
const Topic = require("../models/topicModel");
const User = require("../models/userModel");
const { Op } = require("sequelize");
const getDate = require("../utils/date");
const fs = require("fs");
const path = require("path");
const materialKeywordService = require("./materialKeywordService");
const permissionService = require("./permissionsService");

const getMaterial = async (id) => {
  return new Promise((resolve, reject) => {
    Material.findByPk(id, {
      include: [
        {
          model: MaterialType,
          attributes: ["id"],
        },
        {
          model: Subtopic,
          attributes: ["id", "name"],
        },
        {
          model: Topic,
          attributes: ["id", "name"],
        },
        {
          model: Keyword,
        },
      ],
    })
      .then((material) => {
        if (material) {
          const keywordIds = material.dataValues.platform__keywords.map(
            (keyword) => keyword.id,
          );
          material = {
            ...material.toJSON(),
            keywordIds,
          };
          return resolve(material);
        }
        return reject({ kind: "Material not found" });
      })
      .catch((err) => {
        return reject({ kind: "Material not found" });
      });
  });
};

const getAllMaterials = async (req) => {
  const { topic, subtopic, type } = req.body;

  return new Promise((resolve, reject) => {
    Material.findAll({
      where: {
        validate: 1,
        ...(type !== null && type !== undefined && { type: type }),
        ...(topic !== null && topic !== undefined && { topic }),
        ...(subtopic !== null && subtopic !== undefined && { subtopic }),
      },
      order: [["id", "DESC"]],
    })
      .then((collection) => {
        //console.log(collection);
        return resolve(collection);
      })
      .catch((err) => {
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const getLibraryMaterials = async (req) => {
  const { topic, subtopic, type, keywords } = req.body;

  const include = [];
  if (keywords !== null) {
    include.push({ model: Keyword, where: { id: keywords } });
  }

  return new Promise((resolve, reject) => {
    Material.findAll({
      where: {
        validate: 1,
        ...(type !== null && type !== undefined && { type: type }),
        ...(topic !== null && topic !== undefined && { topic }),
        ...(subtopic !== null && subtopic !== undefined && { subtopic }),
      },
      include,
      order: [["id", "DESC"]],
    })
      .then((collection) => {
        //console.log(collection);
        return resolve(collection);
      })
      .catch((err) => {
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const addMaterial = async (userID,req) => {
  const lastLink = req.link.slice(-11);
  const date = getDate();
  const newMaterial = await Material.create({
    id_lect: userID,
    title: req.title,
    author: req.author,
    type: req.type,
    description: req.description,
    link: lastLink,
    topic: req.topic,
    subtopic: req.subtopic,
    file_name: req.file_name,
    file_ext: req.file_ext,
    date: date,
    validate: req.validate,
  });
  await updateAssociationsAndFile({ ...req, id: newMaterial.id });
  return newMaterial;
};

const updateById = async (data) => {
  const {
    id,
    title,
    author,
    description,
    link,
    file_name,
    file_ext,
    validate,
    topic,
    subtopic,
  } = data;
  const fields = {};
  if (title != null) fields.title = title;
  if (author != null) fields.author = author;
  if (description != null) fields.description = description;
  if (link != null) fields.link = link.slice(-11);
  if (file_name != null) fields.file_name = file_name;
  if (file_ext != null) fields.file_ext = file_ext;
  if (validate != null) fields.validate = validate;
  if (topic != null) fields.topic = topic;
  fields.subtopic = subtopic; //Subtopic can be null, so we always update it
  await Material.update(fields, { where: { id } });
  return updateAssociationsAndFile(data);
};

const getValidated = async (userID, data) => {
  const conditions = { validate: { [Op.ne]: 0 } };
  const paramsToFields = [
    { param: data.topic, field: "topic" },
    { param: data.subtopic, field: "subtopic" },
    { param: data.type, field: "type" },
    { param: data.validate, field: "validate" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }

  return new Promise((resolve, reject) => {
    Material.findAll({
      where: {
        [Op.and]: [{ id_lect: userID }, conditions],
      },
    })
      .then((material) => {
        if (material) return resolve(material);
        return reject({ kind: "Not Found" });
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const getCollection = async (userID, data) => {
  const conditions = { validate: { [Op.ne]: 0 } };
  const paramsToFields = [
    { param: data.type, field: "type" },
    { param: data.validate, field: "validate" },
    { param: userID, field: "id_lect" },
    { param: data.topic, field: "topic" },
    { param: data.subtopic, field: "subtopic" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }

  const includeArray = [];

  if (data.keywords !== null) {
    includeArray.push({
      model: Keyword,
      where: {
        id: data.keywords,
      },
    });
  }

  return new Promise((resolve, reject) => {
    Material.findAll({
      where: {
        [Op.and]: [conditions],
      },
      include: includeArray,
      order: [["id", "DESC"]],
      //limit: 3,
    })
      .then((collection) => {
        //TODO: add logging
        //console.log(collection);
        // if (collection.length > 0) {
        return resolve(collection);
        // } else {
        //   return reject({ kind: 'Not Found' });
        // }
      })
      .catch((err) => {
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const deleteById = async (id) => {
  return new Promise((resolve, reject) => {
    Material.destroy({
      where: { id: id },
    })
      .then((item) => {
        return resolve("Success");
      })
      .catch((err) => {
        return reject({ kind: "Forbidden" });
      });
  });
};

const validate = async (userID, req) => {
  const date = getDate();
  const lastLink = req.link.slice(-11);
  await Material.update(
    {
      title: req.title,
      author: req.author,
      description: req.description,
      link: lastLink,
      file_name: req.file_name,
      file_ext: req.file_ext,
      validate: req.validate,
      validate_date: date,
      validate_by: userID,
      topic: req.topic,
      subtopic: req.subtopic,
    },
    { where: { id: req.id } },
  );
  return updateAssociationsAndFile(req);
};

const getMultipleMaterials = async (req) => {
  const ids = req.ids;
  const idOrderMap = {};
  ids.forEach((id, index) => {
    idOrderMap[id] = index;
  });
  return new Promise((resolve, reject) => {
    Material.findAll({
      where: { id: ids },
    })
      .then((material) => {
        const m = material.sort((a, b) => idOrderMap[a.id] - idOrderMap[b.id]);
        return resolve(m);
      })
      .catch((err) => {
        return reject({ kind: "Error Update" });
      });
  });
};

const incrementClicks = async (id) => {
  return new Promise((resolve, reject) => {
    Material.increment("clicks", { where: { id: id } })
      .then((item) => {
        return resolve(item);
      })
      .catch((err) => {
        //console.log(err.message);
        return reject({ kind: "Forbidden" });
      });
  });
};

const getFile = async (id) => {
  return Material.findByPk(id, { attributes: ["file_name", "file_ext"] });
};

const UPLOADS_DIR = path.join(__dirname, "../../uploads");


const getFilePath = async (id) => {
  const material = await Material.findByPk(id, { attributes: ["id", "file_ext"] });
  if (!material || !material.file_ext) return null;

  const filePath = path.join(UPLOADS_DIR, `${material.id}.${material.file_ext}`);
  if (path.dirname(filePath) !== UPLOADS_DIR) return null;

  return fs.existsSync(filePath) ? filePath : null;
};

const deleteFile = async (name) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "../../uploads/" + name);
    // TODO: add logging
    //console.log(filePath);
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          //console.error(`Error removing file: ${err}`);
          return;
        }
        //console.log(`File ${filePath} has been successfully removed.`);
        resolve("File deleted successfully");
      });
    } else {
      reject("Unable to delete the file");
    }
  });
};

const countMaterials = () => {
  return new Promise((resolve, reject) => {
    Material.count({
      where: {
        type: 3,
        validate: 1,
      },
    })
      .then((count) => {
        //console.log("Number of lecturers", count);
        return resolve(count);
      })
      .catch((err) => {
        //console.log(err);
        return reject({ kind: "Error Counting Users" });
      });
  });
};

const countVideos = () => {
  return new Promise((resolve, reject) => {
    Material.count({
      where: {
        type: [1, 2],
        validate: 1,
      },
    })
      .then((count) => {
        //console.log("Number of lecturers", count);
        return resolve(count);
      })
      .catch((err) => {
        //console.log(err);
        return reject({ kind: "Error Counting Users" });
      });
  });
};

const getMaterialsForValidation = (permissions, data, lect) => {
  const conditions = { validate: { [Op.ne]: 0 } };
  const paramsToFields = [
    { param: data.topic, field: "topic" },
    { param: data.subtopic, field: "subtopic" },
    { param: data.type, field: "type" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }
  return new Promise((resolve, reject) => {
    Material.findAll({
      where: {
        [Op.and]: [
          {
            validate: 4,
          },
          { topic: permissions.topics },
          conditions,
        ],
      },
      include: [
        { model: Topic },
        { model: Subtopic },
        { model: Keyword, attributes: ["id"], raw: true },
      ],
    })
      .then((question) => {
        if (question) {
          //console.log(question);
          // const keywordIds = question.dataValues.platform__keywords.map(keyword => keyword.id);
          // question = {
          //   ...question.toJSON(),
          //   keywordIds
          // };
          return resolve(question);
        }
        return reject({ kind: "User not found" });
      })
      .catch((err) => {
        //console.log(err);
        return reject({ kind: "Error Counting Users" });
      });
  });
};

const getMaterialsForValidationAdmin = (data) => {
  const conditions = { validate: { [Op.ne]: 0 } };
  const paramsToFields = [
    { param: data.topic, field: "topic" },
    { param: data.subtopic, field: "subtopic" },
    { param: data.type, field: "type" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }
  return new Promise((resolve, reject) => {
    Material.findAll({
      where: {
        [Op.and]: [{ validate: 4 }, conditions],
      },
      include: [
        { model: Topic },
        { model: Subtopic },
        { model: Keyword, attributes: ["id"], raw: true },
      ],
    })
      .then((question) => {
        if (question) {
          return resolve(question);
        }
        return reject({ kind: "User not found" });
      })
      .catch((err) => {
        return reject({ kind: "Error Counting Users" });
      });
  });
};

const getMaterialsForValidationByRole = async (userID, data, typology) => {
  if (typology == process.env.Admin) return getMaterialsForValidationAdmin(data);

  const permissions = await permissionService.getPermissionsByUser(userID);
  return getMaterialsForValidation(permissions, data, userID);
};


const getAllMaterialsInfo = async ({ topic = null, subtopic = null }) => {
  const conditionsTopic = topic !== null ? { id: topic } : {};
  const conditionsSubtopic = subtopic !== null ? { id: subtopic } : null;

  const include = [
    { model: User, as: "M_Lecturer", attributes: ["name"] },
    { model: User, as: "M_Validator", attributes: ["name"] },
  ];

  include.push({ model: Topic, where: conditionsTopic });
  if (conditionsSubtopic) {
    include.push({ model: Subtopic, where: conditionsSubtopic });
  } else {
    include.push({ model: Subtopic });
  }

  const materials = await Material.findAll({
    where: { type: 3 },
    attributes: ["id", "file_name", "clicks"],
    include,
  });

  if (!materials || materials.length === 0) return [];

  return materials.map((material) => {
    const data = { ...material.dataValues };
    data.Topic =
      data.platform__topic == null ? null : data.platform__topic.name;
    data.Subtopic =
      data.platform__subtopic == null
        ? null
        : data.platform__subtopic.name;
    data.Validator = data.M_Validator == null ? null : data.M_Validator.name;
    data.Author = data.M_Lecturer == null ? null : data.M_Lecturer.name;
    delete data.platform__topic;
    delete data.platform__subtopic;
    delete data.M_Lecturer;
    delete data.M_Validator;
    return data;
  });
};

const getAllVideosInfo = async ({ topic = null, subtopic = null }) => {
  const conditionsTopic = topic !== null ? { id: topic } : {};
  const conditionsSubtopic = subtopic !== null ? { id: subtopic } : null;

  // Build include dynamically: apply where on Topic/Subtopic only when filters are provided
  const include = [
    { model: User, as: "M_Lecturer", attributes: ["name"] },
    { model: User, as: "M_Validator", attributes: ["name"] },
  ];

  include.push({ model: Topic, attributes: ["name"], where: conditionsTopic });
  if (conditionsSubtopic) {
    include.push({
      model: Subtopic,
      attributes: ["name"],
      where: conditionsSubtopic,
    });
  } else {
    include.push({ model: Subtopic, attributes: ["name"] });
  }

  const videos = await Material.findAll({
    where: { type: [1, 2] },
    attributes: ["id", "link", "clicks"],
    include,
  });

  if (!videos || videos.length === 0) return [];

  // Flatten associations and prepend YouTube base URL to link
  return videos.map((video) => {
    const data = { ...video.dataValues };
    data.Topic =
      data.platform__topic == null ? null : data.platform__topic.name;
    data.link = "https://www.youtube.com/watch?v=" + data.link;
    data.Subtopic =
      data.platform__subtopic == null
        ? null
        : data.platform__subtopic.name;
    data.Validator = data.M_Validator == null ? null : data.M_Validator.name;
    data.Author = data.M_Lecturer == null ? null : data.M_Lecturer.name;
    delete data.platform__topic;
    delete data.platform__subtopic;
    delete data.M_Lecturer;
    delete data.M_Validator;
    return data;
  });
};

const updateAssociationsAndFile = async ({
  id,
  keywords,
  isSameFile,
  file_name,
  file_ext,
}) => {
  const materialK = await materialKeywordService.replace(id, keywords);

  if (isSameFile !== undefined && !isSameFile) {
    const file = await getFile(id);
    if (isSameFile == null && file_name && file_ext) {
      if (file.file_name === file_name && file.file_ext === file_ext)
        return materialK;
    }
    await deleteFile(`${id}.${file.file_ext}`);
  }

  return materialK;
};

module.exports = {
  getMaterial,
  getAllMaterials,
  addMaterial,
  updateById,
  getValidated,
  getCollection,
  deleteById,
  validate,
  getMultipleMaterials,
  incrementClicks,
  getFile,
  getFilePath,
  deleteFile,
  countMaterials,
  countVideos,
  getMaterialsForValidationAdmin,
  getMaterialsForValidation,
  getMaterialsForValidationByRole,
  getAllVideosInfo,
  getAllMaterialsInfo,
  updateAssociationsAndFile,
  getLibraryMaterials
};
