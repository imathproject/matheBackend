const University = require("../models/universityModel");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const sequelize = require("../utils/db");
const emailService = require("../services/emailService");
const userService = require("../services/userService");

const findAll = () => {
  return new Promise((resolve, reject) => {
    University.findAll({
      attributes: [["name", "label"], "id"],
      order: [["name", "ASC"]],
      where: {
        // validated: 1,
        id: {
          [Sequelize.Op.not]: 64,
        },
      },
    })
      .then((university) => {
        if (university){
          return resolve(university);
        }
        else{
          return resolve("Error: Not Found");
        }      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        return reject({ kind: "error" });
      });
  });
};

const getAvailableUniversities = () => {
  return new Promise((resolve, reject) => {
    University.findAll({
      attributes: [["name", "label"], "id"],
      order: [["name", "ASC"]],
      where: {
        validated: 1,
        // validated: 1,
        id: {
          [Sequelize.Op.not]: 64,
        },
      },
    })
      .then((university) => {
        if (university){
          return resolve(university);
        }
        else{
          return resolve("Error: Not Found");
        }      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        return reject({ kind: "error" });
      });
  });
};

const findAllInfo = () => {
  return new Promise((resolve, reject) => {
    University.findAll()
      .then((university) => {
        if (university){
          return resolve(university);
        }
        else{
          return resolve("Error: Not Found");
        }
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        return reject({ kind: "error" });
      });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    University.findByPk(id)
      .then((university) => {
        if (university) {
          return resolve(university);
        } else{
          return resolve("Error: Not Found");
      }
    }).catch((err) => {
      //TODO:logging
      //console.log(err);
      return reject({ kind: "error" });
      });
  });
};

const findByCountry = (country, validated) => {
  const conditions = {};
  const paramsToFields = [{ param: validated, field: "validated" }];

  for (const { param, field } of paramsToFields) {
    if (param !== null) {
      conditions[field] = param;
    }
  }

  if (country !== null) {
    conditions["country"] = {
      [Op.substring]: country,
    };
  }

  return new Promise((resolve, reject) => {
    University.findAll({
      where: {
        [Op.and]: [conditions],
      },
      // include: [User],
    })
      .then((university) => {
        if(university)
          return resolve(university);
        else
          return resolve("Not Found");
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        return reject({ kind: "error" });
      });
  });
};

const updateById = async (req) => {
  return new Promise((resolve, reject) => {
    University.update(
      {
        name: req.name,
        country: req.country,
        latitude: req.latitude,
        longitude: req.longitude,
      },
      {
        where: { id: req.id },
      }
    )
      .then((university) => {
        return resolve(university);
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        return reject({ kind: "Error Update" });
      });
  });
};

const updateStatus = async (id, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (Number(status) === 0) {
        const users = await userService.findAll({ university: id },
          { attributes: ["id", "name", "surname", "typology", "email"] }
        );

        if (users) {
          await userService.updateUniversity(id);
        }
      }

      University.update(
        {
          validated: status,
        },
        {
          where: { id: id },
        }
      )
        .then((university) => {
          if (university)
            return resolve(university);
          else
            return resolve("Not Found");
        })
        .catch((err) => {
          //TODO:logging
          //console.log(err);
          return reject({ kind: "Error Update" });
        });
    } catch (err) {
      return reject({ kind: "Error Update", message: err.message });
    }
  });
};

const deleteUniversity = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await userService.findAll({ university: id },
          { attributes: ["id", "name", "surname", "typology", "email"] }
      );

      if (!users) return resolve("University does not have any users.");

      await userService.updateUniversity(id);

      // TODO: send email

      await University.destroy({ where: { id: id } });

      return resolve({ message:"Success", users });
    } catch (err) {
      return reject({ kind: "Error Delete", message: err.message });
    }
  });
};

const addUniversity = async (universityData) => {
  try {
    const university = await University.create({
      ...universityData,
      validated: universityData.validated ?? 1,
    });

    // if not validated, send email
    if (university.validated == 0) {
      await emailService.trySend(() =>
          emailService.sendSuggestUniversityEmail(university.name)
      );
    }

    return university;
  } catch (err) {
    //TODO:logging
    //console.error("Error:", err.message);
    throw { kind: "Error Creation", message: err.message };
  }
};

