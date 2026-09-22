var jwt = require('jsonwebtoken');
require('dotenv').config();


/**
 * Express middleware that authenticates a request using a JWT access token.
 *
 * Expects an `Authorization: Bearer <token>` header.
 *
 * On success, attaches the authenticated user's username and roles to the request object
 * (`req.user` and `req.roles`) for use in downstream middleware/controllers.
 * On failure, delegates to the centralized error handler via `next(error)`.
 *
 * @function authenticateToken
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 *
 * @throws {{kind: "expired", detail: string}} No token provided in the Authorization header
 * @throws {{kind: "forbidden", detail: string}} Token provided but invalid/expired
 */
//TODO: verificar concordancia desses erros
const authenticateToken = (req, res, next) =>{
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
        return next({ kind: "expired", detail: "No token provided." });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err)
            return next({ kind: "forbidden", detail: err.message });
        req.user = decoded.userInfo.username;
        req.roles = decoded.userInfo.roles;
        // TODO: logging
        //console.log(decoded.userInfo.username);
        //console.log(decoded.userInfo.roles)
        next();
    })
}

module.exports={authenticateToken}