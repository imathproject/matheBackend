const nodemailer = require("nodemailer");

const templates = {
  welcome: (newUser) => ({
    subject: "Welcome in MathE Portal - Please confirm your email address",
    text: `Dear ${newUser.name} ${newUser.surname},

Welcome to the MathE platform!

You activated the registration process to the MathE platform. Please verify your email address by clicking on the following link: ${process.env.FRONTEND_URL}/confirmEmail?checkcode=${newUser.checkcode}

Best regards,
MathE Platform`,
  }),

  passwordRecovery: (email, checkcode) => ({
    subject: "MathE Platform - Recover Password",
    text: `Dear ${email} ,

Recently, there has been a request to change the password for your account.
If you requested this password change, please click on the following link to reset your password: ${process.env.FRONTEND_URL}/newPassword?checkcode=${checkcode}

If you did not make this request, you can disregard this message and your password will remain the same.

Best regards,
MathE Platform`,
  }),

  getInTouch: ({ name, email, userSubject, userContent }) => ({
    subject: "MathE Platform - Get in touch",
    text: `Dear Administrators,

The user, ${name} (email: ${email}), has left the following message:

Subject: ${userSubject}
Content: "${userContent}"

Kind regards,
MathE Platform`,
  }),

  suggestUniversity: (name) => ({
    subject: "New University suggestion",
    text: `Dear Administrators,

The ${name} university was suggested by a new user of the MathE platform.
Please, verify it under the Management Area, Universities option.

Best regards,
MathE Platform`,
  }),

  typologyUpdateApproved: (name) => ({
    subject: "MathE Lecturer Application Status",
    text: `Dear ${name},

Your Lecturer account has been successfully verified. Upon logging back into the MathE platform, you will gain access to the restricted areas designated for Lecturers.

Best regards,
MathE Platform`,
  }),

  typologyUpdateReproved: (name) => ({
    subject: "MathE Lecturer Application Status",
    text: `Dear ${name},

Unfortunately, your request to become a Lecturer on the MathE platform has been declined. However, you can still access the platform in student view and enjoy materials and tests tailored to your needs.

Best regards,
MathE Platform`,
  }),

  teacherInterest: ({ email, role }) => ({
    subject: `New ${role}`,
    text: `Dear Administrators,

User ${email} has expressed interest in collaborating with the MathE project as a ${role}.

Please navigate to the management section under the "Users" option to validate the ${role.toLowerCase()}'s qualifications.

Best regards,
MathE Platform`,
  }),
};

const transporter = nodemailer.createTransport({
  host: process.env.MailHost,
  port: Number(process.env.MailPort),
  secure: false,
  auth: {
    user: process.env.MailUsername,
    pass: process.env.MailPassword,
  },
  tls: { rejectUnauthorized: false },
});

const sendEmail = async ({ to, subject, text }) => {
  if (!to) throw { kind: "Email Error", detail: "Missing recipient" };

  try {
    await transporter.sendMail({ from: process.env.MailFrom, to, subject, text });
    return "Success";
  } catch (err) {
    //console.error(err);
    throw { kind: "Email Error" };
  }
};

const sendWelcomeEmail = (newUser) => {
  const { subject, text } = templates.welcome(newUser);
  return sendEmail({ to: newUser.email, subject, text });
};

const sendPasswordRecoveryEmail = (email, checkcode) => {
  const { subject, text } = templates.passwordRecovery(email, checkcode);
  return sendEmail({ to: email, subject, text });
};

const sendGetInTouchEmail = (data) => {
  const { subject, text } = templates.getInTouch(data);
  return sendEmail({ to: process.env.MailFrom, subject, text });
};

const sendSuggestUniversityEmail = (name) => {
  const { subject, text } = templates.suggestUniversity(name);
  return sendEmail({ to: process.env.MailFrom, subject, text });
};

const sendTypologyUpdateApprovedEmail = ({ name, email }) => {
  const { subject, text } = templates.typologyUpdateApproved(name);
  return sendEmail({ to: email, subject, text });
};

const sendTypologyUpdateReprovedEmail = ({ name, email }) => {
  const { subject, text } = templates.typologyUpdateReproved(name);
  return sendEmail({ to: email, subject, text });
};

const sendTeacherInterestEmail = async ({ email, role }) => {
  if (!email) throw { kind: "Email Error", detail: "Missing email" };

  const { subject, text } = templates.teacherInterest({ email, role });
  return sendEmail({ to: process.env.MailFrom, subject, text });
};

// Returns false instead of throwing, so DB changes already made are kept.
const trySend = async (fn) => {
  try {
    await fn();
    return true;
  } catch (err) {
    // TODO:logging — no recipient/content, only the failure reason
    console.error("Email failed:", err.kind || err.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  trySend,
  sendWelcomeEmail,
  sendPasswordRecoveryEmail,
  sendGetInTouchEmail,
  sendSuggestUniversityEmail,
  sendTypologyUpdateApprovedEmail,
  sendTypologyUpdateReprovedEmail,
  sendTeacherInterestEmail,
};
