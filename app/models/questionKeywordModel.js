const db = require("../utils/db");

const QuestionKeyword = db.define(
  "platform_keyword_snaquestion",
  {},
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = QuestionKeyword;