const suggestUniversity = async (userID, req) => {
    try {
      const newUni = await University.create({
        name: req.name,
        country: req.country,
        latitude: req.latitude,
        longitude: req.longitude,
        suggested_by: userID,
        validated: 0,
      })

      await emailService.trySend(() =>
        emailService.sendSuggestUniversityEmail(newUni.name)
      );

      return newUni;
    } catch (err) {
      //TODO:logging
      throw { kind: "Error Update", message: err.message };
    }
};

const countUniversities = () => {
  return new Promise((resolve, reject) => {
    University.count({
      where: {
        validated: 1,
      },
    })
      .then((count) => {
        console.log("Number of universities", count);
        return resolve(count);
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        return reject({ kind: "Error Counting Users" });
      });
  });
};

const getCountries = () => {
  return new Promise((resolve, reject) => {
    University.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("country")), "country"],
      ],
      where: {
        id: {
          [Sequelize.Op.not]: 64,
        },
        validated: 1,
      },
    })
      .then((countries) => {
        const countryList = countries.map((country) => country.country);
        //TODO:logging
        //console.log("Distinct countries:", countryList);
        resolve(countryList);
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        reject({ kind: "Error Fetching Countries" });
      });
  });
};

const getMarkers = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        u.id,
        u.latitude, 
        u.longitude, 
        u.name,
        u.country,
        COUNT(uf.id) AS totalMembers,
        SUM(CASE WHEN uf.typology = 5584 THEN 1 ELSE 0 END) AS students,
        SUM(CASE WHEN uf.typology IN (5139, 7811, 8079) THEN 1 ELSE 0 END) AS lecturer
      FROM platform__university u
      LEFT JOIN user_final uf ON uf.university = u.id
      WHERE u.id != 64 AND u.validated = 1
      GROUP BY u.id, u.latitude, u.longitude, u.name
    `;

    sequelize
      .query(query, { type: Sequelize.QueryTypes.SELECT })
      .then((markers) => {
        const markerArray = markers.map((marker) => ({
          id: marker.id,
          latitude: marker.latitude,
          longitude: marker.longitude,
          name: marker.name,
          totalMembers: marker.totalMembers,
          students: marker.students,
          lecturer: marker.lecturer,
          country: marker.country,
        }));
        //TODO:logging
        //console.log("Markers:", markerArray);
        resolve(markerArray);
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        reject({ kind: "Error Fetching Universities" });
      });
  });
};

const getInfo = (countries) => {
  return new Promise((resolve, reject) => {
    const query = `
       SELECT 
        u.country, 
        COUNT(DISTINCT u.id) AS institutions,
        SUM(CASE WHEN uf.typology = 5584 THEN 1 ELSE 0 END) AS students,
        SUM(CASE WHEN uf.typology IN (5139, 7811, 8079) THEN 1 ELSE 0 END) AS lecturer
      FROM platform__university u
      LEFT JOIN user_final uf ON uf.university = u.id
      WHERE u.id != 64 AND u.validated = 1
      GROUP BY u.country
    `;

    sequelize
      .query(query, { type: Sequelize.QueryTypes.SELECT })
      .then((markers) => {
        //TODO:logging
        //console.log(markers);
        const markerArray = markers.map((marker) => ({
          // id: marker.id,
          country: marker.country,
          institutions: marker.institutions,
          students: marker.students,
          lecturer: marker.lecturer,
        }));
        //TODO:logging
        //console.log("Markers:", markerArray);
        resolve(markerArray);
      })
      .catch((err) => {
        //TODO:logging
        //console.log(err);
        reject({ kind: "Error Fetching Universities" });
      });
  });
};

module.exports = {
  findAll,
  addUniversity,
  updateById,
  findById,
  countUniversities,
  getCountries,
  getMarkers,
  getInfo,
  findByCountry,
  updateStatus,
  findAllInfo,
  suggestUniversity,
  deleteUniversity,
  getAvailableUniversities
};
