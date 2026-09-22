const countryService = require("../services/countryService");
const { tryCatch } = require("../utils/tryCatch");

const findAll = tryCatch(async (req, res) => {
  const countries = await countryService.findAll();
  return res.status(200).json({ elements: countries });
});

module.exports = { findAll };
