const db = require("../utils/db");

const MaterialKeyword = db.define("platform_material_keyword", {
},{
  timestamps: false,
  freezeTableName: true,
});

module.exports = MaterialKeyword;