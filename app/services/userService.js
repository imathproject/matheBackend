const UserModel = require("../models/userModel");
const RoleModel = require("../models/roleModel");
const University = require("../models/universityModel");
const Learning = require("../models/learningModel");
const Hobbies = require("../models/hobbiesModel");
const Gender = require("../models/genderModel");
const Work = require("../models/workModel");
const Country = require("../models/countryModel");
const Course = require("../models/courseModel");
const Degree = require("../models/degreeModel");
const DegreePercentage = require("../models/degreePercentageModel");
const Position = require("../models/positionModel");
const Experience = require("../models/experienceModel");
const Teaching = require("../models/teachingModel");
const StudentWork = require("../models/studentWorkModel");
const TeachingTopics = require("../models/teachingTopicsModel");
const Topic = require("../models/topicModel");
const AssessmentQuestions = require("../models/QuestionAssessmentModel");
const topicService = require("./topicService");
const teachingTopicsService = require("./teachingTopicService");
const revisorTopicsService = require("./revisorTopicsService");
const authService = require("./authService");
const emailService = require("./emailService");
const md5 = require("md5");
const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../utils/db");
const fs = require("fs");
const path = require("path");

// --- User queries ---

const findById = async (id) => {
  const user = await UserModel.findOne({ where: { id } });
  if (!user) throw { kind: "not_found" };
  return user;
};

const findAll = async (data, options = {}) => {
  const conditions = {};
  const paramsToFields = [
    { param: data.typology, field: "typology" },
    { param: data.ban, field: "ban" },
    { param: data.university, field: "university" },
  ];

  for (const { param, field } of paramsToFields) {
    if (param != null) conditions[field] = param;
  }

  const users = await UserModel.findAll({
    where: { [Op.and]: [conditions] },
    order: [["id", "ASC"]],
    include: [{ model: RoleModel }, { model: Topic }],
    ...(options.attributes && { attributes: options.attributes }),
  });

  if (!users) throw { kind: "Not Found" };
  return users;
};

// Returns null if not found, otherwise the user array (with topicIds if teacher)
const getUser = async (id) => {
  const user = await UserModel.findAll({
    where: { id },
    include: [
      { model: RoleModel, attributes: ["id", "description"] },
      { model: Learning, attributes: ["label", "id"] },
      { model: Teaching, attributes: ["label", "id"] },
      { model: Hobbies, attributes: ["label", "id"] },
      { model: University, attributes: [["name", "label"], "id"] },
      { model: Gender, attributes: ["label", "id"] },
      { model: Work, attributes: ["label", "id"] },
      { model: StudentWork, attributes: ["label", "id"] },
      { model: Country, attributes: [["name", "label"], "id"] },
      { model: Course, attributes: ["label", "id"] },
      { model: Degree, attributes: ["label", "id"] },
      { model: DegreePercentage, attributes: ["label", "id"] },
      { model: Position, attributes: ["label", "id"] },
      { model: Experience, attributes: ["label", "id"] },
    ],
  });

  if (!user || user.length === 0) return null;

  const teachingTopics = await TeachingTopics.findAll({
    where: { userFinalId: id },
  });

  if (teachingTopics.length > 0) {
    const topicIds = teachingTopics.map((t) => t.dataValues.platformTopicId);
    return [{ ...user[0].toJSON(), topicIds }];
  }

  return user;
};

