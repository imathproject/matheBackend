require("dotenv").config();
require("./models");
const express = require("express");
const errorHandler = require("../middleware/errorHandler");
const app = express();
const db = require("./utils/db");
const routes = require("./routes");
const verify = require("../middleware/verifyAuth");
const cors = require("cors");
const credentials = require("../middleware/credentials");
const corsOptions = require("./utils/corsOption");
const cookieParser = require("cookie-parser");

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.json());

//middleware for cookies
app.use(cookieParser());

try {
  db.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

//Routes
app.use("/api/user", verify.authenticateToken, routes.user); //ADD: app.use('/api/user', routes.user); verify.authenticateToken,
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/role", verify.authenticateToken, require("./routes/roleRoute"));
app.use(
  "/api/topic",
  verify.authenticateToken,
  require("./routes/topicRoutes"),
);
app.use(
  "/api/subtopic",
  verify.authenticateToken,
  require("./routes/subtopicRoutes"),
);
app.use(
  "/api/question",
  verify.authenticateToken,
  require("./routes/questionRoute"),
);
app.use(
  "/api/questionAssessment",
  verify.authenticateToken,
  require("./routes/questionsAssessmentRoute"),
);
app.use(
  "/api/keyword",
  verify.authenticateToken,
  require("./routes/keywordRoutes"),
);
app.use(
  "/api/material",
  verify.authenticateToken,
  require("./routes/materialRoute"),
);
app.use(
  "/api/university",
  verify.authenticateToken,
  require("./routes/universityRoutes"),
);
app.use(
  "/api/learning",
  verify.authenticateToken,
  require("./routes/learningRoute"),
);
app.use(
  "/api/hobbies",
  verify.authenticateToken,
  require("./routes/hobbiesRoutes"),
);
app.use(
  "/api/gender",
  verify.authenticateToken,
  require("./routes/genderRoutes"),
);
app.use("/api/work", verify.authenticateToken, require("./routes/workRoutes"));
app.use(
  "/api/testimonial",
  verify.authenticateToken,
  require("./routes/testimonialRoute"),
);
app.use(
  "/api/country",
  verify.authenticateToken,
  require("./routes/countryRoutes"),
);
app.use(
  "/api/degree",
  verify.authenticateToken,
  require("./routes/degreeRoute"),
);
app.use(
  "/api/course",
  verify.authenticateToken,
  require("./routes/courseRoutes"),
);
app.use(
  "/api/position",
  verify.authenticateToken,
  require("./routes/positionRoute"),
);
app.use(
  "/api/experience",
  verify.authenticateToken,
  require("./routes/experienceRoute"),
);
app.use(
  "/api/degreePercentage",
  verify.authenticateToken,
  require("./routes/degreePercentageRoute"),
);

app.use("/api/olympic", verify.authenticateToken, require("./routes/olympicRoutes"));
app.use("/api/olympicQuestion", verify.authenticateToken, require("./routes/olympicQuestionRoute"));
app.use("/api/olympicAssessment", verify.authenticateToken, require("./routes/olympicAssessmentRoute"));

app.use("/api/competition", verify.authenticateToken, require("./routes/competitionRoute"));
app.use("/api/challenge", verify.authenticateToken, require("./routes/competitionRoute"));

app.use("/api/olympiadsChallenge", verify.authenticateToken, require("./routes/olympiadsChallengeRoute"));

app.use("/api/info", require("./routes/noAuthRoute"));
app.use("/api/publication", require("./routes/publicationRoute"));
app.use("/api/news", require("./routes/newsRoute"));
app.use(errorHandler);

module.exports = app;
