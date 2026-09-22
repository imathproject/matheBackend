const PublicationModel = require("../models/publicationModel");

const reorderAll = async (transaction) => {
  const publications = await PublicationModel.findAll({
    order: [
      ["itemOrder", "ASC"],
      ["id", "DESC"],
    ],
    transaction,
  });

  await Promise.all(
    publications.map((pub, index) =>
      pub.update({ itemOrder: index }, { transaction }),
    ),
  );
};

const addPublication = async (req) => {
  const { title, authors, link, type } = req.body;

  const t = await PublicationModel.sequelize.transaction();

  const id = await getLastId();
  console.log(id);

  try {
    const publication = await PublicationModel.create(
      {
        id: id + 1,
        title: title,
        link: link,
        authors: authors,
        type: type,
        itemOrder: -1,
      },
      { transaction: t },
    );

    await reorderAll(t);
    await t.commit();
    return publication.dataValues;
  } catch (err) {
    console.error(err);
    throw { kind: "Error Update", detail: err.message };
  }
};

/*
const incrementOrder = async () => {

  return new Promise((resolve, reject) => {
    PublicationModel.increment('itemOrder', {
      by: 1,
      where: {}  // Empty where clause to update all rows
    })
      .then((publication) => {
        return resolve(publication);
      })
      .catch((err) => {
        console.log(err);
        return reject({ kind: "Error Update" });
      });
  });
};*/

const getLastId = async () => {
  return new Promise((resolve, reject) => {
    PublicationModel.max("id")
      .then((maxId) => {
        console.log("MAX ID:", maxId);
        resolve(maxId);
      })
      .catch((err) => {
        reject({ kind: "Error Fetching Max ID", detail: err.message });
      });
  });
};

const getAllPublications = async () => {
  return new Promise((resolve, reject) => {
    PublicationModel.findAll({ order: [["itemOrder", "ASC"]] })
      .then((publications) => {
        return resolve(publications);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const getPublicationById = async (id) => {
  return new Promise((resolve, reject) => {
    PublicationModel.findByPk(id)
      .then((publications) => {
        return resolve(publications);
      })
      .catch((err) => {
        console.log(err.message);
        return reject({ kind: "Error Update" });
      });
  });
};

const updateById = async (req) => {
  const { id, ...updateData } = req.body;

  try {
    const [affectedCount] = await PublicationModel.update(updateData, {
      where: { id },
    });

    if (affectedCount === 0) {
      return new Error("Publication not found");
    }

    return { success: true, affectedCount };
  } catch (err) {
    console.error("Error updating publication:", err.message);
    throw { kind: "Error Update", message: err.message };
  }
};

const deleteById = async (id) => {
  const t = await PublicationModel.sequelize.transaction();

  try {
    const publication = await PublicationModel.findByPk(id, { transaction: t });

    if (!publication) {
      await t.rollback();
      return "Item not found";
    }

    await publication.destroy({ transaction: t });

    await reorderAll(t);

    await t.commit();
    return `Success, item deleted and list reordered`;
  } catch (err) {
    await t.rollback();
    throw { kind: "Forbidden", detail: err.message };
  }
};

// const updateOrder = async (id, newOrder) => {
//   const t = await PublicationModel.sequelize.transaction();

//   try {
//     const publication = await PublicationModel.findByPk(id, { transaction: t });
//     if (!publication) return new Error("Publication not found");

//     const targetOrder =
//       typeof newOrder === "number" ? newOrder + 0.5 : publication.itemOrder;

//     await publication.update({ itemOrder: targetOrder }, { transaction: t });

//     await reorderAll(t);

//     await t.commit();
//     return "Order updated and list synchronized";
//   } catch (err) {
//     await t.rollback();
//     throw { kind: "Forbidden", error: err.message };
//   }
// };

const updateOrder = async (req) => {
  const newOrder = req.body;

  const t = await PublicationModel.sequelize.transaction();

  try {
    await Promise.all(
      newOrder.map((item) =>
        PublicationModel.update(
          { itemOrder: item.order },
          {
            where: { id: item.id },
            transaction: t,
          },
        ),
      ),
    );

    await t.commit();
    return "Success";
  } catch (err) {
    await t.rollback();
    throw { kind: "Forbidden", error: err.message };
  }
};

module.exports = {
  addPublication,
  reorderAll,
  getAllPublications,
  getLastId,
  updateById,
  deleteById,
  updateOrder,
  getPublicationById,
};