const getUsersInfo = async (roles) => {
  const valueMap = {
    1: process.env.Student,
    2: process.env.Lecture,
    3: process.env.Lecture_Reviewer,
    4: process.env.Admin,
  };

  const finalRoles = roles.map((num) => valueMap[num]);
  const conditions = {};
  if (finalRoles !== null) conditions.typology = finalRoles;

  const users = await UserModel.findAll({
    where: { [Op.and]: [conditions] },
    attributes: ["id", "name", "surname", "email"],
    include: [
      { model: RoleModel, attributes: ["id", "description"] },
      { model: Course, attributes: ["label"] },
      { model: Experience, attributes: ["label"] },
      { model: Degree, attributes: ["label"] },
      { model: DegreePercentage, attributes: ["label"] },
      { model: Gender, attributes: ["label"] },
      { model: Country, attributes: ["name"] },
      { model: University, attributes: ["name"] },
      { model: Hobbies, attributes: ["label"] },
      { model: Learning, attributes: ["label"] },
      { model: Teaching, attributes: ["label"] },
      { model: Work, attributes: ["label"] },
      { model: StudentWork, attributes: ["label"] },
      { model: Position, attributes: ["label"] },
    ],
  });

  return users.map((user) => {
    const userData = { ...user.dataValues };
    userData.country = userData.country ? userData.country.name : null;
    userData.hobby = userData.hobby ? userData.hobby.label : null;
    userData.learning_style = userData.learning_style ? userData.learning_style.label : null;
    userData.course = userData.platform__course ? userData.platform__course.label : null;
    userData.degree = userData.platform__degree ? userData.platform__degree.label : null;
    userData.percentage_degree = userData.platform__percentage_degree ? userData.platform__percentage_degree.label : null;
    userData.university = userData.platform__university ? userData.platform__university.name : null;
    userData.user_gender = userData.user_gender ? userData.user_gender.label : null;
    userData.teacher_experience = userData.teacher_experience ? userData.teacher_experience.label : null;
    userData.teaching_style = userData.teaching_style ? userData.teaching_style.label : null;
    userData.work_preference = userData.work_preference ? userData.work_preference.label : null;
    userData.studentwork_preference = userData.studentwork_preference ? userData.studentwork_preference.label : null;
    userData.teacher_position = userData.teacher_position ? userData.teacher_position.label : null;
    userData.role = userData.role ? userData.role.description : null;
    delete userData.platform__course;
    delete userData.platform__degree;
    delete userData.platform__percentage_degree;
    delete userData.platform__university;
    return userData;
  });
};

// --- User updates ---

const updateUser = async (userId, data) => {
  const values = {
    name: data.name,
    surname: data.surname,
    profile: data.profile,
    birth_year: data.birth_year,
    gender: data.gender,
    university: data.university,
    uni_degree: data.degree,
    study_country: data.study_country,
    work: data.work,
    learning: data.learning,
    hobbies: data.hobbies,
    enjoy_math: data.enjoy_math,
    degree_percentage: data.percentage,
    uni_courses: data.course,
  };

  if (data.guardian_name != null) values.guardian_name = data.guardian_name;
  if (data.guardian_email != null) values.guardian_email = data.guardian_email;

  await UserModel.update(values, { where: { id: userId } });
  return "Success";
};

const updateTeacher = async (userId, data) => {
  await UserModel.update(
    {
      name: data.name,
      surname: data.surname,
      profile: data.profile,
      birth_year: data.birth_year,
      gender: data.gender,
      university: data.university,
      uni_degree: data.uni_degree,
      study_country: data.study_country,
      work: data.work,
      student_work: data.student_work,
      learning: data.learning,
      teaching: data.teaching,
      orcid: data.orcid,
      scopus: data.scopus,
      position: data.position,
      years_of_experience: data.years_of_experience,
      completeProfile: 1,
    },
    { where: { id: userId } }
  );
  return "Success";
};

const updateStatus = async (data) => {
  await UserModel.update({ ban: data.ban }, { where: { id: data.id } });
  return "Success";
};


const updateUniversity = async (id) => {
  console.log("Updating users with university id:", id, "to default university (id: 64)");
  await UserModel.update({ university: 64 }, { where: { university: id } });
  return "Success";
};

const VALID_TYPOLOGIES = [
  process.env.Admin,
  process.env.Lecture_Reviewer,
  process.env.Lecture,
  process.env.Student,
  process.env.Lecturer_Not_Verified,
];

const updateTypologyDB = async (data) => {
  const updateData = { typology: data.typology };
  if (data.oldUser === process.env.Student && data.typology === process.env.Student) {
    updateData.completeProfile = 0;
  }
  await UserModel.update(updateData, { where: { id: data.id } });
  return "Success";
};

const handleTypologyUpdate = async (data) => {
  const { oldRole, email, typology, name } = data;

  if (!VALID_TYPOLOGIES.includes(String(typology)))
    throw { kind: "invalid_input", detail: "Invalid typology id." };

  const update = await updateTypologyDB(data); // tem data.id

  if (oldRole === process.env.Student || typology === process.env.Student)
    await authService.deleteTokenByUser(data.id);

  if (oldRole == process.env.Lecturer_Not_Verified) {
    const approved =
      typology == process.env.Lecture || typology == process.env.Lecture_Reviewer;

    await emailService.trySend(() =>
      approved
        ? emailService.sendTypologyUpdateApprovedEmail({ name, email })
        : emailService.sendTypologyUpdateReprovedEmail({ name, email })
    );
  }

  return update;
};

