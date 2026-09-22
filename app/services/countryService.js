const Country = require("../models/countryModel");
const { Op } = require("sequelize");


/**
 * Fetches all countries from the database, ordered by name.
 * Excludes id 251, which corresponds to the "Other" entry
 * (not a real country, used as a fallback/catch-all option).
 *
 * @async
 * @function findAll
 * @returns {Promise<Array<{id: number, label: string}>>} List of countries in { id, label } format
 * @throws {{kind: string, detail: string}} Custom error object if the query fails
 */

const findAll = async () => {
    try{
        return await Country.findAll({
            attributes: [["name", "label"], "id"],
            where: {
                id: {
                    [Op.not]: 251, // 251 = "Other"
                },
            },
            order: [["name", "ASC"]]
        });
    } catch (err) {
        throw err;
    }
};

module.exports = { findAll };