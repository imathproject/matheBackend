const User = require("./userModel");
const Token = require("./tokenModel");
const Keyword = require("./keywordModel");
const Question = require("./questionModel");
const QuestionKeyword = require("./questionKeywordModel");
const Material = require("./materialModel");
const MaterialType = require("./materialTypeModel");
const MaterialKeyword = require("./materialKeywordModel");
const Topic = require("./topicModel");
const Subtopic = require("./subtopicModel");
const AssessmentQuestions = require("./QuestionAssessmentModel");
const University = require("./universityModel");
const Learning = require("./learningModel");
const Hobbies = require("./hobbiesModel");
const Gender = require("./genderModel");
const Work = require("./workModel");
const Role = require("./roleModel");
const Country = require("./countryModel");
const Degree = require("./degreeModel");
const DegreePercentge = require("./degreePercentageModel");
const Course = require("./courseModel");
const Position = require("./positionModel");
const Experience = require("./experienceModel");
const TeachingTopics = require("./teachingTopicsModel");
const RevisorTopics = require("./revisorTopicsModel");
const Teaching = require("./teachingModel");
const StudentWork = require("./studentWorkModel");
const Testimonial = require("./testimonialModel");
const Olympic = require("./olympicModel");
const OlympicQuestion = require("./olympicQuestionsModel");
const OlympicLevel = require("./olympicLevelModel");
const OlympicQuestionAssesment = require("./olympicQuestionAssessmentModel");
const OlympicYear = require("./olympicYearModel");
const OlympicPhase = require("./olympicPhaseModel");
const OlympicAlternatives = require("./olympicAlternatives");
const RevisorOlympics = require("./revisorOlympicsModel");
const News = require("./newsModel");
const Competition = require("./competitionModel");
const CompetitionQuestion = require("./competitionQuestionModel");
const OlympiadsChallenge = require("./olympiadsChallengeModel");
const OlympiadsChallengeSelectedQuestion = require("./olympiadsChallengeSelectedQuestionModel");
const OlympiadsChallengeQuestion = require("./olympiadsChallengeQuestionModel");

//Relations

//Many-to-one
Competition.hasMany(CompetitionQuestion, { foreignKey: "competition_id" });
CompetitionQuestion.belongsTo(Competition, { foreignKey: "competition_id" });

Question.hasMany(CompetitionQuestion, { foreignKey: "id_question" });
CompetitionQuestion.belongsTo(Question, { foreignKey: "id_question" });

User.hasMany(CompetitionQuestion, { foreignKey: "user_id" });
CompetitionQuestion.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Competition, { foreignKey: "user_id" });
Competition.belongsTo(User, { foreignKey: "user_id" });

Topic.hasMany(Competition, { foreignKey: "topic" });
Competition.belongsTo(Topic, { foreignKey: "topic" });

Subtopic.hasMany(Competition, { foreignKey: "subtopic" });
Competition.belongsTo(Subtopic, { foreignKey: "subtopic" });

// Olympiads Challenge associations
OlympiadsChallenge.hasMany(OlympiadsChallengeSelectedQuestion, { foreignKey: "olympiads_challenge_id" });
OlympiadsChallengeSelectedQuestion.belongsTo(OlympiadsChallenge, { foreignKey: "olympiads_challenge_id" });

OlympiadsChallenge.hasMany(OlympiadsChallengeQuestion, { foreignKey: "olympiads_challenge_id" });
OlympiadsChallengeQuestion.belongsTo(OlympiadsChallenge, { foreignKey: "olympiads_challenge_id" });

OlympicQuestion.hasMany(OlympiadsChallengeSelectedQuestion, { foreignKey: "id_olympic_question" });
OlympiadsChallengeSelectedQuestion.belongsTo(OlympicQuestion, { foreignKey: "id_olympic_question" });

OlympicQuestion.hasMany(OlympiadsChallengeQuestion, { foreignKey: "id_olympic_question" });
OlympiadsChallengeQuestion.belongsTo(OlympicQuestion, { foreignKey: "id_olympic_question" });

User.hasMany(OlympiadsChallengeQuestion, { foreignKey: "user_id" });
OlympiadsChallengeQuestion.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(OlympiadsChallenge, { foreignKey: "user_id" });
OlympiadsChallenge.belongsTo(User, { foreignKey: "user_id" });

Olympic.hasMany(OlympiadsChallenge, { foreignKey: "id_olympic" });
OlympiadsChallenge.belongsTo(Olympic, { foreignKey: "id_olympic" });

