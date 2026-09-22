const UserModel = require("../models/userModel");
const CountryModel = require("../models/countryModel");
const RoleModel = require("../models/roleModel");
const TestimonialModel = require("../models/testimonialModel");


const addTestimonial = async (userID, req) => {
  const { title, testimonial } = req.body;

  if (await getTestimonialByUser(userID)) {
    const error = new Error("Testimonial already exists");
    error.kind = "already_exists";
    throw error;
    // checar como vai ser tratado no front
  }

  return new Promise((resolve, reject) => {
    TestimonialModel.create({
      user_id: userID,
      title: title,
      testimonial: testimonial,
      validated: 0,
      public: 0,
    })
      .then((publication) => {
        //TODO: logging
        //console.log("publication", publication.dataValues);
        return resolve(publication.dataValues);
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err);
        return reject({ kind: "Error Update" });
      });
  });
};

const getValidatedTestimonials = async () => {
  return new Promise((resolve, reject) => {
    TestimonialModel.findAll({
      where: { public: 1, validated: 1 },
      include: [
        {
          model: UserModel,
          include: [CountryModel, RoleModel],
        },
      ],
    })
      .then((publications) => {
        return resolve(publications);
      })
      .catch((err) => {
        //TODO: logging
        //console.error(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const getAll = async () => {
  return await TestimonialModel.findAll({
    include: [
      {
        model: UserModel,
        include: [CountryModel, RoleModel],
      },
    ],
  }).catch((err) => {
    //TODO: logging
    //console.log(err);
    throw new Error("Error fetching testimonials");
  });
};

const getTestimonialByUser = async (id) => {
  //TODO: logging
  //console.log("Entrei no get testimonial by user para o user: " + id);
  return new Promise((resolve, reject) => {
    TestimonialModel.findOne({
      where: { user_id: id },
      include: [
        {
          model: UserModel,
          include: [CountryModel, RoleModel],
        },
      ],
    })
      .then((publications) => {
        //TODO: logging
        //console.log(publications);
        return resolve(publications);
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const findById = async (id) => {
  return new Promise((resolve, reject) => {
    TestimonialModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          include: [CountryModel, RoleModel],
        },
      ],
    })
      .then((publication) => {
        return resolve(publication);
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const deleteById = async (id) => {
  return new Promise((resolve, reject) => {
    TestimonialModel.destroy({
      where: { id: id },
    })
      .then((item) => {
        if (item) {
          //TODO: logging
          //console.log(item);
          return resolve("Success");
        }
        return resolve("Error Delete: Not Found");
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Forbidden" });
      });
  });
};

const validateTestimonial = async (req) => {
  const { id, title, testimonial, validated } = req.body;
  return new Promise((resolve, reject) => {
    TestimonialModel.update(
      { title: title, testimonial: testimonial, validated: validated },
      { where: { id: id } },
    )
      .then((item) => {
        //TODO: logging
        //console.log(item.message);
        return resolve("Success");
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Forbidden" });
      });
  });
};

const updateStatus = async (req) => {
  const { testimonialID, status } = req.body;
  return new Promise((resolve, reject) => {
    TestimonialModel.update(
      { public: status },
      { where: { id: testimonialID } },
    )
      .then((item) => {
        //TODO: logging
        //console.log(item.message);
        return resolve("Success");
      })
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        return reject({ kind: "Forbidden" });
      });
  });
};

module.exports = {
  getValidatedTestimonials,
  addTestimonial,
  getTestimonialByUser,
  validateTestimonial,
  deleteById,
  getAll,
  findById,
  updateStatus,
};
