const axios = require("axios");

const SCORE_THRESHOLD = 0.5;

const verify = async (token, action) => {
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${token}`
  );

  const { success, score, action: verifiedAction } = response.data;

  if (!success || score < SCORE_THRESHOLD || (action && verifiedAction !== action)) {
    throw { kind: "robot_detected", message: "Robot detected" };
  }
};

module.exports = { verify };