OlympicLevel.hasMany(OlympiadsChallenge, { foreignKey: "id_olympic_level" });
OlympiadsChallenge.belongsTo(OlympicLevel, { foreignKey: "id_olympic_level" });

OlympicYear.hasMany(OlympiadsChallenge, { foreignKey: "id_olympic_year" });
OlympiadsChallenge.belongsTo(OlympicYear, { foreignKey: "id_olympic_year" });

OlympicPhase.hasMany(OlympiadsChallenge, { foreignKey: "id_olympic_phase" });
OlympiadsChallenge.belongsTo(OlympicPhase, { foreignKey: "id_olympic_phase" });

User.hasMany(Token, { foreignKey: "user_id", as: "user_token" });
Token.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Question, { as: "Validator", foreignKey: "validate_by" });
Question.belongsTo(User, { as: "Validator", foreignKey: "validate_by" });

User.hasMany(Question, { as: "Lecturer", foreignKey: "id_lect" });
Question.belongsTo(User, { as: "Lecturer", foreignKey: "id_lect" });

User.hasMany(Material, { as: "M_Validator", foreignKey: "validate_by" });
Material.belongsTo(User, { as: "M_Validator", foreignKey: "validate_by" });

User.hasMany(Material, { as: "M_Lecturer", foreignKey: "id_lect" });
Material.belongsTo(User, { as: "M_Lecturer", foreignKey: "id_lect" });

Topic.hasMany(Keyword, { foreignKey: "id_top" });
Keyword.belongsTo(Topic, { foreignKey: "id_top" });

Subtopic.hasMany(Keyword, { foreignKey: "id_sub" });
Keyword.belongsTo(Subtopic, { foreignKey: "id_sub" });

MaterialType.hasMany(Material, { foreignKey: "type" });
Material.belongsTo(MaterialType, { foreignKey: "type" });

Topic.hasMany(Subtopic, { foreignKey: "id_top" });
Subtopic.belongsTo(Topic, { foreignKey: "id_top" });

Topic.hasMany(Question, { foreignKey: "topic" });
Question.belongsTo(Topic, { foreignKey: "topic" });

Subtopic.hasMany(Question, { foreignKey: "subtopic" });
Question.belongsTo(Subtopic, { foreignKey: "subtopic" });

University.hasMany(User, { foreignKey: "university" });
User.belongsTo(University, { foreignKey: "university" });

User.hasMany(University, { foreignKey: "suggested_by" });
University.belongsTo(User, { foreignKey: "suggested_by" });

Learning.hasMany(User, { foreignKey: "learning" });
User.belongsTo(Learning, { foreignKey: "learning" });

Teaching.hasMany(User, { foreignKey: "teaching" });
User.belongsTo(Teaching, { foreignKey: "teaching" });

Hobbies.hasMany(User, { foreignKey: "hobbies" });
User.belongsTo(Hobbies, { foreignKey: "hobbies" });

Gender.hasMany(User, { foreignKey: "gender" });
User.belongsTo(Gender, { foreignKey: "gender" });

Work.hasMany(User, { foreignKey: "work" });
User.belongsTo(Work, { foreignKey: "work" });

Role.hasMany(User, { foreignKey: "typology" });
User.belongsTo(Role, { foreignKey: "typology" });

Country.hasMany(User, { foreignKey: "study_country" });
User.belongsTo(Country, { foreignKey: "study_country" });

Degree.hasMany(User, { foreignKey: "uni_degree" });
User.belongsTo(Degree, { foreignKey: "uni_degree" });

DegreePercentge.hasMany(User, { foreignKey: "degree_percentage" });
User.belongsTo(DegreePercentge, { foreignKey: "degree_percentage" });

Course.hasMany(User, { foreignKey: "uni_courses" });
User.belongsTo(Course, { foreignKey: "uni_courses" });

User.hasMany(AssessmentQuestions, { foreignKey: "student_id" });
AssessmentQuestions.belongsTo(User, { foreignKey: "student_id" });

Position.hasMany(User, { foreignKey: "position" });
User.belongsTo(Position, { foreignKey: "position" });

Experience.hasMany(User, { foreignKey: "years_of_experience" });
User.belongsTo(Experience, { foreignKey: "years_of_experience" });

StudentWork.hasMany(User, { foreignKey: "student_work" });
User.belongsTo(StudentWork, { foreignKey: "student_work" });

Question.hasMany(AssessmentQuestions, { foreignKey: "question_id" });
AssessmentQuestions.belongsTo(Question, { foreignKey: "question_id" });

