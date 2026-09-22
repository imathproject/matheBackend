const PublicationService = require("../services/publicationService");
const { tryCatch } = require("../utils/tryCatch");

const findAll = tryCatch(async (req, res) => {
  const publication = await PublicationService.getAllPublications();
  return res.status(200).json({ elements: publication });
});

const getById = tryCatch(async (req, res) => {
  const publication = await PublicationService.getPublicationById(
    req.params.id,
  );
  return res.status(200).json({ elements: publication });
});

const addPublication = tryCatch(async (req, res) => {
  const new_publication = await PublicationService.addPublication(req);
  return res.status(200).json({ elements: new_publication });
});

const updatePublication = tryCatch(async (req, res) => {
  const updatePublication = await PublicationService.updateById(req);
  return res.status(200).json({ elements: updatePublication });
});

const deletePublication = tryCatch(async (req, res) => {
  const deletePublication = await PublicationService.deleteById(req.params.id);
  return res.status(200).json({ elements: deletePublication });
});

const updateOrder = tryCatch(async (req, res) => {
  const { id, order } = req.body;
  const updateOrder = await PublicationService.updateOrder(req);
  return res.status(200).json({ elements: updateOrder });
});

module.exports = {
  findAll,
  addPublication,
  updatePublication,
  deletePublication,
  updateOrder,
  getById,
};