const handleTeacherUpdate = async (userId, data) => {
  await updateTeacher(userId, data);
  await teachingTopicsService.replace(userId, data.teachingTopics);
  const revisorTopics = data.revisorTopics ?? [];
  if (revisorTopics.length !== 0)
    await revisorTopicsService.replace(userId, revisorTopics);
  return "Success";
};

const handleReviewerTopicsUpdate = async (userId, topics) => {
  return revisorTopicsService.replace(userId, topics);
};

const handleUserUpdate = async (userId, roles, data) => {
  const isTeacher = roles == process.env.Lecture || roles == process.env.Lecture_Reviewer || roles == process.env.Lecturer_Not_Verified || roles == process.env.Admin;
  const isStudent = roles == process.env.Student;

  if (!await isProfileComplete(userId)) {
    if (isTeacher) return completeTeacherProfile(userId, data);
    if (isStudent) return completeStudentProfile(userId, data);
  }

  if (isTeacher) return handleTeacherUpdate(userId, data);

  const result = await updateUser(userId, data);
  if (data.isSameFile != null) await deleteFile(data.id);
  return result;
};

const completeTeacherProfile = async (userId, data) => {
  await updateTeacher(userId, data);

  await teachingTopicsService.replace(userId, data.teachingTopics);

  const revisorTopics = data.revisorTopics ?? [];
  let role = "Lecturer";

  if (revisorTopics.length > 0) {
    const topicsR = await topicService.findById(revisorTopics);
    await revisorTopicsService.insertInBulk(userId, topicsR);
    role = "Reviewer";
  }

  const { email } = await findById(userId);
  await emailService.trySend(() =>
    emailService.sendTeacherInterestEmail({ email, role })
  );
};

const completeStudentProfile = async (userId, data) => {
  const values = {
    name: data.name,
    surname: data.surname,
    profile: data.profile,
    birth_year: data.birth_year,
    gender: data.gender,
    university: data.university,
    uni_degree: data.degree,
    study_country: data.study_country,
    work: data.work,
    learning: data.learning,
    hobbies: data.hobbies,
    enjoy_math: data.enjoy_math,
    completeProfile: 1,
    degree_percentage: data.percentage,
    uni_courses: data.course,
  };

  if (data.guardian_name != null) values.guardian_name = data.guardian_name;
  if (data.guardian_email != null) values.guardian_email = data.guardian_email;

  await UserModel.update(values, { where: { id: userId } });
  return "Success";
};

// --- Auth / Password ---

const findByCheckcode = async (checkcode) => {
  const user = await UserModel.findOne({ where: { checkcode } });
  if (!user) throw { kind: "Error Update" };
  return user.id;
};

const singUp = (req) => {
  const hashedPassword = md5(req.password);
  const checkcode = (Math.random() + 1).toString(36).substring(2);
  let typology = process.env.Student;
  if (req.typology === 2) typology = process.env.Lecturer_Not_Verified;

  return new Promise((resolve, reject) => {
    UserModel.create({
      name: req.name,
      surname: req.surname,
      email: req.email,
      password: hashedPassword,
      typology: typology,
      university: 64,
      verifyEmail: 0,
      profile: "",
      checkcode: checkcode,
      completeProfile: 0,
      privacy: 0,
      ban: 0,
      gender: 4,
      birth_year: 2000,
      study_country: 251,
      scholar_year: 2,
      work: 1,
      learning: 1,
      hobbies: 6,
      enjoy_math: 1,
      degree_percentage: 1,
      uni_courses: 1,
      uni_degree: 6,
    })
      .then((user) => resolve(user))
      .catch((err) => {
        //TODO: logging
        //console.log(err.message);
        reject({ kind: "Error Update" });
      });
  });
};

const requestNewPassword = async (email) => {
  const checkcode = (Math.random() + 1).toString(36).substring(2);
  await UserModel.update({ recoverPass: checkcode }, { where: { email } });
  return checkcode;
};