Topic.hasMany(AssessmentQuestions, { foreignKey: "topic" });
AssessmentQuestions.belongsTo(Topic, { foreignKey: "topic" });

Subtopic.hasMany(AssessmentQuestions, { foreignKey: "subtopic" });
AssessmentQuestions.belongsTo(Subtopic, { foreignKey: "subtopic" });

Subtopic.hasMany(AssessmentQuestions, { foreignKey: "subtopic" });
AssessmentQuestions.belongsTo(Subtopic, { foreignKey: "subtopic" });


User.hasMany(Testimonial, { foreignKey: "user_id" });
Testimonial.belongsTo(User, { foreignKey: "user_id" });

Olympic.hasMany(OlympicLevel, { foreignKey: "id_olympic" });
OlympicLevel.belongsTo(Olympic, { foreignKey: "id_olympic" });

Olympic.hasMany(OlympicQuestion, { foreignKey: "id_olympic" });
OlympicQuestion.belongsTo(Olympic, { foreignKey: "id_olympic" });

Olympic.hasMany(OlympicYear, { foreignKey: 'id_olympic' });
OlympicYear.belongsTo(Olympic, { foreignKey: 'id_olympic' });

Olympic.hasMany(OlympicPhase, { foreignKey: 'id_olympic' });
OlympicPhase.belongsTo(Olympic, { foreignKey: 'id_olympic' });

OlympicLevel.hasMany(OlympicQuestion, { foreignKey: "id_olympic_level" });
OlympicQuestion.belongsTo(OlympicLevel, { foreignKey: "id_olympic_level" });


OlympicYear.hasMany(OlympicQuestion, { foreignKey: "id_olympic_year" });
OlympicQuestion.belongsTo(OlympicYear, { foreignKey: "id_olympic_year" });


OlympicPhase.hasMany(OlympicQuestion, { foreignKey: "id_olympic_phase" });
OlympicQuestion.belongsTo(OlympicPhase, { foreignKey: "id_olympic_phase" });


User.hasMany(OlympicQuestionAssesment, { foreignKey: "student_id" });
OlympicQuestionAssesment.belongsTo(User, { foreignKey: "student_id" });

OlympicQuestion.hasMany(OlympicQuestionAssesment, { foreignKey: "id_olympic_question", as: "student_answers" });
OlympicQuestionAssesment.belongsTo(OlympicQuestion, { foreignKey: "id_olympic_question", as: "question_details" });

User.hasMany(OlympicQuestion, { foreignKey: "validate_by" });
OlympicQuestion.belongsTo(User, { foreignKey: "validate_by" });

User.hasMany(OlympicQuestion, { as: "OlympicLecturer", foreignKey: "id_lect" });
OlympicQuestion.belongsTo(User, { as: "Lecturer", foreignKey: "id_lect" });

OlympicQuestion.hasMany(OlympicAlternatives, { foreignKey: "id_olympic_question", as: "alternatives" });
OlympicAlternatives.belongsTo(OlympicQuestion, { foreignKey: "id_olympic_question" });

OlympicQuestion.belongsTo(OlympicAlternatives, { foreignKey: "correctAnswerId", as: "correct_alternative" });

User.belongsToMany(Olympic, { through: RevisorOlympics, foreignKey: "userFinalId", otherKey: "id_olympic" });
Olympic.belongsToMany(User, { through: RevisorOlympics, foreignKey: "id_olympic", otherKey: "userFinalId" });

//Olympic Assessment
User.hasMany(OlympicQuestionAssesment, { foreignKey: "id_stud" });
OlympicQuestionAssesment.belongsTo(User, { foreignKey: "id_stud" });


//Many-to-many
Keyword.belongsToMany(Question, { through: QuestionKeyword });
Question.belongsToMany(Keyword, { through: QuestionKeyword });

Keyword.belongsToMany(Material, { through: MaterialKeyword });
Material.belongsToMany(Keyword, { through: MaterialKeyword });

User.belongsToMany(Topic, { through: TeachingTopics });
Topic.belongsToMany(User, { through: TeachingTopics });

Material.belongsTo(Topic, { foreignKey: "topic" });
Topic.hasMany(Material, { foreignKey: "topic" });

Material.belongsTo(Subtopic, { foreignKey: "subtopic" });
Subtopic.hasMany(Material, { foreignKey: "subtopic" });

User.belongsToMany(Topic, { through: TeachingTopics });
Topic.belongsToMany(User, { through: TeachingTopics });

User.belongsToMany(Topic, { through: RevisorTopics });
Topic.belongsToMany(User, { through: RevisorTopics });
