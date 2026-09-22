/**
 * Express middleware factory that restricts access to users with a specific role (typology).
 *
 * Must be used after `authenticateToken`, since it depends on `req.roles`
 * being populated from the decoded JWT (`req.roles` = `user.typology` from the
 * database, stored as a number). `allowedRoles` is typically passed as an
 * env var string (e.g. `verifyRoles(process.env.Admin)`) or an array of them
 * (e.g. `verifyRoles([process.env.Lecture, process.env.Admin])`); loose equality
 * (`==`) is used intentionally to allow number/string comparison.
 *
 * Delegates to the centralized error handler via `next(error)` instead of
 * responding directly.
 *
 * @function verifyRoles
 * @param {string|number|Array<string|number>} allowedRoles - The typology value(s) allowed to access the route
 * @returns {import('express').RequestHandler} Express middleware that checks `req.roles` against `allowedRoles`
 *
 * @throws {{kind: "no_token", detail: string}} `req.roles` is missing (user not authenticated)
 * @throws {{kind: "forbidden", detail: string}} User authenticated but does not have the allowed role
 */
const verifyRoles = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if(!req.roles)
            return next({ kind: "no_token", detail: "User roles not found on request." });

        const result = roles.some((role) => req.roles == role);
        if (!result)
            return next({ kind: "forbidden", detail: "User does not have an allowed role." });

        next();
    }
}

module.exports = verifyRoles;