const confirmEmail = async (checkcode) => {
  const id = await findByCheckcode(checkcode);
  await UserModel.update({ verifyEmail: 1, checkcode: null }, { where: { id } });
  return "Success";
};

const changePassword = async (data) => {
  const hashedPassword = md5(data.newPassword);
  await UserModel.update({ password: hashedPassword }, { where: { id: data.id } });
  return "Success";
};

const checkOldPass = async (data) => {
  const hashedPassword = md5(data.oldPassword);
  const user = await UserModel.findOne({ where: { id: data.id, password: hashedPassword } });
  if (!user) throw { kind: "No_compatible_Pass" };
  return "Success";
};

const comparePasswords = async (data) => {
  const hashedPassword = md5(data.newPassword);
  const user = await UserModel.findOne({ where: { id: data.id, password: hashedPassword } });
  if (user) throw { kind: "Same_Pass" };
  return "Success";
};

const changePasswordWithValidation = async (userID, data) => {
  data.id = userID;
  await checkOldPass(data);
  await comparePasswords(data);
  return changePassword(data);
};

const checkIfSamePassword = (body) => {
  const hashedPassword = md5(body.newPassword);
  return UserModel.findOne({
    where: { recoverPass: body.checkcode, password: hashedPassword },
  });
};

const recoverPassword = async (body) => {
  const samePass = await checkIfSamePassword(body);
  if (samePass) throw { kind: "Same_Pass" };

  const hashedPassword = md5(body.newPassword);
  await UserModel.update(
    { password: hashedPassword, recoverPass: null },
    { where: { recoverPass: body.checkcode } }
  );
  return "Success";
};

// --- Stats ---

const countStudents = async () => {
  return UserModel.count({ where: { typology: 5584 } });
};

const countLectures = async () => {
  return UserModel.count({ where: { typology: [5139, 7811, 8079] } });
};

const usersCountries = async () => {
  const results = await sequelize.query(
    `SELECT DISTINCT u.study_country, c.name as country_name
     FROM user_final u
     LEFT JOIN countries c ON u.study_country = c.id`,
    { type: QueryTypes.SELECT }
  );
  return results.map((r) => r.country_name);
};

const getHistoric = async () => {
  const usersData = await UserModel.findAll({
    attributes: ["id", "gender", "birth_year", "study_country", "work", "learning", "hobbies", "enjoy_math"],
    order: [["id", "ASC"]],
    where: { typology: 5584 },
    raw: true,
  });

  const assessmentData = await AssessmentQuestions.findAll({
    attributes: ["student_id", "question_id", "question_level", "answer"],
  });

  return [
    usersData.map((u) => u.id),
    usersData.map((u) => u.gender),
    usersData.map((u) => u.birth_year),
    usersData.map((u) => u.study_country),
    usersData.map((u) => u.work),
    usersData.map((u) => u.learning),
    usersData.map((u) => u.hobbies),
    usersData.map((u) => u.enjoy_math),
    assessmentData,
  ];
};

// --- File ---

const getTeacherAbilityPath = (id) => {
  const filePath = path.join(__dirname, "../../teachingAbilities/" + id + ".pdf");
  console.log(filePath);
  return fs.existsSync(filePath) ? filePath : null;
};

const deleteFile = async (id) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "../../teachingAbilities/" + id + ".pdf");
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`);
          return;
        }
        resolve("File deleted successfully");
      });
    } else {
      reject("Unable to delete the file");
    }
  });
};

const isProfileComplete = async (id) => {
  const user = await UserModel.findOne({
    where: { id },
    attributes: ["completeProfile"],
  });
  return !!user?.completeProfile;
};

module.exports = {
  findById,
  findAll,
  getUser,
  getUsersInfo,
  updateUser,
  updateTeacher,
  updateStatus,
  updateUniversity,
  handleTypologyUpdate,
  handleTeacherUpdate,
  handleReviewerTopicsUpdate,
  handleUserUpdate,
  completeTeacherProfile,
  completeStudentProfile,
  singUp,
  findByCheckcode,
  requestNewPassword,
  confirmEmail,
  changePassword,
  checkOldPass,
  comparePasswords,
  changePasswordWithValidation,
  checkIfSamePassword,
  recoverPassword,
  countStudents,
  countLectures,
  usersCountries,
  getHistoric,
  getTeacherAbilityPath,
  deleteFile,
  isProfileComplete,
};