require("dotenv").config();

// Verified lecturer, lecturer who also reviews, or admin: can create/manage own content.
const CONTENT_MANAGER = [
    process.env.Lecture,
    process.env.Lecture_Reviewer,
    process.env.Admin,
];

// Lecturer with review privileges, or admin: can approve/reject submitted content.
const REVIEWER_OR_ADMIN = [
    process.env.Lecture_Reviewer,
    process.env.Admin,
];

const ADMIN = [process.env.Admin];

module.exports = { CONTENT_MANAGER, REVIEWER_OR_ADMIN, ADMIN };
