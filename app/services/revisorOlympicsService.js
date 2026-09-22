const RevisorOlympics = require("../models/revisorOlympicsModel");
const Olympic = require("../models/olympicModel");
const db = require("../utils/db");

const findByUserId = async (user) => {
  const rows = await RevisorOlympics.findAll({ where: { userFinalId: user } });
  const olympicIds = rows.map((row) => row.id_olympic);
  return { olympicIds };
};


const replaceForUser = async (user, olympics) => {
  const requested = [...new Set((olympics || []).map(Number))].filter(Number.isInteger);
  const existing = requested.length
    ? await Olympic.findAll({ attributes: ["id"], where: { id: requested } })
    : [];

  return db.transaction(async (transaction) => {
    await RevisorOlympics.destroy({ where: { userFinalId: user }, transaction });
    if (existing.length === 0) return [];
    return RevisorOlympics.bulkCreate(
      existing.map((olympic) => ({ userFinalId: user, id_olympic: olympic.id })),
      { transaction }
    );
  });
};

module.exports = { findByUserId, replaceForUser };
