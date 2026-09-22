const User = require("../app/models/userModel");
const { check } = require('express-validator');

const checkLogin = (req, res, next) =>{
    check(req.body.email, 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check(req.body.password, 'Password must be 6 or more characters').isLength({ min: 6 })
}

module.exports = {checkLogin};